"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  Alert,
  ImageBackground,
  ActivityIndicator,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

import { useNavigation } from "@react-navigation/native"
import { COLORS } from "../../constants/colors"
import PlaceCard from "../../components/PlaceCard"
import { tripApi } from "../../api"

const { width } = Dimensions.get("window")

// --- Categories Data (Static) ---
const CATEGORIES = [
  { id: 1, name: "Beaches", icon: "water-outline" },
  { id: 2, name: "Mountains", icon: "triangle-outline" },
  { id: 3, name: "Heritage", icon: "library-outline" },
  { id: 4, name: "Food", icon: "restaurant-outline" }, // This can remain for general food experiences
  { id: 5, name: "Adventure", icon: "bicycle-outline" },
  { id: 6, name: "Wildlife", icon: "leaf-outline" },
  // Removed: { id: 100, name: "Restaurants", icon: "restaurant" }, as it's now destination-specific
]

// --- Reusable Components ---
const Section = ({ title, children, onSeeAll, iconName }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {iconName && <Ionicons name={iconName} size={24} color={COLORS.PRIMARY} style={styles.sectionIcon} />}
        {title}
      </Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      )}
    </View>
    {children}
  </View>
)

const CircularPlaceItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.circularPlaceItemContainer} onPress={() => onPress(item)}>
    <View style={styles.circularPlaceImageWrapper}>
      <Image
        source={{ uri: item.image || "https://source.unsplash.com/random/400x400?travel" }}
        style={styles.circularPlaceImage}
      />
    </View>
    <Text style={styles.circularPlaceName} numberOfLines={1}>
      {item.title}
    </Text>
    {item.location && (
      <Text style={styles.circularPlaceLocation} numberOfLines={1}>
        {item.location}
      </Text>
    )}
  </TouchableOpacity>
)

const DestinationCard = ({ item, onPress }) => {
  // Debug: Log the item to see what data we're getting
  console.log("DestinationCard item:", item)

  // Handle different image types (emoji vs URL)
  const imageSource =
    item.image && item.image.startsWith("http")
      ? { uri: item.image }
      : {
          uri: `https://source.unsplash.com/random/800x600?${item.title?.toLowerCase().replace(/\s+/g, ",") || "travel"}`,
        }

  return (
    <TouchableOpacity style={styles.destinationCard} onPress={() => onPress(item)}>
      <ImageBackground
        source={imageSource}
        style={styles.destinationCardImageBackground}
        imageStyle={styles.destinationCardImageStyle}
      >
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.destinationCardGradient} />
        <View style={styles.destinationCardContent}>
          <Text style={styles.destinationCardText}>{item.title}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  )
}

const CircularCategoryCard = ({ category, onPress }) => (
  <TouchableOpacity style={styles.categoryCard} onPress={() => onPress(category)}>
    <Ionicons name={category.icon} size={36} color={COLORS.PRIMARY} />
    <Text style={styles.categoryName}>{category.name}</Text>
  </TouchableOpacity>
)

