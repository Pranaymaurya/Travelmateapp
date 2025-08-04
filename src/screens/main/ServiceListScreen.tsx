"use client"
import { useEffect, useState, useCallback } from "react"
import { Text, FlatList, SafeAreaView, ActivityIndicator, StyleSheet, Alert, View, TouchableOpacity } from "react-native"
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native"
import ServiceCard from "../../components/ServiceCard"
import ServiceFilterBar from "../../components/ServiceFilterbar"
import { Ionicons } from "@expo/vector-icons"

// API endpoints for different services
const API_ENDPOINTS = {
  restaurants: "http://localhost:5000/api/restaurants",
  stays: "http://localhost:5000/api/stays",
  activities: "http://localhost:5000/api/activities",
  rentals: "http://localhost:5000/api/rentals",
} as const

// Screen titles for different services
const SCREEN_TITLES = {
  restaurants: "Restaurants",
  stays: "Stays",
  activities: "Activities",
  rentals: "Rentals",
} as const

// Detail screen names for navigation
const DETAIL_SCREENS = {
  restaurants: "RestaurantDetail",
  stays: "StayDetail",
  activities: "ActivityDetail",
  rentals: "RentalDetail",
} as const

type ServiceType = keyof typeof API_ENDPOINTS

interface RouteParams {
  destinationId?: string
  destinationName?: string
  location?: string // fallback for location name
}

interface ServiceFilters {
  cuisine: string // For restaurants
  budget: string
  type: string // For stays/activities/rentals
  amenities: string // For stays
  category: string // For activities
  vehicleType: string // For rentals
  destinationId: string
  destinationName: string
}

interface ServiceListScreenProps {
  serviceType: ServiceType
}

