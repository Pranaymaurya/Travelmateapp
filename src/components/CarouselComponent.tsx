"use client"

import * as React from "react"
import { useEffect } from "react"
import { View, StyleSheet, Text } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import { Feather } from "@expo/vector-icons" // Using Feather icons
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  interpolate,
  Easing,
} from "react-native-reanimated"
import type { ICarouselInstance } from "react-native-reanimated-carousel"
import Carousel from "react-native-reanimated-carousel"

// A more vibrant and inspirational color palette
const inspirationalColors = [
  "#8E2DE2", // Purple
  "#4A00E0", // Blue-Purple
  "#654ea3", // Lavender
  "#eaafc8", // Pink
  "#ff6e7f", // Coral
  "#bfe9ff", // Light Blue
]

// ✅ Card rendering component with levitation animation
const LevitatingCard = ({ item, index }: { item: string; index: number }) => {
  const levitate = useSharedValue(0)

  // Start animation with a random delay for a more organic feel
  useEffect(() => {
    const randomDelay = Math.random() * 2000 // Delay up to 2 seconds
    levitate.value = withDelay(
      randomDelay,
      withRepeat(
        withTiming(1, {
          duration: 3000,
          easing: Easing.inOut(Easing.quad),
        }),
        -1,
        true,
      ),
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(levitate.value, [0, 1], [0, -10])
    const rotateZ = interpolate(levitate.value, [0, 1], [-1, 1])
    return {
      transform: [{ translateY }, { rotateZ: `${rotateZ}deg` }],
    }
  })

  return (
    <Animated.View style={animatedStyle}>
      <View style={[styles.cardContainer, { backgroundColor: item }]}>
        <Feather name="feather" size={24} color="rgba(255, 255, 255, 0.8)" />
        <View>
          <Text style={styles.cardTitle}>Inspiration {index + 1}</Text>
          <Text style={styles.cardSubtitle}>Discover the magic</Text>
        </View>
      </View>
    </Animated.View>
  )
}

// ✅ Pagination Indicator that reacts to the active index
const PaginationIndicator = ({
  index,
  activeIndex,
}: {
  index: number
  activeIndex: Animated.SharedValue<number>
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const width = interpolate(
      activeIndex.value,
      [index - 1, index, index + 1],
      [8, 20, 8],
    )
    const opacity = interpolate(
      activeIndex.value,
      [index - 1, index, index + 1],
      [0.5, 1, 0.5],
    )
    return {
      width,
      opacity,
    }
  })

  return <Animated.View style={[styles.indicator, animatedStyle]} />
}

function CarouselComponent() {
  const ref = React.useRef<ICarouselInstance>(null)
  const activeIndex = useSharedValue(0)

  return (
    <View style={styles.container}>
      {/* Blurred background for depth */}
      <BlurView intensity={80} tint="light" style={styles.backgroundBlur} />

      {/* Animated title */}
      <Animated.View style={styles.titleContainer}>
        <LinearGradient
          colors={["#8E2DE2", "#4A00E0"]}
          style={styles.titleGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.titleText}>✨ Your Next Journey</Text>
        </LinearGradient>
      </Animated.View>

      {/* Carousel */}
      <Carousel
        ref={ref}
        data={inspirationalColors}
        renderItem={({ item, index }) => (
          <LevitatingCard item={item} index={index} />
        )}
        onProgressChange={(_, absoluteProgress) => {
          // Update the active index for the pagination indicators
          activeIndex.value = absoluteProgress
        }}
        width={300}
        height={220}
        loop
        autoPlay
        autoPlayInterval={4000}
        scrollAnimationDuration={1000}
        style={styles.carousel}
        mode={"horizontal-stack"}
        modeConfig={{
          snapDirection: "left",
          stackInterval: 18,
          scaleInterval: 0.06,
          rotateZDeg: 120, // Adjusted for a different stack effect
        }}
        customConfig={() => ({
          type: "positive",
          viewCount: 5,
        })}
        withAnimation={{
          type: "spring",
          config: {
            damping: 15,
            stiffness: 120,
            mass: 1,
          },
        }}
      />

      {/* Active Pagination Indicators */}
      <View style={styles.indicatorsContainer}>
        {inspirationalColors.map((_, index) => (
          <PaginationIndicator key={index} index={index} activeIndex={activeIndex} />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "#f0f2f5", // A soft background color
  },
  backgroundBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  titleContainer: {
    marginBottom: 30,
    zIndex: 2,
  },
  titleGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: "#6A35D8",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  titleText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  carousel: {
    width: "100%",
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  cardContainer: {
    width: 280,
    height: 180,
    borderRadius: 24,
    padding: 20,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  indicatorsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    gap: 8,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4A00E0",
  },
})

export default CarouselComponent