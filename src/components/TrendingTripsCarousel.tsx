import React, { useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// --- Constants for animations and layout ---
const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.6;
const CARD_HEIGHT = width * 0.75;
const SPACING = 10;
const SIDECARD_SPACING = (width - CARD_WIDTH) / 2;

// --- A beautiful, reusable, and now 3D-ANIMATED PlaceCard component ---
const PlaceCard = ({ item, onPress, index, scrollX }) => {
  // --- Carousel Scroll Animations for 3D Cover Flow ---
  const animatedStyles = useMemo(() => {
    const inputRange = [
      (index - 2) * (CARD_WIDTH + SPACING),
      (index - 1) * (CARD_WIDTH + SPACING),
      index * (CARD_WIDTH + SPACING),
    ];

    // Apply a 3D rotation effect to the cards
    const rotateY = scrollX.interpolate({
      inputRange,
      outputRange: ["45deg", "0deg", "-45deg"],
      extrapolate: "clamp",
    });

    // Scale and opacity to emphasize the center card
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
        inputRange,
        outputRange: [0.6, 1, 0.6],
        extrapolate: "clamp",
    });

    return {
      transform: [{ scale }, { rotateY }],
      opacity,
    };
  }, [scrollX, index]);

  // A spacer item for centering the first and last cards
  if (item.type === 'spacer') {
    return <View style={{ width: SIDECARD_SPACING }} />;
  }

  return (
    <Animated.View style={[styles.cardContainer, animatedStyles]}>
      <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.9}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.85)"]}
          style={styles.cardGradient}
        />
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.cardLocation} numberOfLines={1}>{item.location}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// --- The main 3D Animated Carousel Component ---
const TrendingTripsCarousel = ({ trips, onTripPress }) => {
  const scrollX = useRef(new Animated.Value(0)).current;

  if (!trips || trips.length === 0) {
    return null; // Don't render if there are no trips
  }

  // Add spacer items to center the first and last cards
  const carouselData = [
    { id: 'left-spacer', type: 'spacer' },
    ...trips,
    { id: 'right-spacer', type: 'spacer' }
  ];

  const renderItem = ({ item, index }) => (
    <PlaceCard item={item} onPress={onTripPress} index={index} scrollX={scrollX} />
  );

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={carouselData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
        snapToInterval={CARD_WIDTH + SPACING} // Snap to the next card
        decelerationRate="fast"
        // This is the magic that updates our scrollX value on scroll
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true } // Crucial for performance
        )}
        scrollEventThrottle={16} // Update scroll position every 16ms
        // Add perspective for the 3D effect to be visible
        style={{ perspective: 1000 }}
      />
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  horizontalScroll: {
    paddingVertical: 20, // Add padding for shadow visibility
    alignItems: 'center',
  },
  // Card Styles
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: SPACING / 2,
    borderRadius: 20,
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    // Android Shadow
    elevation: 12,
    backgroundColor: '#fff', // Needed for shadow on Android
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  cardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "60%",
    borderRadius: 20,
  },
  ratingBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  cardTextContainer: {
    position: 'absolute',
    bottom: 0,
    padding: 18,
    width: '100%',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  cardLocation: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
  },
});

export default TrendingTripsCarousel;
