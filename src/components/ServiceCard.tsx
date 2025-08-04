import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface ServiceCardProps {
  service: any
  onPress: (service: any) => void
  serviceType: 'restaurants' | 'stays' | 'activities' | 'rentals'
}

const ServiceCard = ({ service, onPress, serviceType }: ServiceCardProps) => {
  const getServiceIcon = () => {
    switch (serviceType) {
      case 'restaurants':
        return 'restaurant-outline'
      case 'stays':
        return 'bed-outline'
      case 'activities':
        return 'walk-outline'
      case 'rentals':
        return 'car-outline'
      default:
        return 'location-outline'
    }
  }

  const getServiceInfo = () => {
    switch (serviceType) {
      case 'restaurants':
        return {
          subtitle: service.cuisines?.join(", ") || "Restaurant",
          price: service.averagePrice ? `₹${service.averagePrice} for two` : null,
          rating: service.averageRating,
          extraInfo: service.totalReviews ? `${service.totalReviews} reviews` : null
        }
      case 'stays':
        return {
          subtitle: service.type || "Accommodation",
          price: service.price ? `₹${service.price} per night` : null,
          rating: service.averageRating,
          extraInfo: service.amenities?.slice(0, 2).join(", ") || null
        }
      case 'activities':
        return {
          subtitle: service.category || "Activity",
          price: service.price ? `₹${service.price} per person` : null,
          rating: service.averageRating,
          extraInfo: service.duration || null
        }
      case 'rentals':
        return {
          subtitle: service.vehicleType || "Vehicle",
          price: service.price ? `₹${service.price} per day` : null,
          rating: service.averageRating,
          extraInfo: service.fuelType || null
        }
      default:
        return {
          subtitle: "Service",
          price: null,
          rating: null,
          extraInfo: null
        }
    }
  }

  // Enhanced press handler with ID validation and better data structure
  const handlePress = () => {
    console.log("ServiceCard pressed with service:", service);
    
    // Validate that the service has an ID
    const serviceId = service._id || service.id;
    if (!serviceId) {
      console.error("Service missing ID:", service);
      Alert.alert("Error", "Service data is incomplete");
      return;
    }

    // Prepare comprehensive data for navigation
    const navigationData = {
      // Core identification
      id: serviceId,
      _id: serviceId, // Include both formats for compatibility
      
      // Basic info
      name: service.name,
      location: service.location,
      serviceType: serviceType,
      
      // Images
      image: service.images?.[0] || service.image,
      images: service.images || (service.image ? [service.image] : []),
      
      // Spread all original service data
      ...service,
      
      // Add service-specific metadata
      displayName: service.name || "Unknown Service",
      category: serviceType,
    };

    console.log("Passing navigation data:", navigationData);
    console.log("Service ID being passed:", serviceId);
    
    // Call the onPress callback with enhanced data
    onPress(navigationData);
  };

  const serviceInfo = getServiceInfo()
  const imageSource = service.images?.[0] || service.image || 
    `https://source.unsplash.com/random/300x200?${serviceType}`

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: imageSource }} 
        style={styles.image} 
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {service.name}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {serviceInfo.subtitle}
            </Text>
          </View>
          <Ionicons 
            name={getServiceIcon()} 
            size={24} 
            color="#666" 
            style={styles.icon}
          />
        </View>
        
        <View style={styles.details}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color="#888" />
            <Text style={styles.location} numberOfLines={1}>
              {service.location}
            </Text>
          </View>
          
          {serviceInfo.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.rating}>{serviceInfo.rating}</Text>
              {serviceInfo.extraInfo && (
                <Text style={styles.reviews}>({serviceInfo.extraInfo})</Text>
              )}
            </View>
          )}
        </View>

        {serviceInfo.price && (
          <Text style={styles.price}>{serviceInfo.price}</Text>
        )}

        {serviceInfo.extraInfo && !serviceInfo.rating && (
          <Text style={styles.extraInfo}>{serviceInfo.extraInfo}</Text>
        )}

        {/* Debug info (remove in production) */}
        {__DEV__ && (
          <Text style={styles.debugText}>
            ID: {service._id || service.id || 'No ID'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  icon: {
    marginTop: 2,
  },
  details: {
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: "#888",
    marginLeft: 4,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    color: "#333",
    marginLeft: 4,
    fontWeight: "600",
  },
  reviews: {
    fontSize: 12,
    color: "#888",
    marginLeft: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 4,
  },
  extraInfo: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
  },
  debugText: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
    fontFamily: "monospace",
  },
})

export default ServiceCard

// Example of how to use this component in a parent component:
/*
const handleServicePress = (serviceData) => {
  console.log("Service pressed with ID:", serviceData.id);
  console.log("Full service data:", serviceData);
  
  // Navigate to service detail screen with ID and data
  navigation.navigate('ServiceDetail', {
    serviceId: serviceData.id,
    service: serviceData,
    serviceType: serviceData.serviceType
  });
};

// Usage in JSX:
<ServiceCard 
  service={serviceItem}
  serviceType="restaurants"
  onPress={handleServicePress}
/>
*/

// Example of how the receiving screen should handle the params:
/*
// ServiceDetailScreen.js
import { useRoute } from '@react-navigation/native';

export default function ServiceDetailScreen() {
  const route = useRoute();
  const { serviceId, service, serviceType } = route.params || {};
  
  console.log("Received service ID:", serviceId);
  console.log("Received service data:", service);
  console.log("Service type:", serviceType);
  
  // Use the service data and ID in your component
  useEffect(() => {
    if (serviceId) {
      // Fetch additional details using the ID if needed
      fetchServiceDetails(serviceId);
    }
  }, [serviceId]);
  
  return (
    <View>
      <Text>Service: {service?.name}</Text>
      <Text>ID: {serviceId}</Text>
      // ... rest of your component
    </View>
  );
}
*/