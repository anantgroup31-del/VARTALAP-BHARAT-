
import { Chat, User, Call, StatusUpdate, GlobalStats, Channel, PropertyPost } from './types';

export const APP_NAME = "VARTALAP BHARAT";

export const COLORS = {
  primary: '#f97316',
  secondary: '#138808',
  accent: '#f97316', 
  chatBg: '#fef2e7',
  myBubble: '#ffedd5',
  otherBubble: '#ffffff',
  sidebarBg: '#ffffff',
  darkNav: '#121b22',
};

export const LIST_OF_BANKS = [
  "State Bank of India (SBI)", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank",
  "Punjab National Bank (PNB)", "Bank of Baroda (BOB)", "Canara Bank", "Union Bank of India",
  "IDBI Bank", "IndusInd Bank", "Yes Bank", "Federal Bank", "IDFC First Bank", "Bandhan Bank",
  "Standard Chartered Bank", "HSBC Bank", "Citibank", "RBL Bank", "South Indian Bank"
];

export const LOCAL_SERVICE_CATEGORIES = [
  "Doctor", "Advocate", "Restaurant", "Groceries Store", "DMart", "School", "College", 
  "Election", "Plumber", "Hospital", "Jio Fiber", "Airtel Fiber", "Electrician", "Carpenter", 
  "AC Repair", "Painter", "Mason", "Gardener", "Pest Control", 
  "Home Cleaning", "Laundry", "Tailor", "Barber", "Salon at Home", "Makeup Artist", "Photographer", 
  "Videographer", "Event Planner", "DJ", "Caterer", "Florist", "Grocery Delivery", "Milk Delivery", 
  "Water Tanker", "Gas Agency", "Newspaper Vendor", "Internet Provider", "Cable Operator", "Gym Trainer", 
  "Yoga Teacher", "Physiotherapist", "Nurse", "Baby Sitter", "Cook", "Driver", "Maid", "Security Guard", 
  "Astrologer", "Pandit", "Lawyer", "Notary", "Architect", "Interior Designer", "Real Estate Agent", 
  "Insurance Agent", "Tax Consultant", "CA", "Web Designer", "Graphic Designer", "Digital Marketer", 
  "Computer Repair", "Mobile Repair", "TV Repair", "Washing Machine Repair", "Fridge Repair", 
  "Microwave Repair", "Chimney Repair", "Water Purifier Service", "Inverter Repair", "Battery Dealer", 
  "Tire Shop", "Car Wash", "Bike Mechanic", "Car Mechanic", "Towing Service", "Driving School", 
  "Tutor (Home)", "Music Teacher", "Dance Teacher", "Language Teacher", "Coaching Center", "Stationery Shop", 
  "Xerox Shop", "Courier Service", "Packers and Movers", "Hardware Store", "Paint Shop", "Electrical Store", 
  "Sanitary Store", "Plywood Shop", "Furniture Shop", "Curtains & Blinds", "Mattress Shop", "Glass Work", 
  "Fabrication", "Aluminum Work", "RO System Dealer", "Solar Panel Dealer", "CCTV Installer", "Key Maker", 
  "Shoe Repair", "Bag Repair", "Watch Repair", "Cycle Repair", "Pet Groomer", "Veterinary Doctor", 
  "Dog Walker", "Aquarium Service", "Nursery (Plants)", "Tent House", "Sound System"
];

export const INITIAL_CHATS: Chat[] = [
  {
    id: 'ai-assistant',
    name: 'VARTALAP BHARAT AI',
    avatar: 'https://picsum.photos/seed/ai-bharat/200',
    lastMessage: 'Jai Shree Ram! Main aapki kya sahayata kar sakta hoon?',
    lastMessageTime: '10:01 AM',
    unreadCount: 0,
    isOnline: true,
    type: 'ai',
    hasReadReceipt: true
  },
  {
    id: '1',
    name: 'SATYAM DUBEY',
    avatar: 'https://picsum.photos/seed/rahul/200',
    lastMessage: 'Bharat Seva Post Approved',
    lastMessageTime: '10:01 AM',
    unreadCount: 0,
    isOnline: true,
    type: 'contact',
    hasReadReceipt: true
  },
  {
    id: '2',
    name: 'BECHO INDIA PRO',
    avatar: 'https://picsum.photos/seed/becho/200',
    lastMessage: 'Listing active hai sir.',
    lastMessageTime: '9:24 AM',
    unreadCount: 0,
    isOnline: false,
    type: 'contact',
    hasReadReceipt: true
  },
  {
    id: '3',
    name: 'VARTALAP STUDY GROUP',
    avatar: 'https://picsum.photos/seed/study/200',
    lastMessage: 'Chandan: Jai Bharat!',
    lastMessageTime: '5:56 AM',
    unreadCount: 2,
    isOnline: false,
    type: 'contact'
  }
];

export const GLOBAL_STATS: GlobalStats = {
  totalMembers: 1400000, 
  onlineNow: 95000,
  aiMessagesToday: 500000,
  uptime: '99.99%'
};

export const CURRENT_USER: User = {
  id: 'me',
  name: 'Bharat Admin',
  status: 'Vartalap Bharat - Jai Hind 🇮🇳',
  avatar: 'https://picsum.photos/seed/admin-bharat/200',
  mobile: '8369404361',
  role: 'admin',
  totalLeads: 0,
  totalListings: 0
};
