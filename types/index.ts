export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  role?: UserRole;
  totalCatches: number;
  totalSpots: number;
  joinedDate: string;
}

export interface FishingSpot {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    city: string;
    state: string;
  };
  type: 'river' | 'lake' | 'ocean' | 'reservoir' | 'fishery';
  rating: number;
  totalCatches: number;
  description?: string;
  addedBy: User;
  photos: string[];
}

export interface Catch {
  id: string;
  user: User;
  species: string;
  weight: number;
  length?: number;
  bait: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  photo: string;
  notes?: string;
  date: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  isPromoted?: boolean;
  promotedBy?: string;
  promotedAt?: string;
}

export interface FishSpecies {
  id: string;
  name: string;
  scientificName: string;
  image: string;
  description: string;
  averageWeight: string;
  habitat: string[];
  popularBaits: string[];
}

export interface UserStats {
  totalCatches: number;
  totalSpecies: number;
  totalWeight: number;
  biggestCatch: {
    species: string;
    weight: number;
    date: string;
  };
  recentActivity: {
    thisWeek: number;
    thisMonth: number;
  };
}

export type MapFilterType = 'all' | 'river' | 'lake' | 'ocean' | 'reservoir';
