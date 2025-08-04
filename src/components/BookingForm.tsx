import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { Picker } from "@react-native-picker/picker"

interface BookingFormProps {
  onSubmit: (bookingData: any) => void
  loading: boolean
  serviceType: 'restaurants' | 'stays' | 'activities' | 'rentals'
}

const BookingForm = ({ onSubmit, loading, serviceType }: BookingFormProps) => {
  const [date, setDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [time, setTime] = useState(new Date())
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [people, setPeople] = useState("")
  const [guests, setGuests] = useState("")
  const [participants, setParticipants] = useState("")
  const [duration, setDuration] = useState("")
  const [nights, setNights] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")

  const formatDate = (date: Date) => {
    return date.toLocaleDateString()
  }

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios')
    if (selectedDate) {
      setDate(selectedDate)
    }
  }

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios')
    if (selectedTime) {
      setTime(selectedTime)
    }
  }

  const handleSubmit = () => {
    const bookingData: any = {
      date: formatDate(date),
      specialRequests: specialRequests || undefined,
    }

    // Add service-specific data
    switch (serviceType) {
      case 'restaurants':
        bookingData.time = formatTime(time)
        bookingData.people = parseInt(people) || 0
        break
      case 'stays':
        bookingData.guests = parseInt(guests) || 0
        bookingData.nights = parseInt(nights) || 1
        break
      case 'activities':
        bookingData.time = formatTime(time)
        bookingData.participants = parseInt(participants) || 0
        break
      case 'rentals':
        bookingData.duration = duration
        break
    }

    onSubmit(bookingData)
  }

  const getFormFields = () => {
    switch (serviceType) {
      case 'restaurants':
        return (
          <>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.dateText}>{formatDate(date)}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Time</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
                  <Text style={styles.dateText}>{formatTime(time)}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Number of People</Text>
              <TextInput
                style={styles.input}
                value={people}
                onChangeText={setPeople}
                placeholder="Enter number of people"
                keyboardType="numeric"
              />
            </View>
          </>
        )
      case 'stays':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Check-in Date</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateText}>{formatDate(date)}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Guests</Text>
                <TextInput
                  style={styles.input}
                  value={guests}
                  onChangeText={setGuests}
                  placeholder="Number of guests"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Nights</Text>
                <TextInput
                  style={styles.input}
                  value={nights}
                  onChangeText={setNights}
                  placeholder="Number of nights"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </>
        )
      case 'activities':
        return (
          <>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.dateText}>{formatDate(date)}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Time</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
                  <Text style={styles.dateText}>{formatTime(time)}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Participants</Text>
              <TextInput
                style={styles.input}
                value={participants}
                onChangeText={setParticipants}
                placeholder="Number of participants"
                keyboardType="numeric"
              />
            </View>
          </>
        )
      case 'rentals':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Rental Date</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateText}>{formatDate(date)}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Duration</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={duration}
                  style={styles.picker}
                  onValueChange={setDuration}
                >
                  <Picker.Item label="Select duration" value="" />
                  <Picker.Item label="Half Day (4 hours)" value="half-day" />
                  <Picker.Item label="Full Day (8 hours)" value="full-day" />
                  <Picker.Item label="2 Days" value="2-days" />
                  <Picker.Item label="3 Days" value="3-days" />
                  <Picker.Item label="1 Week" value="1-week" />
                  <Picker.Item label="Custom" value="custom" />
                </Picker>
              </View>
            </View>
          </>
        )
      default:
        return null
    }
  }

  return (
    <View style={styles.container}>
      {getFormFields()}
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Special Requests (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={specialRequests}
          onChangeText={setSpecialRequests}
          placeholder={`Any special requests for your ${serviceType.slice(0, -1)}...`}
          multiline
          numberOfLines={3}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? "Booking..." : `Book ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1, -1)}`}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f8f9fa",
    margin: 16,
    borderRadius: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  halfWidth: {
    width: "48%",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
})

export default BookingForm