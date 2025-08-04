"use client"

import { View, Text, StyleSheet, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"
import { useEffect } from "react"

const { width: screenWidth } = Dimensions.get("window")

interface RenderItemOptions {
  rounded?: boolean
}

const travelDestinations = [
  {
    title: "Bali Paradise",
    subtitle: "Tropical Escape",
    emoji: "🏝️",
    gradient: ["#FF6B6B", "#4ECDC4"],
    description: "Crystal clear waters",
  },
  {
    title: "Swiss Alps",
    subtitle: "Mountain Adventure",
    emoji: "⛰️",
    gradient: ["#667eea", "#764ba2"],
    description: "Breathtaking peaks",
  },
  {
    title: "Tokyo Nights",
    subtitle: "Urban Explorer",
    emoji: "🏙️",
    gradient: ["#f093fb", "#f5576c"],
    description: "Neon-lit streets",
  },
  {
    title: "Safari Wild",
    subtitle: "Wildlife Journey",
    emoji: "🦁",
    gradient: ["#4ECDC4", "#44A08D"],
    description: "Untamed nature",
  },
  {
    title: "Northern Lights",
    subtitle: "Arctic Wonder",
    emoji: "🌌",
    gradient: ["#A8EDEA", "#FED6E3"],
    description: "Dancing auroras",
  },
  {
    title: "Desert Dunes",
    subtitle: "Sahara Experience",
    emoji: "🐪",
    gradient: ["#F7DC6F", "#F39C12"],
    description: "Golden sands",
  },
]

export const renderItem = (options: RenderItemOptions = {}) => {
  return ({
    item,
    index,
    animationValue,
  }: { item: string; index: number; animationValue: Animated.SharedValue<number> }) => {
    const destination = travelDestinations[index % travelDestinations.length]

    // Floating animation
    const floatValue = useSharedValue(0)

    useEffect(() => {
      floatValue.value = withRepeat(withTiming(1, { duration: 2000 + index * 200 }), -1, true)
    }, [])

    // Card animation based on carousel position
    const cardAnimatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(animationValue.value, [-1, 0, 1], [0.85, 1, 0.85], Extrapolate.CLAMP)

      const rotateY = interpolate(animationValue.value, [-1, 0, 1], [-15, 0, 15], Extrapolate.CLAMP)

      const translateY = interpolate(floatValue.value, [0, 1], [0, -8], Extrapolate.CLAMP)

      const opacity = interpolate(animationValue.value, [-1, 0, 1], [0.7, 1, 0.7], Extrapolate.CLAMP)

      return {
        transform: [{ scale }, { rotateY: `${rotateY}deg` }, { translateY }],
        opacity,
      }
    })

    // Emoji animation
    const emojiAnimatedStyle = useAnimatedStyle(() => {
      const rotate = interpolate(floatValue.value, [0, 1], [0, 10], Extrapolate.CLAMP)

      const scale = interpolate(floatValue.value, [0, 1], [1, 1.1], Extrapolate.CLAMP)

      return {
        transform: [{ rotate: `${rotate}deg` }, { scale }],
      }
    })

    // Shimmer effect
    const shimmerValue = useSharedValue(0)

    useEffect(() => {
      shimmerValue.value = withRepeat(withTiming(1, { duration: 3000 }), -1, false)
    }, [])

    const shimmerStyle = useAnimatedStyle(() => {
      const translateX = interpolate(shimmerValue.value, [0, 1], [-screenWidth, screenWidth], Extrapolate.CLAMP)

      return {
        transform: [{ translateX }],
      }
    })

    return (
      <Animated.View style={[styles.carouselItem, cardAnimatedStyle]}>
        <LinearGradient
          colors={destination.gradient}
          style={[styles.gradientContainer, options.rounded && styles.rounded]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Shimmer overlay */}
          <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}>
            <LinearGradient
              colors={["transparent", "rgba(255,255,255,0.3)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>

          {/* Floating particles */}
          <View style={styles.particlesContainer}>
            {[...Array(6)].map((_, i) => (
              <FloatingParticle key={i} delay={i * 500} />
            ))}
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Animated.Text style={[styles.emoji, emojiAnimatedStyle]}>{destination.emoji}</Animated.Text>

            <Text style={styles.title}>{destination.title}</Text>
            <Text style={styles.subtitle}>{destination.subtitle}</Text>
            <Text style={styles.description}>{destination.description}</Text>

            {/* Animated dots */}
            <View style={styles.dotsContainer}>
              {[...Array(3)].map((_, i) => (
                <AnimatedDot key={i} delay={i * 200} />
              ))}
            </View>
          </View>

          {/* Corner decoration */}
          <View style={styles.cornerDecoration}>
            <LinearGradient colors={["rgba(255,255,255,0.3)", "transparent"]} style={styles.cornerGradient} />
          </View>
        </LinearGradient>
      </Animated.View>
    )
  }
}

// Floating particle component
const FloatingParticle = ({ delay }: { delay: number }) => {
  const particleValue = useSharedValue(0)

  useEffect(() => {
    setTimeout(() => {
      particleValue.value = withRepeat(withTiming(1, { duration: 4000 }), -1, true)
    }, delay)
  }, [delay])

  const particleStyle = useAnimatedStyle(() => {
    const translateY = interpolate(particleValue.value, [0, 1], [0, -30], Extrapolate.CLAMP)

    const opacity = interpolate(particleValue.value, [0, 0.5, 1], [0.3, 1, 0.3], Extrapolate.CLAMP)

    return {
      transform: [{ translateY }],
      opacity,
    }
  })

  return <Animated.View style={[styles.particle, particleStyle]} />
}

// Animated dot component
const AnimatedDot = ({ delay }: { delay: number }) => {
  const dotValue = useSharedValue(0)

  useEffect(() => {
    setTimeout(() => {
      dotValue.value = withRepeat(withTiming(1, { duration: 1500 }), -1, true)
    }, delay)
  }, [delay])

  const dotStyle = useAnimatedStyle(() => {
    const scale = interpolate(dotValue.value, [0, 1], [0.5, 1], Extrapolate.CLAMP)

    const opacity = interpolate(dotValue.value, [0, 1], [0.4, 1], Extrapolate.CLAMP)

    return {
      transform: [{ scale }],
      opacity,
    }
  })

  return <Animated.View style={[styles.dot, dotStyle]} />
}

const styles = StyleSheet.create({
  carouselItem: {
    width: screenWidth * 0.75,
    height: 220,
    marginHorizontal: 5,
  },
  gradientContainer: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  rounded: {
    borderRadius: 25,
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  shimmerGradient: {
    flex: 1,
    width: 100,
  },
  particlesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  particle: {
    position: "absolute",
    width: 4,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 2,
    top: "20%",
    left: `${Math.random() * 80 + 10}%`,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    paddingHorizontal: 20,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 16,
    fontStyle: "italic",
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  cornerDecoration: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 60,
    height: 60,
  },
  cornerGradient: {
    flex: 1,
    borderTopRightRadius: 25,
  },
})
