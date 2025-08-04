// src/api/index.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
const API_BASE_URL = "http://localhost:5000/api" // IMPORTANT: Change this to your deployed backend URL // IMPORTANT: Change this to your deployed backend URL

interface ApiResponse<T> {
  success: boolean
  data?: T
  message: string
  error?: string
}

// Generic API call function
async function apiCall<T>(endpoint: string, method = "GET", data?: any): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = await AsyncStorage.getItem('token');
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }

  if (data) {
    options.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(url, options)
    const responseData = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: responseData.message || "An error occurred",
        error: responseData.error || response.statusText,
      }
    }

    return { success: true, data: responseData, message: responseData.message || "Success" }
  } catch (error: any) {
    console.error(`API call to ${url} failed:`, error)
    return {
      success: false,
      message: "Network error or server is unreachable",
      error: error.message,
    }
  }
}

// FormData API call function for file uploads
async function formDataApiCall<T>(endpoint: string, method = "POST", formData: FormData): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = await AsyncStorage.getItem('token');
  const options: RequestInit = {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Don't set Content-Type for FormData, let the browser set it with boundary
    },
    body: formData,
  }

  try {
    const response = await fetch(url, options)
    const responseData = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: responseData.message || "An error occurred",
        error: responseData.error || response.statusText,
      }
    }

    return { success: true, data: responseData, message: responseData.message || "Success" }
  } catch (error: any) {
    console.error(`FormData API call to ${url} failed:`, error)
    return {
      success: false,
      message: "Network error or server is unreachable",
      error: error.message,
    }
  }
}

// --- Auth API Calls ---
export const authApi = {
  sendOtp: (phoneNumber: string) => apiCall("/auth/send-otp", "POST", { phoneNumber }),
  resendOtp: (phoneNumber: string) => apiCall("/auth/send-otp", "POST", { phoneNumber }),
  verifyOtp: (phoneNumber: string, otpCode: string) => apiCall("/auth/verify-otp", "POST", { phoneNumber, otpCode }),
  
  // Registration with profile image support
  register: async (userData: any, profileImageUri?: string) => {
    if (profileImageUri) {
      const formData = new FormData();
      
      // Add user data
      Object.keys(userData).forEach(key => {
        formData.append(key, userData[key]);
      });
      
      // Add profile image
      const filename = profileImageUri.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('image', {
        uri: profileImageUri,
        name: filename,
        type: type,
      } as any);
      
      return formDataApiCall("/auth/register", "POST", formData);
    } else {
      return apiCall("/auth/register", "POST", userData);
    }
  },
  
  login: (credentials: any) => apiCall("/auth/login", "POST", credentials),
  getCurrentUser: () => apiCall("/auth/me", "GET"),
  logout: async () => {
    await AsyncStorage.removeItem('token');
  },
  requestStoreAdmin: () => apiCall("/auth/request-store-admin", "POST"),
  
  // Profile update with image support
  updateProfile: async (userData: any, profileImageUri?: string) => {
    if (profileImageUri) {
      const formData = new FormData();
      
      // Add user data
      Object.keys(userData).forEach(key => {
        if (userData[key] !== undefined && userData[key] !== null) {
          formData.append(key, userData[key]);
        }
      });
      
      // Add profile image
      const filename = profileImageUri.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('image', {
        uri: profileImageUri,
        name: filename,
        type: type,
      } as any);
      
      return formDataApiCall("/auth/update-profile", "PUT", formData);
    } else {
      return apiCall("/auth/update-profile", "PUT", userData);
    }
  },
  
  // Admin-only APIs
  getAllUsers: () => apiCall("/auth/users", "GET"),
  getAdminRequests: () => apiCall("/auth/admin-requests", "GET"),
  approveStoreAdmin: (userId: string) => apiCall(`/auth/approve-store-admin/${userId}`, "PUT"),
  rejectStoreAdmin: (userId: string) => apiCall(`/auth/reject-store-admin/${userId}`, "PUT"),
  updateUser: (userId: string, userData: any) => apiCall(`/auth/users/${userId}`, "PUT", userData),
  deleteUser: (userId: string) => apiCall(`/auth/users/${userId}`, "DELETE"),
  getAdminStats: () => apiCall("/auth/admin/stats", "GET"),
}

