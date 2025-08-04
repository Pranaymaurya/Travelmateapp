"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Modal, Button, RefreshControl } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../../App"
import { authApi } from '../../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const { setIsOnboarded, setUserId, setIsAdmin, setStoreAdminRequest } = useAuth();
  const [userData, setUserData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminRequestSent, setAdminRequestSent] = useState(false);
  const [adminRequestError, setAdminRequestError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showUserStats, setShowUserStats] = useState(false);

  const fetchUserData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await authApi.getCurrentUser()
      if (response.success && response.data && typeof response.data === 'object') {
        const user = (response.data as any).data ? (response.data as any).data : response.data;
        console.log(user)
        setUserData({
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email,
          phone: user.phoneNumber,
          location: user.location?.city || '',
          memberSince: user.createdAt ? new Date(user.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' }) : '',
          totalTrips: user.totalTrips || 0,
          totalSpent: user.totalSpent || 0,
          storeAdminRequest: user.storeAdminRequest || 'none',
          isAdmin: user.isAdmin || false,
          userId: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          age: user.age,
          fullUserData: user,
        })
      } else {
        setError(response.message || 'Failed to fetch user data')
      }
    } catch (err: any) {
      setError('Could not connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchUserData()
  }, [])

  const menuItems = [
    { 
      icon: "person-outline", 
      title: "Edit Profile", 
      action: () => {
        // TODO: Navigate to edit profile screen
        Alert.alert('Coming Soon', 'Edit profile functionality will be available soon!');
      },
      showForAll: true
    },
    { 
      icon: "bookmark-outline", 
      title: "Saved Trips", 
      action: () => {
        Alert.alert('Coming Soon', 'Saved trips functionality will be available soon!');
      },
      showForAll: true
    },
    { 
      icon: "card-outline", 
      title: "Payment Methods", 
      action: () => {
        Alert.alert('Coming Soon', 'Payment methods functionality will be available soon!');
      },
      showForAll: true
    },
    { 
      icon: "notifications-outline", 
      title: "Notifications", 
      action: () => {
        Alert.alert('Coming Soon', 'Notifications settings will be available soon!');
      },
      showForAll: true
    },
    { 
      icon: "help-circle-outline", 
      title: "Help & Support", 
      action: () => {
        Alert.alert('Help & Support', 'Contact us at support@travelmate.com for assistance.');
      },
      showForAll: true
    },
    { 
      icon: "settings-outline", 
      title: "Settings", 
      action: () => {
        Alert.alert('Coming Soon', 'Settings functionality will be available soon!');
      },
      showForAll: true
    },
    { 
      icon: "shield-checkmark-outline", 
      title: "Admin Dashboard", 
      action: () => {
        // This will be handled by the tab navigation
      },
      showForAll: false,
      showForAdmin: true
    },
  ]

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          try {
            await authApi.logout();
            await AsyncStorage.removeItem('token');
            setIsOnboarded(false);
            setUserId(null);
            setIsAdmin(false);
            setStoreAdminRequest(null);
          } catch (error) {
            console.error("Logout error:", error);
            setIsOnboarded(false);
            setUserId(null);
            setIsAdmin(false);
            setStoreAdminRequest(null);
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ])
  }

  // Handler for requesting admin
  const handleRequestAdmin = async () => {
    setAdminRequestError(null);
    try {
      const response = await authApi.requestStoreAdmin();
      if (response.success) {
        setAdminRequestSent(true);
        setTimeout(() => {
          setShowAdminModal(false);
          fetchUserData(); // Refresh user data to show updated status
        }, 1500);
      } else {
        setAdminRequestError(response.message || 'Failed to submit request');
      }
    } catch (err) {
      setAdminRequestError('Could not connect to the server.');
    }
  };

  const getStoreAdminStatusText = () => {
    switch (userData?.storeAdminRequest) {
      case 'pending':
        return 'Request Pending';
      case 'approved':
        return 'Store Admin';
      case 'rejected':
        return 'Request Rejected';
      default:
        return 'Regular User';
    }
  };

  const getStoreAdminStatusColor = () => {
    switch (userData?.storeAdminRequest) {
      case 'pending':
        return '#FFA500';
      case 'approved':
        return '#28a745';
      case 'rejected':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: '#667eea' }}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error || !userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#FF6B6B' }}>{error || 'No user data found.'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <LinearGradient colors={["#FF6B6B", "#4ECDC4"]} style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {userData.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </Text>
              </LinearGradient>
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={16} color="white" />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
            <Text style={styles.memberSince}>Member since {userData.memberSince}</Text>
            
            {/* User Status Badges */}
            <View style={styles.statusContainer}>
              {userData.isAdmin && (
                <View style={[styles.statusBadge, { backgroundColor: '#667eea' }]}>
                  <Ionicons name="shield-checkmark" size={12} color="white" />
                  <Text style={styles.statusBadgeText}>Admin</Text>
                </View>
              )}
              {userData.storeAdminRequest !== 'none' && (
                <View style={[styles.statusBadge, { backgroundColor: getStoreAdminStatusColor() }]}>
                  <Ionicons name="business" size={12} color="white" />
                  <Text style={styles.statusBadgeText}>{getStoreAdminStatusText()}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.totalTrips}</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>${userData.totalSpent}</Text>
              <Text style={styles.statLabel}>Spent</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <LinearGradient colors={["#FF6B35", "#F7931E"]} style={styles.quickActionGradient}>
              <Ionicons name="add" size={24} color="white" />
            </LinearGradient>
            <Text style={styles.quickActionText}>Plan Trip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton}>
            <LinearGradient colors={["#4ECDC4", "#44A08D"]} style={styles.quickActionGradient}>
              <Ionicons name="heart" size={24} color="white" />
            </LinearGradient>
            <Text style={styles.quickActionText}>Favorites</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton}>
            <LinearGradient colors={["#A8EDEA", "#FED6E3"]} style={styles.quickActionGradient}>
              <Ionicons name="share" size={24} color="white" />
            </LinearGradient>
            <Text style={styles.quickActionText}>Refer Friend</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => {
            // Show item based on user permissions
            if (!item.showForAll && !item.showForAdmin) return null;
            if (item.showForAdmin && !userData.isAdmin && userData.storeAdminRequest !== 'approved') return null;
            
            return (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={item.action}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name={item.icon as any} size={24} color="#667eea" />
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Store Admin Request Button - Only show if user is not already a store admin or main admin */}
        {userData && userData.storeAdminRequest === 'none' && !userData.isAdmin && (
          <TouchableOpacity style={styles.storeAdminButton} onPress={() => setShowAdminModal(true)}>
            <Ionicons name="business-outline" size={20} color="#667eea" />
            <Text style={styles.storeAdminButtonText}>Become a Store Admin</Text>
          </TouchableOpacity>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loggingOut}>
          <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
          <Text style={styles.logoutText}>{loggingOut ? 'Logging out...' : 'Logout'}</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>TravelMate v1.0.0</Text>
          <Text style={styles.appInfoText}>Made with ❤️ for travelers</Text>
        </View>
      </ScrollView>

      {/* Store Admin Request Modal */}
      <Modal
        visible={showAdminModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAdminModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {adminRequestSent ? (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
                <Text style={styles.successText}>Request Sent!</Text>
                <Text style={styles.successSubtext}>We'll review your application and get back to you soon.</Text>
              </View>
            ) : (
              <>
                <Ionicons name="business" size={48} color="#667eea" style={styles.modalIcon} />
                <Text style={styles.modalTitle}>Request Store Admin Access</Text>
                <Text style={styles.modalDescription}>
                  As a Store Admin, you'll be able to:
                </Text>
                <View style={styles.benefitsList}>
                  <View style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.benefitText}>Create and manage your own listings</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.benefitText}>Set your own pricing and availability</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.benefitText}>Earn money from bookings</Text>
                  </View>
                </View>
                {adminRequestError && <Text style={styles.errorText}>{adminRequestError}</Text>}
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.submitButton} onPress={handleRequestAdmin}>
                    <Text style={styles.submitButtonText}>Submit Request</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAdminModal(false)}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

// Keep all existing styles...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 5,
  },
  memberSince: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    paddingVertical: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  quickActionButton: {
    alignItems: "center",
  },
  quickActionGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  menuContainer: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
    fontWeight: "500",
  },
  storeAdminButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: "#667eea",
  },
  storeAdminButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#667eea",
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 18,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B6B",
    marginLeft: 10,
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: 30,
  },
  appInfoText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitsList: {
    width: '100%',
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 12,
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
})
