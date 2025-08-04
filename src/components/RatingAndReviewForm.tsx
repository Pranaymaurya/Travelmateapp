"use client"
import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { COLORS } from "../constants/colors"
import { reviewApi } from "../api" // Assuming you have a reviewApi
import { useAuth } from "../../App" // Assuming useAuth is available at this path

interface RatingAndReviewFormProps {
  itemId: string
  itemType: string // e.g., "Restaurant", "Trip", "Activity", "Stay", "Rental"
  onReviewCreated?: () => void
}

export default function RatingAndReviewForm({ itemId, itemType, onReviewCreated }: RatingAndReviewFormProps) {
  const { userId } = useAuth()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStarPress = (selectedRating: number) => {
    setRating(selectedRating)
  }

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert("Error", "You must be logged in to leave a review.")
      return
    }
    if (rating === 0) {
      Alert.alert("Error", "Please select a rating (1-5 stars).")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await reviewApi.createReview({
        userId,
        itemId,
        itemType,
        rating,
        comment,
      })

      if (response.success) {
        Alert.alert("Success", "Your review has been submitted!")
        setRating(0)
        setComment("")
        if (onReviewCreated) onReviewCreated()
      } else {
        Alert.alert("Error", response.message || "Failed to submit review.")
      }
    } catch (error: any) {
      console.error("Error submitting review:", error)
      Alert.alert("Error", "An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.ratingLabel}>Rate your experience:</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity 
            key={star} 
            onPress={() => handleStarPress(star)}
            style={styles.starButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={32}
              color={star <= rating ? COLORS.PRIMARY : COLORS.GRAY}
            />
          </TouchableOpacity>
        ))}
      </View>
      
      {rating > 0 && (
        <Text style={styles.ratingText}>
          {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Very Good" : "Excellent"}
        </Text>
      )}

      <Text style={styles.commentLabel}>Write a review (optional):</Text>
      <TextInput
        style={styles.commentInput}
        placeholder="Share your experience..."
        placeholderTextColor={COLORS.TEXT_SECONDARY}
        multiline
        numberOfLines={4}
        value={comment}
        onChangeText={setComment}
        maxLength={500}
      />
      <Text style={styles.characterCount}>{comment.length}/500</Text>

      <TouchableOpacity
        style={[
          styles.submitButton, 
          (isSubmitting || rating === 0) && styles.submitButtonDisabled
        ]}
        onPress={handleSubmit}
        disabled={isSubmitting || rating === 0}
        activeOpacity={0.8}
      >
        {isSubmitting ? (
          <Text style={styles.submitButtonText}>Submitting...</Text>
        ) : (
          <Text style={styles.submitButtonText}>Submit Review</Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 5, // Reduced padding
    minHeight: 250, // Reduced minimum height
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 10,
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
    paddingVertical: 10,
  },
  starButton: {
    padding: 5,
    marginHorizontal: 3,
  },
  ratingText: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "500",
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    minHeight: 100, // Reduced height to fit better
    maxHeight: 120, // Reduced max height
    textAlignVertical: "top",
    marginBottom: 5,
    backgroundColor: COLORS.WHITE || "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "right",
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.GRAY,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: "bold",
  },
})