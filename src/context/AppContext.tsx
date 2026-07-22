'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { trackEventDirect } from '@/hooks/useTrackEvent';
import {
  getProductName,
  getProductImage,
  getProductPrice,
} from '@/lib/api-types';
import type { ApiProduct, CartSelections } from '@/lib/api-types';

// Definitions
export interface User {
  id: string;
  name: string;
  username: string;
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
  selections?: CartSelections;
  applied_fabric_id?: string;
  applied_fabric_yards?: number;
  note?: string;
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

export interface RecentItem {
  id: string;
  image: string;
  href: string;
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
  authenticateUser: (email: string, password: string) => Promise<User>;
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
  recentlyViewed: RecentItem[];
  addRecentlyViewed: (item: RecentItem) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Helper: map a backend cart item (populated product_id) → frontend CartItem ──
function mapBackendCartItem(item: any): CartItem {
  const p: ApiProduct | null = item.product_id && typeof item.product_id === 'object' ? item.product_id : null;
  return {
    id: p?._id ?? (typeof item.product_id === 'string' ? item.product_id : ''),
    title: p ? getProductName(p) : 'Product',
    price: item.unit_price ?? (p ? getProductPrice(p) : 0),
    image: p ? getProductImage(p) : '',
    quantity: item.quantity ?? 1,
    kind: p?.kind ?? 'clothing',
    // Carry through selections from backend
    selections: item.selections ?? undefined,
    applied_fabric_id: item.applied_fabric_id ?? undefined,
    applied_fabric_yards: item.applied_fabric_yards ?? undefined,
    note: item.note ?? undefined,
  };
}

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
  const [recentlyViewed, setRecentlyViewed] = useState<RecentItem[]>([]);

  // Track whether the user is authenticated for fire-and-forget API calls
  const isAuthenticated = useRef(false);

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
    if (savedWish) {
      const parsed = JSON.parse(savedWish);
      setWishlist([...new Set(parsed as string[])]);
    }
    if (savedJobs) setJobs(JSON.parse(savedJobs));
    if (savedGender) setGenderState(savedGender as 'male' | 'female');
    if (savedGenderSelected === 'true') setGenderSelectedState(true);
    if (savedFollowed) setFollowedVendors(JSON.parse(savedFollowed));
    const savedRecent = localStorage.getItem('qlozet_recently_viewed');
    if (savedRecent) setRecentlyViewed(JSON.parse(savedRecent));

    // Validate active backend session on load
    const token = localStorage.getItem('qlozet_access_token');
    if (token) {
      api.get('/users/me')
        .then((res) => {
          const userProfile = res.data.data || res.data;
          const mappedUser: User = {
            id: userProfile._id || userProfile.id,
            name: userProfile.full_name || userProfile.name,
            username: userProfile.username || '',
            email: userProfile.email,
            phone: userProfile.phone_number || userProfile.phone || '',
            address: userProfile.address || '',
            dob: userProfile.dob || '',
            tokenBalance: userProfile.tokenBalance ?? 0,
          };
          setUser(mappedUser);
          localStorage.setItem('qlozet_user', JSON.stringify(mappedUser));
          isAuthenticated.current = true;

          // Fetch real token balance from dedicated endpoint
          api.get('/token/balance').then((tokenRes) => {
            const realBalance = tokenRes.data?.data?.tokens ?? tokenRes.data?.tokens ?? 0;
            const userWithBalance = { ...mappedUser, tokenBalance: realBalance };
            setUser(userWithBalance);
            localStorage.setItem('qlozet_user', JSON.stringify(userWithBalance));
          }).catch(() => { /* token fetch failed, keep default */ });

          // ── Sync Cart & Wishlist from backend ─────────────────
          const localCartRaw = localStorage.getItem('qlozet_cart');
          const localCart: CartItem[] = localCartRaw ? JSON.parse(localCartRaw) : [];

          Promise.allSettled([
            api.get('/cart'),
            api.get('/users/wishlist'),
          ]).then(([cartResult, wishResult]) => {
            // -- Cart sync --
            if (cartResult.status === 'fulfilled') {
              const rawCart = cartResult.value.data;
              // API returns { data: { items: [...] } } — unwrap correctly
              const backendCartData = rawCart?.data ?? rawCart;
              const backendItems: CartItem[] = (backendCartData?.items ?? []).map(mapBackendCartItem);

              // Merge local guest items that aren't already in the backend cart
              const backendIds = new Set(backendItems.map((i: CartItem) => i.id));
              const guestOnly = localCart.filter((i) => !backendIds.has(i.id));

              // Push guest-only items to backend silently (include selections)
              for (const item of guestOnly) {
                api.post('/cart/add', {
                  productId: item.id,
                  quantity: item.quantity,
                  ...(item.selections ? { selections: item.selections } : {}),
                  ...(item.applied_fabric_id ? { appliedFabricId: item.applied_fabric_id } : {}),
                  ...(item.applied_fabric_yards ? { appliedFabricYards: item.applied_fabric_yards } : {}),
                  ...(item.note ? { note: item.note } : {}),
                }).catch(() => {});
              }

              const merged = [...backendItems, ...guestOnly];
              setCart(merged);
              saveState('qlozet_cart', merged);
            }

            // -- Wishlist sync --
            if (wishResult.status === 'fulfilled') {
              const backendWishlist = wishResult.value.data;
              // Backend returns array of populated products or IDs
              const raw = Array.isArray(backendWishlist?.data) ? backendWishlist.data : (Array.isArray(backendWishlist) ? backendWishlist : []);
              const ids: string[] = [...new Set<string>(raw.map((item: any) => typeof item === 'string' ? item : item._id).filter(Boolean))];
              setWishlist(ids);
              saveState('qlozet_wishlist', ids);
            }
          });
        })
        .catch(() => {
          // Clean logout on token expiration / error
          logout();
        })
        .finally(() => {
          setIsInitialized(true);
        });
    } else {
      setIsInitialized(true);
    }

