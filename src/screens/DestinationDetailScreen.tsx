import { View, Text, Image, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { COLORS } from "../constants/colors"

const { width } = Dimensions.get("window")

interface CategoryCardProps {
  icon: string
  name: string
  description: string
  onPress: () => void
}

interface RouteParams {
  destination: {
    title: string
    location?: string
    description?: string
    image?: string
  }
}

const DestinationDetailScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  
  // Properly type and extract params
  const params = route.params as RouteParams | undefined
  const destination = params?.destination
  console.log(destination._id)

  // Handle case where destination is not provided
  if (!destination) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Destination details not found.</Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const handleCategoryPress = (categoryType: string) => {
    const navigationParams = { routeDestinationId: destination._id }
    console.log(navigationParams)
    switch (categoryType) {
      case "Restaurants":
        (navigation as any).navigate("RestaurantList", navigationParams)
        break
      case "Rentals":
        (navigation as any).navigate("RentalList", navigationParams)
        break
      case "Activities":
        (navigation as any).navigate("ActivityList", navigationParams)
        break
      case "Stays":
        (navigation as any).navigate("StayList", navigationParams)
        break
      default:
        console.warn(`Unknown category type: ${categoryType}`)
        break
    }
  }

  // Generate image source with fallback
  const imageSource = destination.image && destination.image.startsWith("http")
    ? { uri: destination.image }
    : {
        uri: `https://source.unsplash.com/random/800x600?${
          destination.title?.toLowerCase().replace(/\s+/g, ",") || "travel-destination"
        }`,
      }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.imageContainer}>
          <Image source={imageSource} style={styles.heroImage} />
          <LinearGradient 
            colors={["transparent", "rgba(0,0,0,0.7)"]} 
            style={styles.imageGradient} 
          />
          <View style={styles.backButtonContainer}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButtonIcon}
            >
              <Ionicons name="arrow-back" size={28} color={COLORS.WHITE} />
            </TouchableOpacity>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.destinationTitle}>{destination.title}</Text>
            {destination.country && (
              <Text style={styles.destinationLocation}>{destination.country}</Text>
            )}
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionHeader}>Explore in {destination.title}</Text>
          <View style={styles.categoryGrid}>
            <CategoryCard
              icon="restaurant-outline"
              name="Restaurants"
              description="Local cuisine & dining"
              onPress={() => handleCategoryPress("Restaurants")}
            />
            <CategoryCard
              icon="bed-outline"
              name="Stays"
              description="Hotels & accommodations"
              onPress={() => handleCategoryPress("Stays")}
            />
            <CategoryCard
              icon="walk-outline"
              name="Activities"
              description="Tours & experiences"
              onPress={() => handleCategoryPress("Activities")}
            />
            <CategoryCard
              icon="car-outline"
              name="Rentals"
              description="Vehicle rentals"
              onPress={() => handleCategoryPress("Rentals")}
            />
          </View>

          {destination.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionHeader}>About {destination.title}</Text>
              <Text style={styles.descriptionText}>{destination.description}</Text>
            </View>
          )}

          <View style={styles.attractionsSection}>
            <Text style={styles.sectionHeader}>Popular Attractions</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.attractionsScroll}
            >
              <View style={styles.attractionCard}>
                <Image
                  source={{ 
                    uri: `https://source.unsplash.com/random/200x120?landmark,${destination.title}` 
                  }}
                  style={styles.attractionImage}
                />
                <Text style={styles.attractionName}>Historic Center</Text>
              </View>
              <View style={styles.attractionCard}>
                <Image
                  source={{ 
                    uri: `https://source.unsplash.com/random/200x120?museum,${destination.title}` 
                  }}
                  style={styles.attractionImage}
                />
                <Text style={styles.attractionName}>Local Museum</Text>
              </View>
              <View style={styles.attractionCard}>
                <Image
                  source={{ 
                    uri: `https://source.unsplash.com/random/200x120?nature,${destination.title}` 
                  }}
                  style={styles.attractionImage}
                />
                <Text style={styles.attractionName}>Nature Park</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const CategoryCard: React.FC<CategoryCardProps> = ({ icon, name, description, onPress }) => (
  <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
    <View style={styles.categoryIconContainer}>
      <Ionicons name={icon as any} size={32} color={COLORS.PRIMARY} />
    </View>
    <Text style={styles.categoryCardTitle}>{name}</Text>
    <Text style={styles.categoryCardDescription}>{description}</Text>
    <View style={styles.categoryCardArrow}>
      <Ionicons name="chevron-forward" size={16} color={COLORS.TEXT_SECONDARY} />
    </View>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    width: "100%",
    height: width * 0.7,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
  },
  backButtonContainer: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  backButtonIcon: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 5,
  },
  titleContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  destinationTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.WHITE,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  destinationLocation: {
    fontSize: 18,
    color: COLORS.WHITE,
    marginTop: 5,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  content: {
    padding: 20,
    backgroundColor: COLORS.BACKGROUND,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 15,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  categoryCard: {
    width: "48%",
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: "relative",
  },
  categoryIconContainer: {
    marginBottom: 12,
  },
  categoryCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  categoryCardDescription: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 16,
  },
  categoryCardArrow: {
    position: "absolute",
    top: 20,
    right: 15,
  },
  descriptionSection: {
    marginBottom: 30,
  },
  descriptionText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 24,
    textAlign: "justify",
  },
  attractionsSection: {
    marginBottom: 20,
  },
  attractionsScroll: {
    paddingVertical: 10,
  },
  attractionCard: {
    width: 160,
    marginRight: 15,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3.84,
    elevation: 3,
  },
  attractionImage: {
    width: "100%",
    height: 100,
    resizeMode: "cover",
  },
  attractionName: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.TEXT_PRIMARY,
    padding: 12,
    paddingBottom: 15,
  },
})

export default DestinationDetailScreen