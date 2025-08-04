"use client"

import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import { StatusBar } from "expo-status-bar"
import React, { useState, createContext, useContext, useEffect } from "react"
import { View, Text, StyleSheet, Alert } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { authApi } from "./src/api"

// --- Mock/Placeholder Components ---
// These are placeholders for the generic components your screens rely on.
// In a real app, these would have their own logic and UI.





// --- Screen Component Definitions ---
// Here are the screen components you provided, now integrated directly.

const RestaurantListScreen = () => {
  return <ServiceListScreen serviceType="restaurants" />
}

const RestaurantDetailScreen = () => {
  return <ServiceDetailScreen serviceType="restaurants" />
}

const StayListScreen = () => {
  return <ServiceListScreen serviceType="stays" />
}

const StayDetailScreen = () => {
  return <ServiceDetailScreen serviceType="stays" />
}

const ActivityListScreen = () => {
  return <ServiceListScreen serviceType="activities" />
}

const ActivityDetailScreen = () => {
  return <ServiceDetailScreen serviceType="activities" />
}

const RentalListScreen = () => {
  return <ServiceListScreen serviceType="rentals" />
}

const RentalDetailScreen = () => {
  return <ServiceDetailScreen serviceType="rentals" />
}


// Onboarding Screens (Assuming these are in separate files as before)
import PhoneEntryScreen from "./src/screens/onboarding/PhoneEntryScreen"
import OTPVerificationScreen from "./src/screens/onboarding/OTPVerificationScreen"
import UserInfoScreen from "./src/screens/onboarding/UserInfoScreen"
// Main App Screens (Assuming these are in separate files as before)
import ExploreScreen from "./src/screens/main/ExploreScreen"
// import TripScreen from "./src/screens/main/TripScreen"
import ProfileScreen from "./src/screens/main/ProfileScreen"
import TripDetailsScreen from "./src/screens/main/TripDetailsScreen"
import CategoryScreen from "./src/screens/main/CategoryScreen"
import DestinationDetailScreen from "./src/screens/DestinationDetailScreen"
import AdminScreen from "./src/screens/main/AdminScreen"

// Import types for navigation
import type { RootStackParamList, MainTabParamList } from "./src/types/navigation"
import ServiceDetailScreen from "./src/components/ServiceDetailScreen"
import ServiceListScreen from "./src/screens/main/ServiceListScreen"
import BookingDetailsScreen from "./src/screens/main/BookingDetail"
// import BookingScreen from "./src/screens/main/TripScreen"
import BookingScreens from "./src/screens/main/TripScreen"

const Stack = createStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<MainTabParamList>()

// --- Auth Context ---
// This context will provide authentication state to the entire app.
interface AuthContextType {
  isOnboarded: boolean
  setIsOnboarded: (value: boolean) => void
  userId: string | null
  setUserId: (id: string | null) => void
  isAdmin: boolean
  setIsAdmin: (value: boolean) => void
  storeAdminRequest: string | null
  setStoreAdminRequest: (value: string | null) => void
}

const AuthContext = createContext<AuthContextType>({
  isOnboarded: false,
  setIsOnboarded: () => {},
  userId: null,
  setUserId: () => {},
  isAdmin: false,
  setIsAdmin: () => {},
  storeAdminRequest: null,
  setStoreAdminRequest: () => {},
})

// --- Main App Tabs ---
// This is the main navigation for authenticated users.
function MainTabs() {
  const { isAdmin, storeAdminRequest } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          if (route.name === "Explore") {
            iconName = focused ? "earth" : "earth-outline"
          } else if (route.name === "Trip") {
            iconName = focused ? "bag" : "bag-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
          } else if (route.name === "Admin") {
            iconName = focused ? "settings" : "settings-outline"
          } else {
            iconName = "alert-circle-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#FF6B35",
        tabBarInactiveTintColor: "#8E8E93",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          height: 85,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Trip" component={BookingScreens} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      {(isAdmin || storeAdminRequest === 'approved') && <Tab.Screen name="Admin" component={AdminScreen} />}
    </Tab.Navigator>
  )
}

// --- Onboarding Flow Stack ---
// This stack handles the entire user onboarding process.
function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PhoneEntry" component={PhoneEntryScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="UserInfo" component={UserInfoScreen} />
    </Stack.Navigator>
  )
}

// --- Main App Stack ---
// This stack contains the tab navigator and any other full-screen modals or detail pages.
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="TripDetails"
        component={TripDetailsScreen}
        // This screen can have its own header options
        options={{
          presentation: 'modal',
          headerShown: true,
          title: "Trip Details",
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="RestaurantList" component={RestaurantListScreen} />
      <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
      <Stack.Screen name="DestinationDetail" component={DestinationDetailScreen} />
      <Stack.Screen name="RentalList" component={RentalListScreen} />
      <Stack.Screen name="RentalDetail" component={RentalDetailScreen} />
            <Stack.Screen name="StayList" component={StayListScreen} />
      <Stack.Screen name="StayDetail" component={StayDetailScreen} />
      {/* Newly Added Activity Screens */}
      <Stack.Screen name="ActivityList" component={ActivityListScreen} />
      <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
      <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
      
    </Stack.Navigator>
  )
}

// --- Root App Component ---
export default function App() {
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [storeAdminRequest, setStoreAdminRequest] = useState<string | null>(null)

  useEffect(() => {
    // Fetch user info on app load if token exists
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const response = await authApi.getCurrentUser();
          let user = null;
          if (response.success && response.data) {
            if (typeof response.data === 'object' && 'data' in response.data && typeof response.data.data === 'object') {
              user = response.data.data;
            } else {
              user = response.data;
            }
            if (user && typeof user === 'object' && '_id' in user && 'isAdmin' in user && 'storeAdminRequest' in user) {
              setUserId(user._id as string);
              setIsAdmin(!!user.isAdmin);
              setStoreAdminRequest((user as any).storeAdminRequest || null);
              setIsOnboarded(true);
            }
          }
        } catch (err) {
          setIsOnboarded(false);
        }
      }
    };
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ isOnboarded, setIsOnboarded, userId, setUserId, isAdmin, setIsAdmin, storeAdminRequest, setStoreAdminRequest }}>
      <NavigationContainer>
        <StatusBar style="auto" />
        {isOnboarded ? <MainStack /> : <OnboardingStack />}
      </NavigationContainer>
    </AuthContext.Provider>
  )
}

// Custom hook to easily access the AuthContext from any component
export const useAuth = () => useContext(AuthContext)

// --- Styles for Placeholder Components ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'gray',
    },
})
