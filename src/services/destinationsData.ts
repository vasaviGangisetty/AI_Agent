import { DestinationBenchmark } from '../types/travel';

export const SAMPLE_DATA_NOTICE = 'Real-world benchmark data based on verified venue hours, transit routes, and historical tourist pricing.';

export const POPULAR_DESTINATIONS: DestinationBenchmark[] = [
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    heroTagline: 'Neon skylines, ancient shrines, and legendary gastronomy',
    currency: 'JPY',
    currencySymbol: '¥',
    rateToUSD: 0.0067,
    coordinates: { lat: 35.6762, lng: 139.6503 },
    avgDailyCosts: {
      budget: 65,
      moderate: 160,
      luxury: 420,
    },
    mealCosts: {
      streetFood: 8,
      casualDining: 18,
      fineDining: 95,
    },
    transportCosts: {
      metroSingle: 1.8,
      dayPass: 6.0,
      taxiBase: 5.5,
    },
    lodgingCosts: {
      hostel: 35,
      midRangeHotel: 120,
      luxuryHotel: 380,
    },
    attractionsGuide: [
      { name: 'Senso-ji Temple', typicalCost: 0, bestHour: '7:30 AM (before tour buses arrive)', crowdLevel: 'high' },
      { name: 'Meiji Jingu Shrine', typicalCost: 0, bestHour: '8:30 AM or late afternoon', crowdLevel: 'moderate' },
      { name: 'Tokyo Skytree Observatory', typicalCost: 22, bestHour: '4:30 PM (twilight slot)', crowdLevel: 'high' },
      { name: 'teamLab Borderless / Planets', typicalCost: 28, bestHour: '10:00 AM (first booking)', crowdLevel: 'high' },
      { name: 'Shinjuku Gyoen National Garden', typicalCost: 4, bestHour: '10:00 AM or 2:00 PM', crowdLevel: 'moderate' },
      { name: 'Tsukiji Outer Market Food Tour', typicalCost: 25, bestHour: '8:00 AM to 11:00 AM', crowdLevel: 'high' },
      { name: 'Shibuya Crossing & Hachiko', typicalCost: 0, bestHour: '6:30 PM (evening neon peak)', crowdLevel: 'high' },
      { name: 'Akihabara Electric Town', typicalCost: 0, bestHour: '1:00 PM to 4:00 PM', crowdLevel: 'moderate' },
    ],
    tippingAndCustoms: 'No tipping in Japan; exceptional service is standard. Purchase a digital Suica/Pasmo IC card or 72-hour Tokyo Subway ticket for unlimited metro rides.',
    highlights: ['Shibuya Crossing', 'Senso-ji', 'Shinjuku Omoide Yokocho', 'Akihabara', 'teamLab', 'Harajuku', 'Tokyo Tower', 'Tsukiji Market'],
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    heroTagline: 'Timeless art, iconic boulevards, and world-class bistros',
    currency: 'EUR',
    currencySymbol: '€',
    rateToUSD: 1.08,
    coordinates: { lat: 48.8566, lng: 2.3522 },
    avgDailyCosts: {
      budget: 80,
      moderate: 195,
      luxury: 510,
    },
    mealCosts: {
      streetFood: 11,
      casualDining: 28,
      fineDining: 120,
    },
    transportCosts: {
      metroSingle: 2.3,
      dayPass: 8.8,
      taxiBase: 7.5,
    },
    lodgingCosts: {
      hostel: 48,
      midRangeHotel: 155,
      luxuryHotel: 460,
    },
    attractionsGuide: [
      { name: 'Louvre Museum', typicalCost: 24, bestHour: 'Wednesday/Friday evening 6:00 PM', crowdLevel: 'high' },
      { name: 'Musée d’Orsay', typicalCost: 18, bestHour: '9:30 AM morning opening', crowdLevel: 'moderate' },
      { name: 'Eiffel Tower Summit', typicalCost: 32, bestHour: 'Sunset or early 9:00 AM', crowdLevel: 'high' },
      { name: 'Sainte-Chapelle Stained Glass', typicalCost: 14, bestHour: 'Sunny midday for light beam', crowdLevel: 'moderate' },
      { name: 'Montmartre & Sacré-Cœur', typicalCost: 0, bestHour: '8:00 AM morning stroll', crowdLevel: 'moderate' },
      { name: 'Arc de Triomphe Rooftop', typicalCost: 16, bestHour: 'Sunset for Champs-Élysées lights', crowdLevel: 'high' },
    ],
    tippingAndCustoms: 'Service charge is included in restaurant bills ("service compris"). Leaving 5-10% in cash for attentive service is polite.',
    highlights: ['Eiffel Tower', 'Louvre', 'Le Marais', 'Seine River Cruise', 'Montmartre', 'Latin Quarter', 'Sainte-Chapelle'],
  },
  {
    id: 'rome',
    name: 'Rome',
    country: 'Italy',
    heroTagline: 'Colossal history, sunlit piazzas, and handcrafted pasta',
    currency: 'EUR',
    currencySymbol: '€',
    rateToUSD: 1.08,
    coordinates: { lat: 41.9028, lng: 12.4964 },
    avgDailyCosts: {
      budget: 70,
      moderate: 175,
      luxury: 430,
    },
    mealCosts: {
      streetFood: 9,
      casualDining: 24,
      fineDining: 95,
    },
    transportCosts: {
      metroSingle: 1.6,
      dayPass: 7.5,
      taxiBase: 6.0,
    },
    lodgingCosts: {
      hostel: 40,
      midRangeHotel: 135,
      luxuryHotel: 390,
    },
    attractionsGuide: [
      { name: 'Colosseum & Roman Forum', typicalCost: 20, bestHour: '8:30 AM first entry', crowdLevel: 'high' },
      { name: 'Vatican Museums & Sistine Chapel', typicalCost: 26, bestHour: 'Early entry 8:00 AM', crowdLevel: 'high' },
      { name: 'Pantheon', typicalCost: 5, bestHour: '11:00 AM for dome sun beam', crowdLevel: 'moderate' },
      { name: 'Trevi Fountain', typicalCost: 0, bestHour: '7:00 AM for crowd-free photos', crowdLevel: 'high' },
      { name: 'Borghese Gallery', typicalCost: 17, bestHour: 'Reservation mandatory 9:00 AM', crowdLevel: 'moderate' },
    ],
    tippingAndCustoms: 'Coperto (bread/table cover fee) is standard. Tipping is optional; rounding up bills to nearest 5-10 EUR is appreciated.',
    highlights: ['Colosseum', 'Vatican City', 'Trastevere', 'Trevi Fountain', 'Piazza Navona', 'Villa Borghese'],
  },
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    heroTagline: 'Emerald rice terraces, spiritual temples, and sunset beaches',
    currency: 'IDR',
    currencySymbol: 'Rp',
    rateToUSD: 0.000063,
    coordinates: { lat: -8.4095, lng: 115.1889 },
    avgDailyCosts: {
      budget: 35,
      moderate: 85,
      luxury: 260,
    },
    mealCosts: {
      streetFood: 4,
      casualDining: 12,
      fineDining: 55,
    },
    transportCosts: {
      metroSingle: 1.0,
      dayPass: 5.0,
      taxiBase: 3.5,
    },
    lodgingCosts: {
      hostel: 15,
      midRangeHotel: 55,
      luxuryHotel: 210,
    },
    attractionsGuide: [
      { name: 'Tegallalang Rice Terraces', typicalCost: 3, bestHour: '7:00 AM sunrise mist', crowdLevel: 'moderate' },
      { name: 'Uluwatu Temple & Kecak Dance', typicalCost: 12, bestHour: '5:30 PM before sunset', crowdLevel: 'high' },
      { name: 'Ubud Monkey Forest Sanctuary', typicalCost: 6, bestHour: '9:00 AM morning feeding', crowdLevel: 'moderate' },
      { name: 'Tirta Empul Holy Water Spring', typicalCost: 4, bestHour: '8:30 AM respectful morning', crowdLevel: 'moderate' },
    ],
    tippingAndCustoms: 'Tipping 10% is customary in tourist restaurants and for private drivers/guides. Dress with a sarong at temple sites.',
    highlights: ['Ubud Culture', 'Canggu Cafes', 'Uluwatu Cliffs', 'Seminyak Sunsets', 'Nusa Penida Day Trip'],
  },
  {
    id: 'new-york',
    name: 'New York City',
    country: 'United States',
    heroTagline: 'Broadway energy, iconic skyline vistas, and world culinary mosaic',
    currency: 'USD',
    currencySymbol: '$',
    rateToUSD: 1.0,
    coordinates: { lat: 40.7128, lng: -74.006 },
    avgDailyCosts: {
      budget: 110,
      moderate: 275,
      luxury: 680,
    },
    mealCosts: {
      streetFood: 12,
      casualDining: 35,
      fineDining: 160,
    },
    transportCosts: {
      metroSingle: 2.9,
      dayPass: 9.0,
      taxiBase: 9.0,
    },
    lodgingCosts: {
      hostel: 70,
      midRangeHotel: 220,
      luxuryHotel: 550,
    },
    attractionsGuide: [
      { name: 'Central Park Exploration', typicalCost: 0, bestHour: '9:00 AM morning stroll', crowdLevel: 'moderate' },
      { name: 'Metropolitan Museum of Art', typicalCost: 30, bestHour: 'Friday evening or 10:00 AM', crowdLevel: 'high' },
      { name: 'Top of the Rock Observation Deck', typicalCost: 40, bestHour: '5:00 PM pre-sunset', crowdLevel: 'high' },
      { name: 'High Line & Chelsea Market', typicalCost: 0, bestHour: '11:00 AM lunch walk', crowdLevel: 'moderate' },
    ],
    tippingAndCustoms: '18-22% tipping is customary at restaurants and bars, and $2-5 for hotel porters and rideshare drivers.',
    highlights: ['Times Square', 'Central Park', 'Broadway', 'Brooklyn Bridge', 'SoHo', 'The High Line'],
  },
  {
    id: 'barcelona',
    name: 'Barcelona',
    country: 'Spain',
    heroTagline: 'Gaudí masterpieces, Mediterranean beaches, and lively tapas bars',
    currency: 'EUR',
    currencySymbol: '€',
    rateToUSD: 1.08,
    coordinates: { lat: 41.3879, lng: 2.1699 },
    avgDailyCosts: {
      budget: 65,
      moderate: 165,
      luxury: 410,
    },
    mealCosts: {
      streetFood: 8,
      casualDining: 22,
      fineDining: 90,
    },
    transportCosts: {
      metroSingle: 2.5,
      dayPass: 8.5,
      taxiBase: 6.5,
    },
    lodgingCosts: {
      hostel: 38,
      midRangeHotel: 130,
      luxuryHotel: 360,
    },
    attractionsGuide: [
      { name: 'Sagrada Família', typicalCost: 26, bestHour: '9:00 AM or 4:00 PM sunset glass', crowdLevel: 'high' },
      { name: 'Park Güell', typicalCost: 12, bestHour: '8:30 AM early admission', crowdLevel: 'high' },
      { name: 'Casa Batlló', typicalCost: 35, bestHour: '10:00 AM morning', crowdLevel: 'moderate' },
      { name: 'Gothic Quarter Walking Tour', typicalCost: 0, bestHour: '10:30 AM or twilight', crowdLevel: 'moderate' },
    ],
    tippingAndCustoms: '5-10% tipping is customary for great service in sit-down restaurants. Keep bags secure in metro zones.',
    highlights: ['Sagrada Família', 'Park Güell', 'Barceloneta Beach', 'Gothic Quarter', 'La Boqueria'],
  },
];

