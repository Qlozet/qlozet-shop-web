'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Definitions
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  tokenBalance: number;
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  kind: 'clothing' | 'fabric' | 'accessory';
  extra?: string; // yards for fabric, dimensions for accessories
}

export interface TryOnJob {
  id: string;
  type: 'prediction' | 'outfit' | 'mask';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  payload: any;
  result?: string; // Generated image or measurement data
}

export interface FabricReservation {
  id: string;
  fabricId: string;
  fabricName: string;
  fabricImage: string;
  fabricPrice: number;
  eventName: string;
  totalYards: number;
  claimedYards: number;
  deadline: string;
  createdAt: string;
  organizerName: string;
  status: 'active' | 'completed' | 'expired';
}

interface AppContextType {
  user: User | null;
  gender: 'male' | 'female';
  setGender: (g: 'male' | 'female') => void;
  genderSelected: boolean;
  setGenderSelected: (v: boolean) => void;
  isInitialized: boolean;
  followedVendors: string[];
  toggleFollowVendor: (id: string) => void;
  login: (email: string, name?: string) => void;
  logout: () => void;
  demoLogin: () => void;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  jobs: TryOnJob[];
  addJob: (job: Omit<TryOnJob, 'id' | 'createdAt' | 'status'>) => string;
  updateJobStatus: (id: string, status: TryOnJob['status'], result?: string) => void;
  deductTokens: (amount: number) => boolean;
  addTokens: (amount: number) => void;
  reservations: FabricReservation[];
  createReservation: (reservation: Omit<FabricReservation, 'id' | 'createdAt' | 'claimedYards' | 'status'>) => string;
  claimReservation: (id: string, yards: number) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Global States
  const [user, setUser] = useState<User | null>(null);
  const [gender, setGenderState] = useState<'male' | 'female'>('female');
  const [genderSelected, setGenderSelectedState] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [followedVendors, setFollowedVendors] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [jobs, setJobs] = useState<TryOnJob[]>([]);
  const [reservations, setReservations] = useState<FabricReservation[]>([]);