    // Register auto-refresh failure handler
    const handleAuthFailedEvent = () => {
      logout();
    };
    window.addEventListener('qlozet_auth_failed', handleAuthFailedEvent);

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


    return () => {
      window.removeEventListener('qlozet_auth_failed', handleAuthFailedEvent);
    };
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
    const savedUserStr = localStorage.getItem('qlozet_user');
    let userProfile: User;
    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        userProfile = {
          id: parsed._id || parsed.id || 'usr_' + Math.random().toString(36).substr(2, 9),
          name: parsed.full_name || parsed.name || name,
          username: parsed.username || '',
          email: parsed.email || email,
          phone: parsed.phone_number || parsed.phone || '+234 811 234 5677',
          address: parsed.address || '13c Hallen Estate, Abuja, Nigeria',
          dob: parsed.dob || '1995-05-20',
          tokenBalance: parsed.tokenBalance ?? 250,
        };
      } catch (e) {
        userProfile = createMockUser(email, name);
      }
    } else {
      userProfile = createMockUser(email, name);
    }
    setUser(userProfile);
    saveState('qlozet_user', userProfile);
  };

  const createMockUser = (email: string, name: string): User => ({
    id: 'usr_' + Math.random().toString(36).substr(2, 9),
    name,
    username: '',
    email,
    phone: '+234 811 234 5677',
    address: '13c Hallen Estate, Abuja, Nigeria',
    dob: '1995-05-20',
    tokenBalance: 250,
  });

  const demoLogin = () => {
    const demoUser: User = {
      id: 'usr_demo',
      name: 'Kemi Ayomi',
      username: 'kemi_ayomi',
      email: 'customer@example.com',
      phone: '+234 811 234 5677',
      address: '13c Hallen Estate, Abuja, Nigeria',
      dob: '1995-05-20',
      tokenBalance: 250,
    };
    setUser(demoUser);
    saveState('qlozet_user', demoUser);
    localStorage.setItem('qlozet_user_id', 'usr_demo');
  };

  const authenticateUser = async (email: string, password: string): Promise<User> => {
    const res = await api.post('/auth/login/customer', { email, password });
    const wrapper = res.data;
    const loginData = wrapper.data;

    localStorage.setItem('qlozet_access_token', loginData.token.access_token);
    localStorage.setItem('qlozet_refresh_token', loginData.token.refresh_token);
    localStorage.setItem('qlozet_user_id', loginData.user._id || loginData.user.id);

    const profileRes = await api.get('/users/me');
    const userProfile = profileRes.data.data || profileRes.data;

    const mappedUser: User = {
      id: userProfile._id || userProfile.id,
      name: userProfile.full_name || userProfile.name,
      username: userProfile.username || '',
      email: userProfile.email,
      phone: userProfile.phone_number || userProfile.phone || '',
      address: userProfile.address || '',
      dob: userProfile.dob || '',
      tokenBalance: userProfile.tokenBalance ?? 0,
    };

    setUser(mappedUser);
    localStorage.setItem('qlozet_user', JSON.stringify(mappedUser));

    // Fetch real token balance from dedicated endpoint
    try {
      const tokenRes = await api.get('/token/balance');
      const realBalance = tokenRes.data?.data?.tokens ?? tokenRes.data?.tokens ?? 0;
      const userWithBalance = { ...mappedUser, tokenBalance: realBalance };
      setUser(userWithBalance);
      localStorage.setItem('qlozet_user', JSON.stringify(userWithBalance));
      return userWithBalance;
    } catch {
      return mappedUser;
    }
  };

  const logout = () => {
    setUser(null);
    isAuthenticated.current = false;
    localStorage.removeItem('qlozet_user');
    localStorage.removeItem('qlozet_access_token');
    localStorage.removeItem('qlozet_refresh_token');
    localStorage.removeItem('qlozet_user_id');
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
    // Sync to backend (include selections if present)
    if (isAuthenticated.current) {
      api.post('/cart/add', {
        productId: newItem.id,
        quantity: 1,
        ...(newItem.selections ? { selections: newItem.selections } : {}),
        ...(newItem.applied_fabric_id ? { appliedFabricId: newItem.applied_fabric_id } : {}),
        ...(newItem.applied_fabric_yards ? { appliedFabricYards: newItem.applied_fabric_yards } : {}),
        ...(newItem.note ? { note: newItem.note } : {}),
      }).then((res) => {
        // Adopt the backend's authoritative unit_price (base + components,
        // discount applied) so the displayed line price = what's charged,
        // instead of the client-side customization estimate.
        const backendCart = res.data?.data ?? res.data;
        const backendItem = backendCart?.items?.find((it: any) => {
          const pid = typeof it.product_id === 'object' ? it.product_id?._id : it.product_id;
          return pid === newItem.id;
        });
        if (backendItem && typeof backendItem.unit_price === 'number') {
          setCart((prev) => {
            const updated = prev.map((i) =>
              i.id === newItem.id ? { ...i, price: backendItem.unit_price } : i,
            );
            saveState('qlozet_cart', updated);
            return updated;
          });
        }
      }).catch((error) => {
        const msg = error.response?.data?.message || error.message;
        alert(`Failed to add item to cart on server: ${msg}`);
        // Optional: revert local cart state here if needed, but alerting is the priority
      });
    }
    // Track add_to_cart event
    if (user?.id) {
      trackEventDirect(user.id, {
        eventType: 'add_to_cart',
        properties: { itemId: newItem.id, price: newItem.price },
        context: { surface: 'product_page' },
      });
    }
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      saveState('qlozet_cart', updated);
      return updated;
    });
    // Sync to backend
    if (isAuthenticated.current) {
      api.delete(`/cart/remove/${id}`).catch(() => {});
    }
    // Track remove_from_cart event
    if (user?.id) {
      trackEventDirect(user.id, {
        eventType: 'remove_from_cart',
        properties: { itemId: id },
      });
    }
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
    // Sync to backend
    if (isAuthenticated.current) {
      api.delete('/cart/clear').catch(() => {});
    }
  };

  // Wishlist Handlers
  const toggleWishlist = (id: string) => {
    // Check current state BEFORE updating
    const exists = wishlist.includes(id);

    // Optimistic local update
    setWishlist((prev) => {
      const dedupedPrev = [...new Set(prev)];
      const updated = exists ? dedupedPrev.filter((w) => w !== id) : [...dedupedPrev, id];
      saveState('qlozet_wishlist', updated);
      return updated;
    });

    // Sync to backend (toggle endpoint) — OUTSIDE the state updater
    if (isAuthenticated.current) {
      api.post(`/products/${id}/wishlist`)
        .then((res) => {
          console.log('[Wishlist] toggle success:', id, res.data);
        })
        .catch((err) => {
          console.error('[Wishlist] toggle FAILED:', id, err?.response?.status, err?.response?.data);
          // Rollback: revert the optimistic update
          setWishlist((current) => {
            const rolledBack = exists
              ? [...new Set([...current, id])]
              : current.filter((w) => w !== id);
            saveState('qlozet_wishlist', rolledBack);
            return rolledBack;
          });
        });
    }

    // Track wishlist event
    if (user?.id) {
      trackEventDirect(user.id, {
        eventType: exists ? 'wishlist_remove' : 'wishlist_add',
        properties: { itemId: id },
      });
    }
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

  // ── Recently Viewed ─────────────────────────────────────────────
  const addRecentlyViewed = (item: RecentItem) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((i) => i.id !== item.id);
      const updated = [item, ...filtered].slice(0, 12);
      saveState('qlozet_recently_viewed', updated);
      return updated;
    });
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
        authenticateUser,
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
        recentlyViewed,
        addRecentlyViewed,
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
