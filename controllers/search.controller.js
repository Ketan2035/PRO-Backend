import Professional from "../models/professionalSchema.js";

// @desc    Search for nearby professionals
// @route   GET /api/search/nearby
// @access  Public
export const searchNearbyProfessionals = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 10000, profession } = req.query; // maxDistance default 10km

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const query = {
      isVerified: true,
      isAvailable: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
    };

    if (profession) {
      // Case insensitive match
      query.profession = { $regex: new RegExp(profession, "i") };
    }

    const professionals = await Professional.find(query)
      .select("-password -idProof")
      .limit(20);

    res.status(200).json({
      success: true,
      count: professionals.length,
      professionals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