  // Seed demo details on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('qlozet_user');
    const savedCart = localStorage.getItem('qlozet_cart');
    const savedWish = localStorage.getItem('qlozet_wishlist');
    const savedJobs = localStorage.getItem('qlozet_jobs');
    const savedGender = localStorage.getItem('qlozet_gender');
    const savedGenderSelected = localStorage.getItem('qlozet_gender_selected');
    const savedFollowed = localStorage.getItem('qlozet_followed_vendors');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setGenderSelectedState(true); // logged-in users always have gender set
    }
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWish) setWishlist(JSON.parse(savedWish));
    if (savedJobs) setJobs(JSON.parse(savedJobs));
    if (savedGender) setGenderState(savedGender as 'male' | 'female');
    if (savedGenderSelected === 'true') setGenderSelectedState(true);
    if (savedFollowed) setFollowedVendors(JSON.parse(savedFollowed));

    // Load or seed reservations
    const savedReservations = localStorage.getItem('qlozet_reservations');
    if (savedReservations) {
      setReservations(JSON.parse(savedReservations));
    } else {
      // Seed demo reservations
      const demoReservations: FabricReservation[] = [
        {
          id: 'res_demo_1',
          fabricId: 'prod_5',
          fabricName: 'Ankara Wax Print — Rust Orange',
          fabricImage: '/image/ankara.png',
          fabricPrice: 35000,
          eventName: 'Adebayo Wedding',
          totalYards: 60,
          claimedYards: 38,
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          organizerName: 'Kemi Ayomi',
          status: 'active',
        },
        {
          id: 'res_demo_2',
          fabricId: 'prod_6',
          fabricName: 'Golden Brocade Lace',
          fabricImage: '/image/fabric-1.jpg',
          fabricPrice: 75000,
          eventName: 'Okonkwo Family Reunion',
          totalYards: 30,
          claimedYards: 30,
          deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          organizerName: 'Chidi Okonkwo',
          status: 'completed',
        },
      ];
      setReservations(demoReservations);
      saveState('qlozet_reservations', demoReservations);
    }
    
    setIsInitialized(true);
  }, []);

  // Wrapped setters that also persist
  const setGender = (g: 'male' | 'female') => {
    setGenderState(g);
    localStorage.setItem('qlozet_gender', g);
  };

  const setGenderSelected = (v: boolean) => {
    setGenderSelectedState(v);
    localStorage.setItem('qlozet_gender_selected', String(v));
  };

  const toggleFollowVendor = (id: string) => {
    setFollowedVendors((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((v) => v !== id) : [...prev, id];
      saveState('qlozet_followed_vendors', updated);
      return updated;
    });
  };

  // Persistent Storage Sync
  const saveState = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const login = (email: string, name: string = 'Kemi Ayomi') => {
    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name,
      email,
      phone: '+234 811 234 5677',
      address: '13c Hallen Estate, Abuja, Nigeria',
      dob: '1995-05-20',
      tokenBalance: 250, // Seeds with 250 try-on credits
    };
    setUser(newUser);
    saveState('qlozet_user', newUser);
  };

  const demoLogin = () => {
    login('kemi.ayomi@gmail.com', 'Kemi Ayomi');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('qlozet_user');
  };

  // Cart Handlers
  const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      let updated;
      if (existing) {
        updated = prev.map((i) => (i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i));
      } else {
        updated = [...prev, { ...newItem, quantity: 1 }];
      }
      saveState('qlozet_cart', updated);
      return updated;
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      saveState('qlozet_cart', updated);
      return updated;
    });
  };

  const updateQuantity = (id: string, qty: number) => {
    setCart((prev) => {
      const updated = prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i));
      saveState('qlozet_cart', updated);
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('qlozet_cart');
  };

  // Wishlist Handlers
  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((w) => w !== id) : [...prev, id];
      saveState('qlozet_wishlist', updated);
      return updated;
    });
  };

  // Token Credit Balance operations
  const deductTokens = (amount: number): boolean => {
    if (!user || user.tokenBalance < amount) return false;
    const updatedUser = { ...user, tokenBalance: user.tokenBalance - amount };
    setUser(updatedUser);
    saveState('qlozet_user', updatedUser);
    return true;
  };

  const addTokens = (amount: number) => {
    if (!user) return;
    const updatedUser = { ...user, tokenBalance: user.tokenBalance + amount };
    setUser(updatedUser);
    saveState('qlozet_user', updatedUser);
  };

  // Background Try-On Job processing
  const addJob = (job: Omit<TryOnJob, 'id' | 'createdAt' | 'status'>): string => {
    const id = 'job_' + Math.random().toString(36).substr(2, 9);
    const newJob: TryOnJob = {
      ...job,
      id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    setJobs((prev) => {
      const updated = [newJob, ...prev];
      saveState('qlozet_jobs', updated);
      return updated;
    });

    // Simulate Background Execution Timeline
    setTimeout(() => {
      updateJobStatus(id, 'processing');
      
      setTimeout(() => {
        // Mock successful rendering after 8 seconds
        let resultUrl = '';
        if (job.type === 'prediction') {
          resultUrl = JSON.stringify({
            height: '168 cm',
            bust: '91 cm',
            waist: '71 cm',
            hips: '96 cm',
            gender: 'female',
          });
        } else if (job.type === 'outfit') {
          // Generates high-fidelity fashion render placeholder
          resultUrl = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000';
        }
        updateJobStatus(id, 'completed', resultUrl);
      }, 5000);
    }, 2000);

    return id;
  };

  const updateJobStatus = (id: string, status: TryOnJob['status'], result?: string) => {
    setJobs((prev) => {
      const updated = prev.map((j) => (j.id === id ? { ...j, status, ...(result ? { result } : {}) } : j));
      saveState('qlozet_jobs', updated);
      return updated;
    });
  };

  // ── Fabric Reservations ──────────────────────────────────────────
  const createReservation = (reservation: Omit<FabricReservation, 'id' | 'createdAt' | 'claimedYards' | 'status'>): string => {
    const id = 'res_' + Math.random().toString(36).substr(2, 9);
    const newReservation: FabricReservation = {
      ...reservation,
      id,
      claimedYards: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setReservations((prev) => {
      const updated = [newReservation, ...prev];
      saveState('qlozet_reservations', updated);
      return updated;
    });
    return id;
  };

  const claimReservation = (id: string, yards: number): boolean => {
    let success = false;
    setReservations((prev) => {
      const updated = prev.map((r) => {
        if (r.id === id && r.status === 'active' && r.claimedYards + yards <= r.totalYards) {
          success = true;
          const newClaimed = r.claimedYards + yards;
          return {
            ...r,
            claimedYards: newClaimed,
            status: newClaimed >= r.totalYards ? 'completed' as const : 'active' as const,
          };
        }
        return r;
      });
      saveState('qlozet_reservations', updated);
      return updated;
    });
    return success;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        gender,
        setGender,
        genderSelected,
        setGenderSelected,
        isInitialized,
        followedVendors,
        toggleFollowVendor,
        login,
        logout,
        demoLogin,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        wishlist,
        toggleWishlist,
        jobs,
        addJob,
        updateJobStatus,
        deductTokens,
        addTokens,
        reservations,
        createReservation,
        claimReservation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside an AppProvider');
  return context;
};
