export const API = process.env.REACT_APP_API_URL || 'https://bharatqabackend.onrender.com/api';
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '9923679229-u7oilbqg7phbocnbkfjrk1u76q2tie7k.apps.googleusercontent.com';

export const colors = {
  saffron: '#FF6B2B',
  saffronDark: '#E05E00',
  indigo: '#1A1A3E',
  electricBlue: '#4F8EF7',
  baseDark: '#0B0D1A',
  midDark: '#111328',
  critical: '#FF3B5C',
  high: '#F5A623',
  medium: '#4F8EF7',
  low: '#34C759',
};

export const industries = [
  'Fintech', 'E-commerce', 'EdTech', 'HealthTech', 'Social Media',
  'Gaming', 'SaaS / B2B', 'Logistics', 'Food & Delivery', 'Travel',
  'Media & Entertainment', 'Government / GovTech', 'Other'
];

export const companySizes = ['Just me', '2-10', '11-50', '51-200', '200+'];

export const roles = [
  'Founder / CEO', 'CTO / Tech Lead', 'QA Lead / Manager',
  'Developer', 'Product Manager', 'Other'
];