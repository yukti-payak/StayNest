// controllers/wishlistController.js
import User from "../models/User.js";

export const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { listingId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Convert ObjectId to String for accurate comparison
    const exists = user.wishlist.some(
      (id) => id.toString() === listingId.toString()
    );

    if (exists) {
      // Remove listing if already present
      user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== listingId.toString()
      );
    } else {
      // Add listing if not present
      user.wishlist.push(listingId);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: !exists ? "Added to wishlist" : "Removed from wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: "wishlist",
      populate: { path: "owner", select: "name email" },
    });

    return res.status(200).json({
      success: true,
      data: user.wishlist,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};