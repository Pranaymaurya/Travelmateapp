"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Animated, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import { authApi } from '../../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from "../../../App"

export default function OTPVerificationScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { phoneNumber } = route.params as { phoneNumber: string }
  const { setUserId, setIsOnboarded,setIsAdmin } = useAuth()

  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const inputRefs = useRef<TextInput[]>([])
  const progressAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 60000,
      useNativeDriver: false,
    }).start()

    return () => clearInterval(interval)
  }, [])

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newOtp.every((digit) => digit !== "") && !isVerifying) {
      handleVerify(newOtp.join(""))
    }
  }

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  /**
   * Verifies the OTP and handles navigation based on whether the user exists.
   * This function now contains the corrected fetch call.
   */
  const handleVerify = async (otpCode: string) => {
    setIsVerifying(true)
    try {
      const response = await authApi.verifyOtp(phoneNumber, otpCode);
      const data = response.data as {
        userExists?: boolean;
        user?: { _id: string; name: string };
        token?: string;
      };
      if (response.success) {
        if (data && data.userExists) {
          Alert.alert('Login Successful', `Welcome back, ${data.user?.name || ''}!`);
          setUserId(data.user?._id || '');
          setIsOnboarded(true);
          setIsAdmin(true)
          if (data.token) {
            await AsyncStorage.setItem('token', data.token);
          }
        } else {
          Alert.alert('Verification Complete', "Let's create your account.");
          navigation.navigate('UserInfo' as never, { phoneNumber } as never);
        }
      } else {
        Alert.alert('Verification Failed', response.message || 'Invalid or expired OTP.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Error', 'Could not connect to the server. Please try again later.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setTimer(60);
    try {
      const response = await authApi.resendOtp(phoneNumber);
      if (response.success) {
        Alert.alert('OTP Sent', response.message || 'OTP resent successfully.');
      } else {
        Alert.alert('Error', response.message || 'Failed to resend OTP.');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      Alert.alert('Error', 'Could not connect to the server. Please try again later.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2", "#f093fb"]} style={styles.gradient}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="chatbubble-ellipses" size={50} color="white" />
            </View>
            <Text style={styles.title}>Verify Your Phone</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit code to{"\n"}
              <Text style={styles.phoneText}>{phoneNumber}</Text>
            </Text>
          </View>
          <View style={styles.otpSection}>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    if (ref) inputRefs.current[index] = ref;
                  }}
                  style={[styles.otpInput, digit && styles.otpInputFilled]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  selectTextOnFocus
                  editable={!isVerifying}
                />
              ))}
            </View>
            {isVerifying && (
               <View style={styles.verifyingContainer}>
                 <Text style={styles.verifyingText}>Verifying...</Text>
               </View>
            )}
            <View style={{ marginTop: 20, alignItems: 'center' }}>
              <Text style={{ color: '#888', marginBottom: 8 }}>
                Didn't receive the code?
              </Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={!canResend}
                style={{ opacity: canResend ? 1 : 0.5 }}
              >
                <Text style={{ color: '#667eea', fontWeight: 'bold', fontSize: 16 }}>
                  Resend OTP {canResend ? '' : `in ${timer}s`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    gradient: { flex: 1 },
    content: { flex: 1, paddingHorizontal: 30, paddingTop: 20 },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 30,
    },
    header: { alignItems: "center", marginBottom: 50 },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    title: { fontSize: 28, fontWeight: "bold", color: "white", marginBottom: 15 },
    subtitle: { fontSize: 16, color: "rgba(255, 255, 255, 0.9)", textAlign: "center", lineHeight: 24 },
    phoneText: { fontWeight: "bold", color: "white" },
    otpSection: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 20,
        padding: 30,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    otpContainer: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
    otpInput: {
        width: 45,
        height: 55,
        borderWidth: 2,
        borderColor: "#E0E0E0",
        borderRadius: 12,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold",
        backgroundColor: "#F8F8F8",
    },
    otpInputFilled: {
        borderColor: "#667eea",
        backgroundColor: "white",
        transform: [{ scale: 1.05 }],
    },
    verifyingContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
    },
    verifyingText: { fontSize: 16, fontWeight: "600", color: "#4CAF50" },
});
