"use client"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ImageBackground,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { bookingApi, genericItemApi } from "../../api"
import { COLORS } from "../../constants/colors"
import { useAuth } from "../../../App"

const { width } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.LIGHT_GRAY,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    marginRight: 8,
  },
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.PRIMARY,
    marginTop: 10,
  },
  bookedSection: {
    paddingHorizontal: 20,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 20,
  },
  bookedTripCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5.46,
    elevation: 8,
  },
  bookedTripImageBackground: {
    width: "100%",
    height: 200,
    justifyContent: "flex-end",
  },
  bookedTripImageStyle: {
    borderRadius: 20,
  },
  bookedTripGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
    borderRadius: 20,
  },
  statusBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  confirmedBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.9)",
  },
  pendingBadge: {
    backgroundColor: "rgba(255, 165, 0, 0.9)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.WHITE,
    marginLeft: 4,
  },
  bookedTripContent: {
    padding: 20,
  },
  bookedTripTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.WHITE,
    marginBottom: 5,
  },
  bookedTripDuration: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 5,
  },
  bookedTripDate: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 10,
  },
  bookedTripPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.WHITE,
  },
  bookedTripTravelers: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 5,
  },
  categoryBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  categoryText: {
    fontSize: 10,
    color: "white",
    fontWeight: "600",
  },
  categoryFilter: {
    marginBottom: 20,
  },
  categoryFilterContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  categoryFilterButtonActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  categoryFilterText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "500",
  },
  categoryFilterTextActive: {
    color: "white",
  },
  bookingStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "white",
    paddingVertical: 20,
    marginTop: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bookingStatItem: {
    alignItems: "center",
  },
  bookingStatNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
    marginBottom: 4,
  },
  bookingStatLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  exploreButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.WHITE,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 10,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
})

