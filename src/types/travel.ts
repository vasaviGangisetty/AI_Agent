export type TravelerType = 'solo' | 'group';

export type TravelStyle = 'budget' | 'balanced' | 'luxury';

export type TravelPace = 'relaxed' | 'moderate' | 'packed';

export type ExpenseCategory = 
  | 'food' 
  | 'transport' 
  | 'accommodation' 
  | 'tickets' 
  | 'shopping' 
  | 'other';

export type ActivityCategory =
  | 'attraction'
  | 'food'
  | 'culture'
  | 'outdoor'
  | 'nightlife'
  | 'relaxation'
  | 'shopping';

export type CrowdLevel = 'low' | 'moderate' | 'high';

export interface TransportOption {
  mode: 'walk' | 'metro' | 'bus' | 'taxi' | 'boat';
  durationMinutes: number;
  cost: number;
  note: string;
}

export interface Activity {
  id: string;
  dayNumber: number;
  timeSlot: 'morning' | 'midday' | 'afternoon' | 'evening';
  timeString: string;
  title: string;
  description: string;
  category: ActivityCategory;
  locationName: string;
  address?: string;
  metroStation?: string;
  estimatedDurationMinutes?: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  estimatedCostPerPerson: number;
  costType?: 'per_person' | 'shared_group'; // whether cost is per-person or shared group cost
  sharedGroupCost?: number;
  transportToNext?: TransportOption;
  crowdLevel: CrowdLevel;
  crowdPeakNote: string;
  crowdDataNotice: string; // Explicit simulated label
  crowdHourly?: {
    morning: number; // wait in mins
    midday: number;
    afternoon: number;
    evening: number;
  };
  weatherSuitability: 'all-weather' | 'outdoor' | 'indoor';
  indoorAlternative?: {
    title: string;
    description: string;
    estimatedCostPerPerson: number;
    reason: string;
  };
  isCompleted?: boolean;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  title: string;
  theme: string;
  estimatedCostTotal: number;
  activities: Activity[];
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  dayNumber?: number;
  paidBy: string;
  assignedTo?: string; // For individual expenses: which traveler is responsible
  splitType: 'equal' | 'individual';
  costNature?: 'shared' | 'individual'; // Shared accommodation/transit vs individual meals/shopping
  activityId?: string;
  notes?: string;
  createdAt: string;
}

export interface WeatherDay {
  date: string;
  dayNumber: number;
  tempHighC: number;
  tempLowC: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Rain' | 'Showers' | 'Cloudy' | 'Clear';
  rainChancePercent: number;
  uvIndex: number;
  humidity?: number;
  windKmH?: number;
  hourlyTemps?: {
    morning: number;
    afternoon: number;
    evening: number;
  };
  isOutdoorFriendly: boolean;
  advisory: string;
  indoorAlternativeSuggested?: string;
  isSampleData: boolean; // Must always be true for simulated data
}

export interface DestinationBenchmark {
  id: string;
  name: string;
  country: string;
  heroTagline: string;
  currency: string;
  currencySymbol: string;
  rateToUSD: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  avgDailyCosts: {
    budget: number;
    moderate: number;
    luxury: number;
  };
  mealCosts: {
    streetFood: number;
    casualDining: number;
    fineDining: number;
  };
  transportCosts: {
    metroSingle: number;
    dayPass: number;
    taxiBase: number;
  };
  lodgingCosts: {
    hostel: number;
    midRangeHotel: number;
    luxuryHotel: number;
  };
  attractionsGuide: {
    name: string;
    typicalCost: number;
    bestHour: string;
    crowdLevel: CrowdLevel;
  }[];
  tippingAndCustoms: string;
  highlights: string[];
}

export interface TripPlan {
  id: string;
  destination: string;
  country: string;
  startDate: string;
  endDate?: string;
  durationDays: number;
  totalBudget: number;
  currency: string;
  travelerType: TravelerType;
  travelerCount: number;
  travelerNames: string[];
  interests: string[];
  travelStyle: TravelStyle;
  travelPace: TravelPace;
  accommodationType?: 'hostel' | 'hotel' | 'luxury' | 'apartment';
  transportPreference?: 'public_transit' | 'walking' | 'taxi' | 'rental';
  dailySpendingLimit?: number;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export type ActiveNavTab =
  | 'home'
  | 'plan'
  | 'itinerary_map'
  | 'budget'
  | 'weather_crowds';


export interface AgentInsight {
  id: string;
  timestamp: string;
  type: 'alert' | 'optimization' | 'tip' | 'weather' | 'crowd';
  title: string;
  description: string;
  actionLabel?: string;
  actionType?: 'apply_budget_fix' | 'swap_rain_activity' | 'rebalance_pace' | 'view_expenses';
  savingsAmount?: number;
}
