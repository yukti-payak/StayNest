import Listing from "../models/Listing.js";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding.js";
import redis from "../config/redis.js";

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// 1. Get All Listings (with Category & Search Support)
// 1. Get All Listings (with Category & Multi-Field Search Support)
export const getAllListings = async (req, res) => {
  try {
    const { category, title, query, search } = req.query;

    // Standardize the search term coming from frontend (supports ?query=, ?search=, or ?title=)
    const searchTerm = (query || search || title || "").trim();

    // 1. Generate a dynamic cache key based on category and search query
    const categoryKey = category || "all";
    const searchQueryKey = searchTerm ? searchTerm.toLowerCase().replace(/\s+/g, "-") : "all";
    const cacheKey = `listings:cat:${categoryKey}:search:${searchQueryKey}`;

    // 2. Check if cached data exists in Redis
    const cachedListings = await redis.get(cacheKey);

    if (cachedListings) {
      console.log(`⚡ Cache Hit: ${cacheKey}`);
      return res.status(200).json(JSON.parse(cachedListings));
    }

    console.log(`🐢 Cache Miss: Fetching from MongoDB (${cacheKey})`);

    // 3. Query MongoDB
    let filter = {};

    // Filter by Category if provided and not "All"
    if (category && category !== "All") {
      filter.category = category;
    }

    // Filter by Search Query across title, description, location, and country
    if (searchTerm !== "") {
      const regex = new RegExp(searchTerm, "i");
      filter.$or = [
        { title: regex },
        { description: regex },
        { location: regex },
        { country: regex },
      ];
    }

    const listings = await Listing.find(filter)
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    const responseData = {
      success: true,
      count: listings.length,
      data: listings,
    };

    // 4. Save result in Redis with a 1-hour Time-To-Live (3600 seconds)
    await redis.set(cacheKey, JSON.stringify(responseData), "EX", 3600);

    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. Get Single Listing by ID
export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id)
      .populate("owner", "name email")
      .populate({
        path: "reviews",
        populate: {
          path: "author",
          select: "name",
        },
      });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. Create New Listing (with Mapbox Geocoding)
export const createListing = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please log in to create a listing",
      });
    }

    const bodyData = req.body.listing || req.body;
    const { title, description, price, location, country, category } = bodyData;

    // Fetch coordinates from Mapbox Geocoding API based on location string
    const geoResponse = await geocodingClient
      .forwardGeocode({
        query: `${location}, ${country}`,
        limit: 1,
      })
      .send();

    const geometry = geoResponse.body.features[0]?.geometry || {
      type: "Point",
      coordinates: [0, 0],
    };

    const listing = new Listing({
      title,
      description,
      price,
      location,
      country,
      category,
      geometry,
      owner: req.user._id,
    });

    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    await listing.save();

    // 5. Invalidate Cached Listings
    // When a new listing is created, clear all listing caches so users get fresh data
    const keys = await redis.keys("listings:*");
    if (keys.length > 0) {
      await redis.del(keys);
      console.log(`🧹 Cache Invalidated: Cleared ${keys.length} key(s)`);
    }

    return res.status(201).json({
      success: true,
      message: "Listing created successfully",
      data: listing,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. Update Listing (with Mapbox Geocoding on location update)
export const updateListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    const bodyData = req.body.listing || req.body;
    const { title, description, price, location, country, category } = bodyData;

    // Re-geocode coordinates if location/country changed
    if (
      (location && location !== listing.location) ||
      (country && country !== listing.country)
    ) {
      const geoResponse = await geocodingClient
        .forwardGeocode({
          query: `${location || listing.location}, ${country || listing.country}`,
          limit: 1,
        })
        .send();

      if (geoResponse.body.features[0]?.geometry) {
        listing.geometry = geoResponse.body.features[0].geometry;
      }
    }

    listing.title = title || listing.title;
    listing.description = description || listing.description;
    listing.price = price || listing.price;
    listing.location = location || listing.location;
    listing.country = country || listing.country;
    listing.category = category || listing.category;

    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    await listing.save();

    return res.status(200).json({
      success: true,
      message: "Listing updated successfully",
      data: listing,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// 5. Delete Listing
export const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    await listing.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};