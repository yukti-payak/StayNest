import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding.js";
import OpenAI from "openai";
import Booking from "../models/Booking.js";

const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

// Route requests through Groq Cloud's OpenAI-compatible API
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const askCoHost = async (req, res) => {
  try {
    const { bookingId, question } = req.body;
    const userId = req.user._id;

    // 1. Verify guest booking ownership and retrieve listing details
    const booking = await Booking.findById(bookingId).populate("listing");
    if (!booking || booking.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied. Valid booking required." });
    }

    const listing = booking.listing;
    const coordinates = listing.geometry?.coordinates || [77.209, 28.6139]; // [lng, lat]

    // 2. Perform spatial search on Mapbox Geocoding API centered around property
    let mapboxMarkers = [];
    let mapboxPlacesText = "";

    try {
      const mapboxRes = await geocodingClient
        .forwardGeocode({
          query: question,
          proximity: coordinates,
          limit: 3,
        })
        .send();

      const features = mapboxRes.body.features || [];

      mapboxMarkers = features.map((f) => ({
        name: f.text,
        address: f.place_name,
        coordinates: f.geometry.coordinates,
      }));

      mapboxPlacesText = features
        .map((f) => `- ${f.text}: ${f.place_name}`)
        .join("\n");
    } catch (err) {
      console.error("Mapbox Geocoding lookup error:", err.message);
    }

    // 3. Construct Retrieval-Augmented Generation (RAG) Context
    const promptContext = `
      Property Title: ${listing.title}
      Address: ${listing.location}, ${listing.country}
      Coordinates: ${coordinates.join(", ")}

      HOUSE MANUAL / PRIVATE RULES:
      Wi-Fi Name: ${listing.houseManual?.wifiName || "Not provided"}
      Wi-Fi Password: ${listing.houseManual?.wifiPassword || "Not provided"}
      Check-In Instructions: ${listing.houseManual?.checkInInstructions || "Not provided"}
      Appliances / Amenities Rules: ${listing.houseManual?.applianceRules || "Not provided"}
      Trash Disposal: ${listing.houseManual?.trashDisposal || "Not provided"}
      Parking Info: ${listing.houseManual?.parkingInfo || "Not provided"}

      NEARBY PLACES FOUND VIA MAPBOX:
      ${mapboxPlacesText || "No specific nearby points of interest returned."}
    `;

    // 4. Send query to Groq Llama 3 model
    const completion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are the friendly, helpful AI Local Co-Host for "${listing.title}". Answer the guest using ONLY the provided property context and nearby places context. Keep responses concise, warm, and clear.\n\nContext:\n${promptContext}`,
        },
        { role: "user", content: question },
      ],
      temperature: 0.4,
    });

    const answer = completion.choices[0].message.content;

    res.status(200).json({
      answer,
      markers: mapboxMarkers,
      propertyCoordinates: coordinates,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};