"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
  Modal,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { bookingApi } from "../../api";
import { useAuth } from "../../../App";

const { width, height } = Dimensions.get("window");

// --- Constants for Header Animation ---
const HEADER_MAX_HEIGHT = height * 0.4;
const HEADER_MIN_HEIGHT = 110;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

// --- Reusable component for staggered content animation ---
const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      delay,
      useNativeDriver: true,
    }).start();
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 600,
      delay,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {children}
    </Animated.View>
  );
};

export default function TripDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { trip } = route.params as { trip: any };
  const { userId } = useAuth();

  const [selectedDate, setSelectedDate] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("Cultural");
  const [selectedAccommodation, setSelectedAccommodation] = useState("Hotel");
  const [selectedRoomType, setSelectedRoomType] = useState("Double");
  const [selectedTransportation, setSelectedTransportation] = useState("Flight");
  const [selectedMealPlan, setSelectedMealPlan] = useState("None");
  const [isModalVisible, setModalVisible] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const bookingCategories = [
    "Adventure", "Cultural", "Relaxation", "Business", "Honeymoon", "Family", "Solo", "Group", "Luxury", "Budget"
  ];

  const accommodationTypes = ["Hotel", "Resort", "Hostel", "Apartment", "Villa", "Camping"];
  const roomTypes = ["Single", "Double", "Twin", "Suite", "Family", "Dormitory"];
  const transportationTypes = ["Flight", "Train", "Bus", "Car", "Boat", "None"];
  const mealPlans = ["None", "Breakfast", "Half Board", "Full Board", "All Inclusive"];

  // --- Animated value for scroll position ---
  const scrollY = useRef(new Animated.Value(0)).current;

  // --- Interpolated styles for header animation ---
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  });

  const headerContentOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const headerContentTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -50],
    extrapolate: "clamp",
  });
  
  const parallaxTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -HEADER_SCROLL_DISTANCE / 2],
    extrapolate: 'clamp',
  });

  const compactHeaderOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const handleBookTrip = async () => {
    if (!selectedDate) {
      Alert.alert("Select Date", "Please select your travel date");
      return;
    }

    if (!userId) {
      Alert.alert("Login Required", "Please login to book this trip");
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    try {
      // Parse the selected date range
      const [startDate, endDate] = selectedDate.split(" - ");
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      const bookingData = {
        tripId: trip._id,
        travelers: travelers,
        category: selectedCategory,
        travelDate: {
          startDate: startDateObj,
          endDate: endDateObj,
        },
        accommodation: {
          type: selectedAccommodation,
          roomType: selectedRoomType,
        },
        transportation: selectedTransportation,
        mealPlan: selectedMealPlan,
        paymentDetails: {
          paymentMethod: "Credit Card",
          transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          paymentStatus: "Paid"
        },
        specialRequests: `Travel date: ${selectedDate}`,
        insurance: { included: false },
        guide: { included: false },
        activities: [],
        cancellationPolicy: "Moderate",
        notes: `Booked via TravelMate app`
      };

      const response = await bookingApi.createBooking(bookingData);
      
      if (response.success) {
        setBookingSuccess(true);
        setModalVisible(true);
      } else {
        setBookingError(response.message || "Failed to create booking");
        Alert.alert("Booking Failed", response.message || "Failed to create booking");
      }
    } catch (error) {
      console.error("Booking error:", error);
      setBookingError("Network error. Please try again.");
      Alert.alert("Error", "Could not connect to the server. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const availableDates = ["Mar 15 - Mar 22", "Mar 25 - Apr 1", "Apr 5 - Apr 12", "Apr 15 - Apr 22"];
  const totalPrice = trip.price * travelers;

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
      >
        {/* We add a spacer view that is the height of the header to push content down */}
        <View style={{ marginTop: HEADER_MAX_HEIGHT }} />

        {/* Content */}
        <View style={styles.content}>
          <AnimatedSection delay={0}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✨ Trip Highlights</Text>
              <View style={styles.highlightsGrid}>
                {trip.highlights?.map((highlight: string, index: number) => (
                  <View key={index} style={styles.highlightCard}>
                    <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                    <Text style={styles.highlightText}>{highlight}</Text>
                  </View>
                ))}
              </View>
            </View>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📅 Sample Itinerary</Text>
              <View style={styles.itineraryCard}>
                <Text style={styles.itineraryText}>Day 1: Arrival and welcome dinner</Text>
                <Text style={styles.itineraryText}>Day 2: Guided city tour</Text>
                <Text style={styles.itineraryText}>Day 3: Free day for exploration</Text>
                <Text style={styles.itineraryText}>Day 4: Departure</Text>
              </View>
            </View>
          </AnimatedSection>
          
          <AnimatedSection delay={300}>
            <View style={styles.section}>
               <Text style={styles.sectionTitle}>📆 Select Travel Date</Text>
               <View style={styles.dateContainer}>
                 {availableDates.map((date, index) => (
                   <TouchableOpacity
                     key={index}
                     style={[
                       styles.dateOption,
                       selectedDate === date && styles.selectedDateOption
                     ]}
                     onPress={() => setSelectedDate(date)}
                   >
                     <Text style={[
                       styles.dateText,
                       selectedDate === date && styles.selectedDateText
                     ]}>
                       {date}
                     </Text>
                   </TouchableOpacity>
                 ))}
               </View>
            </View>
          </AnimatedSection>

          <AnimatedSection delay={400}>
            <View style={styles.section}>
               <Text style={styles.sectionTitle}>👥 Number of Travelers</Text>
               <View style={styles.travelersContainer}>
                 <TouchableOpacity
                   style={styles.travelerButton}
                   onPress={() => setTravelers(Math.max(1, travelers - 1))}
                 >
                   <Ionicons name="remove" size={24} color="#667eea" />
                 </TouchableOpacity>
                 <Text style={styles.travelerCount}>{travelers}</Text>
                 <TouchableOpacity
                   style={styles.travelerButton}
                   onPress={() => setTravelers(travelers + 1)}
                 >
                   <Ionicons name="add" size={24} color="#667eea" />
                 </TouchableOpacity>
               </View>
            </View>
          </AnimatedSection>

          <AnimatedSection delay={450}>
            <View style={styles.section}>
               <Text style={styles.sectionTitle}>🏷️ Trip Category</Text>
               <View style={styles.categoryContainer}>
                 {bookingCategories.map((category) => (
                   <TouchableOpacity
                     key={category}
                     style={[
                       styles.categoryOption,
                       selectedCategory === category && styles.selectedCategoryOption
                     ]}
                     onPress={() => setSelectedCategory(category)}
                   >
                     <Text style={[
                       styles.categoryText,
                       selectedCategory === category && styles.selectedCategoryText
                     ]}>
                       {category}
                     </Text>
                   </TouchableOpacity>
                 ))}
               </View>
            </View>
          </AnimatedSection>

          <AnimatedSection delay={500}>
            <View style={styles.section}>
               <Text style={styles.sectionTitle}>🏨 Accommodation</Text>
               <View style={styles.optionContainer}>
                 <Text style={styles.optionLabel}>Type:</Text>
                 <View style={styles.optionButtons}>
                   {accommodationTypes.map((type) => (
                     <TouchableOpacity
                       key={type}
                       style={[
                         styles.optionButton,
                         selectedAccommodation === type && styles.selectedOptionButton
                       ]}
                       onPress={() => setSelectedAccommodation(type)}
                     >
                       <Text style={[
                         styles.optionButtonText,
                         selectedAccommodation === type && styles.selectedOptionButtonText
                       ]}>
                         {type}
                       </Text>
                     </TouchableOpacity>
                   ))}
                 </View>
                 <Text style={styles.optionLabel}>Room:</Text>
                 <View style={styles.optionButtons}>
                   {roomTypes.map((type) => (
                     <TouchableOpacity
                       key={type}
                       style={[
                         styles.optionButton,
                         selectedRoomType === type && styles.selectedOptionButton
                       ]}
                       onPress={() => setSelectedRoomType(type)}
                     >
                       <Text style={[
                         styles.optionButtonText,
                         selectedRoomType === type && styles.selectedOptionButtonText
                       ]}>
                         {type}
                       </Text>
                     </TouchableOpacity>
                   ))}
                 </View>
               </View>
            </View>
          </AnimatedSection>

          <AnimatedSection delay={550}>
            <View style={styles.section}>
               <Text style={styles.sectionTitle}>🚗 Transportation</Text>
               <View style={styles.optionContainer}>
                 <View style={styles.optionButtons}>
                   {transportationTypes.map((type) => (
                     <TouchableOpacity
                       key={type}
                       style={[
                         styles.optionButton,
                         selectedTransportation === type && styles.selectedOptionButton
                       ]}
                       onPress={() => setSelectedTransportation(type)}
                     >
                       <Text style={[
                         styles.optionButtonText,
                         selectedTransportation === type && styles.selectedOptionButtonText
                       ]}>
                         {type}
                       </Text>
                     </TouchableOpacity>
                   ))}
                 </View>
               </View>
            </View>
          </AnimatedSection>

          <AnimatedSection delay={600}>
            <View style={styles.section}>
               <Text style={styles.sectionTitle}>🍽️ Meal Plan</Text>
               <View style={styles.optionContainer}>
                 <View style={styles.optionButtons}>
                   {mealPlans.map((plan) => (
                     <TouchableOpacity
                       key={plan}
                       style={[
                         styles.optionButton,
                         selectedMealPlan === plan && styles.selectedOptionButton
                       ]}
                       onPress={() => setSelectedMealPlan(plan)}
                     >
                       <Text style={[
                         styles.optionButtonText,
                         selectedMealPlan === plan && styles.selectedOptionButtonText
                       ]}>
                         {plan}
                       </Text>
                     </TouchableOpacity>
                   ))}
                 </View>
               </View>
            </View>
          </AnimatedSection>

          <AnimatedSection delay={650}>
             <View style={styles.totalSection}>
               <View style={styles.priceBreakdown}>
                 <View style={styles.priceRow}>
                   <Text style={styles.priceLabel}>Price per person:</Text>
                   <Text style={styles.priceValue}>${trip.price}</Text>
                 </View>
                 <View style={styles.priceRow}>
                   <Text style={styles.priceLabel}>Travelers:</Text>
                   <Text style={styles.priceValue}>{travelers}</Text>
                 </View>
                 <View style={[styles.priceRow, styles.totalRow]}>
                   <Text style={styles.totalLabel}>Total:</Text>
                   <Text style={styles.totalValue}>${totalPrice}</Text>
                 </View>
               </View>
             </View>
          </AnimatedSection>
          
          <AnimatedSection delay={700}>
            <TouchableOpacity 
              style={[styles.bookButton, isBooking && styles.bookButtonDisabled]} 
              onPress={handleBookTrip}
              disabled={isBooking}
            >
              <LinearGradient colors={["#FF6B35", "#F7931E"]} style={styles.bookGradient}>
                {isBooking ? (
                  <Text style={styles.bookButtonText}>Booking...</Text>
                ) : (
                  <>
                    <Text style={styles.bookButtonText}>Book This Trip</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </AnimatedSection>
        </View>
      </Animated.ScrollView>

      {/* --- Animated Header --- */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Animated.View style={[styles.parallaxContainer, {transform: [{ translateY: parallaxTranslate }]}]}>
            <LinearGradient colors={trip.gradient || ["#667eea", "#764ba2"]} style={styles.headerGradient} />
        </Animated.View>
        
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Animated.View style={[styles.headerContent, { opacity: headerContentOpacity, transform: [{ translateY: headerContentTranslate }] }]}>
          <Text style={styles.tripEmoji}>{trip.image}</Text>
          <Text style={styles.tripTitle}>{trip.title}</Text>
          <Text style={styles.tripDuration}>{trip.duration}</Text>
        </Animated.View>

        <Animated.View style={[styles.compactHeader, { opacity: compactHeaderOpacity }]}>
            <Text style={styles.compactTripTitle}>{trip.title}</Text>
        </Animated.View>
      </Animated.View>

      {/* --- Custom Booking Modal --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={80} color="#4ECDC4" />
            <Text style={styles.modalTitle}>Booking Confirmed!</Text>
            <Text style={styles.modalSubtitle}>Your trip to "{trip.title}" for {selectedDate} is all set.</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate("Trip" as never);
              }}
            >
              <Text style={styles.modalButtonText}>View My Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  parallaxContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 11,
  },
  headerContent: {
    alignItems: "center",
    paddingTop: 60,
  },
  compactHeader: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactTripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  tripEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  tripTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  tripDuration: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  content: {
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  highlightsGrid: {
    gap: 12,
  },
  highlightCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  highlightText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    fontWeight: "500",
  },
  itineraryCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itineraryText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: 10,
  },
  dateOption: {
    backgroundColor: "#E0E0E0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedDateOption: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  selectedDateText: {
    color: "white",
  },
  travelersContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  travelerButton: {
    padding: 10,
  },
  travelerCount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: 10,
  },
  categoryOption: {
    backgroundColor: "#E0E0E0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedCategoryOption: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  categoryText: {
    fontSize: 16,
    color: "#333",
  },
  selectedCategoryText: {
    color: "white",
  },
  optionContainer: {
    marginTop: 15,
  },
  optionLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  optionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: 10,
  },
  optionButton: {
    backgroundColor: "#E0E0E0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedOptionButton: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  optionButtonText: {
    fontSize: 16,
    color: "#333",
  },
  selectedOptionButtonText: {
    color: "white",
  },
  priceBreakdown: {
    marginTop: 15,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 16,
    color: "#666",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  totalSection: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bookButton: {
    marginBottom: 30,
  },
  bookButtonDisabled: {
    opacity: 0.7,
  },
  bookGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 12,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginRight: 10,
  },
  // --- Modal Styles ---
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 25,
    paddingBottom: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  modalButton: {
    width: '100%',
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
