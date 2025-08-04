import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { tripApi } from '../../api';
import { COLORS } from '../../constants/colors';

interface Trip {
  _id: string;
  title: string;
  location: string;
  duration: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  image: string;
  gradient: string[];
  category: string;
  subCategories: string[];
  difficulty: string;
  highlights: string[];
}

export default function CategoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { category } = route.params as { category: string };
  
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('All');

  const difficulties = ['All', 'Easy', 'Moderate', 'Challenging', 'Expert'];
  const priceRanges = [
    { label: 'All', min: 0, max: 999999 },
    { label: 'Budget ($0-$500)', min: 0, max: 500 },
    { label: 'Mid-Range ($500-$1500)', min: 500, max: 1500 },
    { label: 'Luxury ($1500+)', min: 1500, max: 999999 },
  ];

  const categoryIcons: { [key: string]: string } = {
    'Adventure': 'trending-up',
    'Cultural': 'library',
    'Relaxation': 'leaf',
    'Business': 'briefcase',
    'Honeymoon': 'heart',
    'Family': 'people',
    'Solo': 'person',
    'Group': 'people-circle',
    'Luxury': 'diamond',
    'Budget': 'wallet'
  };

  useEffect(() => {
    fetchTrips();
  }, [category, selectedDifficulty, selectedPriceRange]);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (selectedDifficulty === 'All' && selectedPriceRange === 'All') {
        // Fetch by category only
        response = await tripApi.getTripsByCategory(category);
      } else {
        // Apply filters
        const filters: any = { category };
        
        if (selectedDifficulty !== 'All') {
          filters.difficulty = selectedDifficulty;
        }
        
        if (selectedPriceRange !== 'All') {
          const range = priceRanges.find(r => r.label === selectedPriceRange);
          if (range) {
            filters.minPrice = range.min;
            filters.maxPrice = range.max;
          }
        }
        
        response = await tripApi.getTripsWithFilters(filters);
      }

      if (response.success && response.data) {
        setTrips(response.data);
      } else {
        setError(response.message || 'Failed to fetch trips');
        setTrips([]);
      }
    } catch (err: any) {
      console.error('Error fetching trips:', err);
      setError('Network error. Please try again.');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTripPress = (trip: Trip) => {
    navigation.navigate('TripDetails' as never, { trip } as never);
  };

  const renderTripCard = (trip: Trip) => (
    <TouchableOpacity
      key={trip._id}
      style={styles.tripCard}
      onPress={() => handleTripPress(trip)}
    >
      <ImageBackground
        source={{ uri: trip.image || 'https://source.unsplash.com/random/400x300?travel' }}
        style={styles.tripImage}
        imageStyle={styles.tripImageStyle}
      >
        <LinearGradient
          colors={trip.gradient && trip.gradient.length >= 2 ? trip.gradient : ['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.tripGradient}
        />
        
        {trip.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{trip.discount}%</Text>
          </View>
        )}
        
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{trip.difficulty}</Text>
        </View>
        
        <View style={styles.tripContent}>
          <Text style={styles.tripTitle}>{trip.title}</Text>
          <Text style={styles.tripLocation}>{trip.location}</Text>
          <Text style={styles.tripDuration}>{trip.duration}</Text>
          
          <View style={styles.tripFooter}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{trip.rating}</Text>
            </View>
            
            <View style={styles.priceContainer}>
              {trip.originalPrice && trip.originalPrice > trip.price && (
                <Text style={styles.originalPrice}>${trip.originalPrice}</Text>
              )}
              <Text style={styles.price}>${trip.price}</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{category} Trips</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading {category} trips...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons 
            name={categoryIcons[category] as any} 
            size={24} 
            color={COLORS.PRIMARY} 
          />
          <Text style={styles.headerTitle}>{category} Trips</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="filter" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        {/* Filters */}
        <View style={styles.filtersContainer}>
          <Text style={styles.filterTitle}>Difficulty:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {difficulties.map((difficulty) => (
              <TouchableOpacity
                key={difficulty}
                style={[
                  styles.filterChip,
                  selectedDifficulty === difficulty && styles.selectedFilterChip
                ]}
                onPress={() => setSelectedDifficulty(difficulty)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedDifficulty === difficulty && styles.selectedFilterChipText
                ]}>
                  {difficulty}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.filterTitle}>Price Range:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {priceRanges.map((range) => (
              <TouchableOpacity
                key={range.label}
                style={[
                  styles.filterChip,
                  selectedPriceRange === range.label && styles.selectedFilterChip
                ]}
                onPress={() => setSelectedPriceRange(range.label)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedPriceRange === range.label && styles.selectedFilterChipText
                ]}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Results */}
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>
            {trips.length} {category} trip{trips.length !== 1 ? 's' : ''} found
          </Text>
          
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchTrips}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : trips.length > 0 ? (
            <View style={styles.tripsGrid}>
              {trips.map(renderTripCard)}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No trips found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your filters or check back later for new {category.toLowerCase()} trips.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  filtersContainer: {
    padding: 20,
    backgroundColor: 'white',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 10,
    marginTop: 15,
  },
  filterChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.PRIMARY,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  selectedFilterChipText: {
    color: 'white',
  },
  resultsContainer: {
    padding: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 20,
  },
  tripsGrid: {
    gap: 15,
  },
  tripCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tripImage: {
    height: 200,
    width: '100%',
  },
  tripImageStyle: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  tripGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  difficultyBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  tripContent: {
    padding: 15,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 5,
  },
  tripLocation: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 5,
  },
  tripDuration: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 10,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ratingText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginTop: 15,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
  },
});
