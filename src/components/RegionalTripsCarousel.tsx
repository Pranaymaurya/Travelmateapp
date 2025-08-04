// components/RegionalTripsCarousel.tsx
import type React from "react"
import { View, Text, ScrollView, StyleSheet } from "react-native"
import PlaceCard from "./PlaceCard" // Import the reusable PlaceCard
import { COLORS } from "../constants/colors" // Adjust path as needed

interface RegionalTripsCarouselProps {
  region: {
    name: string
    emoji: string
    gradient: string[]
    trips: any[]
  }
  onTripPress: (trip: any) => void
}

const RegionalTripsCarousel: React.FC<RegionalTripsCarouselProps> = ({ region, onTripPress }) => {
  if (!region.trips || region.trips.length === 0) {
    return null // Don't render if no trips in this region
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {region.emoji} {region.name}
        </Text>
        {/* Optional: Add a "See All" button for regional trips */}
        {/* <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity> */}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
        {region.trips.map((item) => (
          <PlaceCard key={item.id} item={item} onPress={onTripPress} />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 25, // Space below the carousel
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: "600",
  },
  horizontalScroll: {
    paddingHorizontal: 20,
    gap: 15, // Space between cards
  },
})

export default RegionalTripsCarousel
