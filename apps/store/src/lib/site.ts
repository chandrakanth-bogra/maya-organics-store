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

export const whatsappLink = (text?: string) =>
  `https://wa.me/${SITE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
