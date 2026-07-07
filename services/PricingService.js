// Centralized Pricing Service
// Calculates platform fee, taxes, and final price to ensure consistency

export const PLATFORM_COMMISSION_RATE = 0.10; // 10%
export const TAX_RATE = 0.05; // 5% GST

export const calculatePricing = (basePrice, durationHours = 1) => {
  if (basePrice < 0) throw new Error("Base price cannot be negative");

  const totalBase = basePrice * durationHours;
  const platformFee = totalBase * PLATFORM_COMMISSION_RATE;
  
  // Tax is calculated on the platform fee, or on the total service? Usually service platforms charge GST on the total amount.
  const taxAmount = totalBase * TAX_RATE;

  const totalAmount = totalBase + platformFee + taxAmount;
  const professionalEarnings = totalBase - platformFee;

  return {
    basePrice: totalBase,
    platformFee: Math.round(platformFee),
    taxAmount: Math.round(taxAmount),
    totalAmount: Math.round(totalAmount),
    professionalEarnings: Math.round(professionalEarnings),
  };
};
