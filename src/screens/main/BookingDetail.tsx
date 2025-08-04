"use client"
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRoute, useNavigation } from "@react-navigation/native"
import { COLORS } from "../../constants/colors"
import RatingAndReviewForm from "../../components/RatingAndReviewForm"

import { reviewApi } from "../../api"
import { useState, useEffect } from "react"
import { useAuth } from "../../../App"

export default function BookingDetailsScreen() {
  const route = useRoute()
  const navigation = useNavigation()
  const { userId } = useAuth()
  const { booking } = route.params as { booking: any }
  const itemDetails = booking[`${booking.bookingType.toLowerCase()}Details`] || null

  // Get the appropriate itemId based on booking type
  const getItemId = () => {
    switch (booking.bookingType?.toLowerCase()) {
      case "restaurant":
        return booking.restaurant || booking._id
      case "activity":
        return booking.activity || booking._id
      case "trip":
        return booking.trip || booking._id
      case "rental":
        return booking.rental || booking._id
      case "hotel":
        return booking.hotel || booking._id
      default:
        return booking._id
    }
  }

  const [userReview, setUserReview] = useState<any>(null)
  const [loadingReview, setLoadingReview] = useState(true)

  const fetchUserReview = async () => {
    setLoadingReview(true)
    try {
      const res = await reviewApi.getReviewsForItem({
        itemType: booking.bookingType.toLowerCase(),
        itemId: getItemId(),
        userId:userId
      })
      if (res.success && Array.isArray(res.reviews)) {
        const found = res.reviews.find((r: any) => r.user._id === userId)
        setUserReview(found || null)
      } else {
        setUserReview(null)
      }
    } catch (err) {
      setUserReview(null)
    } finally {
      setLoadingReview(false)
    }
  }

  useEffect(() => {
    fetchUserReview()
    // eslint-disable-next-line
  }, [booking._id, userId])

  const handleReviewCreated = () => {
    fetchUserReview()
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return "N/A"
    return timeString
  }

  const handleGoBack = () => {
    navigation.goBack()
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={true} bounces={true}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Information</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Booking ID:</Text>
              <Text style={styles.detailValue}>{booking._id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Booking Type:</Text>
              <Text style={styles.detailValue}>{booking.bookingType}</Text>
            </View>
            {booking.bookingType === "Restaurant" && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Restaurant:</Text>
                <Text style={styles.detailValue}>{itemDetails ? itemDetails.name : "N/A"}</Text>
              </View>
            )}
            {booking.bookingType === "Activity" && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Activity:</Text>
                <Text style={styles.detailValue}>{itemDetails ? itemDetails.name : "N/A"}</Text>
              </View>
            )}
            {booking.bookingType === "Trip" && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Trip:</Text>
                <Text style={styles.detailValue}>{itemDetails ? itemDetails.title : "N/A"}</Text>
              </View>
            )}
            {booking.bookingType === "Rental" && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Rental:</Text>
                <Text style={styles.detailValue}>{itemDetails ? itemDetails.name : "N/A"}</Text>
              </View>
            )}
            {booking.bookingType === "Hotel" && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Hotel:</Text>
                <Text style={styles.detailValue}>{itemDetails ? itemDetails.name : "N/A"}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text
                style={[
                  styles.detailValue,
                  booking.status === "Pending" ? styles.pendingStatus : styles.confirmedStatus,
                ]}
              >
                {booking.status}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Price:</Text>
              <Text style={styles.detailValue}>${booking.totalPrice?.toFixed(2) || "0.00"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Booking Date:</Text>
              <Text style={styles.detailValue}>{formatDate(booking.bookingDate)}</Text>
            </View>
          </View>
          {/* {booking.reservation && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Reservation Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>{formatDate(booking.reservation.date)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time:</Text>
                <Text style={styles.detailValue}>{formatTime(booking.reservation.time)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>People:</Text>
                <Text style={styles.detailValue}>{booking.reservation.people}</Text>
              </View>
            </View>
          )} */}
          {/* {booking.paymentDetails && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Payment Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Method:</Text>
                <Text style={styles.detailValue}>{booking.paymentDetails.paymentMethod}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Transaction ID:</Text>
                <Text style={styles.detailValue}>{booking.paymentDetails.transactionId}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Status:</Text>
                <Text
                  style={[
                    styles.detailValue,
                    booking.paymentDetails.paymentStatus === "Paid" ? styles.paidStatus : styles.unpaidStatus,
                  ]}
                >
                  {booking.paymentDetails.paymentStatus}
                </Text>
              </View>
            </View>
          )} */}
          {booking.rentalDetails && booking.rentalDetails.extras && booking.rentalDetails.extras.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Rental Extras</Text>
              {booking.rentalDetails.extras.map((extra: any, index: number) => (
                <Text key={index} style={styles.detailValue}>
                  • {extra}
                </Text>
              ))}
            </View>
          )}
          {booking.activities && booking.activities.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Activities</Text>
              {booking.activities.map((activity: any, index: number) => (
                <Text key={index} style={styles.detailValue}>
                  • {activity.name}
                </Text>
              ))}
            </View>
          )}
          <View style={styles.reviewSection}>
            <Text style={styles.reviewSectionTitle}>Leave a Rating & Review</Text>
            {loadingReview ? (
              <Text>Loading your review...</Text>
            ) : userReview ? (
              <View style={{ marginTop: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= userReview.rating ? "star" : "star-outline"}
                      size={18}
                      color={star <= userReview.rating ? COLORS.PRIMARY : COLORS.GRAY}
                    />
                  ))}
                  <Text style={{ marginLeft: 8, fontWeight: "bold" }}>{userReview.rating}/5</Text>
                </View>
                <Text style={{ color: COLORS.TEXT_PRIMARY, fontSize: 15 }}>{userReview.comment}</Text>
                <Text style={{ color: COLORS.TEXT_SECONDARY, fontSize: 12, marginTop: 4 }}>
                  {new Date(userReview.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ) : (
              <RatingAndReviewForm itemId={getItemId()} itemType={booking.bookingType} onReviewCreated={handleReviewCreated} />
            )}
          </View>
        </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: COLORS.WHITE,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
  },
  scrollView: {
    flex: 1, // Explicitly make the ScrollView take up available space
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Increased padding for review form
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
    paddingBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "flex-start", // Better alignment for long text
  },
  detailLabel: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "500",
    flex: 1, // Take available space
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: "400",
    flex: 1, // Take available space
    textAlign: "right",
    marginLeft: 10, // Add some spacing
  },
  pendingStatus: {
    color: COLORS.ORANGE,
    fontWeight: "bold",
  },
  confirmedStatus: {
    color: COLORS.GREEN,
    fontWeight: "bold",
  },
  paidStatus: {
    color: COLORS.GREEN,
    fontWeight: "bold",
  },
  unpaidStatus: {
    color: COLORS.RED,
    fontWeight: "bold",
  },
  reviewSection: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  reviewSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
    paddingBottom: 10,
  },
})
