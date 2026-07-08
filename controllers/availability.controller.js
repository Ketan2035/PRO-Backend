import Availability from "../models/availabilitySchema.js";

// @desc    Get professional availability
// @route   GET /api/availability/:professionalId
export const getAvailability = async (req, res) => {
  try {
    const { professionalId } = req.params;
    let availability = await Availability.findOne({ professional: professionalId });
    
    if (!availability) {
      // Return default if not set
      return res.status(200).json({
        success: true,
        availability: {
          isOnline: false,
          schedule: {
            monday: [], tuesday: [], wednesday: [], thursday: [],
            friday: [], saturday: [], sunday: []
          },
          blockedDates: []
        }
      });
    }

    res.status(200).json({ success: true, availability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update professional availability
// @route   PUT /api/availability
export const updateAvailability = async (req, res) => {
  try {
    const professionalId = req.user.id || req.user._id;
    const { isOnline, schedule, blockedDates } = req.body;

    let availability = await Availability.findOne({ professional: professionalId });
    
    if (availability) {
      if (isOnline !== undefined) availability.isOnline = isOnline;
      if (schedule) availability.schedule = schedule;
      if (blockedDates) availability.blockedDates = blockedDates;
      await availability.save();
    } else {
      availability = await Availability.create({
        professional: professionalId,
        isOnline: isOnline || false,
        schedule: schedule || {
          monday: [], tuesday: [], wednesday: [], thursday: [],
          friday: [], saturday: [], sunday: []
        },
        blockedDates: blockedDates || []
      });
    }

    res.status(200).json({ success: true, availability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
