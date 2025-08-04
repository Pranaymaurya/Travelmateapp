import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native"
import { Picker } from "@react-native-picker/picker"
import { useState } from "react"

interface ServiceFilterBarProps {
  filters: any
  onChange: (filters: any) => void
  serviceType: 'restaurants' | 'stays' | 'activities' | 'rentals'
}

const ServiceFilterBar = ({ filters, onChange, serviceType }: ServiceFilterBarProps) => {
  const [showFilters, setShowFilters] = useState(false)

  // Filter options for different service types
  const getFilterOptions = () => {
    switch (serviceType) {
      case 'restaurants':
        return {
          primary: {
            key: 'cuisine',
            label: 'Cuisine',
            options: [
              { label: 'All Cuisines', value: '' },
              { label: 'Indian', value: 'Indian' },
              { label: 'Chinese', value: 'Chinese' },
              { label: 'Italian', value: 'Italian' },
              { label: 'Mexican', value: 'Mexican' },
              { label: 'Thai', value: 'Thai' },
              { label: 'Continental', value: 'Continental' },
            ]
          },
          secondary: [
            {
              key: 'budget',
              label: 'Budget',
              options: [
                { label: 'Any Budget', value: '' },
                { label: 'Under ₹500', value: 'low' },
                { label: '₹500 - ₹1000', value: 'medium' },
                { label: 'Above ₹1000', value: 'high' },
              ]
            }
          ]
        }
      case 'stays':
        return {
          primary: {
            key: 'type',
            label: 'Type',
            options: [
              { label: 'All Types', value: '' },
              { label: 'Hotel', value: 'Hotel' },
              { label: 'Resort', value: 'Resort' },
              { label: 'Homestay', value: 'Homestay' },
              { label: 'Apartment', value: 'Apartment' },
              { label: 'Villa', value: 'Villa' },
            ]
          },
          secondary: [
            {
              key: 'budget',
              label: 'Budget',
              options: [
                { label: 'Any Budget', value: '' },
                { label: 'Under ₹2000', value: 'low' },
                { label: '₹2000 - ₹5000', value: 'medium' },
                { label: 'Above ₹5000', value: 'high' },
              ]
            },
            {
              key: 'amenities',
              label: 'Amenities',
              options: [
                { label: 'All Amenities', value: '' },
                { label: 'WiFi', value: 'WiFi' },
                { label: 'Pool', value: 'Pool' },
                { label: 'Gym', value: 'Gym' },
                { label: 'Spa', value: 'Spa' },
                { label: 'Parking', value: 'Parking' },
              ]
            }
          ]
        }
      case 'activities':
        return {
          primary: {
            key: 'category',
            label: 'Category',
            options: [
              { label: 'All Categories', value: '' },
              { label: 'Adventure', value: 'Adventure' },
              { label: 'Cultural', value: 'Cultural' },
              { label: 'Nature', value: 'Nature' },
              { label: 'Water Sports', value: 'Water Sports' },
              { label: 'Sightseeing', value: 'Sightseeing' },
              { label: 'Food Tours', value: 'Food Tours' },
            ]
          },
          secondary: [
            {
              key: 'budget',
              label: 'Budget',
              options: [
                { label: 'Any Budget', value: '' },
                { label: 'Under ₹1000', value: 'low' },
                { label: '₹1000 - ₹3000', value: 'medium' },
                { label: 'Above ₹3000', value: 'high' },
              ]
            }
          ]
        }
      case 'rentals':
        return {
          primary: {
            key: 'vehicleType',
            label: 'Vehicle Type',
            options: [
              { label: 'All Vehicles', value: '' },
              { label: 'Car', value: 'Car' },
              { label: 'Bike', value: 'Bike' },
              { label: 'Scooter', value: 'Scooter' },
              { label: 'Bus', value: 'Bus' },
              { label: 'Cycle', value: 'Cycle' },
            ]
          },
          secondary: [
            {
              key: 'budget',
              label: 'Budget',
              options: [
                { label: 'Any Budget', value: '' },
                { label: 'Under ₹500', value: 'low' },
                { label: '₹500 - ₹1500', value: 'medium' },
                { label: 'Above ₹1500', value: 'high' },
              ]
            }
          ]
        }
      default:
        return {
          primary: { key: 'type', label: 'Type', options: [] },
          secondary: []
        }
    }
  }

  const filterOptions = getFilterOptions()

  const handleFilterChange = (key: string, value: string) => {
    onChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = ''
      return acc
    }, {} as any)
    onChange(clearedFilters)
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <View style={styles.container}>
      {/* Primary Filter - Always visible */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.primaryFilter}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={filters[filterOptions.primary.key]}
            style={styles.picker}
            onValueChange={(value) => handleFilterChange(filterOptions.primary.key, value)}
          >
            {filterOptions.primary.options.map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity 
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={[styles.filterButtonText, showFilters && styles.filterButtonTextActive]}>
            More Filters
          </Text>
        </TouchableOpacity>

        {hasActiveFilters && (
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Secondary Filters - Collapsible */}
      {showFilters && (
        <View style={styles.secondaryFilters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* Location Filter - Common for all services */}
            <View style={styles.pickerContainer}>
              <Text style={styles.filterLabel}>Location</Text>
              <Picker
                selectedValue={filters.location}
                style={styles.picker}
                onValueChange={(value) => handleFilterChange('location', value)}
              >
                <Picker.Item label="All Locations" value="" />
                <Picker.Item label="Mumbai" value="Mumbai" />
                <Picker.Item label="Delhi" value="Delhi" />
                <Picker.Item label="Bangalore" value="Bangalore" />
                <Picker.Item label="Chennai" value="Chennai" />
                <Picker.Item label="Kolkata" value="Kolkata" />
                <Picker.Item label="Hyderabad" value="Hyderabad" />
                <Picker.Item label="Pune" value="Pune" />
                <Picker.Item label="Goa" value="Goa" />
              </Picker>
            </View>

            {/* Service-specific secondary filters */}
            {filterOptions.secondary.map((filter) => (
              <View key={filter.key} style={styles.pickerContainer}>
                <Text style={styles.filterLabel}>{filter.label}</Text>
                <Picker
                  selectedValue={filters[filter.key]}
                  style={styles.picker}
                  onValueChange={(value) => handleFilterChange(filter.key, value)}
                >
                  {filter.options.map((option) => (
                    <Picker.Item key={option.value} label={option.label} value={option.value} />
                  ))}
                </Picker>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  primaryFilter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerContainer: {
    marginRight: 12,
    minWidth: 140,
  },
  picker: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  filterLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  filterButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    height: 40,
  },
  filterButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  clearButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  secondaryFilters: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
})

export default ServiceFilterBar