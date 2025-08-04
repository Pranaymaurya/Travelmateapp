"use client"

import React, { useState } from "react"
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView,
  ScrollView, Alert, ActivityIndicator, TextInputProps
} from "react-native"
import { useAuth } from "../../../App"
import { authApi } from "../../api"
import { useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native";

// Reusable Input Component
const Input = ({ label, ...props }: { label: string } & TextInputProps) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput style={styles.input} placeholderTextColor="#999" {...props} />
  </View>
)

export default function UserInfoScreen() {
  const { setIsOnboarded, setUserId } = useAuth()
  const route = useRoute()
  const navigation = useNavigation();
  // Receive the phone number passed from the OTP screen
  const { phoneNumber } = route.params as { phoneNumber: string }

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "", age: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (Object.values(formData).some(field => !field)) {
      Alert.alert("Missing Information", "Please fill all fields.")
      return
    }

    setIsSubmitting(true)
    try {
      // Include the verified phone number in the registration payload
      const response = await authApi.register({
        ...formData,
        age: Number.parseInt(formData.age),
        phoneNumber: phoneNumber, // Add the phone number to the request
      })

      if (response.success && response.data) {
        Alert.alert("Registration Successful", "Welcome!");
        setUserId(response.data.userId) // Set the new user's ID
        setIsOnboarded(true) // Mark user as onboarded/logged in
        // TODO: Securely store the JWT token
        // You would typically navigate to your main app screen from here
      } else {
        Alert.alert("Registration Failed", response.message || "An error occurred.")
      }
    } catch (error) {
      console.error("Error during registration:", error)
      Alert.alert("Error", "Could not connect to the server.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>Your phone number ({phoneNumber}) has been verified. Just a few more details!</Text>

        <Input label="First Name" value={formData.firstName} onChangeText={t => handleInputChange("firstName", t)} />
        <Input label="Last Name" value={formData.lastName} onChangeText={t => handleInputChange("lastName", t)} />
        <Input label="Email" value={formData.email} onChangeText={t => handleInputChange("email", t)} keyboardType="email-address" autoCapitalize="none" />
        <Input label="Password" value={formData.password} onChangeText={t => handleInputChange("password", t)} secureTextEntry />
        <Input label="Age" value={formData.age} onChangeText={t => handleInputChange("age", t)} keyboardType="numeric" maxLength={2} />

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color="#007AFF" /> : <Text style={styles.buttonText}>Complete Registration</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  button: {
    backgroundColor: '#EFEFF4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#DADADA'
  },
  buttonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  backButton: {
    marginBottom: 20,
    padding: 10,
  },
  // Removed locationText style
})