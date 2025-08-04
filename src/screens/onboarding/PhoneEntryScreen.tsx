"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  Alert,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { authApi } from "../../api" // Import the API service

const { width, height } = Dimensions.get("window")

export default function PhoneEntryScreen() {
  const navigation = useNavigation()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryCode, setCountryCode] = useState("+1") // Default country code
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Handles the continue button press.
   * Sends an OTP to the entered phone number via the backend API.
   */
  const handleContinue = async () => {
    if (phoneNumber.length < 10) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit phone number")
      return
    }

    setIsLoading(true)
    const fullPhoneNumber = countryCode + phoneNumber

    try {
      // Call backend API to send OTP
      const response = await authApi.sendOtp(fullPhoneNumber)

      if (response.success) {
        Alert.alert("OTP Sent", response.message)
        // Navigate to OTP verification screen, passing the phone number
        navigation.navigate(
          "OTPVerification" as never,
          {
            phoneNumber: fullPhoneNumber,
          } as never,
        )
      } else {
        Alert.alert("Error", response.message || "Failed to send OTP. Please try again.")
      }
    } catch (error) {
      console.error("Error sending OTP:", error)
      Alert.alert("Error", "Could not connect to the server. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#FF6B35", "#F7931E", "#FFD23F"]} style={styles.gradient}>
        {/* Animated Background Elements */}
        <View style={styles.backgroundElements}>
          <Animated.View style={[styles.circle, styles.circle1]} />
          <Animated.View style={[styles.circle, styles.circle2]} />
          <Animated.View style={[styles.circle, styles.circle3]} />
        </View>

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="earth" size={60} color="white" />
            <Text style={styles.title}>Welcome to TravelExplorer</Text>
            <Text style={styles.subtitle}>Discover amazing places around the world</Text>
          </View>

          {/* Phone Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Enter your phone number</Text>

            <View style={styles.phoneInputContainer}>
              <TouchableOpacity style={styles.countryCodeButton}>
                <Text style={styles.countryCodeText}>{countryCode}</Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>

              <TextInput
                style={styles.phoneInput}
                placeholder="Phone Number"
                placeholderTextColor="#999"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <TouchableOpacity
              style={[styles.continueButton, isLoading && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={isLoading}
            >
              {isLoading ? (
                <Animated.View style={styles.loadingSpinner}>
                  <Ionicons name="refresh" size={24} color="white" />
                </Animated.View>
              ) : (
                <>
                  <Text style={styles.continueButtonText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.disclaimer}>We'll send you a verification code via SMS</Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  backgroundElements: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  circle: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 100,
  },
  circle1: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: 100,
    left: -30,
  },
  circle3: {
    width: 100,
    height: 100,
    top: height * 0.3,
    left: width * 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 24,
  },
  inputSection: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  phoneInputContainer: {
    flexDirection: "row",
    marginBottom: 30,
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 5,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  continueButton: {
    backgroundColor: "#FF6B35",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  loadingSpinner: {
    transform: [{ rotate: "45deg" }],
  },
  disclaimer: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
})
