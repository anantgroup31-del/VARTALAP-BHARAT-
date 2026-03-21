
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  VehicleListing, LocalService, BuilderListing, OwnerListing, GroceryProduct 
} from './types.ts';
import { 
  LIST_OF_BANKS, LOCAL_SERVICE_CATEGORIES, CURRENT_USER 
} from './constants.tsx';
import { 
  SearchIcon, BackIcon, ToolsIcon, LoanIcon, 
  HomeIcon, PersonIcon, VideoIcon, PhoneIcon,
  VartalapBharatLogo, SparkleIcon, CameraIcon, VehicleIcon, StarIcon, PlusIcon, MapPinIcon,
  MenuIcon, HeartIcon, ChevronRightIcon, MicIcon, ShoppingBagIcon, FileIcon, HeadphonesIcon, UserIcon,
  RefreshIcon, MaximizeIcon, LiveLocationIcon, CurrentLocationIcon, ChatIcon
} from './components/Icons.tsx';

import { 
  auth, db, storage, loginWithGoogle, logout, loginWithEmail, signupWithEmail,
  collection, doc, setDoc, getDoc, getDocs, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp,
  onAuthStateChanged, handleFirestoreError, OperationType,
  ref, uploadBytes, getDownloadURL
} from './firebase.ts';

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, errorInfo: string }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorInfo: '' };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message };
  }

  render() {
    if (this.state.hasError) {
      let displayMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.errorInfo);
        if (parsed.error && parsed.error.includes('Missing or insufficient permissions')) {
          displayMessage = "You don't have permission to perform this action. Please check your role.";
        }
      } catch (e) {
        displayMessage = this.state.errorInfo;
      }
      return (
        <div className="h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <ToolsIcon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 uppercase mb-2">Application Error</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-md">{displayMessage}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all hover:bg-indigo-700"
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

type Tab = 'hub' | 'vehicle' | 'loan' | 'local' | 'property' | 'grocery';
type View = 'user_app' | 'admin_login' | 'admin_console';
type BookingStage = 'hub' | 'search' | 'location_picker' | 'ride_selection' | 'verification' | 'confirming' | 'tracking' | 'ride_confirmation';

interface Lead {
  id: string;
  type: string;
  userName: string;
  userMobile: string;
  details: string;
  timestamp: string;
}

import { Post } from './types.ts';

const INITIAL_VEHICLES_MOCK: VehicleListing[] = [
  { id: 'v1', ownerName: 'Om Prakash', ownerPhoto: '', vehicleNumber: 'MH-02-AB-1234', vehicleType: 'Car', vehiclePhoto: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400', location: 'Borivali, Mumbai', title: 'Luxury Car for Local Trip', description: 'Clean and well maintained car.', status: 'active', availability: 'Available', timestamp: 'Active Now', licenseNumber: 'DL12345' },
  { id: 'v2', ownerName: 'Rajesh Kumar', ownerPhoto: '', vehicleNumber: 'MH-04-XY-9988', vehicleType: 'Tempo', vehiclePhoto: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400', location: 'Andheri, Mumbai', title: 'Heavy Duty Tempo for shifting', description: 'Reliable service for luggage.', status: 'active', availability: 'Busy', timestamp: '2 mins ago', licenseNumber: 'DL99887' },
];

const INITIAL_BUILDERS_MOCK: BuilderListing[] = [
  { id: 'b1', builderLogo: 'https://i.pravatar.cc/150?u=build1', builderName: 'Lodha Group', buildingName: 'Lodha World One', reraNumber: 'P51900000001', location: 'Lower Parel, Mumbai', propertyType: '4BHK Luxury', photo: 'https://images.unsplash.com/photo-1545324418-f1d3ac597347?w=600', title: 'Iconic Living', description: 'Tallest tower.', timestamp: 'Just Now', status: 'active' },
];

const INITIAL_SERVICES_MOCK: LocalService[] = [
  { id: 'ls1', businessName: 'SHREE GANESH PLUMBING', ownerName: 'Sanjay Gupta', photo: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400', location: 'Borivali West', category: 'Plumber', description: '24/7 Service', status: 'active', timestamp: '2h ago' },
];

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [authError, setAuthError] = useState('');
  const [view, setView] = useState<View>('user_app');
  const [activeTab, setActiveTab] = useState<Tab>('hub');
  const [serviceSearch, setServiceSearch] = useState('');
  const [grocerySearch, setGrocerySearch] = useState('');
  const [debouncedServiceSearch, setDebouncedServiceSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedServiceSearch(serviceSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [serviceSearch]);
  
  const [localServices, setLocalServices] = useState<LocalService[]>([]);
  const [groceryProducts, setGroceryProducts] = useState<GroceryProduct[]>([]);
  const [builders, setBuilders] = useState<BuilderListing[]>([]);
  const [owners, setOwners] = useState<OwnerListing[]>([]);
  const [vehicles, setVehicles] = useState<VehicleListing[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'grocery_products'), where('status', '==', 'active'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroceryProduct));
      setGroceryProducts(products);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'grocery_products'));
    return () => unsubscribe();
  }, []);

  const filteredLocalServices = React.useMemo(() => {
    return localServices.filter(s => 
      s.category.toLowerCase().includes(debouncedServiceSearch.toLowerCase()) || 
      s.businessName.toLowerCase().includes(debouncedServiceSearch.toLowerCase())
    );
  }, [localServices, debouncedServiceSearch]);

  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [showLoanApply, setShowLoanApply] = useState(false);
  const [showLoanDocs, setShowLoanDocs] = useState(false);
  const [showCibilCheck, setShowCibilCheck] = useState(false);
  const [showLoanStatus, setShowLoanStatus] = useState(false);
  const [adminAuth, setAdminAuth] = useState({ id: '', password: '' });
  const [currentGpsLocation, setCurrentGpsLocation] = useState('');
  const [propertyTypeSelection, setPropertyTypeSelection] = useState<'builders' | 'owner'>('builders');

  // Vehicle Booking Specific State
  const [bookingStage, setBookingStage] = useState<BookingStage>('hub');
  const [rideHistory, setRideHistory] = useState<any[]>([]);
  const [showRideHistory, setShowRideHistory] = useState(false);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('');
  const [bookingFrom, setBookingFrom] = useState('');
  const [bookingTo, setBookingTo] = useState('');
  const [bookingDate, setBookingDate] = useState('2026-03-21');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [locationPickerTarget, setLocationPickerTarget] = useState<'from' | 'to'>('from');
  const [selectedRide, setSelectedRide] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleListing | null>(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [driverAssigned, setDriverAssigned] = useState<any>(null);
  const [userMobile, setUserMobile] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [builderLogo, setBuilderLogo] = useState<string | null>(null);
  const [ownerPhoto, setOwnerPhoto] = useState<string | null>(null);
  const [licensePhoto, setLicensePhoto] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [appStatuses, setAppStatuses] = useState<any[]>([]);
  const [isUploadingStatus, setIsUploadingStatus] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const ownerPhotoInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);
  const statusPhotoInputRef = useRef<HTMLInputElement>(null);
  const statusVideoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (user.email === 'anantgroup31@gmail.com' && userData.role !== 'admin') {
              await updateDoc(userDocRef, { role: 'admin', isOnline: true });
              userData.role = 'admin';
            } else {
              await updateDoc(userDocRef, { isOnline: true });
            }
            userData.isOnline = true;
            setCurrentUser(userData);
          } else {
            const newUser = {
              id: user.uid,
              name: user.displayName || 'User',
              avatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
              mobile: user.phoneNumber || '',
              role: user.email === 'anantgroup31@gmail.com' ? 'admin' : 'user',
              status: 'Jai Bharat!',
              totalLeads: 0,
              totalListings: 0,
              isOnline: true
            };
            await setDoc(userDocRef, newUser);
            setCurrentUser(newUser);
          }
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setIsAuthReady(true);
      }
    });

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const locString = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
        setCurrentGpsLocation(locString);
      });
    }

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const handleOffline = () => {
      updateDoc(doc(db, 'users', currentUser.id), { isOnline: false });
    };

    window.addEventListener('beforeunload', handleOffline);
    return () => {
      handleOffline();
      window.removeEventListener('beforeunload', handleOffline);
    };
  }, [currentUser?.id]);

  const handleStatusUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setIsUploadingStatus(true);
    try {
      const storageRef = ref(storage, `statuses/${currentUser.id}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const post = {
        approvalType: 'Status',
        uid: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        type,
        url: downloadURL,
        status: 'pending',
        timestamp: new Date().toLocaleString(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      };

      await addDoc(collection(db, 'pending_approvals'), post);
      alert('Jai Bharat! Aapka status approval ke liye Admin Console mein bhej diya gaya hai.');
    } catch (err) {
      console.error("Status Upload Error:", err);
      alert("Error uploading status. Please try again.");
    } finally {
      setIsUploadingStatus(false);
    }
  };

  useEffect(() => {
    if (!isAuthReady) return;

    const unsubServices = onSnapshot(query(collection(db, 'services'), where('status', '==', 'active')), (snap) => {
      setLocalServices(snap.docs.map(d => ({ id: d.id, ...d.data() } as LocalService)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'services'));

    const unsubBuilders = onSnapshot(query(collection(db, 'builders'), where('status', '==', 'active')), (snap) => {
      setBuilders(snap.docs.map(d => ({ id: d.id, ...d.data() } as BuilderListing)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'builders'));

    const unsubOwners = onSnapshot(query(collection(db, 'owners'), where('status', '==', 'active')), (snap) => {
      setOwners(snap.docs.map(d => ({ id: d.id, ...d.data() } as OwnerListing)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'owners'));

    const unsubVehicles = onSnapshot(query(collection(db, 'vehicles'), where('status', '==', 'active')), (snap) => {
      setVehicles(snap.docs.map(d => ({ id: d.id, ...d.data() } as VehicleListing)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'vehicles'));

    const unsubLeads = onSnapshot(collection(db, 'leads'), (snap) => {
      setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lead)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'leads'));

    const unsubPending = onSnapshot(collection(db, 'pending_approvals'), (snap) => {
      setPendingApprovals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'pending_approvals'));

    const unsubAllUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

    const unsubStatuses = onSnapshot(query(collection(db, 'statuses'), where('status', '==', 'active')), (snap) => {
      setAppStatuses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'statuses'));

    const unsubRides = onSnapshot(query(collection(db, 'ride_bookings'), where('uid', '==', currentUser.id)), (snap) => {
      setRideHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'ride_bookings'));

    return () => {
      unsubServices();
      unsubBuilders();
      unsubOwners();
      unsubVehicles();
      unsubLeads();
      unsubPending();
      unsubAllUsers();
      unsubStatuses();
      unsubRides();
    };
  }, [isAuthReady]);

  useEffect(() => {
    setShowForm(false);
    setShowLoanApply(false);
    setShowLoanDocs(false);
    setShowCibilCheck(false);
    setShowLoanStatus(false);
    setPropertyTypeSelection('builders');
    setIsVerifying(false);
    setUserOtp('');
    setUserMobile('');
  }, [activeTab]);

  useEffect(() => {
    if (bookingStage === 'confirming') {
      const timer = setTimeout(() => {
        setDriverAssigned({
          name: 'Rajesh Kumar',
          rating: '4.8',
          vehicle: `White ${selectedRide?.name || 'Vehicle'}`,
          number: 'MH 02 AB 1234',
          otp: '4829',
          avatar: 'https://i.pravatar.cc/150?u=driver1'
        });
        setBookingStage('tracking');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [bookingStage]);

  const save = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  const captureLead = async (type: string, details: string) => {
    if (!currentUser) return;
    const locationPart = currentGpsLocation ? ` [Loc: ${currentGpsLocation}]` : '';
    const newLead = {
      type,
      userName: currentUser.name,
      userMobile: currentUser.mobile,
      details: details + locationPart,
      timestamp: new Date().toLocaleString(),
      uid: currentUser.id
    };
    try {
      await addDoc(collection(db, 'leads'), newLead);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'leads');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'logo' | 'owner' | 'license') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'image') setSelectedImage(url);
      else if (type === 'video') setSelectedVideo(url);
      else if (type === 'logo') setBuilderLogo(url);
      else if (type === 'owner') setOwnerPhoto(url);
      else if (type === 'license') setLicensePhoto(url);
    }
  };

  const handleConnectGps = (inputId?: string) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const locString = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
        setCurrentGpsLocation(locString);
        
        // If in vehicle booking, set as pickup
        if (activeTab === 'vehicle') {
          setBookingFrom(locString + " (Current Location)");
        }

        if (inputId) {
          const el = document.getElementById(inputId) as HTMLInputElement;
          if (el) el.value = locString + " (GPS Connected)";
        } else {
          alert(`Jai Bharat! GPS Connected at ${locString}`);
        }
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const submitForApproval = async (type: string, data: any) => {
    if (!currentUser) return;
    const finalType = type === 'property' ? (propertyTypeSelection === 'builders' ? 'Builders' : 'Owner') : type;
    const post = {
      approvalType: finalType,
      ...data,
      status: 'pending',
      timestamp: new Date().toLocaleString(),
      uid: currentUser.id,
      photo: selectedImage || 'https://images.unsplash.com/photo-1560513617-49741da02543?w=800',
      video: selectedVideo || undefined,
      vehiclePhoto: (activeTab === 'vehicle' || type === 'Vehicle') ? selectedImage || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400' : undefined,
      builderLogo: builderLogo || (finalType === 'Builders' ? 'https://i.pravatar.cc/150?u=new' : undefined),
      ownerPhoto: ownerPhoto || undefined,
      licensePhoto: licensePhoto || undefined
    };
    
    try {
      await addDoc(collection(db, 'pending_approvals'), post);
      alert('Jai Bharat! Aapka post approval ke liye Admin Console mein bhej diya gaya hai.');
      setShowForm(false);
      setSelectedImage(null);
      setSelectedVideo(null);
      setBuilderLogo(null);
      setOwnerPhoto(null);
      setLicensePhoto(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'pending_approvals');
    }
  };

  const handleAdminAction = async (post: any, approved: boolean) => {
    try {
      if (approved) {
        const collectionName = post.approvalType === 'Builders' ? 'builders' : 
                             post.approvalType === 'Owner' ? 'owners' :
                             post.approvalType === 'Service' ? 'services' :
                             post.approvalType === 'Vehicle' ? 'vehicles' : 
                             post.approvalType === 'grocery' ? 'grocery_products' :
                             post.approvalType === 'Status' ? 'statuses' : null;
        
        if (collectionName) {
          await addDoc(collection(db, collectionName), { ...post, status: 'active', timestamp: new Date().toLocaleString() });
        }
      }
      await deleteDoc(doc(db, 'pending_approvals', post.id));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'admin_action');
    }
  };

  const handleLoanSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const bankName = fd.get('bankName');
    const mobile = fd.get('mobile');
    captureLead('Loan Application', `Bank: ${bankName}, Income: ${fd.get('monthlyIncome')}`);
    alert(`Jai Bharat! Application submitted.\n\n1. Message sent to ${bankName} Headquarters.\n2. SMS sent to your mobile ${mobile} for tracking.`);
    setShowLoanApply(false);
  };

  const handleCitySelect = (city: string) => {
    if (locationPickerTarget === 'from') setBookingFrom(city);
    else setBookingTo(city);
    setBookingStage('search');
  };

  const handleBookRide = async () => {
    if (!currentUser || !selectedRide) return;
    const bookingData = {
      uid: currentUser.id,
      userName: currentUser.name,
      userMobile: userMobile,
      from: bookingFrom,
      to: bookingTo,
      bookingDate: bookingDate,
      bookingTime: bookingTime,
      vehicleType: selectedRide.name,
      price: selectedRide.price,
      status: 'confirmed',
      timestamp: new Date().toLocaleString(),
      driver: {
        name: 'Rajesh Kumar',
        number: 'MH 02 AB 1234',
        otp: '4829'
      }
    };

    try {
      await addDoc(collection(db, 'ride_bookings'), bookingData);
      captureLead('Ride Booking', `${selectedRide.name} from ${bookingFrom} to ${bookingTo} on ${bookingDate} at ${bookingTime} (Mobile: ${userMobile})`);
      setBookingStage('confirming');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'ride_bookings');
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    (!selectedVehicleType || v.vehicleType === selectedVehicleType)
  );

  const renderBranding = (size: 'small' | 'large') => (
    <div className={`flex ${size === 'large' ? 'flex-col items-center' : 'items-center'}`}>
      <VartalapBharatLogo className={size === 'large' ? 'scale-[2] mb-12' : 'scale-75 -ml-4'} />
    </div>
  );

  if (view === 'admin_login') return (
    <div className="h-screen w-full bg-slate-900 flex flex-col items-center justify-center p-8 animate-smart">
      <div className="mb-10 text-white text-center">
        <VartalapBharatLogo className="w-24 h-24 mx-auto mb-4" />
        <h2 className="text-2xl font-black uppercase tracking-widest">Console Admin</h2>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if(adminAuth.id==='admin@vartalap.in' && adminAuth.password==='Bharat@2025') setView('admin_console'); else alert('Sahi ID/Password dale!'); }} className="w-full max-sm space-y-4">
        <input required type="email" placeholder="Admin ID" className="w-full p-5 bg-slate-800 border border-slate-700 text-white rounded-3xl font-bold" onChange={e=>setAdminAuth({...adminAuth, id:e.target.value})} />
        <input required type="password" placeholder="Password" className="w-full p-5 bg-slate-800 border border-slate-700 text-white rounded-3xl font-bold" onChange={e=>setAdminAuth({...adminAuth, password:e.target.value})} />
        <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-6 rounded-full font-black text-lg shadow-xl uppercase active:scale-95 transition-all hover:shadow-indigo-200/50">Login Console</button>
        <button onClick={() => setView('user_app')} className="w-full text-slate-500 text-xs font-bold uppercase py-4">Back to App</button>
      </form>
    </div>
  );

  if (!isAuthReady) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white font-black uppercase tracking-widest text-[10px]">Jai Bharat! Loading...</p>
        </div>
      </div>
    );
  }

  if (view === 'admin_console') return (
    <div className="h-screen w-full bg-slate-50 flex flex-col overflow-hidden">
      <div className="bg-slate-900 p-6 flex justify-between items-center shrink-0 shadow-lg">
        <div>
          <h2 className="text-white font-black uppercase text-sm tracking-tight leading-none">Console Account</h2>
        </div>
        <button onClick={() => setView('user_app')} className="p-2 bg-slate-800 rounded-xl text-slate-400"><BackIcon className="w-5 h-5"/></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-20">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Stats</p>
           <h4 className="text-2xl font-black text-slate-900 mt-1">1,40,00,00+ Members</h4>
        </div>
        <section>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pending Approvals ({pendingApprovals.length})</h3>
          <div className="space-y-4">
            {pendingApprovals.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">{p.approvalType}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase">{p.timestamp}</span>
                </div>
                <h4 className="font-bold text-lg leading-tight mb-2">{p.buildingName || p.businessName || p.vehicleNumber || p.title}</h4>
                
                <div className="space-y-2 mb-4">
                  {p.ownerName && <p className="text-[10px] font-bold text-slate-500 uppercase">Owner: <span className="text-slate-900">{p.ownerName}</span></p>}
                  {p.builderName && <p className="text-[10px] font-bold text-slate-500 uppercase">Builder: <span className="text-slate-900">{p.builderName}</span></p>}
                  {p.reraNumber && <p className="text-[10px] font-bold text-slate-500 uppercase">RERA: <span className="text-slate-900">{p.reraNumber}</span></p>}
                  {p.location && <p className="text-[10px] font-bold text-slate-500 uppercase">Location: <span className="text-slate-900">{p.location}</span></p>}
                  {p.propertyType && <p className="text-[10px] font-bold text-slate-500 uppercase">Type: <span className="text-slate-900">{p.propertyType}</span></p>}
                  {p.vehicleType && <p className="text-[10px] font-bold text-slate-500 uppercase">Vehicle: <span className="text-slate-900">{p.vehicleType}</span></p>}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {p.builderLogo && (
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Logo</p>
                      <img src={p.builderLogo} className="w-full h-20 object-cover rounded-xl bg-slate-50" alt="" loading="lazy" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  {p.ownerPhoto && (
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Owner Photo</p>
                      <img src={p.ownerPhoto} className="w-full h-20 object-cover rounded-xl bg-slate-50" alt="" loading="lazy" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  {p.licensePhoto && (
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase">License</p>
                      <img src={p.licensePhoto} className="w-full h-20 object-cover rounded-xl bg-slate-50" alt="" loading="lazy" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  {(p.photo || p.vehiclePhoto || p.url) && (
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Main Media</p>
                      {p.approvalType === 'Status' && p.type === 'video' ? (
                        <div className="w-full h-20 bg-slate-900 rounded-xl flex items-center justify-center">
                          <VideoIcon className="w-6 h-6 text-white/50" />
                        </div>
                      ) : (
                        <img src={p.photo || p.vehiclePhoto || p.url} className="w-full h-20 object-cover rounded-xl bg-slate-50" alt="" loading="lazy" referrerPolicy="no-referrer" />
                      )}
                    </div>
                  )}
                </div>

                {p.description && (
                  <p className="text-xs text-slate-600 mb-4 line-clamp-2">{p.description}</p>
                )}

                <div className="flex gap-3 mt-4">
                  <button onClick={() => handleAdminAction(p, true)} className="flex-1 bg-[#008751] text-white py-3.5 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-[#007043] transition-all active:scale-95">Approve Live</button>
                  <button onClick={() => handleAdminAction(p, false)} className="flex-1 bg-rose-600 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-rose-700 transition-all active:scale-95">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Deployment & Domain Guide */}
        <section className="mt-12">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Deployment & Domain Guide</h3>
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
            <div className="space-y-6">
              <div>
                <h4 className="text-red-600 font-black uppercase text-xs mb-2 tracking-widest">Step 1: App Deploy Karein</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  AI Studio ke top-right corner mein <span className="text-white font-bold">"Share"</span> button par click karein ya Settings menu se <span className="text-white font-bold">"Deploy to Cloud Run"</span> select karein. Isse aapka app internet par live ho jayega.
                </p>
              </div>
              
              <div className="h-px bg-white/10"></div>

              <div>
                <h4 className="text-red-600 font-black uppercase text-xs mb-2 tracking-widest">Step 2: Domain Connect Karein</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Google Cloud Console mein jaakar apne Cloud Run service ki settings mein <span className="text-white font-bold">"Manage Custom Domains"</span> par click karein.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[8px] font-black uppercase text-slate-500 mb-1">TXT Record</p>
                    <p className="text-[10px] font-mono text-red-400">google-site-verification=...</p>
                    <p className="text-[8px] text-slate-500 mt-1 uppercase">Domain verify karne ke liye</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[8px] font-black uppercase text-slate-500 mb-1">A Record (IP)</p>
                    <p className="text-[10px] font-mono text-red-400">216.239.32.21</p>
                    <p className="text-[8px] text-slate-500 mt-1 uppercase">Domain ko server se jodne ke liye</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-600/10 p-4 rounded-2xl border border-red-600/20">
                <p className="text-[10px] font-black text-red-600 uppercase mb-1">Pro Tip</p>
                <p className="text-[10px] text-red-200/70 leading-relaxed">
                  Agar aap chahte hain ki sabhi users ka data ek saath dikhe, toh <span className="text-white font-bold">Firebase Database</span> setup karna zaroori hai. Abhi data sirf local storage mein save ho raha hai.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isSignupMode) {
        await signupWithEmail(authEmail, authPassword);
      } else {
        await loginWithEmail(authEmail, authPassword);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setAuthError(err.message || "Authentication failed. Please try again.");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-8 relative overflow-y-auto no-scrollbar">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#008751]/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-red-600/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[100px]"></div>
        
        <div className="relative z-10 w-full max-w-md text-center py-10">
          <div className="mb-8 animate-bounce">
            {renderBranding('large')}
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Jai Bharat!</h2>
            <p className="text-white/60 font-bold text-[10px] mb-8 leading-relaxed uppercase tracking-widest">
              {isSignupMode ? 'Naya account banayein' : 'Sab milega yaha! Login karein.'}
            </p>

            <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
              <div className="space-y-1 text-left">
                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest ml-4">Email Address</label>
                <input 
                  type="email" 
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-red-500 transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest ml-4">Password</label>
                <input 
                  type="password" 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-red-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              {authError && (
                <p className="text-red-500 text-[9px] font-black uppercase tracking-widest bg-red-500/10 p-2 rounded-lg">
                  {authError}
                </p>
              )}

              <button 
                type="submit"
                className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all"
              >
                {isSignupMode ? 'Create Account' : 'Login Now'}
              </button>
            </form>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] flex-1 bg-white/10"></div>
              <span className="text-[8px] font-black text-white/20 uppercase">OR</span>
              <div className="h-[1px] flex-1 bg-white/10"></div>
            </div>
            
            <button 
              onClick={loginWithGoogle}
              className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-red-200 active:scale-95 transition-all flex items-center justify-center gap-4"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/0/google.svg" className="w-5 h-5" alt="Google" />
              Login with Google
            </button>

            <button 
              onClick={() => setIsSignupMode(!isSignupMode)}
              className="mt-6 text-white/40 hover:text-white text-[9px] font-black uppercase tracking-widest transition-colors"
            >
              {isSignupMode ? 'Already have an account? Login' : 'Don\'t have an account? Sign up'}
            </button>
            
            <div className="mt-8 pt-8 border-t border-white/5">
              <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">
                Secure & Verified Platform
              </p>
            </div>
          </div>
          
          <p className="mt-8 text-white/30 text-[9px] font-black uppercase tracking-widest">
            Made with ❤️ for Bharat
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-slate-50 relative">
      <div className="safe-top bg-white border-b border-slate-100 z-30 shrink-0 shadow-sm">
        <div className="px-6 py-2 flex items-center justify-between h-[60px]">
          {renderBranding('small')}
          <button className="p-2 text-slate-900">
            <MenuIcon className="w-8 h-8" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 relative">
        {showForm ? (
          <div className="p-6 animate-smart pb-20">
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setShowForm(false)} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100"><BackIcon className="w-5 h-5"/></button>
              <h2 className="text-2xl font-black uppercase tracking-tight">Post {activeTab}</h2>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); submitForApproval(activeTab, Object.fromEntries(new FormData(e.currentTarget))); }} className="space-y-5">
              
              {activeTab === 'property' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Listing Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={() => setPropertyTypeSelection('builders')} className={`p-4 rounded-3xl font-black text-[10px] uppercase border-2 transition-all ${propertyTypeSelection === 'builders' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-400 border-slate-100'}`}>Builder Project</button>
                    <button type="button" onClick={() => setPropertyTypeSelection('owner')} className={`p-4 rounded-3xl font-black text-[10px] uppercase border-2 transition-all ${propertyTypeSelection === 'owner' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-400 border-slate-100'}`}>Owner Listing</button>
                  </div>
                </div>
              )}

              {(activeTab === 'property' && propertyTypeSelection === 'builders') && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Builder Logo</label>
                    <div onClick={() => logoInputRef.current?.click()} className="w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                      {builderLogo ? <img src={builderLogo} className="w-full h-full object-cover" /> : <PlusIcon className="w-8 h-8 text-slate-300" />}
                      <input type="file" ref={logoInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'logo')} accept="image/*" />
                    </div>
                  </div>
                  <input name="builderName" required placeholder="Builder Name" className="w-full p-4 bg-white border border-slate-100 rounded-3xl font-bold shadow-sm" />
                  <input name="buildingName" required placeholder="Building Name" className="w-full p-4 bg-white border border-slate-100 rounded-3xl font-bold shadow-sm" />
                  <input name="reraNumber" required placeholder="RERA Number" className="w-full p-4 bg-white border border-slate-100 rounded-3xl font-bold shadow-sm" />
                  <input name="propertyType" required placeholder="Property Type (e.g. 2BHK, 3BHK)" className="w-full p-4 bg-white border border-slate-100 rounded-3xl font-bold shadow-sm" />
                </>
              )}

              {(activeTab === 'property' && propertyTypeSelection === 'owner') && (
                <>
                  <input name="ownerName" required placeholder="Your Name" className="w-full p-4 bg-white border border-slate-100 rounded-3xl font-bold shadow-sm" />
                  <input name="buildingName" required placeholder="Building Name" className="w-full p-4 bg-white border border-slate-100 rounded-3xl font-bold shadow-sm" />
                  <input name="propertyType" required placeholder="Property Type" className="w-full p-4 bg-white border border-slate-100 rounded-3xl font-bold shadow-sm" />
                </>
              )}

              {activeTab === 'vehicle' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Vehicle Photo</label>
                    <div onClick={() => imageInputRef.current?.click()} className="w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:bg-slate-100 transition-colors">
                      {selectedImage ? (
                        <img src={selectedImage} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <PlusIcon className="w-8 h-8 text-slate-300 group-hover:scale-110 transition-transform" />
                          <p className="text-[10px] font-black text-slate-400 uppercase mt-2">Upload Vehicle Photo</p>
                        </>
                      )}
                      <input type="file" ref={imageInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'image')} accept="image/*" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Owner Name</label>
                      <input name="ownerName" required placeholder="Full Name" className="w-full p-4 bg-white border border-slate-100 rounded-3xl font-bold shadow-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Vehicle Number</label>
                      <input name="vehicleNumber" required placeholder="MH 01 AB 1234" className="w-full p-4 bg-white border border-slate-100 rounded-3xl font-bold shadow-sm uppercase" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Driver License Number</label>
                    <input name="driverLicense" required placeholder="DL-1234567890" className="w-full p-4 bg-white border border-slate-100 rounded-3xl font-bold shadow-sm uppercase" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Vehicle Type</label>
                    <select name="vehicleType" required className="w-full p-4 bg-white border border-slate-100 rounded-3xl font-bold shadow-sm">
                      <option value="Car">Car</option>
                      <option value="Auto">Auto</option>
                      <option value="Bus">Bus</option>
                      <option value="Tempo">Tempo</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'grocery' && (
                <>
                  <input name="productName" required placeholder="Product Name (e.g. Fresh Tomatoes)" className="w-full p-4 bg-white border border-slate-100 rounded-3xl font-bold shadow-sm" />
                  <div className="grid grid-cols-2 gap-4">
                    <input name="price" required placeholder="Price (e.g. ₹40)" className="w-full p-4 bg-white border border-slate-100 rounded-3xl font-bold shadow-sm" />
                    <input name="unit" required placeholder="Unit (e.g. per kg)" className="w-full p-4 bg-white border border-slate-100 rounded-3xl font-bold shadow-sm" />
                  </div>
                  <input name="category" required placeholder="Category (Vegetables, Fruits, Dairy...)" className="w-full p-4 bg-white border border-slate-100 rounded-3xl font-bold shadow-sm" />
                </>
              )}

              {activeTab === 'local' && (
                <>
                  <input name="businessName" required placeholder="Business Name" className="w-full p-4 bg-white border border-slate-100 rounded-3xl font-bold shadow-sm" />
                  <input name="ownerName" required placeholder="Owner Name" className="w-full p-4 bg-white border border-slate-100 rounded-3xl font-bold shadow-sm" />
                  <input name="category" required placeholder="Category (Plumber, Electrician...)" className="w-full p-4 bg-white border border-slate-100 rounded-3xl font-bold shadow-sm" />
                </>
              )}

              {(activeTab === 'local' || activeTab === 'property') && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Google Location (GPS)</label>
                  <div className="relative">
                    <input name="location" id="listing-gps-input" required placeholder="Connect GPS" className="w-full p-4 bg-white border border-slate-100 rounded-3xl font-bold shadow-sm pr-12" />
                    <button type="button" onClick={() => handleConnectGps('listing-gps-input')} className="absolute right-4 top-4 text-red-600 animate-pulse"><SparkleIcon className="w-5 h-5"/></button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                  {activeTab === 'vehicle' ? 'Vehicle Photo' : 'Image / Video Upload'}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div onClick={() => imageInputRef.current?.click()} className="w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                    {selectedImage ? <img src={selectedImage} className="w-full h-full object-cover" /> : <div className="text-center"><CameraIcon className="w-8 h-8 mx-auto text-slate-300" /><span className="text-[8px] font-bold text-slate-400 uppercase mt-1">Photo</span></div>}
                    <input type="file" ref={imageInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'image')} accept="image/*" />
                  </div>
                  {activeTab !== 'vehicle' && (
                    <div onClick={() => videoInputRef.current?.click()} className="w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                      {selectedVideo ? <div className="text-red-600 font-bold text-[10px]">Video Selected</div> : <div className="text-center"><VideoIcon className="w-8 h-8 mx-auto text-slate-300" /><span className="text-[8px] font-bold text-slate-400 uppercase mt-1">Video</span></div>}
                      <input type="file" ref={videoInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'video')} accept="video/*" />
                    </div>
                  )}
                </div>
              </div>

              {activeTab !== 'vehicle' && (
                <>
                  <input name="title" required placeholder="Title" className="w-full p-4 bg-white border border-slate-100 rounded-3xl font-bold shadow-sm" />
                  <textarea name="description" placeholder="Description" className="w-full p-4 bg-white border border-slate-100 rounded-3xl font-bold h-32 shadow-sm" />
                </>
              )}

              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-full font-black uppercase shadow-xl active:scale-95 transition-all hover:bg-slate-800">Submit for Approval</button>
            </form>
          </div>
        ) : activeTab === 'loan' ? (
          <div className="p-6">
            {!showLoanApply && !showLoanDocs && !showCibilCheck ? (
              <div className="space-y-8 animate-smart">
                <div className="p-10 text-center bg-white rounded-[3.5rem] border border-slate-100 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-red-50 rounded-bl-[6rem] -mr-20 -mt-20 group-hover:bg-red-100 transition-colors"></div>
                  <div className="w-24 h-24 bg-red-600 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-red-200 relative z-10 animate-pulse">
                    <LoanIcon className="w-12 h-12" />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Bharat Loan Hub</h2>
                  <p className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] mt-4">SABSE TEZ LOAN APPROVAL</p>
                  <button onClick={() => setShowLoanApply(true)} className="mt-12 w-full bg-red-600 text-white py-7 rounded-full font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-red-100 active:translate-y-1 transition-all hover:bg-red-700">Apply Loan Now</button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setShowCibilCheck(true)} className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 shadow-sm flex flex-col items-center gap-4 active:scale-95 transition-all hover:shadow-md hover:border-amber-200 group">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-[1.5rem] flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all shadow-inner"><StarIcon className="w-7 h-7"/></div>
                    <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest text-center">CIBIL Score</span>
                  </button>
                  <button onClick={() => setShowLoanDocs(true)} className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 shadow-sm flex flex-col items-center gap-4 active:scale-95 transition-all hover:shadow-md hover:border-blue-200 group">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner"><ToolsIcon className="w-7 h-7"/></div>
                    <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest text-center">Documents</span>
                  </button>
                </div>

                <button onClick={() => setShowLoanStatus(true)} className="w-full bg-white p-6 rounded-[2.5rem] border-t-2 border-t-red-600 border-b-2 border-b-[#008751] flex items-center justify-between group shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-5 text-left">
                    <div className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-100">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase text-slate-900 tracking-tight">Track Application</h4>
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Check Approval Status</p>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-ping mr-4"></div>
                </button>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4">Partner Banks</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {LIST_OF_BANKS.slice(0, 20).map(bank => (
                      <button key={bank} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 flex items-center gap-4 shadow-sm hover:shadow-md hover:scale-[1.02] hover:border-indigo-200 active:scale-95 transition-all group">
                        <div className="w-12 h-12 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-inner">{bank.charAt(0)}</div>
                        <span className="text-[10px] font-black text-slate-900 uppercase truncate tracking-tighter">{bank}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : showLoanApply ? (
              <div className="animate-smart pb-20">
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => setShowLoanApply(false)} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100"><BackIcon className="w-5 h-5"/></button>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Loan Apply Now</h2>
                </div>
                <form onSubmit={handleLoanSubmit} className="space-y-6">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Select Bank (20 Banks Available)</label>
                    <select name="bankName" required className="w-full p-5 bg-white border border-slate-100 rounded-[2rem] font-bold shadow-sm focus:ring-2 focus:ring-red-100 focus:border-red-600 transition-all outline-none">
                      {LIST_OF_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input name="aadhaar" required placeholder="Aadhaar" className="w-full p-5 bg-white border border-slate-100 rounded-[2rem] font-bold shadow-sm focus:ring-2 focus:ring-red-100 focus:border-red-600 transition-all outline-none" />
                    <input name="pan" required placeholder="PAN" className="w-full p-5 bg-white border border-slate-100 rounded-[2rem] font-bold shadow-sm uppercase focus:ring-2 focus:ring-red-100 focus:border-red-600 transition-all outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input name="mobile" required type="tel" placeholder="Mobile Number" className="w-full p-5 bg-white border border-slate-100 rounded-[2rem] font-bold shadow-sm focus:ring-2 focus:ring-red-100 focus:border-red-600 transition-all outline-none" />
                    <input name="monthlyIncome" required type="number" placeholder="Monthly Income" className="w-full p-5 bg-white border border-slate-100 rounded-[2rem] font-bold shadow-sm focus:ring-2 focus:ring-red-100 focus:border-red-600 transition-all outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Google Location (GPS)</label>
                    <div className="relative">
                      <input name="location" id="loan-gps-input" required placeholder="Connect GPS" className="w-full p-5 bg-white border border-slate-100 rounded-[2rem] font-bold shadow-sm pr-16 focus:ring-2 focus:ring-red-100 focus:border-red-600 transition-all outline-none" />
                      <button type="button" onClick={() => handleConnectGps('loan-gps-input')} className="absolute right-4 top-3 w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center animate-pulse"><SparkleIcon className="w-5 h-5"/></button>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 text-white py-7 rounded-full font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-indigo-100 active:translate-y-1 transition-all hover:bg-indigo-700">Apply Now</button>
                </form>
              </div>
            ) : showLoanDocs ? (
              <div className="animate-smart pb-20">
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => setShowLoanDocs(false)} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100"><BackIcon className="w-5 h-5"/></button>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Documents</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { title: 'Aadhaar Card', desc: 'Identity & Address Proof', icon: '🆔' },
                    { title: 'PAN Card', desc: 'Mandatory for Financials', icon: '💳' },
                    { title: 'Bank Statement', desc: 'Last 6 Months', icon: '📊' },
                    { title: 'Salary Slips', desc: 'Last 3 Months (For Salaried)', icon: '📝' },
                    { title: 'ITR / Form 16', desc: 'Income Proof', icon: '📄' }
                  ].map(doc => (
                    <div key={doc.title} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-red-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-xl shadow-inner">{doc.icon}</div>
                        <div>
                          <h4 className="font-black text-sm uppercase text-slate-900">{doc.title}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{doc.desc}</p>
                        </div>
                      </div>
                      <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-inner">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : showCibilCheck ? (
              <div className="animate-smart pb-20">
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => setShowCibilCheck(false)} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100"><BackIcon className="w-5 h-5"/></button>
                  <h2 className="text-2xl font-black uppercase tracking-tight">CIBIL Check</h2>
                </div>
                <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-[#008751]"></div>
                  <div className="relative w-64 h-64 mx-auto mb-10">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#dc2626" />
                          <stop offset="100%" stopColor="#16a34a" />
                        </linearGradient>
                      </defs>
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#f0fdf4" strokeWidth="12" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#scoreGradient)" strokeWidth="12" strokeDasharray="210 264" strokeLinecap="round" className="animate-dash" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-6xl font-black text-slate-900 tracking-tighter">785</span>
                      <div className="px-4 py-1.5 bg-gradient-to-r from-red-600 to-[#008751] text-white text-[10px] font-black uppercase rounded-full mt-3 shadow-lg shadow-red-200">Excellent</div>
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Shandaar Score!</h3>
                  <p className="text-sm font-bold text-slate-500 mt-4 leading-relaxed px-4">Aapka credit profile bahut mazboot hai. Top banks se best interest rates par loan ke liye aap eligible hain.</p>
                  <button onClick={() => { setShowCibilCheck(false); setShowLoanApply(true); }} className="mt-10 w-full bg-red-600 text-white py-6 rounded-full font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-red-100 active:translate-y-1 transition-all hover:bg-red-700">Apply for Loan Now</button>
                </div>
              </div>
            ) : showLoanStatus ? (
              <div className="animate-smart pb-20">
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => setShowLoanStatus(false)} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100"><BackIcon className="w-5 h-5"/></button>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Loan Status</h2>
                </div>
                
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-10">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Application ID</p>
                      <h4 className="text-lg font-black text-slate-900">#BH-2026-8892</h4>
                    </div>
                    <div className="bg-red-50 text-red-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase">In Progress</div>
                  </div>

                  <div className="space-y-10 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100"></div>

                    {[
                      { title: 'Application Submitted', date: '25 Feb, 2026', status: 'completed', desc: 'Aapka application safaltapoorvak jama ho gaya hai.' },
                      { title: 'Document Verification', date: '25 Feb, 2026', status: 'completed', desc: 'Aadhar aur PAN card verify ho chuke hain.' },
                      { title: 'Bank Review', date: 'Processing', status: 'active', desc: 'Bank Headquarters aapki file check kar raha hai.' },
                      { title: 'Final Approval', date: 'Pending', status: 'pending', desc: 'Approval ke baad aapko SMS mil jayega.' }
                    ].map((step, idx) => (
                      <div key={step.title} className="flex gap-6 relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          step.status === 'completed' ? 'bg-red-500 text-white' : 
                          step.status === 'active' ? 'bg-red-600 text-white animate-pulse' : 
                          'bg-slate-100 text-slate-400'
                        }`}>
                          {step.status === 'completed' ? (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                          ) : (
                            <span className="text-[10px] font-black">{idx + 1}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`font-black text-sm uppercase ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-900'}`}>{step.title}</h4>
                            <span className="text-[8px] font-bold text-slate-400 uppercase">{step.date}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 font-medium">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 text-center uppercase leading-relaxed">
                      Bank se call aane par kripya apna <span className="text-slate-900">Application ID</span> batayein.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : activeTab === 'vehicle' ? (
          <div className="bg-white animate-smart relative">
            {/* Simulated Map Background - Fixed behind everything */}
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]"></div>
            </div>

            {/* Vehicle Details Modal */}
            <AnimatePresence>
              {showVehicleDetails && selectedVehicle && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end"
                >
                  <motion.div 
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    className="bg-white w-full rounded-t-[3rem] p-8 max-h-[85vh] overflow-y-auto no-scrollbar"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-black uppercase tracking-tighter">Vehicle Details</h2>
                      <button onClick={() => setShowVehicleDetails(false)} className="p-2 bg-slate-100 rounded-full"><PlusIcon className="w-6 h-6 rotate-45 text-slate-400"/></button>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="relative h-64 rounded-[2.5rem] overflow-hidden shadow-xl">
                        <img src={selectedVehicle.vehiclePhoto} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                        <div className="absolute top-4 right-4">
                          <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase shadow-lg ${
                            selectedVehicle.availability === 'Available' ? 'bg-[#008751] text-white' : 'bg-rose-600 text-white'
                          }`}>
                            {selectedVehicle.availability}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-[10px] font-black text-red-600 uppercase bg-red-50 px-2 py-1 rounded-md">{selectedVehicle.vehicleType}</span>
                            <h3 className="text-2xl font-black text-slate-900 mt-2 uppercase tracking-tight">{selectedVehicle.title}</h3>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Number</p>
                            <p className="text-lg font-black text-slate-900">{selectedVehicle.vehicleNumber}</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{selectedVehicle.description}</p>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm border border-white">
                            <img src={selectedVehicle.ownerPhoto || 'https://i.pravatar.cc/150?u=' + selectedVehicle.ownerName} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Owner / Driver</p>
                            <h4 className="font-black text-slate-900 uppercase">{selectedVehicle.ownerName}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">📍 {selectedVehicle.location}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => captureLead('Vehicle', selectedVehicle.ownerName)} className="bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-red-100">
                            <PhoneIcon className="w-4 h-4" /> Call Owner
                          </button>
                          <button 
                            disabled={selectedVehicle.availability === 'Busy'}
                            onClick={() => {
                              setSelectedRide({ id: selectedVehicle.vehicleType.toLowerCase(), name: selectedVehicle.vehicleType, icon: selectedVehicle.vehicleType === 'Car' ? '🚗' : selectedVehicle.vehicleType === 'Auto' ? '🛺' : selectedVehicle.vehicleType === 'Bus' ? '🚌' : '🚚' });
                              setBookingStage('search');
                              setShowVehicleDetails(false);
                            }}
                            className={`py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all ${
                              selectedVehicle.availability === 'Available' 
                                ? 'bg-slate-900 text-white shadow-slate-100' 
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                            }`}
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ride History Modal */}
            <AnimatePresence>
              {showRideHistory && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end"
                >
                  <motion.div 
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    className="bg-white w-full rounded-t-[3rem] p-8 max-h-[85vh] overflow-y-auto no-scrollbar"
                  >
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-black uppercase tracking-tighter">My Ride History</h2>
                      <button onClick={() => setShowRideHistory(false)} className="p-2 bg-slate-100 rounded-full"><PlusIcon className="w-6 h-6 rotate-45 text-slate-400"/></button>
                    </div>
                    
                    <div className="space-y-4">
                      {rideHistory.length > 0 ? rideHistory.map(ride => (
                        <div key={ride.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className="text-[8px] font-black text-red-600 uppercase bg-red-50 px-2 py-1 rounded-md">{ride.vehicleType}</span>
                              <h4 className="font-black text-slate-900 mt-2">{ride.to}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">From: {ride.from}</p>
                              <p className="text-[9px] font-black text-indigo-600 uppercase mt-1">Date: {ride.bookingDate} • Time: {ride.bookingTime}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-slate-900">{ride.price}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase">{ride.timestamp}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-lg">🚗</div>
                            <div>
                              <p className="text-[9px] font-black text-slate-900 uppercase">{ride.driver?.name}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase">{ride.driver?.number}</p>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-20">
                          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <VehicleIcon className="w-10 h-10 text-slate-200" />
                          </div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No rides found</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hub Stage: Ultra-Clear Bento Layout */}
            {bookingStage === 'hub' && (
              <div className="z-10 relative bg-white pb-10">
                {/* Header Section */}
                <div className="p-8 pb-4 flex justify-between items-start">
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-1">JAI BHARAT VEHICLE HUB</h1>
              <p className="text-xs font-black text-red-600 uppercase tracking-[0.2em]">Fast • Reliable • Safe</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => setShowForm(true)}
                      className="bg-slate-900 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-slate-100 hover:bg-slate-800"
                    >
                      + Post Vehicle
                    </button>
                    <button 
                      onClick={() => setShowRideHistory(true)}
                      className="bg-slate-900 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-slate-100 hover:bg-slate-800"
                    >
                      My Rides
                    </button>
                  </div>
                </div>

                {/* Main Action Area */}
                <div className="px-6 space-y-6">
                  {/* Ultra-Clear Search Card */}
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-red-200 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <div className="relative z-10">
                      <h2 className="text-white text-2xl font-black mb-6 leading-tight">Where are you<br/>going today?</h2>
                      <button 
                        onClick={() => setBookingStage('search')}
                        className="w-full bg-white p-5 rounded-2xl flex items-center gap-4 shadow-xl active:scale-95 transition-all"
                      >
                        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                          <SearchIcon className="w-6 h-6 text-red-600" />
                        </div>
                        <span className="text-lg font-bold text-slate-400">Enter Destination...</span>
                      </button>
                    </div>
                  </motion.div>

                  {/* Bento Grid for Vehicle Types */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'car', label: 'CAR', icon: '🚗', color: 'bg-red-50', iconColor: 'text-red-600', desc: 'Comfortable' },
                      { id: 'auto', label: 'AUTO', icon: '🛺', color: 'bg-red-50', iconColor: 'text-red-600', desc: 'Quick' },
                      { id: 'bus', label: 'BUS', icon: '🚌', color: 'bg-slate-50', iconColor: 'text-slate-600', desc: 'Group' },
                      { id: 'tempo', label: 'TEMPO', icon: '🚚', color: 'bg-red-50', iconColor: 'text-red-600', desc: 'Luggage' }
                    ].map((item, i) => (
                      <motion.button 
                        key={item.id}
                        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => { setSelectedRide({ id: item.id, name: item.label, icon: item.icon }); setBookingStage('search'); }}
                        className={`${item.color} p-6 rounded-[2.5rem] flex flex-col items-start justify-between h-48 border border-white shadow-sm hover:shadow-md transition-all active:scale-95`}
                      >
                        <div className="text-5xl">{item.icon}</div>
                        <div>
                          <h3 className={`text-xl font-black ${item.iconColor} leading-none`}>{item.label}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.desc}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Recent Activity / Map Preview */}
                  <div className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Map View</h4>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-[#008751] rounded-full animate-pulse"></div>
                        <span className="text-[8px] font-black text-[#008751] uppercase">Active</span>
                      </div>
                    </div>
                    <div className="h-48 bg-white rounded-2xl border border-slate-100 relative overflow-hidden shadow-inner">
                      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="w-6 h-6 bg-red-600 rounded-full border-4 border-white shadow-2xl z-10"></div>
                        <div className="w-12 h-12 bg-red-500/20 rounded-full animate-ping absolute -inset-3"></div>
                      </div>
                      <motion.div animate={{ x: [0, 150, 0], y: [0, 20, 0] }} transition={{ duration: 12, repeat: Infinity }} className="absolute top-1/4 left-1/4 text-2xl">🚗</motion.div>
                      <motion.div animate={{ x: [0, -120, 0], y: [0, -30, 0] }} transition={{ duration: 15, repeat: Infinity }} className="absolute bottom-1/4 right-1/4 text-2xl">🛺</motion.div>
                    </div>
                  </div>

                  {/* Recent Vehicle Listings */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Recent Vehicle Listings</h4>
                    <div className="space-y-4">
                      {filteredVehicles.length > 0 ? filteredVehicles.map(v => (
                        <button 
                          key={v.id} 
                          onClick={() => { setSelectedVehicle(v); setShowVehicleDetails(true); }}
                          className="w-full p-5 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex items-center gap-4 text-left active:scale-[0.98] transition-all hover:shadow-md"
                        >
                          <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-slate-50 relative">
                            <img src={v.vehiclePhoto} className="w-full h-full object-cover" alt="" loading="lazy" referrerPolicy="no-referrer" />
                            <div className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white ${v.availability === 'Available' ? 'bg-[#008751]' : 'bg-rose-600'}`}></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <span className="text-[8px] font-black text-red-600 uppercase bg-red-50 px-2 py-0.5 rounded-md">{v.vehicleType}</span>
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${v.availability === 'Available' ? 'bg-[#008751]/10 text-[#008751]' : 'bg-rose-50 text-rose-600'}`}>
                                {v.availability}
                              </span>
                            </div>
                            <h4 className="font-black text-slate-900 truncate mt-1 uppercase text-xs tracking-tight">{v.title}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase truncate mt-0.5">👤 {v.ownerName} • 📍 {v.location}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <p className="text-[9px] font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{v.vehicleNumber}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{v.timestamp}</p>
                            </div>
                          </div>
                        </button>
                      )) : (
                        <div className="text-center py-10 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                          <p className="text-xs font-bold text-slate-400 uppercase">No vehicles listed yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Why Choose Us Section */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Why Vartalap Bharat?</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { title: 'Verified Drivers', desc: 'All our drivers are background checked', icon: '✅' },
                        { title: '24/7 Support', desc: 'We are here to help you anytime', icon: '📞' },
                        { title: 'Secure Payments', desc: 'Multiple safe payment options', icon: '🛡️' }
                      ].map((feature, i) => (
                        <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center gap-4 shadow-sm">
                          <div className="text-2xl">{feature.icon}</div>
                          <div>
                            <h5 className="text-sm font-black text-slate-900 uppercase leading-none">{feature.title}</h5>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{feature.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Safety Banner */}
                  <div className="bg-red-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                      <h4 className="text-xl font-black uppercase tracking-tight mb-2">Your Safety is Our Priority</h4>
                      <p className="text-[10px] font-bold text-red-100 uppercase tracking-widest leading-relaxed">
                        Share your ride status with family and friends in real-time. Emergency SOS button available in every ride.
                      </p>
                      <button className="mt-6 bg-white text-red-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-red-50 transition-colors">Learn More</button>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="text-center py-10 opacity-30">
                    <VartalapBharatLogo className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-900">© 2026 Vartalap Bharat • All Rights Reserved</p>
                  </div>
                </div>
              </div>
            )}

            {/* Search Stage: Pickup/Drop Inputs */}
            {bookingStage === 'search' && (
              <div className="bg-white z-10 p-6 animate-smart pb-10">
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => setBookingStage('hub')} className="p-2"><BackIcon className="w-6 h-6 text-slate-400"/></button>
                  <h2 className="text-xl font-black uppercase tracking-tight">Plan Your Ride</h2>
                </div>
                <div className="space-y-4 relative pb-6">
                  <div className="absolute left-[23px] top-10 bottom-10 w-0.5 bg-slate-100"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full bg-red-500 shrink-0 z-10"></div>
                    <div className="flex-1 flex gap-2">
                      <button 
                        onClick={() => { setLocationPickerTarget('from'); setBookingStage('location_picker'); }}
                        className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left"
                      >
                        <p className="text-[10px] font-black text-slate-500 uppercase">Pickup</p>
                        <p className={`text-base font-bold truncate ${bookingFrom ? 'text-slate-900' : 'text-slate-300'}`}>{bookingFrom || 'Current Location'}</p>
                      </button>
                      <button 
                        onClick={() => handleConnectGps()}
                        className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center justify-center"
                        title="Connect GPS"
                      >
                        <SparkleIcon className="w-6 h-6 animate-pulse" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full bg-red-600 shrink-0 z-10"></div>
                    <button 
                      onClick={() => { setLocationPickerTarget('to'); setBookingStage('location_picker'); }}
                      className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left"
                    >
                      <p className="text-[10px] font-black text-slate-500 uppercase">Destination</p>
                      <p className={`text-base font-bold truncate ${bookingTo ? 'text-slate-900' : 'text-slate-300'}`}>{bookingTo || 'Where are you going?'}</p>
                    </button>
                  </div>

                  {/* Date and Time Selection */}
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Date</p>
                      <input 
                        type="date" 
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="bg-transparent w-full font-bold text-slate-900 outline-none text-sm"
                      />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Time</p>
                      <input 
                        type="time" 
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="bg-transparent w-full font-bold text-slate-900 outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
                {bookingFrom && bookingTo && (
                  <button 
                    onClick={() => setBookingStage('ride_selection')}
                    className="mt-auto w-full bg-red-600 text-white py-5 rounded-full font-black uppercase tracking-widest shadow-xl shrink-0 active:scale-95 transition-all hover:bg-red-700"
                  >
                    Find Rides
                  </button>
                )}
              </div>
            )}

            {/* Ride Selection Stage: Bottom Sheet */}
            {bookingStage === 'ride_selection' && (
              <div className="relative pb-10">
                <div className="absolute top-6 left-6 z-20">
                  <button onClick={() => setBookingStage('search')} className="p-3 bg-white rounded-2xl shadow-xl border border-slate-100"><BackIcon className="w-6 h-6 text-slate-400"/></button>
                </div>
                
                {/* Map Preview in background */}
                <div className="flex-1 bg-slate-50 relative">
                   <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
                </div>

                <motion.div 
                  initial={{ y: 400 }} animate={{ y: 0 }}
                  className="bg-white rounded-t-[3rem] p-6 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] border-t border-slate-100 max-h-[75%] overflow-y-auto no-scrollbar shrink-0"
                >
                  <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6"></div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Available Rides</h3>
                  <div className="space-y-4 px-2">
                    {[
                      { id: 'car', name: 'Car', icon: '🚗', desc: 'Private & comfortable', price: '₹142', time: '2 min' },
                      { id: 'auto', name: 'Auto', icon: '🛺', desc: 'Fast & affordable', price: '₹85', time: '1 min' },
                      { id: 'bus', name: 'Bus', icon: '🚌', desc: 'Economical travel', price: '₹25', time: '5 min' },
                      { id: 'tempo', name: 'Tempo', icon: '🚚', desc: 'For heavy luggage', price: '₹250', time: '8 min' }
                    ].map(ride => (
                      <button 
                        key={ride.id} 
                        onClick={() => setSelectedRide(ride)}
                        className={`w-full p-4 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${selectedRide?.id === ride.id ? 'border-red-600 bg-red-50' : 'border-slate-50 bg-white'}`}
                      >
                        <div className="text-4xl">{ride.icon}</div>
                        <div className="flex-1 text-left">
                          <h4 className="font-black text-slate-900 uppercase text-xs">{ride.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400">{ride.desc} • {ride.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900">{ride.price}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  {selectedRide && (
                    <button 
                      onClick={() => setBookingStage('verification')}
                      className="mt-8 w-full bg-indigo-600 text-white py-5 rounded-full font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all hover:bg-indigo-700"
                    >
                      Book {selectedRide.name}
                    </button>
                  )}
                </motion.div>
              </div>
            )}

            {/* Verification Stage: Mobile & OTP */}
            {bookingStage === 'verification' && (
              <div className="bg-white z-40 p-8 animate-smart pb-10">
                <div className="flex items-center gap-4 mb-10">
                  <button onClick={() => setBookingStage('ride_selection')} className="p-2"><BackIcon className="w-6 h-6 text-slate-400"/></button>
                  <h2 className="text-xl font-black uppercase tracking-tight">Verification</h2>
                </div>
                
                {!isVerifying ? (
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Enter Mobile</h3>
                    <p className="text-sm font-bold text-slate-400 mb-8 uppercase tracking-widest">We will send a 4-digit OTP</p>
                    <div className="space-y-6">
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
                        <span className="text-lg font-black text-slate-400">+91</span>
                        <input 
                          type="tel" 
                          value={userMobile}
                          onChange={(e) => setUserMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="9876543210" 
                          className="bg-transparent flex-1 text-xl font-black text-slate-900 outline-none"
                        />
                      </div>
                      <button 
                        disabled={userMobile.length !== 10}
                        onClick={() => setIsVerifying(true)}
                        className={`w-full py-5 rounded-full font-black uppercase tracking-widest shadow-xl transition-all ${userMobile.length === 10 ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-slate-100 text-slate-300'}`}
                      >
                        Send OTP
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto no-scrollbar">
                    <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Enter OTP</h3>
                    <p className="text-sm font-bold text-slate-400 mb-8 uppercase tracking-widest">Sent to +91 {userMobile}</p>
                    <div className="space-y-6">
                      <div className="flex justify-between gap-4">
                        {[0, 1, 2, 3].map((i) => (
                          <input 
                            key={i}
                            type="text"
                            maxLength={1}
                            value={userOtp[i] || ''}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              if (val) {
                                const nextOtp = userOtp.split('');
                                nextOtp[i] = val;
                                setUserOtp(nextOtp.join('').slice(0, 4));
                              }
                            }}
                            className="w-16 h-20 bg-slate-50 border border-slate-100 rounded-3xl text-center text-3xl font-black text-red-600 outline-none focus:border-red-600 transition-all"
                          />
                        ))}
                      </div>
                      <button 
                        disabled={userOtp.length !== 4}
                        onClick={handleBookRide}
                        className={`w-full py-5 rounded-full font-black uppercase tracking-widest shadow-xl transition-all ${userOtp.length === 4 ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-slate-100 text-slate-300'}`}
                      >
                        Verify & Book
                      </button>
                      <button onClick={() => setIsVerifying(false)} className="w-full text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Resend OTP</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirming Stage: Radar Animation */}
            {bookingStage === 'confirming' && (
              <div className="bg-slate-900/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-10 text-center pb-20">
                <div className="relative w-64 h-64 mb-10">
                    <motion.div 
                    animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 border-2 border-red-600 rounded-full"
                  ></motion.div>
                  <motion.div 
                    animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="absolute inset-0 border-2 border-red-600 rounded-full"
                  ></motion.div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-4xl shadow-2xl shadow-red-500/50">
                      {selectedRide?.icon}
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Finding your ride...</h2>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Connecting to nearest {selectedRide?.name} drivers</p>
                  <button 
                    onClick={() => setBookingStage('ride_selection')}
                    className="mt-12 text-red-500 font-black uppercase text-xs tracking-widest"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            )}

            {/* Tracking Stage: Driver Details */}
            {bookingStage === 'tracking' && (
              <div className="relative pb-20">
                <div className="absolute top-6 left-6 z-20 flex flex-wrap gap-4">
                  <button onClick={() => setBookingStage('hub')} className="p-3 bg-white rounded-2xl shadow-xl border border-slate-100"><BackIcon className="w-6 h-6 text-slate-400"/></button>
                  <div className="bg-red-500 text-white px-4 py-2 rounded-2xl shadow-xl font-black text-[10px] uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                    Arriving in 3 mins
                  </div>
                </div>
                
                {/* Map Area */}
                <div className="flex-1 bg-slate-50 relative overflow-hidden">
                   <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
                   
                   {/* Simulated GPS Path */}
                   <svg className="absolute inset-0 w-full h-full pointer-events-none">
                     <motion.path 
                       d="M 100 100 L 200 300 L 350 150" 
                       fill="none" 
                       stroke="#dc2626" 
                       strokeWidth="4" 
                       strokeDasharray="10 10"
                       initial={{ pathLength: 0 }}
                       animate={{ pathLength: 1 }}
                       transition={{ duration: 10, repeat: Infinity }}
                     />
                   </svg>

                   {/* Vehicle Marker */}
                   <motion.div 
                     animate={{ 
                       x: [100, 200, 350],
                       y: [100, 300, 150]
                     }}
                     transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                     className="absolute w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center text-2xl z-10 border-2 border-red-600"
                   >
                     {selectedRide?.icon || '🚗'}
                   </motion.div>

                   {/* User Marker */}
                   <div className="absolute top-[150px] left-[350px] w-6 h-6 bg-red-600 rounded-full border-4 border-white shadow-xl z-20">
                     <div className="absolute -inset-4 bg-red-600/20 rounded-full animate-ping"></div>
                   </div>

                   {/* Distance Indicator */}
                   <div className="absolute bottom-6 left-6 right-6 flex gap-3">
                     <div className="flex-1 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Distance</p>
                       <p className="text-lg font-black text-slate-900">1.2 KM</p>
                     </div>
                     <div className="flex-1 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">ETA</p>
                       <p className="text-lg font-black text-red-600">3 MINS</p>
                     </div>
                   </div>
                </div>

                <motion.div 
                  initial={{ y: 400 }} animate={{ y: 0 }}
                  className="bg-white rounded-t-[3rem] p-6 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] border-t border-slate-100 shrink-0"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <img src={driverAssigned?.avatar} className="w-14 h-14 rounded-2xl object-cover shadow-md" alt="" />
                      <div>
                        <h4 className="font-black text-slate-900 uppercase text-xs">{driverAssigned?.name}</h4>
                        <div className="flex items-center gap-1 text-red-600">
                          <StarIcon className="w-3 h-3 fill-current" />
                          <span className="text-[9px] font-black">{driverAssigned?.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">OTP</p>
                      <h3 className="text-xl font-black text-red-600 tracking-widest">{driverAssigned?.otp}</h3>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center mb-6">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{driverAssigned?.vehicle}</p>
                      <h4 className="text-base font-black text-slate-900">{driverAssigned?.number}</h4>
                    </div>
                    <div className="text-3xl">🚗</div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 mb-4">
                    <button className="bg-slate-900 text-white py-4 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                      <PhoneIcon className="w-4 h-4" /> Call
                    </button>
                    <button 
                      onClick={() => setBookingStage('ride_confirmation')}
                      className="bg-red-600 text-white py-4 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-red-100"
                    >
                      Confirm Booking Details
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => alert('SOS Alert Sent to Emergency Contacts & Local Police!')}
                      className="bg-red-50 text-red-600 py-4 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 border border-red-100"
                    >
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div> SOS
                    </button>
                    <button 
                      onClick={() => alert('Ride Status Shared with your family!')}
                      className="bg-red-50 text-red-600 py-4 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 border border-red-100"
                    >
                      Share Ride
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Ride Confirmation Stage: Final Summary */}
            {bookingStage === 'ride_confirmation' && (
              <div className="bg-white z-50 p-8 animate-smart h-full overflow-y-auto no-scrollbar pb-32">
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => setBookingStage('tracking')} className="p-2 bg-slate-100 rounded-xl"><BackIcon className="w-5 h-5 text-slate-400"/></button>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Confirm Booking</h2>
                </div>

                <div className="space-y-6">
                  {/* Ride Summary Card */}
                  <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Ride Summary</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase">Pickup</p>
                          <p className="text-sm font-bold text-slate-900">{bookingFrom}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-2 h-2 rounded-full bg-red-600 mt-1.5 shrink-0"></div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase">Drop-off</p>
                          <p className="text-sm font-bold text-slate-900">{bookingTo}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase">Date & Time</p>
                          <p className="text-xs font-bold text-slate-900">{bookingDate} • {bookingTime}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Estimated Price</p>
                          <p className="text-lg font-black text-red-600">{selectedRide?.price}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Driver Details Card */}
                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Driver Details</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <img src={driverAssigned?.avatar} className="w-16 h-16 rounded-2xl object-cover shadow-md" alt="" />
                      <div>
                        <h4 className="font-black text-slate-900 uppercase text-sm">{driverAssigned?.name}</h4>
                        <div className="flex items-center gap-1 text-amber-500">
                          <StarIcon className="w-3 h-3 fill-current" />
                          <span className="text-[10px] font-black">{driverAssigned?.rating}</span>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{driverAssigned?.vehicle} • {driverAssigned?.number}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Your OTP</p>
                        <h3 className="text-xl font-black text-red-600 tracking-widest">{driverAssigned?.otp}</h3>
                      </div>
                      <div className="text-3xl">{selectedRide?.icon}</div>
                    </div>
                  </div>

                  {/* Confirmation Button */}
                  <div className="pt-4">
                    <button 
                      onClick={() => {
                        // Finalize booking
                        const newRide = {
                          id: 'ride-' + Date.now(),
                          from: bookingFrom,
                          to: bookingTo,
                          bookingDate,
                          bookingTime,
                          price: selectedRide?.price || '₹0',
                          vehicleType: selectedRide?.name || 'Vehicle',
                          driver: { name: driverAssigned?.name, number: driverAssigned?.number },
                          timestamp: 'Just Now'
                        };
                        setRideHistory([newRide, ...rideHistory]);
                        alert('Booking Confirmed! Your ride is on the way.');
                        setBookingStage('hub');
                      }}
                      className="w-full bg-red-600 text-white py-6 rounded-full font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-red-100 active:translate-y-1 transition-all hover:bg-red-700"
                    >
                      Confirm Booking
                    </button>
                    <button 
                      onClick={() => setBookingStage('tracking')}
                      className="w-full mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center"
                    >
                      Back to Tracking
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Location Picker Stage */}
            {bookingStage === 'location_picker' && (
              <div className="bg-white z-50 p-6 animate-smart pb-20">
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => setBookingStage('search')} className="p-2"><BackIcon className="w-6 h-6 text-slate-400"/></button>
                  <div className="flex-1 bg-red-50 p-4 rounded-3xl border border-red-100 flex items-center gap-3">
                    <SearchIcon className="w-5 h-5 text-red-600" />
                    <input 
                      type="text" 
                      placeholder={`Type ${locationPickerTarget === 'from' ? 'Pickup' : 'Destination'}...`}
                      className="bg-transparent flex-1 outline-none text-base font-bold text-slate-900 placeholder:text-slate-300"
                      onChange={(e) => {
                        // In a real app, this would trigger a location search API
                        if (e.target.value.length > 3) {
                          // Simulate selection for demo
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCitySelect((e.target as HTMLInputElement).value);
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-8 mt-8">
                  {/* Set on Map Action */}
                    <button 
                      onClick={() => handleCitySelect('Map Location')}
                      className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-red-50 hover:border-red-200 transition-all group"
                    >
                      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                        <MapPinIcon className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-black text-slate-900 uppercase text-xs">Set Location on Map</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Pin your exact location</p>
                      </div>
                    </button>

                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Saved Places</h3>
                      <div className="space-y-3">
                        {[
                          { name: 'Home', address: 'Borivali East, Mumbai', icon: '🏠', color: 'bg-red-50 text-red-600' },
                          { name: 'Work', address: 'Andheri West, Mumbai', icon: '🏢', color: 'bg-red-50 text-red-600' },
                          { name: 'Gym', address: 'Dadar, Mumbai', icon: '🏋️', color: 'bg-slate-50 text-slate-600' }
                        ].map((place, i) => (
                          <button 
                            key={i}
                            onClick={() => handleCitySelect(place.address)}
                            className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-[2rem] transition-all border border-transparent hover:border-slate-100"
                          >
                            <div className={`w-12 h-12 ${place.color} rounded-2xl flex items-center justify-center text-xl shadow-sm`}>{place.icon}</div>
                            <div className="flex-1 text-left">
                              <h4 className="font-black text-slate-900 uppercase text-xs">{place.name}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[200px]">{place.address}</p>
                            </div>
                            <ChevronRightIcon className="w-5 h-5 text-slate-200" />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Popular Areas</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {['Thane', 'Vashi', 'Dadar', 'Sion', 'Bandra', 'Colaba'].map(city => (
                          <button 
                            key={city} 
                            onClick={() => handleCitySelect(city)} 
                            className="p-4 border border-slate-100 rounded-2xl text-xs font-black text-slate-600 bg-slate-50 hover:bg-white hover:shadow-md transition-all uppercase tracking-tight"
                          >
                            🏙️ {city}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'property' ? (
          <div className="p-6 animate-smart pb-20">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Property Hub</h2>
              <button onClick={() => setShowForm(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase shadow-md active:scale-95 transition-all hover:bg-slate-800">+ List Property</button>
            </div>
            
            <div className="space-y-8">
              <section>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Builders Projects</h3>
                <div className="space-y-4">
                  {builders.map(b => (
                    <div key={b.id} className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm flex gap-4">
                      <img src={b.photo} className="w-24 h-24 rounded-[1.5rem] object-cover" alt="" />
                      <div className="flex-1 py-1">
                        <h4 className="font-black text-sm text-slate-900 uppercase leading-tight">{b.buildingName}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{b.builderName}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">{b.propertyType}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase">{b.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Owner Listings</h3>
                <div className="grid grid-cols-2 gap-4">
                  {owners.map(o => (
                    <div key={o.id} className="bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm">
                      <img src={o.photo} className="w-full h-24 rounded-[1.5rem] object-cover mb-3" alt="" />
                      <h4 className="font-black text-[10px] text-slate-900 uppercase truncate">{o.buildingName}</h4>
                      <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{o.propertyType}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : activeTab === 'grocery' ? (
          <div className="bg-white animate-smart pb-20">
            <div className="p-8 pb-4">
              <div className="flex justify-between items-center mb-1">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">GROCERY HUB</h1>
                <button onClick={() => setShowForm(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all hover:bg-slate-800">+ Post Product</button>
              </div>
              <p className="text-xs font-black text-red-600 uppercase tracking-[0.2em]">Fresh Items</p>
            </div>

            <div className="px-6 mb-8">
              <div className="bg-white rounded-[2rem] p-2 flex items-center gap-3 border border-slate-100 shadow-sm focus-within:border-red-200 focus-within:shadow-red-100/50 transition-all">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                  <SearchIcon className="w-5 h-5 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  value={grocerySearch}
                  placeholder="Search for Milk, Eggs, Fruits..." 
                  className="bg-transparent flex-1 outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300"
                  onChange={(e) => setGrocerySearch(e.target.value)}
                />
              </div>
            </div>

            <div className="px-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {groceryProducts.filter(p => 
                  p.productName.toLowerCase().includes(grocerySearch.toLowerCase()) || 
                  p.category.toLowerCase().includes(grocerySearch.toLowerCase())
                ).length > 0 ? groceryProducts.filter(p => 
                  p.productName.toLowerCase().includes(grocerySearch.toLowerCase()) || 
                  p.category.toLowerCase().includes(grocerySearch.toLowerCase())
                ).map(p => (
                  <div key={p.id} className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm group hover:shadow-md transition-all">
                    <div className="h-40 relative">
                      <img src={p.photo} className="w-full h-full object-cover" alt="" loading="lazy" referrerPolicy="no-referrer" />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase text-red-600 shadow-sm">
                        {p.category}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-black text-slate-900 uppercase text-[11px] truncate">{p.productName}</h4>
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <span className="text-sm font-black text-slate-900">{p.price}</span>
                          <span className="text-[8px] font-bold text-slate-400 ml-1 uppercase">{p.unit}</span>
                        </div>
                        <button onClick={() => captureLead('Grocery', p.productName)} className="w-8 h-8 bg-rose-600 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all hover:bg-rose-700">
                          <PhoneIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase">No products found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'local' ? (
          <div className="bg-white animate-smart pb-20">
            {/* Header */}
            <div className="p-8 pb-4">
              <div className="flex justify-between items-center mb-1">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">LOCAL HUB</h1>
                <button onClick={() => setShowForm(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all hover:bg-slate-800">+ Post</button>
              </div>
              <p className="text-xs font-black text-red-600 uppercase tracking-[0.2em]">100+ Services • Verified Experts</p>
            </div>

            {/* Search Bar */}
            <div className="px-6 mb-8">
              <div className="bg-white rounded-[2rem] p-2 flex items-center gap-3 border border-slate-100 shadow-sm focus-within:border-red-200 focus-within:shadow-red-100/50 transition-all">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                  <SearchIcon className="w-5 h-5 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  value={serviceSearch}
                  placeholder="Search for Plumber, Electrician..." 
                  className="bg-transparent flex-1 outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300"
                  onChange={(e) => setServiceSearch(e.target.value)}
                />
                {serviceSearch && (
                  <button onClick={() => setServiceSearch('')} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-slate-500 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                )}
              </div>
            </div>

            {/* Categories Grid */}
            <div className="px-6 pb-10">
              <div className="grid grid-cols-3 gap-4 mb-10">
                {[
                  { icon: '🪠', label: 'Plumber', color: 'bg-red-50' },
                  { icon: '⚡', label: 'Electrician', color: 'bg-red-50' },
                  { icon: '⚖️', label: 'Advocate', color: 'bg-slate-50' },
                  { icon: '🏨', label: 'Hotel', color: 'bg-red-50' },
                  { icon: '🪚', label: 'Carpenter', color: 'bg-slate-50' },
                  { icon: '🎨', label: 'Painter', color: 'bg-red-50' },
                  { icon: '🔧', label: 'Mechanic', color: 'bg-red-50' },
                  { icon: '🧵', label: 'Tailor', color: 'bg-slate-50' },
                  { icon: '✂️', label: 'Barber', color: 'bg-red-50' },
                  { icon: '👨‍⚕️', label: 'Doctor', color: 'bg-red-50' },
                  { icon: '🦷', label: 'Dentist', color: 'bg-slate-50' },
                  { icon: '💊', label: 'Pharmacy', color: 'bg-red-50' },
                  { icon: '🧺', label: 'Laundry', color: 'bg-red-50' },
                  { icon: '📦', label: 'Courier', color: 'bg-slate-50' },
                  { icon: '📸', label: 'Photographer', color: 'bg-red-50' },
                  { icon: '🧘', label: 'Yoga', color: 'bg-red-50' },
                  { icon: '🏋️', label: 'Gym', color: 'bg-slate-50' },
                  { icon: '🎓', label: 'Tutor', color: 'bg-red-50' },
                  { icon: '🏠', label: 'Real Estate', color: 'bg-red-50' },
                  { icon: '🛋️', label: 'Interior', color: 'bg-slate-50' },
                  { icon: '📐', label: 'Architect', color: 'bg-red-50' },
                  { icon: '📊', label: 'CA', color: 'bg-red-50' },
                  { icon: '📄', label: 'Insurance', color: 'bg-slate-50' },
                  { icon: '✈️', label: 'Travel', color: 'bg-red-50' },
                  { icon: '🎉', label: 'Events', color: 'bg-red-50' },
                  { icon: '🍽️', label: 'Caterer', color: 'bg-slate-50' },
                  { icon: '💐', label: 'Florist', color: 'bg-red-50' },
                  { icon: '✂️', label: 'Pet Groom', color: 'bg-red-50' },
                  { icon: '🐕', label: 'Vet', color: 'bg-slate-50' },
                  { icon: '🐜', label: 'Pest Ctrl', color: 'bg-red-50' },
                  { icon: '🧹', label: 'Cleaning', color: 'bg-red-50' },
                  { icon: '👮', label: 'Security', color: 'bg-slate-900' },
                  { icon: '🚗', label: 'Driver', color: 'bg-slate-50' },
                  { icon: '👨‍🍳', label: 'Cook', color: 'bg-red-50' },
                  { icon: '👶', label: 'Nanny', color: 'bg-red-50' },
                  { icon: '🌳', label: 'Gardener', color: 'bg-slate-50' },
                  { icon: '💻', label: 'PC Repair', color: 'bg-red-50' },
                  { icon: '📱', label: 'Mobile Rep', color: 'bg-red-50' },
                  { icon: '❄️', label: 'AC Repair', color: 'bg-slate-50' },
                  { icon: '🚰', label: 'RO Repair', color: 'bg-red-50' },
                  { icon: '🧊', label: 'Fridge Rep', color: 'bg-red-50' },
                  { icon: '🧺', label: 'WM Repair', color: 'bg-slate-50' },
                  { icon: '📺', label: 'TV Repair', color: 'bg-red-50' },
                  { icon: '🔑', label: 'Key Maker', color: 'bg-red-50' },
                  { icon: '🪟', label: 'Glass Work', color: 'bg-slate-50' },
                  { icon: '🏗️', label: 'Aluminum', color: 'bg-red-50' },
                  { icon: '🔥', label: 'Welder', color: 'bg-red-50' },
                  { icon: '🧱', label: 'Mason', color: 'bg-slate-50' },
                  { icon: '📐', label: 'Tile Layer', color: 'bg-red-50' },
                  { icon: '🏗️', label: 'Plasterer', color: 'bg-red-50' },
                  { icon: '💧', label: 'Waterproof', color: 'bg-slate-50' },
                  { icon: '☀️', label: 'Solar', color: 'bg-red-50' },
                  { icon: '📹', label: 'CCTV', color: 'bg-slate-900' },
                  { icon: '🏠', label: 'Smart Home', color: 'bg-red-50' },
                  { icon: '🚚', label: 'Movers', color: 'bg-slate-50' },
                  { icon: '🧼', label: 'Car Wash', color: 'bg-red-50' },
                  { icon: '🏍️', label: 'Bike Svc', color: 'bg-red-50' },
                  { icon: '🛞', label: 'Tyre Shop', color: 'bg-slate-900' },
                  { icon: '🔋', label: 'Battery', color: 'bg-red-50' },
                  { icon: '📝', label: 'Stationery', color: 'bg-red-50' },
                  { icon: '🛠️', label: 'Hardware', color: 'bg-slate-50' },
                  { icon: '💡', label: 'Electrical', color: 'bg-red-50' },
                  { icon: '🚽', label: 'Sanitary', color: 'bg-red-50' },
                  { icon: '🖌️', label: 'Paint Shop', color: 'bg-slate-50' },
                  { icon: '🪑', label: 'Furniture', color: 'bg-red-50' },
                  { icon: '🛏️', label: 'Mattress', color: 'bg-red-50' },
                  { icon: '🪟', label: 'Curtain', color: 'bg-slate-50' },
                  { icon: '👕', label: 'Clothing', color: 'bg-red-50' },
                  { icon: '👟', label: 'Footwear', color: 'bg-slate-50' },
                  { icon: '💎', label: 'Jewelry', color: 'bg-red-50' },
                  { icon: '眼镜', label: 'Optical', color: 'bg-slate-50' },
                  { icon: '⌚', label: 'Watch Rep', color: 'bg-slate-50' },
                  { icon: '📲', label: 'Mobile Shop', color: 'bg-red-50' },
                  { icon: '📺', label: 'Electronics', color: 'bg-slate-50' },
                  { icon: '🍳', label: 'Appliances', color: 'bg-red-50' },
                  { icon: '🎁', label: 'Gift Shop', color: 'bg-red-50' },
                  { icon: '🧸', label: 'Toy Store', color: 'bg-red-50' },
                  { icon: '⚽', label: 'Sports', color: 'bg-red-50' },
                  { icon: '🎸', label: 'Musical', color: 'bg-slate-50' },
                  { icon: '📚', label: 'Books', color: 'bg-red-50' },
                  { icon: '🖨️', label: 'Printing', color: 'bg-slate-50' },
                  { icon: '🌐', label: 'Cyber Cafe', color: 'bg-red-50' },
                  { icon: '📄', label: 'Xerox', color: 'bg-slate-50' },
                  { icon: '📮', label: 'Courier', color: 'bg-red-50' },
                  { icon: '💄', label: 'Parlor', color: 'bg-red-50' },
                  { icon: '🧖', label: 'Spa', color: 'bg-slate-50' },
                  { icon: '💉', label: 'Tattoo', color: 'bg-slate-900' },
                  { icon: '✋', label: 'Mehndi', color: 'bg-red-50' },
                  { icon: '🎨', label: 'Makeup', color: 'bg-red-50' },
                  { icon: '🔮', label: 'Astrologer', color: 'bg-slate-50' },
                  { icon: '📿', label: 'Pandit', color: 'bg-red-50' },
                  { icon: '👨‍⚖️', label: 'Lawyer', color: 'bg-slate-50' },
                  { icon: '🖋️', label: 'Notary', color: 'bg-slate-50' },
                  { icon: '⌨️', label: 'Typing', color: 'bg-slate-50' },
                  { icon: '🗣️', label: 'Translate', color: 'bg-red-50' },
                  { icon: '🛂', label: 'Visa', color: 'bg-slate-50' },
                  { icon: '📖', label: 'Passport', color: 'bg-red-50' },
                  { icon: '🚦', label: 'RTO', color: 'bg-slate-50' },
                  { icon: '🆔', label: 'Aadhaar', color: 'bg-red-50' }
                ].filter(c => c.label.toLowerCase().includes(serviceSearch.toLowerCase())).map((cat, i) => (
                    <button 
                      key={i} 
                      onClick={() => setServiceSearch(cat.label)}
                      className={`group relative bg-white p-4 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 border transition-all hover:shadow-md ${
                        serviceSearch === cat.label 
                          ? 'border-t-4 border-t-red-600 border-b-4 border-b-red-600 shadow-xl scale-105' 
                          : 'border-slate-100 shadow-sm hover:border-red-100'
                      }`}
                    >
                    <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-inner`}>
                      {cat.icon}
                    </div>
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter text-center leading-tight">{cat.label}</span>
                    {serviceSearch === cat.label && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Recent Listings */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Recent Listings</h3>
                {filteredLocalServices.length > 0 ? filteredLocalServices.map(s => (
                  <div key={s.id} className="p-5 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-slate-50">
                      <img src={s.photo} className="w-full h-full object-cover" alt="" loading="lazy" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[8px] font-black text-red-600 uppercase bg-red-50 px-2 py-0.5 rounded-md">{s.category}</span>
                      <h4 className="font-bold text-slate-900 truncate mt-1">{s.businessName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase truncate">📍 {s.location}</p>
                    </div>
                    <button onClick={()=>captureLead('Service', s.businessName)} className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all hover:bg-red-700"><PhoneIcon className="w-4 h-4"/></button>
                  </div>
                )) : (
                  <div className="text-center py-10 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase">No listings yet in your area</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'hub' ? (
          <div className="p-6 space-y-8 animate-smart pb-20 overflow-y-auto no-scrollbar h-full">
            {/* User Profile Card */}
            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-4 border-white/10 shadow-xl">
                  <img src={currentUser?.avatar || 'https://i.pravatar.cc/150?u=me'} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black uppercase tracking-tighter leading-none truncate">{currentUser?.name}</h2>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-2">{currentUser?.role} • {currentUser?.mobile}</p>
                  <button 
                    onClick={() => logout()}
                    className="mt-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
                <div className="text-center">
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Total Members</p>
                  <p className="text-xl font-black">{allUsers.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Online Now</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-[#008751] rounded-full animate-pulse"></div>
                    <p className="text-xl font-black">{allUsers.filter(u => u.isOnline).length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Bento */}
            <div className="grid grid-cols-1 gap-4">
              {currentUser?.role === 'admin' && (
                <button 
                  onClick={() => setView('admin_console')}
                  className="bg-white border border-slate-100 p-6 rounded-[2.5rem] text-slate-900 shadow-xl shadow-slate-100 flex flex-col items-center justify-center gap-3 active:scale-95 transition-all group hover:border-blue-200"
                >
                  <div className="w-12 h-12 bg-slate-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner"><ToolsIcon className="w-6 h-6"/></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Admin Console</span>
                </button>
              )}
            </div>

            {/* Hub Stats */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Hub Activity</h3>
              <div className="space-y-6">
                {[
                  { label: 'Vehicles Available', count: vehicles.length, color: 'bg-red-600', tab: 'vehicle' },
                  { label: 'Properties Listed', count: builders.length + owners.length, color: 'bg-blue-600', tab: 'property' },
                  { label: 'Grocery Products', count: groceryProducts.length, color: 'bg-red-600', tab: 'grocery' },
                  { label: 'Active Services', count: localServices.length, color: 'bg-red-600', tab: 'local' }
                ].map(stat => (
                  <button 
                    key={stat.label} 
                    onClick={() => setActiveTab(stat.tab as Tab)}
                    className="w-full flex items-center justify-between hover:bg-slate-50 p-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${stat.color}`}></div>
                      <span className="text-xs font-bold text-slate-700 uppercase">{stat.label}</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">{stat.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <h2 className="text-2xl font-black uppercase tracking-tighter">Hub</h2>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white/95 backdrop-blur-md flex justify-around items-end border-t border-slate-100 z-50 h-[85px] shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] overflow-x-auto no-scrollbar">
        {[
          { id: 'hub', label: 'HUB', icon: <MenuIcon className="w-5 h-5" />, color: 'bg-indigo-600' },
          { id: 'vehicle', label: 'VEHICLE', icon: <VehicleIcon className="w-5 h-5" />, color: 'bg-red-600' },
          { id: 'loan', label: 'LOAN', icon: <LoanIcon className="w-5 h-5" />, color: 'bg-amber-600' },
          { id: 'grocery', label: 'GROCERY', icon: <ShoppingBagIcon className="w-5 h-5" />, color: 'bg-rose-600' },
          { id: 'local', label: 'SERVICES', icon: <ToolsIcon className="w-5 h-5" />, color: 'bg-sky-600' },
          { id: 'property', label: 'PROPERTY', icon: <HomeIcon className="w-5 h-5" />, color: 'bg-slate-800' },
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => { setActiveTab(t.id as Tab); setBookingStage('hub'); setShowForm(false); setShowLoanApply(false); }} 
            className={`flex flex-col items-center gap-2 mb-2 transition-all duration-300 min-w-[60px] ${activeTab === t.id ? 'scale-110' : 'opacity-70'}`}
          >
            <div className={`${
              activeTab === t.id 
                ? 'bg-white border-t-2 border-t-red-600 border-b-2 border-b-[#008751] border-x-2 border-x-blue-600 text-slate-900 shadow-xl' 
                : t.color + ' text-white'
            } w-10 h-10 rounded-[1rem] flex items-center justify-center shadow-lg ${activeTab === t.id ? 'ring-4 ring-slate-100' : ''}`}>
              {t.icon}
            </div>
            <span className={`text-[7px] font-black uppercase tracking-[0.1em] text-slate-700`}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const AppWrapper: React.FC = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export default AppWrapper;
