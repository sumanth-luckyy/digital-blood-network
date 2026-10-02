/**
 * Indian Geographic Data and Coordinates Helper
 * Comprehensive coverage for States, Union Territories, and Major Cities
 * Prioritized for Andhra Pradesh, Telangana, and National Metros
 */

export interface IndianCity {
  name: string;
  state: string;
  district?: string;
  latitude: number;
  longitude: number;
  zoom: number;
  isPopular?: boolean;
}

export const INDIAN_STATES: string[] = [
  'Andhra Pradesh',
  'Telangana',
  'Tamil Nadu',
  'Karnataka',
  'Kerala',
  'Maharashtra',
  'Delhi',
  'Uttar Pradesh',
  'Gujarat',
  'Rajasthan',
  'West Bengal',
  'Madhya Pradesh',
  'Odisha',
  'Bihar',
  'Punjab',
  'Haryana',
  'Assam',
  'Goa',
  'Jharkhand',
  'Chhattisgarh',
  'Uttarakhand',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Ladakh',
  'Tripura',
  'Meghalaya',
  'Manipur',
  'Nagaland',
  'Mizoram',
  'Arunachal Pradesh',
  'Sikkim',
  'Puducherry',
  'Chandigarh',
  'Andaman & Nicobar Islands',
  'Dadra & Nagar Haveli and Daman & Diu',
  'Lakshadweep',
];

export const INDIAN_CITIES: IndianCity[] = [
  // Telangana
  {
    name: 'Hyderabad',
    state: 'Telangana',
    district: 'Hyderabad',
    latitude: 17.385,
    longitude: 78.4867,
    zoom: 12,
    isPopular: true,
  },
  {
    name: 'Warangal',
    state: 'Telangana',
    district: 'Warangal',
    latitude: 17.9784,
    longitude: 79.5941,
    zoom: 13,
  },
  {
    name: 'Nizamabad',
    state: 'Telangana',
    district: 'Nizamabad',
    latitude: 18.6725,
    longitude: 78.0941,
    zoom: 13,
  },

  // Andhra Pradesh (Special Focus)
  {
    name: 'Vijayawada',
    state: 'Andhra Pradesh',
    district: 'NTR District',
    latitude: 16.5062,
    longitude: 80.648,
    zoom: 13,
    isPopular: true,
  },
  {
    name: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    latitude: 17.6868,
    longitude: 83.2185,
    zoom: 12,
    isPopular: true,
  },
  {
    name: 'Guntur',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    latitude: 16.3067,
    longitude: 80.4365,
    zoom: 13,
    isPopular: true,
  },
  {
    name: 'Eluru',
    state: 'Andhra Pradesh',
    district: 'Eluru',
    latitude: 16.7107,
    longitude: 81.0952,
    zoom: 13,
    isPopular: true,
  },
  {
    name: 'Tirupati',
    state: 'Andhra Pradesh',
    district: 'Tirupati',
    latitude: 13.6288,
    longitude: 79.4192,
    zoom: 13,
    isPopular: true,
  },
  {
    name: 'Kakinada',
    state: 'Andhra Pradesh',
    district: 'Kakinada',
    latitude: 16.9891,
    longitude: 82.2475,
    zoom: 13,
  },
  {
    name: 'Nellore',
    state: 'Andhra Pradesh',
    district: 'SPSR Nellore',
    latitude: 14.4426,
    longitude: 79.9865,
    zoom: 13,
  },
  {
    name: 'Kurnool',
    state: 'Andhra Pradesh',
    district: 'Kurnool',
    latitude: 15.8281,
    longitude: 78.0373,
    zoom: 13,
  },
  {
    name: 'Rajahmundry',
    state: 'Andhra Pradesh',
    district: 'East Godavari',
    latitude: 17.0005,
    longitude: 81.804,
    zoom: 13,
  },

  // Major Indian Metros
  {
    name: 'Bengaluru',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    latitude: 12.9716,
    longitude: 77.5946,
    zoom: 12,
    isPopular: true,
  },
  {
    name: 'Chennai',
    state: 'Tamil Nadu',
    district: 'Chennai',
    latitude: 13.0827,
    longitude: 80.2707,
    zoom: 12,
    isPopular: true,
  },
  {
    name: 'Mumbai',
    state: 'Maharashtra',
    district: 'Mumbai City',
    latitude: 19.076,
    longitude: 72.8777,
    zoom: 12,
    isPopular: true,
  },
  {
    name: 'Delhi',
    state: 'Delhi',
    district: 'New Delhi',
    latitude: 28.6139,
    longitude: 77.209,
    zoom: 12,
    isPopular: true,
  },
  {
    name: 'Kolkata',
    state: 'West Bengal',
    district: 'Kolkata',
    latitude: 22.5726,
    longitude: 88.3639,
    zoom: 12,
    isPopular: true,
  },
  {
    name: 'Pune',
    state: 'Maharashtra',
    district: 'Pune',
    latitude: 18.5204,
    longitude: 73.8567,
    zoom: 12,
    isPopular: true,
  },
  {
    name: 'Kochi',
    state: 'Kerala',
    district: 'Ernakulam',
    latitude: 9.9312,
    longitude: 76.2673,
    zoom: 12,
    isPopular: true,
  },
  {
    name: 'Ahmedabad',
    state: 'Gujarat',
    district: 'Ahmedabad',
    latitude: 23.0225,
    longitude: 72.5714,
    zoom: 12,
    isPopular: true,
  },
  {
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    latitude: 26.8467,
    longitude: 80.9462,
    zoom: 12,
    isPopular: true,
  },
  {
    name: 'Jaipur',
    state: 'Rajasthan',
    district: 'Jaipur',
    latitude: 26.9124,
    longitude: 75.7873,
    zoom: 12,
  },
  {
    name: 'Bhubaneswar',
    state: 'Odisha',
    district: 'Khordha',
    latitude: 20.2961,
    longitude: 85.8245,
    zoom: 12,
  },
  {
    name: 'Patna',
    state: 'Bihar',
    district: 'Patna',
    latitude: 25.5941,
    longitude: 85.1376,
    zoom: 12,
  },
  {
    name: 'Chandigarh',
    state: 'Punjab',
    district: 'Chandigarh',
    latitude: 30.7333,
    longitude: 76.7794,
    zoom: 12,
  },
  {
    name: 'Guwahati',
    state: 'Assam',
    district: 'Kamrup Metropolitan',
    latitude: 26.1445,
    longitude: 91.7362,
    zoom: 12,
  },
  {
    name: 'Bhopal',
    state: 'Madhya Pradesh',
    district: 'Bhopal',
    latitude: 23.2599,
    longitude: 77.4126,
    zoom: 12,
  },
];

/**
 * Default geographic center for all-India map view
 */
export const INDIA_DEFAULT_CENTER: [number, number] = [22.5, 79.0];
export const INDIA_DEFAULT_ZOOM: number = 5;

/**
 * Find city coordinates by name
 */
export function findIndianCityCoords(cityName: string): [number, number] | null {
  const match = INDIAN_CITIES.find(
    (c) => c.name.toLowerCase() === cityName.toLowerCase()
  );
  return match ? [match.latitude, match.longitude] : null;
}