export default function BookingScreens() {
  const navigation = useNavigation()
  const { userId } = useAuth()
  const [bookingFilter, setBookingFilter] = useState("all")
  const [userBookings, setUserBookings] = useState<any[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [bookingStats, setBookingStats] = useState<any>(null)

  const bookingCategories = [
    { key: "all", label: "All", icon: "list" },
    { key: "upcoming", label: "Upcoming", icon: "calendar" },
    { key: "past", label: "Past", icon: "time" },
    { key: "Restaurant", label: "Restaurant", icon: "restaurant" },
    { key: "Activity", label: "Activity", icon: "bicycle" },
    { key: "Stay", label: "Stay", icon: "bed" },
    { key: "Rental", label: "Rental", icon: "car" },
  ]

  useEffect(() => {
    /**
     * Fetches user bookings based on the selected filter and enriches them with item details.
     */
    const fetchUserBookings = async () => {
      if (userId) {
        setLoadingBookings(true)
        try {
          const response = await bookingApi.getUserBookings(userId)
          if (response.success && response.data) {
            const fetchedBookings = response.data

            // Enrich bookings with specific item details
            const enrichedBookings = await Promise.all(
              fetchedBookings.map(async (booking: any) => {
                let itemDetails = null
                let itemTypePath = ""

                switch (booking.bookingType) {
                  case "Restaurant":
                    itemTypePath = "restaurants"
                    itemDetails = booking.restaurant
                    break
                  case "Activity":
                    itemTypePath = "activities"
                    itemDetails = booking.activity
                    break
                  case "Stay":
                    itemTypePath = "stays"
                    itemDetails = booking.stay
                    break
                  case "Rental":
                    itemTypePath = "rentals"
                    itemDetails = booking.rental
                    break
                  default:
                    return booking
                }

                if (itemDetails && itemTypePath) {
                  const itemResponse = await genericItemApi.getItemByIdAndType(itemTypePath, itemDetails)
                  if (itemResponse.success && itemResponse.data) {
                    return { ...booking, [`${booking.bookingType.toLowerCase()}Details`]: itemResponse.data }
                  } else {
                    console.warn(
                      `Failed to fetch details for ${booking.bookingType} ID ${itemDetails}:`,
                      itemResponse.message,
                    )
                  }
                }
                return booking
              }),
            )

            // Apply filter after enriching
            const filteredBookings = enrichedBookings.filter((booking: any) => {
              if (bookingFilter === "all") return true
              if (bookingFilter === "upcoming") {
                return new Date(booking.bookingDate) > new Date()
              }
              if (bookingFilter === "past") {
                return new Date(booking.bookingDate) <= new Date()
              }
              return booking.bookingType === bookingFilter
            })

            setUserBookings(filteredBookings)
          } else {
            console.error("Failed to fetch bookings:", response.message)
            setUserBookings([])
          }
        } catch (err: any) {
          console.error("Error fetching bookings:", err)
          setUserBookings([])
        } finally {
          setLoadingBookings(false)
        }
      }
    }

    const fetchBookingStats = async () => {
      if (userId) {
        try {
          const response = await bookingApi.getBookingStats()
          if (response.success && response.data) {
            setBookingStats(response.data)
          }
        } catch (err: any) {
          console.error("Error fetching booking stats:", err)
        }
      }
    }

    fetchUserBookings()
    fetchBookingStats()
  }, [userId, bookingFilter])

  /**
   * Navigates to the BookingDetailsScreen with the selected booking object.
   */
  const handleBookingCardPress = (booking: any) => {
    navigation.navigate("BookingDetails" as never, { booking } as never)
  }

  /**
   * Renders a single booked item card.
   */
  const renderBookedItem = (booking: any) => {
    const getCategoryIcon = (category: string) => {
      const categoryIcons: { [key: string]: string } = {
        Restaurant: "restaurant",
        Activity: "bicycle",
        Stay: "bed",
        Rental: "car",
      }
      return categoryIcons[category] || "bookmark"
    }

    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    }

    // Determine title and image based on bookingType and enriched details
    let cardTitle = "Booking"
    let cardImage = "https://source.unsplash.com/random/800x600?travel"
    let cardSubtitle = ""

    const itemDetails = booking[`${booking.bookingType.toLowerCase()}Details`]

    if (booking.bookingType === "Restaurant" && itemDetails) {
      cardTitle = itemDetails.name || "Restaurant Reservation"
      cardImage = itemDetails.images?.[0] || "https://source.unsplash.com/random/800x600?restaurant"
      cardSubtitle = `For ${booking.reservation.people} people`
    } else if (booking.bookingType === "Activity" && itemDetails) {
      cardTitle = itemDetails.name || "Activity Booking"
      cardImage = itemDetails.images?.[0] || "https://source.unsplash.com/random/800x600?activity"
      cardSubtitle = itemDetails.location
    } else if (booking.bookingType === "Stay" && itemDetails) {
      cardTitle = itemDetails.name || "Stay Booking"
      cardImage = itemDetails.images?.[0] || "https://source.unsplash.com/random/800x600?hotel"
      cardSubtitle = itemDetails.location
    } else if (booking.bookingType === "Rental" && itemDetails) {
      cardTitle = itemDetails.name || "Rental Booking"
      cardImage = itemDetails.images?.[0] || "https://source.unsplash.com/random/800x600?car"
      cardSubtitle = `${itemDetails.brand} ${itemDetails.model}`
    }

    return (
      <TouchableOpacity key={booking._id} style={styles.bookedTripCard} onPress={() => handleBookingCardPress(booking)}>
        <ImageBackground
          source={{ uri: cardImage }}
          style={styles.bookedTripImageBackground}
          imageStyle={styles.bookedTripImageStyle}
        >
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={styles.bookedTripGradient} />
          <View
            style={[styles.statusBadge, booking.status === "Confirmed" ? styles.confirmedBadge : styles.pendingBadge]}
          >
            <Ionicons name={booking.status === "Confirmed" ? "checkmark-circle" : "time"} size={14} color="white" />
            <Text style={styles.statusText}>{booking.status}</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Ionicons name={getCategoryIcon(booking.bookingType)} size={12} color="white" />
            <Text style={styles.categoryText}>{booking.bookingType}</Text>
          </View>
          <View style={styles.bookedTripContent}>
            <Text style={styles.bookedTripTitle}>{cardTitle}</Text>
            {cardSubtitle && <Text style={styles.bookedTripDuration}>{cardSubtitle}</Text>}
            <Text style={styles.bookedTripDate}>
              {booking.reservation?.date ? formatDate(booking.reservation.date) : formatDate(booking.bookingDate)}
            </Text>
            <Text style={styles.bookedTripPrice}>${booking.totalPrice}</Text>
            {booking.reservation?.people && (
              <Text style={styles.bookedTripTravelers}>{booking.reservation.people} people</Text>
            )}
          </View>
        </ImageBackground>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <View style={styles.bookedSection}>
          {/* Booking Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFilter}
            contentContainerStyle={styles.categoryFilterContent}
          >
            {bookingCategories.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryFilterButton,
                  bookingFilter === category.key && styles.categoryFilterButtonActive,
                ]}
                onPress={() => setBookingFilter(category.key)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={bookingFilter === category.key ? "white" : COLORS.TEXT_SECONDARY}
                />
                <Text
                  style={[styles.categoryFilterText, bookingFilter === category.key && styles.categoryFilterTextActive]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loadingBookings ? (
            <View style={styles.loadingState}>
              <Ionicons name="sync-circle-outline" size={48} color={COLORS.PRIMARY} />
              <Text style={styles.loadingText}>Loading your bookings...</Text>
            </View>
          ) : userBookings.length > 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="calendar-outline" size={24} color={COLORS.PRIMARY} style={styles.sectionIcon} />
                  {bookingFilter === "all"
                    ? "Your Bookings"
                    : bookingFilter === "upcoming"
                      ? "Upcoming Bookings"
                      : bookingFilter === "past"
                        ? "Past Bookings"
                        : `${bookingFilter} Bookings`}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {userBookings.length} booking{userBookings.length !== 1 ? "s" : ""}
                </Text>
              </View>

              {userBookings.map((booking) => renderBookedItem(booking))}

              {/* Booking Statistics */}
              {bookingStats && (
                <View style={styles.bookingStatsContainer}>
                  <View style={styles.bookingStatItem}>
                    <Text style={styles.bookingStatNumber}>{bookingStats.overview?.totalBookings || 0}</Text>
                    <Text style={styles.bookingStatLabel}>Total Bookings</Text>
                  </View>
                  <View style={styles.bookingStatItem}>
                    <Text style={styles.bookingStatNumber}>${bookingStats.overview?.totalSpent || 0}</Text>
                    <Text style={styles.bookingStatLabel}>Total Spent</Text>
                  </View>
                  <View style={styles.bookingStatItem}>
                    <Text style={styles.bookingStatNumber}>{bookingStats.overview?.confirmedBookings || 0}</Text>
                    <Text style={styles.bookingStatLabel}>Confirmed</Text>
                  </View>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateTitle}>
                {bookingFilter === "all"
                  ? "No Bookings Yet"
                  : bookingFilter === "upcoming"
                    ? "No Upcoming Bookings"
                    : bookingFilter === "past"
                      ? "No Past Bookings"
                      : `No ${bookingFilter} Bookings`}
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                {bookingFilter === "all"
                  ? "Start exploring and make your first booking!"
                  : bookingFilter === "upcoming"
                    ? "Make a booking to see it here!"
                    : bookingFilter === "past"
                      ? "Complete a booking to see it here!"
                      : `Make a ${bookingFilter.toLowerCase()} booking to see it here!`}
              </Text>
              <TouchableOpacity style={styles.exploreButton} onPress={() => navigation.navigate("Home" as never)}>
                <Text style={styles.exploreButtonText}>Start Exploring</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
