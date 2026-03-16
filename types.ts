
export interface Message {
  id: string;
  text?: string;
  translatedText?: string;
  sender: 'me' | 'other' | 'ai';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  replyTo?: string;
  reactions?: string[];
  isStarred?: boolean;
  media?: {
    type: 'image' | 'video' | 'location' | 'voice' | 'sticker';
    url: string;
    label?: string;
    duration?: string;
  };
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  type: 'contact' | 'ai' | 'group';
  isPinned?: boolean;
  isArchived?: boolean;
  hasReadReceipt?: boolean;
  lastMessageIsMedia?: 'photo' | 'video';
}

export interface User {
  id: string;
  name: string;
  status: string;
  avatar: string;
  mobile: string;
  role: 'user' | 'admin';
  totalLeads: number;
  totalListings: number;
}

export interface CallSession {
  chat: Chat;
  type: 'voice' | 'video';
  status: 'ringing' | 'connected';
  startTime: number;
}

export interface LocalService {
  id: string;
  businessName: string;
  ownerName: string;
  photo: string;
  location: string;
  category: string;
  description: string;
  coords?: { lat: number; lng: number };
  timestamp: string;
  status: 'active' | 'pending';
}

export interface VehicleListing {
  id: string;
  ownerName: string;
  ownerPhoto: string;
  vehicleNumber: string;
  licenseNumber: string;
  licensePhoto?: string;
  vehicleType: 'Car' | 'Tempo' | 'Auto' | 'Bus' | 'Bike';
  vehiclePhoto: string;
  location: string;
  title: string;
  description: string;
  coords?: { lat: number; lng: number };
  status: 'active' | 'pending';
  availability: 'Available' | 'Busy';
  timestamp: string;
}

export interface BuilderListing {
  id: string;
  builderLogo: string;
  builderName: string;
  buildingName: string;
  reraNumber: string;
  location: string;
  propertyType: string;
  photo: string;
  video?: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'active' | 'pending';
}

export interface OwnerListing {
  id: string;
  ownerName: string;
  buildingName: string;
  location: string;
  propertyType: string;
  photo: string;
  video?: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'active' | 'pending';
  uid: string;
}

export interface StatusUpdate {
  id: string;
  name: string;
  avatar: string;
  contentImage: string;
  time: string;
  isViewed: boolean;
}

export interface Call {
  id: string;
  name: string;
  avatar: string;
  time: string;
  type: 'incoming' | 'outgoing' | 'missed';
  isVideo: boolean;
  count?: number;
}

export interface Channel {
  id: string;
  name: string;
  avatar: string;
  date: string;
  description: string;
  followers: string;
  isVerified?: boolean;
}

export interface PropertyPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'Sell' | 'Rent';
  propertyType: string;
  price: string;
  location: string;
  description: string;
  video?: string;
  timestamp: string;
  likes: number;
  status: 'pending' | 'approved';
}

// Global statistics for the platform used in constants
export interface GlobalStats {
  totalMembers: number;
  onlineNow: number;
  aiMessagesToday: number;
  uptime: string;
}

export interface GroceryProduct {
  id: string;
  sellerName: string;
  productName: string;
  price: string;
  unit: string;
  category: string;
  photo: string;
  location: string;
  description: string;
  status: 'active' | 'pending';
  timestamp: string;
  uid: string;
}
