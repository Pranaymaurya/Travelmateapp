// src/types/navigation.ts
export type RootStackParamList = {
  Landing: undefined
  Auth: undefined
  Main: undefined
  Restaurant: undefined
  PhoneEntry: undefined // Added for onboarding flow
  OTPVerification: { phoneNumber: string } // Added for OTP flow, expects phoneNumber
  UserInfo: { userId: string } // Added for user info flow, expects userId
  MainTabs: undefined // For the bottom tab navigator
  TripDetails: { trip: any } // Expects a trip object
  Category: { category: any } // Expects a category object
  Bookings: undefined // For the bookings screen
  RestaurantList: undefined
  RestaurantDetail: { restaurantId: string }
  RentalList: undefined
  RentalDetail: { rental: any }
  StayList: undefined
  StayDetail: { stay: any }
  DestinationDetail: { destinationId: string } | undefined
  ActivityList: undefined
  ActivityDetail: { activityId: string }
  BookingDetails: { bookingId: string } | undefined
}

export type MainTabParamList = {
  Explore: undefined
  Trip: undefined
  Profile: undefined
  Admin: undefined
}
