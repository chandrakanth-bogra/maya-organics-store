/** Business facts used across pages, structured data and the agent layer. */
export const SITE = {
  name: 'Maya Organics',
  url: 'https://mayaorganics.store',
  tagline: 'Soil amendments and growing media for Indian gardens',
  description:
    'Perlite, pumice, LECA, pine bark, vermiculite, cocopeat, vermicompost, zeolite and neem cake — shipped across India from Hyderabad.',
  email: 'info@mayaorganics.org',
  whatsapp: '917680945577',
  phoneDisplay: '+91 76809 45577',
  b2bUrl: 'https://www.mayaorganics.org',
  locality: 'Hyderabad',
  region: 'Telangana',
  country: 'IN',
  currency: 'INR',
} as const;

/** Delivery and returns rules (owner's decisions, 2026-10-22). Money in paise. */
export const POLICY = {
  freeDeliveryAbove: 100000, // ₹1,000
  deliveryFee: null as number | null, // below the threshold: not decided yet, shown before payment
  returns: false, // no returns
  damageReportHours: 48, // damaged/wrong item: report with photos within this time (to confirm)
} as const;

export const whatsappLink = (text?: string) =>
  `https://wa.me/${SITE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