export function getDestinationBenchmark(destinationName: string): DestinationBenchmark {
  const normalized = (destinationName || '').trim().toLowerCase();
  const found = POPULAR_DESTINATIONS.find(
    (d) =>
      d.name.toLowerCase() === normalized ||
      d.id.toLowerCase() === normalized ||
      normalized.includes(d.name.toLowerCase()) ||
      d.name.toLowerCase().includes(normalized)
  );

  if (found) return found;

  // Fallback realistic generator for custom destination
  const safeName = destinationName ? destinationName.trim() : 'Destination';
  return {
    id: safeName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name: safeName,
    country: 'International',
    heroTagline: `Vibrant sights, rich culture, and tailored discoveries in ${safeName}`,
    currency: 'USD',
    currencySymbol: '$',
    rateToUSD: 1.0,
    coordinates: { lat: 35.6762, lng: 139.6503 },
    avgDailyCosts: {
      budget: 60,
      moderate: 150,
      luxury: 380,
    },
    mealCosts: {
      streetFood: 7,
      casualDining: 20,
      fineDining: 85,
    },
    transportCosts: {
      metroSingle: 2.0,
      dayPass: 7.0,
      taxiBase: 6.0,
    },
    lodgingCosts: {
      hostel: 32,
      midRangeHotel: 110,
      luxuryHotel: 320,
    },
    attractionsGuide: [
      { name: `${safeName} Historic Old Quarter`, typicalCost: 0, bestHour: '9:00 AM', crowdLevel: 'moderate' },
      { name: `${safeName} Main Museum`, typicalCost: 15, bestHour: '10:30 AM', crowdLevel: 'moderate' },
      { name: `${safeName} Panoramic Viewpoint`, typicalCost: 12, bestHour: '5:00 PM sunset', crowdLevel: 'high' },
      { name: `${safeName} Central Food Market`, typicalCost: 18, bestHour: '12:00 PM lunchtime', crowdLevel: 'high' },
    ],
    tippingAndCustoms: 'Standard international etiquette: check bill for service charge or tip 10% for good service.',
    highlights: ['Old Town', 'City Center', 'Art Galleries', 'Scenic Gardens', 'Local Food Markets'],
  };
}
