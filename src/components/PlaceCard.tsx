// components/PlaceCard.tsx
import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { COLORS } from "../constants/colors" // Adjust path as needed

const { width } = Dimensions.get("window")

interface PlaceCardProps {
  item: {
    id: string | number
    title: string
    location?: string
    image: string
    price?: number
    duration?: string
  }
  onPress: (item: any) => void
}

const PlaceCard: React.FC<PlaceCardProps> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.placeCard} onPress={() => onPress(item)}>
    <ImageBackground
      source={{ uri: item.image }}
      style={styles.placeCardImageBackground}
      imageStyle={styles.placeCardImageStyle}
    >
      <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={styles.placeCardGradient} />
      <View style={styles.placeCardContent}>
        <Text style={styles.placeCardTitle}>{item.title}</Text>
        {item.location && <Text style={styles.placeCardLocation}>{item.location}</Text>}
        {item.price && <Text style={styles.placeCardPrice}>${item.price}</Text>}
      </View>
    </ImageBackground>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  placeCard: {
    width: width * 0.45, // Adjust width for better fit
    height: width * 0.6,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placeCardImageBackground: {
    flex: 1,
    justifyContent: "flex-end",
  },
  placeCardImageStyle: {
    borderRadius: 15,
  },
  placeCardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
    borderRadius: 15,
  },
  placeCardContent: {
    padding: 15,
  },
  placeCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.WHITE,
  },
  placeCardLocation: {
    fontSize: 12,
    color: COLORS.WHITE,
    opacity: 0.9,
    marginTop: 2,
  },
  placeCardPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.WHITE,
    marginTop: 5,
  },
})

export default PlaceCard