// --- Main Screen Component ---
export default function ExploreScreen() {
  const navigation = useNavigation()
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Data states
  const [topDestinations, setTopDestinations] = useState([])
  const [trendingNow, setTrendingNow] = useState([])
  const [weekendEscapes, setWeekendEscapes] = useState([])
  const [budgetFriendly, setBudgetFriendly] = useState([])
  const [featuredExperiences, setFeaturedExperiences] = useState([])
  const [offbeatEscapes, setOffbeatEscapes] = useState([])
  const [partyEscapes, setPartyEscapes] = useState([])
  const [popularQuickTrips, setPopularQuickTrips] = useState([])

  useEffect(() => {
    fetchExploreData()
  }, [])

  const fetchExploreData = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("Starting to fetch explore data...")

      const [
        topDestinationsRes,
        trendingRes,
        weekendEscapesRes,
        budgetFriendlyRes,
        featuredExperiencesRes,
        offbeatEscapesRes,
        partyEscapesRes,
        popularQuickRes,
      ] = await Promise.all([
        tripApi.getTopDestinations(),
        tripApi.getTrendingTrips(),
        tripApi.getWeekendEscapes(),
        tripApi.getBudgetFriendly(),
        tripApi.getFeaturedExperiences(),
        tripApi.getOffbeatEscapes(),
        tripApi.getPartyEscapes(),
        tripApi.getPopularQuickTrips(),
      ])

      console.log("All API calls completed. Processing responses...")

      // Set data if successful, otherwise set empty array
      setTopDestinations(topDestinationsRes.success && topDestinationsRes.data ? topDestinationsRes.data: [])
      setTrendingNow(trendingRes.success && trendingRes.data ? trendingRes.data.data : [])
      setWeekendEscapes(weekendEscapesRes.success && weekendEscapesRes.data ? weekendEscapesRes.data.data : [])
      setBudgetFriendly(budgetFriendlyRes.success && budgetFriendlyRes.data ? budgetFriendlyRes.data.data : [])
      setFeaturedExperiences(
        featuredExperiencesRes.success && featuredExperiencesRes.data ? featuredExperiencesRes.data.data : [],
      )
      setOffbeatEscapes(offbeatEscapesRes.success && offbeatEscapesRes.data ? offbeatEscapesRes.data.data : [])
      setPartyEscapes(partyEscapesRes.success && partyEscapesRes.data ? partyEscapesRes.data.data : [])
      setPopularQuickTrips(popularQuickRes.success && popularQuickRes.data ? popularQuickRes.data.data : [])

      // Debug: Log the data we're setting
      console.log("Top Destinations Response:", topDestinationsRes)
      console.log("Trending Response:", trendingRes)
      console.log("Weekend Escapes Response:", weekendEscapesRes)
      console.log("Budget Friendly Response:", budgetFriendlyRes)
      console.log("Featured Experiences Response:", featuredExperiencesRes)
      console.log("Offbeat Escapes Response:", offbeatEscapesRes)
      console.log("Party Escapes Response:", partyEscapesRes)
      console.log("Popular Quick Response:", popularQuickRes)

      console.log(
        "Top Destinations:",
        topDestinationsRes.success && topDestinationsRes.data.data ? topDestinationsRes.data.length : 0,
        "items",
      )
      console.log("Trending Now:", trendingRes.success && trendingRes.data ? trendingRes.data.length : 0, "items")
      console.log(
        "Weekend Escapes:",
        weekendEscapesRes.success && weekendEscapesRes.data ? weekendEscapesRes.data.length : 0,
        "items",
      )
      console.log(
        "Budget Friendly:",
        budgetFriendlyRes.success && budgetFriendlyRes.data ? budgetFriendlyRes.data.length : 0,
        "items",
      )
      console.log(
        "Featured Experiences:",
        featuredExperiencesRes.success && featuredExperiencesRes.data ? featuredExperiencesRes.data.length : 0,
        "items",
      )
      console.log(
        "Offbeat Escapes:",
        offbeatEscapesRes.success && offbeatEscapesRes.data ? offbeatEscapesRes.data.length : 0,
        "items",
      )
      console.log(
        "Party Escapes:",
        partyEscapesRes.success && partyEscapesRes.data ? partyEscapesRes.data.length : 0,
        "items",
      )
      console.log(
        "Popular Quick Trips:",
        popularQuickRes.success && popularQuickRes.data ? popularQuickRes.data.length : 0,
        "items",
      )

      // Log any failed responses for debugging
      if (!topDestinationsRes.success) console.log("Top destinations failed:", topDestinationsRes.message)
      if (!trendingRes.success) console.log("Trending failed:", trendingRes.message)
      if (!weekendEscapesRes.success) console.log("Weekend escapes failed:", weekendEscapesRes.message)
      if (!budgetFriendlyRes.success) console.log("Budget friendly failed:", budgetFriendlyRes.message)
      if (!featuredExperiencesRes.success) console.log("Featured experiences failed:", featuredExperiencesRes.message)
      if (!offbeatEscapesRes.success) console.log("Offbeat escapes failed:", offbeatEscapesRes.message)
      if (!partyEscapesRes.success) console.log("Party escapes failed:", partyEscapesRes.message)
      if (!popularQuickRes.success) console.log("Popular quick failed:", popularQuickRes.message)
    } catch (err) {
      console.error("Error fetching explore data:", err)
      setError("Failed to load explore data. Please try again.")
      // Ensure all arrays are empty on error
      setTopDestinations([])
      setTrendingNow([])
      setWeekendEscapes([])
      setBudgetFriendly([])
      setFeaturedExperiences([])
      setOffbeatEscapes([])
      setPartyEscapes([])
      setPopularQuickTrips([])
    } finally {
      setLoading(false)
    }
  }

  const handleSeeAll = (sectionName) => {
    Alert.alert(`See All ${sectionName}`)
    // In a real app, you would navigate to a list screen for this section
    // navigation.navigate('ListScreen', { section: sectionName });
  }

  const handleItemPress = (item) => {
    // If it's a top destination, navigate to DestinationDetailScreen
    // Otherwise, navigate to TripDetails (for other trip types)
    if (topDestinations.some((dest) => dest._id === item._id)) {
      navigation.navigate("DestinationDetail" as never, { destination: item } as never)
    } else {
      navigation.navigate("TripDetails" as never, { trip: item } as never)
    }
  }

  const handleCategoryPress = (category) => {
    // The 'Restaurants' category is now handled via DestinationDetailScreen
    // So, this part remains for other general categories
    navigation.navigate("Category" as never, { category: category.name } as never)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      const response = await tripApi.searchTrips(searchQuery)
      if (response.success) {
        // Navigate to search results or show in modal
        Alert.alert("Search Results", `Found ${response.data.length} trips for "${searchQuery}"`)
      }
    } catch (err) {
      console.error("Search error:", err)
      Alert.alert("Search Error", "Failed to search trips. Please try again.")
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading amazing destinations...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchExploreData}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollViewContent, { flexGrow: 1 }]}>
        {/* --- Header --- */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi, Explorer! 👋</Text>
            <Text style={styles.location}>Find your next adventure</Text>
          </View>
          <Image source={{ uri: "https://i.pravatar.cc/150?u=a042581f4e29026704d" }} style={styles.profileImage} />
        </View>

        {/* --- Search --- */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={22} color={COLORS.GRAY} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search destinations, hotels..."
              placeholderTextColor={COLORS.GRAY}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options-outline" size={22} color={COLORS.PRIMARY} />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- Top Destinations Carousel (Rectangular) --- */}
        <Section title="Top Destinations">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {Array.isArray(topDestinations) && topDestinations.length > 0 ? (
              topDestinations.map((item) => <DestinationCard key={item._id} item={item} onPress={handleItemPress} />)
            ) : (
              <Text style={styles.emptySectionText}>No top destinations available</Text>
            )}
          </ScrollView>
        </Section>

        {/* --- Categories (Circular Icon Cards) --- */}
        <Section title="Explore Categories">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {CATEGORIES.map((category) => (
              <CircularCategoryCard key={category.id} category={category} onPress={handleCategoryPress} />
            ))}
          </ScrollView>
        </Section>

        {/* --- Travelmate Banner --- */}
        <Section title="Explore with TravelMate">
          <TouchableOpacity style={styles.travelmateCard} onPress={() => Alert.alert("Travelmate")}>
            <ImageBackground
              source={{ uri: "https://source.unsplash.com/random/800x600?group,travel,friends" }}
              style={StyleSheet.absoluteFillObject}
              imageStyle={styles.travelmateImageStyle}
            >
              <LinearGradient
                colors={[COLORS.ACCENT_GRADIENT_START + "B3", COLORS.ACCENT_GRADIENT_END + "CC"]}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.travelmateContent}>
                <Text style={styles.travelmateTitle}>Find Your Travel Companion</Text>
                <Text style={styles.travelmateSubtitle}>Connect with fellow travelers and explore together.</Text>
                <View style={styles.travelmateButton}>
                  <Text style={styles.travelmateButtonText}>Get Started</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </Section>

        {/* --- Popular Quick Trips (Circular Image Cards) --- */}
        <Section
          title="Popular Quick Trips"
          iconName="map-outline"
          onSeeAll={() => handleSeeAll("Popular Quick Trips")}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {Array.isArray(popularQuickTrips) && popularQuickTrips.length > 0 ? (
              popularQuickTrips.map((item) => (
                <CircularPlaceItem key={item._id} item={item} onPress={handleItemPress} />
              ))
            ) : (
              <Text style={styles.emptySectionText}>No quick trips available</Text>
            )}
          </ScrollView>
        </Section>

        {/* --- Featured Experiences (Rectangular Cards) --- */}
        <Section
          title="Featured Experiences"
          iconName="star-outline"
          onSeeAll={() => handleSeeAll("Featured Experiences")}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {Array.isArray(featuredExperiences) && featuredExperiences.length > 0 ? (
              featuredExperiences.map((item) => <PlaceCard key={item._id} item={item} onPress={handleItemPress} />)
            ) : (
              <Text style={styles.emptySectionText}>No featured experiences available</Text>
            )}
          </ScrollView>
        </Section>

        {/* --- Trending Now (Rectangular Cards) --- */}
        <Section title="Trending Now" iconName="flame-outline" onSeeAll={() => handleSeeAll("Trending Now")}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {Array.isArray(trendingNow) && trendingNow.length > 0 ? (
              trendingNow.map((item) => <PlaceCard key={item._id} item={item} onPress={handleItemPress} />)
            ) : (
              <Text style={styles.emptySectionText}>No trending trips available</Text>
            )}
          </ScrollView>
        </Section>

        {/* --- Offbeat Escapes (Circular Image Cards) --- */}
        <Section title="Offbeat Escapes" iconName="compass-outline" onSeeAll={() => handleSeeAll("Offbeat Escapes")}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {Array.isArray(offbeatEscapes) && offbeatEscapes.length > 0 ? (
              offbeatEscapes.map((item) => <CircularPlaceItem key={item._id} item={item} onPress={handleItemPress} />)
            ) : (
              <Text style={styles.emptySectionText}>No offbeat escapes available</Text>
            )}
          </ScrollView>
        </Section>

        {/* --- Party Escapes (Rectangular Cards) --- */}
        <Section title="Party Escapes" iconName="happy-outline" onSeeAll={() => handleSeeAll("Party Escapes")}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {Array.isArray(partyEscapes) && partyEscapes.length > 0 ? (
              partyEscapes.map((item) => <PlaceCard key={item._id} item={item} onPress={handleItemPress} />)
            ) : (
              <Text style={styles.emptySectionText}>No party escapes available</Text>
            )}
          </ScrollView>
        </Section>

        {/* --- Weekend Escapes (Rectangular Cards) --- */}
        <Section title="Weekend Escapes" iconName="bonfire-outline" onSeeAll={() => handleSeeAll("Weekend Escapes")}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {Array.isArray(weekendEscapes) && weekendEscapes.length > 0 ? (
              weekendEscapes.map((item) => <CircularPlaceItem key={item._id} item={item} onPress={handleItemPress} />)
            ) : (
              <Text style={styles.emptySectionText}>No weekend escapes available</Text>
            )}
          </ScrollView>
        </Section>

        {/* --- Budget Friendly (Rectangular Cards) --- */}
        <Section title="Budget Friendly" iconName="wallet-outline" onSeeAll={() => handleSeeAll("Budget Friendly")}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {Array.isArray(budgetFriendly) && budgetFriendly.length > 0 ? (
              budgetFriendly.map((item) => <PlaceCard key={item._id} item={item} onPress={handleItemPress} />)
            ) : (
              <Text style={styles.emptySectionText}>No budget-friendly trips available</Text>
            )}
          </ScrollView>
        </Section>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: COLORS.WHITE,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
  },
  location: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2.22,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: COLORS.TEXT_PRIMARY,
  },
  filterButton: {
    padding: 5,
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
  seeAllText: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: "600",
  },
  horizontalScroll: {
    paddingHorizontal: 20,
    gap: 15, // Use gap for spacing in React Native if supported, otherwise use margin
  },

  // Destination Card (Larger Rectangular)
  destinationCard: {
    width: width * 0.75, // Adjust width for better fit
    height: width * 0.5,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  destinationCardImageBackground: {
    flex: 1,
    justifyContent: "flex-end",
  },
  destinationCardImageStyle: {
    borderRadius: 20,
  },
  destinationCardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "60%",
    borderRadius: 20,
  },
  destinationCardContent: {
    padding: 20,
  },
  destinationCardText: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.WHITE,
  },

  // Category Card (Circular Icon)
  categoryCard: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.WHITE,
    padding: 15,
    borderRadius: 9999, // Makes it a circle
    width: 100,
    height: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2.22,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.TEXT_SECONDARY,
    marginTop: 8,
    textAlign: "center",
  },

  // Circular Place Item (Circular image with text below)
  circularPlaceItemContainer: {
    alignItems: "center",
    width: 120, // Fixed width for circular items
  },
  circularPlaceImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50, // Half of width/height for perfect circle
    overflow: "hidden",
    borderWidth: 2,
    borderColor: COLORS.LIGHT_GRAY,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2.22,
    elevation: 3,
  },
  circularPlaceImage: {
    width: "100%",
    height: "100%",
  },
  circularPlaceName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    textAlign: "center",
    marginTop: 4,
  },
  circularPlaceLocation: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
  },

  // Travelmate Card
  travelmateCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    height: 180,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5.46,
    elevation: 9,
  },
  travelmateImageStyle: {
    borderRadius: 20,
  },
  travelmateContent: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
  },
  travelmateTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.WHITE,
    maxWidth: "70%",
  },
  travelmateSubtitle: {
    fontSize: 14,
    color: COLORS.WHITE,
    opacity: 0.9,
    marginTop: 5,
    maxWidth: "80%",
  },
  travelmateButton: {
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: "flex-start",
    marginTop: 15,
  },
  travelmateButtonText: {
    color: COLORS.PRIMARY,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.TEXT_SECONDARY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.BACKGROUND,
  },
  errorText: {
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  retryButtonText: {
    color: COLORS.WHITE,
    fontWeight: "bold",
  },
  emptySectionText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    paddingVertical: 20,
    fontStyle: "italic",
  },
})