const ServiceListScreen = ({ serviceType }: ServiceListScreenProps) => {
  const navigation = useNavigation()
  const route = useRoute()

  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState<ServiceFilters>({
    cuisine: "",
    budget: "",
    type: "",
    amenities: "",
    category: "",
    vehicleType: "",
    destinationId: "",
    destinationName: "",
  })

  // Extract and validate route params
  const routeParams = route.params as RouteParams | undefined
  const routeDestinationId = routeParams?.routeDestinationId || ""
  const routeDestinationName = routeParams?.destinationName || routeParams?.location || ""
  console.log(routeParams)

  // Initialize filters with route params when component mounts or route changes
  useFocusEffect(
    useCallback(() => {
      if (routeDestinationId || routeDestinationName) {
        setFilters((prev) => ({
          ...prev,
          destinationId: routeDestinationId,
          destinationName: routeDestinationName,
        }))
      }
    }, [routeDestinationId, routeDestinationName]),
  )

  // Build query parameters based on filters
  const buildQueryParams = useCallback(() => {
    const params: string[] = []

    // Service-specific filters
    if (serviceType === "restaurants" && filters.cuisine) {
      params.push(`cuisine=${encodeURIComponent(filters.cuisine)}`)
    }

    if (serviceType === "stays") {
      if (filters.amenities) {
        params.push(`amenities=${encodeURIComponent(filters.amenities)}`)
      }
      if (filters.type) {
        params.push(`type=${encodeURIComponent(filters.type)}`)
      }
    }

    if (serviceType === "activities" && filters.category) {
      params.push(`category=${encodeURIComponent(filters.category)}`)
    }

    if (serviceType === "rentals" && filters.vehicleType) {
      params.push(`vehicleType=${encodeURIComponent(filters.vehicleType)}`)
    }

    // Common filters
    if (filters.budget) {
      params.push(`budget=${encodeURIComponent(filters.budget)}`)
    }

    if (filters.type && serviceType !== "stays") {
      params.push(`type=${encodeURIComponent(filters.type)}`)
    }

    return params
  }, [filters, serviceType])

  // Fetch services with proper error handling and filter management
  const fetchServices = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      let url = ""

      if (filters.destinationId) {
        // Use destination-specific endpoint
        // IMPORTANT: Ensure your backend has a route like `/api/restaurants/by-destination/:destinationId`
        // for each service type (restaurants, stays, activities, rentals).
        url = `${API_ENDPOINTS[serviceType]}/by-destination/${filters.destinationId}`

        // Add additional filters as query params if the backend supports them
        // IMPORTANT: Your backend route for `/by-destination/:destinationId` must be able to
        // read and apply these query parameters (e.g., req.query.cuisine, req.query.budget).
        const queryParams = buildQueryParams()
        if (queryParams.length > 0) {
          url += `?${queryParams.join("&")}`
        }
      } else {
        // Use general endpoint with filters
        const queryParams = buildQueryParams()
        url =
          queryParams.length > 0 ? `${API_ENDPOINTS[serviceType]}?${queryParams.join("&")}` : API_ENDPOINTS[serviceType]
      }
      console.log(`Fetching from: ${url}`) // Debug log

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        let errorMessage = `Failed to fetch ${serviceType}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch {
          errorMessage += ` (Status: ${response.status})`
        }
        throw new Error(errorMessage)
      }
      const data = await response.json()

      // Handle different response formats
      const servicesData = Array.isArray(data) ? data : data.data || data.results || []
      setServices(servicesData)
    } catch (err: any) {
      console.error("Fetch error:", err)
      const errorMessage = err.message || "Network error occurred"
      setError(errorMessage)

      // Show alert for critical errors
      if (err.message.includes("Network") || err.message.includes("fetch")) {
        Alert.alert("Connection Error", "Unable to connect to server. Please check your internet connection.", [
          { text: "OK" },
        ])
      }
    } finally {
      setLoading(false)
    }
  }, [filters, serviceType, buildQueryParams])

  // Fetch data when filters change
  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<ServiceFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }))
  }, [])

  // Handle card press with proper navigation
  const handleCardPress = useCallback(
    (service: any) => {
      if (!service?._id) {
        Alert.alert("Error", "Invalid service data")
        return
      }
      const detailScreen = DETAIL_SCREENS[serviceType]
      const idParam = (() => {
        switch (serviceType) {
          case "restaurants":
            return "restaurantId"
          case "stays":
            return "stayId"
          case "activities":
            return "activityId"
          case "rentals":
            return "rentalId"
          default:
            return "id"
        }
      })()
      const navigationParams = {
        [idParam]: service._id,
        service: service, // Pass the full service object for immediate display
        ...(filters.destinationId && { destinationId: filters.destinationId }),
        ...(filters.destinationName && { destinationName: filters.destinationName }),
      }
      try {
        ;(navigation as any).navigate(detailScreen, navigationParams)
      } catch (err) {
        console.error("Navigation error:", err)
        Alert.alert("Navigation Error", "Unable to open details")
      }
    },
    [navigation, serviceType, filters.destinationId, filters.destinationName],
  )

  // Render empty state
  const renderEmptyComponent = () => (
    <Text style={styles.emptyListText}>
      No {serviceType} found{filters.destinationName ? ` in ${filters.destinationName}` : ""}.
      {Object.values(filters).some((f) => f && f !== filters.destinationId && f !== filters.destinationName)
        ? " Try adjusting your filters."
        : ""}
    </Text>
  )

  // Render error state
  const renderError = () => (
    <Text style={styles.error}>
      {error}
      {"\n"}
      <Text style={styles.retryText} onPress={fetchServices}>
        Tap to retry
      </Text>
    </Text>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.header}>
          {SCREEN_TITLES[serviceType]}
          {filters.destinationName && ` in ${filters.destinationName}`}
        </Text>
        <View style={{ width: 24 }} />
      </View>
      <ServiceFilterBar filters={filters} onChange={handleFilterChange} serviceType={serviceType} />
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : error ? (
        renderError()
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item, index) => item._id || item.id || `${serviceType}-${index}`}
          renderItem={({ item }) => (
            <ServiceCard service={item} onPress={() => handleCardPress(item)} serviceType={serviceType} />
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchServices}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  loader: {
    marginTop: 40,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  retryText: {
    color: "blue",
    textDecorationLine: "underline",
    fontSize: 14,
  },
  emptyListText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  listContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
})

export default ServiceListScreen
