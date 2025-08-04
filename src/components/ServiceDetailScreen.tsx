"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
} from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../App"
import BookingForm from "./BookingForm"

// API endpoints for different services
const API_ENDPOINTS = {
  restaurants: "http://localhost:5000/api/restaurants",
  stays: "http://localhost:5000/api/stays",
  activities: "http://localhost:5000/api/activities",
  rentals: "http://localhost:5000/api/rentals",
}

const BOOKING_API_URL = "http://localhost:5000/api/bookings"
const REVIEWS_API_URL = "http://localhost:5000/api/review"

// Booking Confirmation Modal Component
const BookingConfirmationModal = ({ 
  visible, 
  onClose, 
  bookingDetails, 
  serviceType 
}: {
  visible: boolean
  onClose: () => void
  bookingDetails: any
  serviceType: string
}) => (
  <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
    <View style={modalStyles.centeredView}>
      <View style={modalStyles.modalView}>
        <Ionicons name="checkmark-circle-outline" size={80} color="#4CAF50" style={modalStyles.icon} />
        <Text style={modalStyles.modalTitle}>Booking Confirmed!</Text>
        {bookingDetails && (
          <>
            <Text style={modalStyles.modalText}>
              <Text style={modalStyles.boldText}>
                {serviceType === "restaurants"
                  ? "Restaurant"
                  : serviceType === "stays"
                    ? "Stay"
                    : serviceType === "activities"
                      ? "Activity"
                      : "Rental"}
                :
              </Text>{" "}
              {bookingDetails.serviceName}
            </Text>
            <Text style={modalStyles.modalText}>
              <Text style={modalStyles.boldText}>Date:</Text> {bookingDetails.date}
            </Text>
            {bookingDetails.time && (
              <Text style={modalStyles.modalText}>
                <Text style={modalStyles.boldText}>Time:</Text> {bookingDetails.time}
              </Text>
            )}
            {bookingDetails.people && (
              <Text style={modalStyles.modalText}>
                <Text style={modalStyles.boldText}>{serviceType === "restaurants" ? "People" : "Guests"}:</Text>{" "}
                {bookingDetails.people}
              </Text>
            )}
            {bookingDetails.duration && (
              <Text style={modalStyles.modalText}>
                <Text style={modalStyles.boldText}>Duration:</Text> {bookingDetails.duration}
              </Text>
            )}
            {bookingDetails.transactionId && (
              <Text style={modalStyles.modalText}>
                <Text style={modalStyles.boldText}>Transaction ID:</Text> {bookingDetails.transactionId}
              </Text>
            )}
          </>
        )}
        <TouchableOpacity style={modalStyles.button} onPress={onClose}>
          <Text style={modalStyles.buttonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
)

// Reviews Modal Component
const ReviewsModal = ({ 
  visible, 
  onClose, 
  reviews, 
  loading, 
  serviceName 
}: {
  visible: boolean
  onClose: () => void
  reviews: any[]
  loading: boolean
  serviceName: string
}) => {
  const renderReview = ({ item }: { item: any }) => (
    <View style={reviewModalStyles.reviewItem}>
      <View style={reviewModalStyles.reviewHeader}>
        <View style={reviewModalStyles.userInfo}>
          <Ionicons name="person-circle-outline" size={24} color="#666" />
          <Text style={reviewModalStyles.userName}>
            {item.user?.firstName || 'Anonymous'} {item.user?.lastName || ''}
          </Text>
        </View>
        <View style={reviewModalStyles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= item.rating ? "star" : "star-outline"}
              size={16}
              color={star <= item.rating ? "#FFD700" : "#ccc"}
            />
          ))}
          <Text style={reviewModalStyles.ratingText}>{item.rating}/5</Text>
        </View>
      </View>
      {item.comment && (
        <Text style={reviewModalStyles.comment}>{item.comment}</Text>
      )}
      <Text style={reviewModalStyles.date}>
        {new Date(item.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Text>
    </View>
  )

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={reviewModalStyles.centeredView}>
        <View style={reviewModalStyles.modalView}>
          <View style={reviewModalStyles.modalHeader}>
            <Text style={reviewModalStyles.modalTitle}>Reviews for {serviceName}</Text>
            <TouchableOpacity onPress={onClose} style={reviewModalStyles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={reviewModalStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={reviewModalStyles.loadingText}>Loading reviews...</Text>
            </View>
          ) : reviews && reviews.length > 0 ? (
            <FlatList
              data={reviews}
              renderItem={renderReview}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={reviewModalStyles.reviewsList}
            />
          ) : (
            <View style={reviewModalStyles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
              <Text style={reviewModalStyles.emptyText}>No reviews yet</Text>
              <Text style={reviewModalStyles.emptySubtext}>Be the first to review this service!</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

interface ServiceDetailScreenProps {
  serviceType: "restaurants" | "stays" | "activities" | "rentals"
}

const ServiceDetailScreen = ({ serviceType }: ServiceDetailScreenProps) => {
  const route = useRoute()
  const navigation = useNavigation()
  const { userId } = useAuth()

  // Get the correct ID parameter based on service type
  const getServiceId = () => {
    const params = route.params as any
    return params.restaurantId || params.stayId || params.activityId || params.rentalId
  }

  const serviceId = getServiceId()
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const [showReviewsModal, setShowReviewsModal] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_ENDPOINTS[serviceType]}/${serviceId}`)
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.message || `Failed to fetch ${serviceType} details (Status: ${res.status})`)
        }
        const data = await res.json()
        setService(data)
      } catch (err: any) {
        Alert.alert("Error", err.message || "Network error")
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [serviceId, serviceType])

  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true)
      try {
        // Use the correct endpoint format: /api/review/item/:itemType/:itemId
        const itemType = serviceType.slice(0, -1) // Remove 's' from end (restaurants -> restaurant)
        const res = await fetch(`${REVIEWS_API_URL}/item/${itemType}/${serviceId}`)
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.message || `Failed to fetch reviews (Status: ${res.status})`)
        }
        const data = await res.json()
        console.log("Reviews API response:", data)
        
        // Handle the API response structure properly
        if (data.success && data.reviews) {
          setReviews(data.reviews)
        } else if (Array.isArray(data)) {
          // In case API returns reviews array directly
          setReviews(data)
        } else {
          setReviews([])
        }
      } catch (err: any) {
        console.error("Error fetching reviews:", err)
        setReviews([]) // Set empty array on error
      } finally {
        setReviewsLoading(false)
      }
    }
    
    if (serviceId) {
      fetchReviews()
    }
  }, [serviceId, serviceType])

  const handleBooking = async (bookingFormData: any) => {
    if (!userId) {
      Alert.alert("Authentication Required", "You must be logged in to make a booking.")
      return
    }

    // Basic validation for required fields based on service type
    if (
      !bookingFormData.date ||
      (serviceType === "restaurants" &&
        (!bookingFormData.time || !bookingFormData.people || bookingFormData.people < 1)) ||
      (serviceType === "stays" && !bookingFormData.guests) ||
      (serviceType === "activities" && !bookingFormData.participants) ||
      (serviceType === "rentals" && !bookingFormData.duration)
    ) {
      Alert.alert("Validation Error", "Please fill all required fields for your booking.")
      return
    }

    setBookingLoading(true)
    try {
      // Construct the booking payload for the /api/bookings endpoint
      const bookingPayload: any = {
        user: userId,
        bookingType: serviceType.charAt(0).toUpperCase() + serviceType.slice(1, -1), // e.g., "Restaurant", "Stay"
        totalPrice: service.price || 0, // Use service's price, or 0 if not defined
        paymentDetails: {
          paymentMethod: "Credit Card", // Hardcoded for now, can be dynamic
          paymentStatus: "Paid", // Assuming immediate payment for simplicity
          transactionId: `TRX-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Mock transaction ID
        },
        // Link the specific service ID
        [serviceType.slice(0, -1)]: serviceId, // e.g., { restaurant: serviceId }
      }

      // Add service-specific details from bookingFormData
      if (serviceType === "restaurants") {
        bookingPayload.reservation = {
          date: bookingFormData.date,
          time: bookingFormData.time,
          people: bookingFormData.people,
        }
      } else if (serviceType === "stays") {
        bookingPayload.stayDetails = {
          checkIn: bookingFormData.date,
          checkOut: bookingFormData.endDate,
          guests: bookingFormData.guests,
          roomType: bookingFormData.roomType,
        }
        bookingPayload.totalPrice = (bookingFormData.guests || 1) * (service.pricing?.perNight || service.price || 0)
      } else if (serviceType === "activities") {
        bookingPayload.activityDetails = {
          date: bookingFormData.date,
          participants: bookingFormData.participants,
        }
        bookingPayload.totalPrice = (bookingFormData.participants || 1) * (service.cost || service.price || 0)
      } else if (serviceType === "rentals") {
        bookingPayload.rentalDetails = {
          from: bookingFormData.date,
          to: bookingFormData.endDate,
          duration: bookingFormData.duration,
        }
        const durationInDays =
          (new Date(bookingFormData.endDate).getTime() - new Date(bookingFormData.date).getTime()) /
          (1000 * 60 * 60 * 24)
        bookingPayload.totalPrice =
          (durationInDays > 0 ? durationInDays : 1) * (service.pricing?.perDay || service.price || 0)
      }

      const bookRes = await fetch(BOOKING_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      })

      // Check for non-2xx responses
      if (!bookRes.ok) {
        const errorData = await bookRes.json()
        throw new Error(errorData.message || `Booking failed (Status: ${bookRes.status})`)
      }

      const bookData = await bookRes.json()

      // Show confirmation modal
      setBookingDetails({
        serviceName: service.name,
        date: bookingFormData.date,
        time: bookingFormData.time,
        people: bookingFormData.people || bookingFormData.guests || bookingFormData.participants,
        duration: bookingFormData.duration,
        transactionId: bookingPayload.paymentDetails.transactionId,
      })
      setShowConfirmationModal(true)
    } catch (err: any) {
      Alert.alert("Booking Error", err.message || "Booking failed. Please try again.")
    } finally {
      setBookingLoading(false)
    }
  }

  const handleModalClose = () => {
    setShowConfirmationModal(false)
    setBookingDetails(null)
    navigation.goBack()
  }

  const handleReviewsModalClose = () => {
    setShowReviewsModal(false)
  }

  const renderServiceSpecificContent = () => {
    if (!service) return null

    switch (serviceType) {
      case "restaurants":
        return (
          <>
            <Text style={styles.cuisines}>{service.cuisines?.join(", ")}</Text>
            <Text style={styles.sectionTitle}>Menu</Text>
            {service.menu?.length ? (
              service.menu.map((item: any, idx: number) => (
                <Text key={idx} style={styles.menuItem}>
                  {item.name} - ₹{item.price}
                </Text>
              ))
            ) : (
              <Text style={styles.menuItem}>No menu available.</Text>
            )}
          </>
        )
      case "stays":
        return (
          <>
            <Text style={styles.serviceType}>{service.type}</Text>
            <Text style={styles.price}>₹{service.pricing?.perNight || service.price} per night</Text>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <Text style={styles.amenities}>{service.amenities?.join(", ") || "No amenities listed"}</Text>
          </>
        )
      case "activities":
        return (
          <>
            <Text style={styles.serviceType}>{service.type}</Text>
            <Text style={styles.price}>₹{service.cost || service.price} per person</Text>
            <Text style={styles.duration}>Difficulty: {service.difficulty}</Text>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{service.description || "No description available"}</Text>
          </>
        )
      case "rentals":
        return (
          <>
            <Text style={styles.serviceType}>{service.type}</Text>
            <Text style={styles.price}>₹{service.pricing?.perDay || service.price} per day</Text>
            <Text style={styles.sectionTitle}>Features</Text>
            <Text style={styles.features}>{service.features?.join(", ") || "No features listed"}</Text>
          </>
        )
      default:
        return null
    }
  }

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />
  if (!service) return <Text style={{ textAlign: "center", marginTop: 40 }}>{serviceType} not found.</Text>

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image
          source={{
            uri: service.images?.[0] || service.image || `https://source.unsplash.com/random/400x300?${serviceType}`,
          }}
          style={styles.image}
        />
        <Text style={styles.name}>{service.name}</Text>
        <Text style={styles.location}>{service.location}</Text>

        {/* Rating Display */}
        {reviews.length > 0 && (
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(Number(averageRating)) ? "star" : "star-outline"}
                  size={20}
                  color={star <= Math.round(Number(averageRating)) ? "#FFD700" : "#ccc"}
                />
              ))}
            </View>
            <Text style={styles.ratingText}>
              {averageRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </Text>
          </View>
        )}

        {renderServiceSpecificContent()}

        <Text style={styles.sectionTitle}>
          {serviceType === "restaurants"
            ? "Book a Table"
            : serviceType === "stays"
              ? "Book Your Stay"
              : serviceType === "activities"
                ? "Book Activity"
                : "Rent Vehicle"}
        </Text>
        <TouchableOpacity
          style={styles.reviewsButton}
          onPress={() => setShowReviewsModal(true)}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#4CAF50" />
          <Text style={styles.reviewsButtonText}>
            Read Reviews {reviews.length > 0 && `(${reviews.length})`}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
        </TouchableOpacity>
        <BookingForm onSubmit={handleBooking} loading={bookingLoading} serviceType={serviceType} />
      </ScrollView>

      <BookingConfirmationModal
        visible={showConfirmationModal}
        onClose={handleModalClose}
        bookingDetails={bookingDetails}
        serviceType={serviceType}
      />

      <ReviewsModal
        visible={showReviewsModal}
        onClose={handleReviewsModalClose}
        reviews={reviews}
        loading={reviewsLoading}
        serviceName={service.name}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  image: { width: "100%", height: 200, borderRadius: 12, marginTop: 10 },
  name: { fontSize: 24, fontWeight: "bold", margin: 16 },
  cuisines: { fontSize: 14, color: "#888", marginHorizontal: 16 },
  serviceType: { fontSize: 14, color: "#888", marginHorizontal: 16 },
  location: { fontSize: 14, color: "#888", marginHorizontal: 16, marginBottom: 10 },
  price: { fontSize: 18, fontWeight: "600", color: "#4CAF50", marginHorizontal: 16, marginBottom: 10 },
  duration: { fontSize: 14, color: "#666", marginHorizontal: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", margin: 16, marginBottom: 6 },
  menuItem: { fontSize: 14, marginHorizontal: 20, marginBottom: 2 },
  amenities: { fontSize: 14, marginHorizontal: 20, marginBottom: 10 },
  description: { fontSize: 14, marginHorizontal: 20, marginBottom: 10 },
  features: { fontSize: 14, marginHorizontal: 20, marginBottom: 10 },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  reviewsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  reviewsButtonText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
})

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
    maxWidth: 400,
  },
  icon: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  modalText: {
    marginBottom: 8,
    fontSize: 16,
    textAlign: "center",
    color: "#555",
  },
  boldText: {
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    marginTop: 20,
    width: "70%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})

const reviewModalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
    maxWidth: 500,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  reviewItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFD700",
  },
  comment: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  reviewsList: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
    minHeight: 200,
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },
})

export default ServiceDetailScreen