// Helper function to create FormData for entity operations with images
const createEntityFormData = (entityData: any, images?: string[], options?: {
  isPrimary?: boolean;
  tags?: string[];
  imageDescriptions?: string[];
}) => {
  const formData = new FormData();
  
  // Add entity data
  Object.keys(entityData).forEach(key => {
    if (entityData[key] !== undefined && entityData[key] !== null) {
      if (typeof entityData[key] === 'object') {
        formData.append(key, JSON.stringify(entityData[key]));
      } else {
        formData.append(key, entityData[key].toString());
      }
    }
  });
  
  // Add images
  if (images && images.length > 0) {
    images.forEach((imageUri, index) => {
      const filename = imageUri.split('/').pop() || `image${index}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('images', {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);
    });
  }
  
  // Add options
  if (options?.isPrimary) {
    formData.append('isPrimary', 'true');
  }
  if (options?.tags) {
    formData.append('tags', options.tags.join(','));
  }
  if (options?.imageDescriptions) {
    formData.append('imageDescriptions', options.imageDescriptions.join(','));
  }
  
  return formData;
};

// --- Trip API Calls ---
export const tripApi = {
  getAllTrips: () => apiCall("/trips", "GET"),
  getTripById: (id: string) => apiCall(`/trips/${id}`, "GET"),
  getTripsByCategory: (category: string) => apiCall(`/trips/category/${category}`, "GET"),
  getTripsBySubcategory: (subcategory: string) => apiCall(`/trips/subcategory/${subcategory}`, "GET"),
  getTripsByDifficulty: (difficulty: string) => apiCall(`/trips/difficulty/${difficulty}`, "GET"),
  getTripsByPriceRange: (minPrice: number, maxPrice: number) => apiCall(`/trips/price-range?minPrice=${minPrice}&maxPrice=${maxPrice}`, "GET"),
  getTrendingTrips: () => apiCall("/trips/trending", "GET"),
  getCategories: () => apiCall("/trips/categories", "GET"),
  getSubcategories: () => apiCall("/trips/subcategories", "GET"),
  getTripsWithFilters: (filters: any) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key]);
      }
    });
    return apiCall(`/trips?${params.toString()}`, "GET");
  },
  // Explore Screen APIs
  getTopDestinations: () => apiCall("/destination", "GET"),
  getWeekendEscapes: () => apiCall("/trips/weekend-escapes", "GET"),
  getBudgetFriendly: () => apiCall("/trips/budget-friendly", "GET"),
  getFeaturedExperiences: () => apiCall("/trips/featured-experiences", "GET"),
  getOffbeatEscapes: () => apiCall("/trips/offbeat-escapes", "GET"),
  getPartyEscapes: () => apiCall("/trips/party-escapes", "GET"),
  getPopularQuickTrips: () => apiCall("/trips/popular-quick", "GET"),
  searchTrips: (query: string, filters?: any) => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
    }
    return apiCall(`/trips/search?${params.toString()}`, "GET");
  },
  
  // Create trip with images
  createTrip: (tripData: any, images?: string[], options?: {
    tags?: string[];
    imageDescriptions?: string[];
  }) => {
    const formData = createEntityFormData(tripData, images, options);
    return formDataApiCall("/trips", "POST", formData);
  },
  
  // Update trip with images
  updateTrip: (id: string, tripData: any, images?: string[], options?: {
    isPrimary?: boolean;
    tags?: string[];
    imageDescriptions?: string[];
  }) => {
    const formData = createEntityFormData(tripData, images, options);
    return formDataApiCall(`/trips/${id}`, "PUT", formData);
  },
  
  deleteTrip: (id: string) => apiCall(`/trips/${id}`, "DELETE"),
}

export const tripApiWithGetAll = {
  ...tripApi,
  getAll: tripApi.getAllTrips,
  create: tripApi.createTrip,
  delete: tripApi.deleteTrip,
};

// --- Booking API Calls ---
export const bookingApi = {
  createBooking: (bookingData: any) => apiCall("/booking", "POST", bookingData),
  getUserBookings: (userId: string) => apiCall(`/bookings/user/${userId}`, "GET"),
  getAllBookings: () => apiCall("/bookings", "GET"),
  getBookingsByCategory: (category: string) => apiCall(`/booking/category/${category}`, "GET"),
  getBookingsByStatus: (status: string) => apiCall(`/booking/status/${status}`, "GET"),
  getUpcomingBookings: () => apiCall("/booking/upcoming", "GET"),
  getPastBookings: () => apiCall("/booking/past", "GET"),
  getBookingStats: () => apiCall("/booking/stats", "GET"),
  updateBookingStatus: (bookingId: string, status: string) => apiCall(`/booking/${bookingId}/status`, "PUT", { status }),
  cancelBooking: (bookingId: string) => apiCall(`/booking/${bookingId}`, "DELETE"),
}

// --- Review API Calls ---
export const reviewApi = {
  // Create review with images
  createReview: async (reviewData: {
    itemId: string
    itemType: string
    rating: number
    comment: string
  }, images?: string[], options?: {
    tags?: string[];
    imageDescriptions?: string[];
  }) => {
    if (images && images.length > 0) {
      const formData = createEntityFormData(reviewData, images, options);
      return formDataApiCall("/review", "POST", formData);
    } else {
      return apiCall("/review", "POST", reviewData);
    }
  },

  getReviewsForItem: async ({
    itemType,
    itemId,
    userId
  }: {
    itemType: string
    itemId: string
    userId: string
  }) => {
    try {
      const params = new URLSearchParams({ itemType, itemId, userId });
      const response = await fetch(
        `${API_BASE_URL}/review/item?${params.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      const result = await response.json()

      if (!response.ok) {
        return { success: false, message: result.message || "Failed to fetch reviews." }
      }

      return { success: true, reviews: result.reviews || [] }
    } catch (error: any) {
      console.error("Error fetching item reviews:", error)
      return { success: false, message: "Server error. Please try again later." }
    }
  },
  
  // Update review with images
  updateReview: async (reviewId: string, reviewData: {
    rating?: number;
    comment?: string;
  }, images?: string[], options?: {
    tags?: string[];
    imageDescriptions?: string[];
  }) => {
    if (images && images.length > 0) {
      const formData = createEntityFormData(reviewData, images, options);
      return formDataApiCall("/review", "PUT", formData);
    } else {
      return apiCall("/review", "PUT", { reviewId, ...reviewData });
    }
  },
  
  deleteReview: (reviewId: string) => apiCall("/review", "DELETE", { reviewId }),
  
  canReview: (itemType: string, itemId: string) => 
    apiCall(`/review/can-review?itemType=${itemType}&itemId=${itemId}`, "GET"),
}

// This file provides a generalized API client to fetch details for various item types.

interface ApiResponse<T> {
  success: boolean
  data?: T
  message: string
}

// Define a generic Item interface that can represent any item type
interface GenericItem {
  _id: string
  name: string
  // Add other common properties or use a union type if specific properties are needed
  [key: string]: any // Allow for arbitrary properties
}

const BASE_URL = "http://localhost:5000/api" // Adjust to your backend URL

export const genericItemApi = {
  /**
   * Fetches details for a specific item by its type and ID.
   * @param itemType The type of the item (e.g., "restaurants", "activities", "trips", "stays", "rentals").
   *                 This should correspond to your backend route segments.
   * @param itemId The ID of the item to fetch.
   * @returns A promise that resolves to an ApiResponse containing the item data.
   */
  getItemByIdAndType: async <T extends GenericItem>(itemType: string, itemId: string): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${BASE_URL}/${itemType}/${itemId}`)
      const data = await response.json()

      if (response.ok) {
        return { success: true, data: data as T, message: "Success" }
      } else {
        return { success: false, message: data.message || `Failed to fetch ${itemType} details.` }
      }
    } catch (error: any) {
      console.error(`Error fetching ${itemType} by ID (${itemId}):`, error)
      return { success: false, message: "Network error or server is unreachable." }
    }
  },
}

// --- Rentals API Calls ---
export const rentalApi = {
  getAll: () => apiCall("/rentals", "GET"),
  getById: (id: string) => apiCall(`/rentals/${id}`, "GET"),
  create: (data: any, images?: string[], options?: {
    tags?: string[];
    imageDescriptions?: string[];
  }) => {
    const formData = createEntityFormData(data, images, options);
    return formDataApiCall("/rentals", "POST", formData);
  },
  update: (id: string, data: any, images?: string[], options?: {
    isPrimary?: boolean;
    tags?: string[];
    imageDescriptions?: string[];
  }) => {
    const formData = createEntityFormData(data, images, options);
    return formDataApiCall(`/rentals/${id}`, "PUT", formData);
  },
  delete: (id: string) => apiCall(`/rentals/${id}`, "DELETE"),
};

// --- Restaurants API Calls ---
export const restaurantApi = {
  getAll: () => apiCall("/restaurants", "GET"),
  getById: (id: string) => apiCall(`/restaurants/${id}`, "GET"),
  create: (data: any, images?: string[], options?: {
    tags?: string[];
    imageDescriptions?: string[];
  }) => {
    const formData = createEntityFormData(data, images, options);
    return formDataApiCall("/restaurants", "POST", formData);
  },
  update: (id: string, data: any, images?: string[], options?: {
    isPrimary?: boolean;
    tags?: string[];
    imageDescriptions?: string[];
  }) => {
    const formData = createEntityFormData(data, images, options);
    return formDataApiCall(`/restaurants/${id}`, "PUT", formData);
  },
  delete: (id: string) => apiCall(`/restaurants/${id}`, "DELETE"),
};

// --- Stays API Calls ---
export const stayApi = {
  getAll: () => apiCall("/stays", "GET"),
  getById: (id: string) => apiCall(`/stays/${id}`, "GET"),
  create: (data: any, images?: string[], options?: {
    tags?: string[];
    imageDescriptions?: string[];
  }) => {
    const formData = createEntityFormData(data, images, options);
    return formDataApiCall("/stays", "POST", formData);
  },
  update: (id: string, data: any, images?: string[], options?: {
    isPrimary?: boolean;
    tags?: string[];
    imageDescriptions?: string[];
  }) => {
    const formData = createEntityFormData(data, images, options);
    return formDataApiCall(`/stays/${id}`, "PUT", formData);
  },
  delete: (id: string) => apiCall(`/stays/${id}`, "DELETE"),
};

// --- Activities API Calls ---
export const activityApi = {
  getAll: () => apiCall("/activities", "GET"),
  getById: (id: string) => apiCall(`/activities/${id}`, "GET"),
  create: (data: any, images?: string[], options?: {
    tags?: string[];
    imageDescriptions?: string[];
  }) => {
    const formData = createEntityFormData(data, images, options);
    return formDataApiCall("/activities", "POST", formData);
  },
  update: (id: string, data: any, images?: string[], options?: {
    isPrimary?: boolean;
    tags?: string[];
    imageDescriptions?: string[];
  }) => {
    const formData = createEntityFormData(data, images, options);
    return formDataApiCall(`/activities/${id}`, "PUT", formData);
  },
  delete: (id: string) => apiCall(`/activities/${id}`, "DELETE"),
};

export const destinationsApi = {
  getAll: () => apiCall("/destination", "GET"),
  create: (data: any, images?: string[], options?: {
    tags?: string[];
    imageDescriptions?: string[];
  }) => {
    const formData = createEntityFormData(data, images, options);
    return formDataApiCall("/destination", "POST", formData);
  },
  update: (id: string, data: any, images?: string[], options?: {
    isPrimary?: boolean;
    tags?: string[];
    imageDescriptions?: string[];
  }) => {
    const formData = createEntityFormData(data, images, options);
    return formDataApiCall(`/destination/${id}`, "PUT", formData);
  },
  delete: (id: string) => apiCall(`/destination/${id}`, "DELETE"),
};

// --- Image API Calls ---
export const imageApi = {
  uploadSingle: async (imageUri: string, entityType: string, entityId: string, options?: {
    isPrimary?: boolean;
    tags?: string[];
    description?: string;
  }) => {
    try {
      const formData = new FormData();
      
      // Get file info from URI
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);
      
      formData.append('entityType', entityType);
      formData.append('entityId', entityId);
      
      if (options?.isPrimary) {
        formData.append('isPrimary', 'true');
      }
      if (options?.tags) {
        formData.append('tags', JSON.stringify(options.tags));
      }
      if (options?.description) {
        formData.append('description', options.description);
      }

      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/images/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        message: 'Failed to upload image',
        error: error.message,
      };
    }
  },

  uploadMultiple: async (imageUris: string[], entityType: string, entityId: string, options?: {
    tags?: string[];
    description?: string;
  }) => {
    try {
      const formData = new FormData();
      
      imageUris.forEach((imageUri, index) => {
        const filename = imageUri.split('/').pop() || `image${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('images', {
          uri: imageUri,
          name: filename,
          type: type,
        } as any);
      });
      
      formData.append('entityType', entityType);
      formData.append('entityId', entityId);
      
      if (options?.tags) {
        formData.append('tags', JSON.stringify(options.tags));
      }
      if (options?.description) {
        formData.append('description', options.description);
      }

      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/images/upload-multiple`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Error uploading images:', error);
      return {
        success: false,
        message: 'Failed to upload images',
        error: error.message,
      };
    }
  },

  getImage: (imageId: string) => `${API_BASE_URL}/images/${imageId}`,
  
  getEntityImages: (entityType: string, entityId: string) => 
    apiCall(`/images/entity/${entityType}/${entityId}`, "GET"),
  
  updateImage: (imageId: string, data: any) => 
    apiCall(`/images/${imageId}`, "PUT", data),
  
  deleteImage: (imageId: string) => 
    apiCall(`/images/${imageId}`, "DELETE"),
  
  getUserImages: (userId: string) => 
    apiCall(`/images/user/${userId}`, "GET"),
};
