"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  Dimensions,
  StatusBar,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import { Ionicons } from "@expo/vector-icons"
import { Picker } from "@react-native-picker/picker"
import { rentalApi, restaurantApi, stayApi, tripApiWithGetAll, activityApi, destinationsApi, authApi, imageApi } from "../../api"
import { useAuth } from "../../../App"
import ImageUpload from "../../components/ImageUpload"

const { width } = Dimensions.get("window")

const ENTITY_TYPES = [
  { key: "rentals", label: "Rentals", api: rentalApi, icon: "car-outline" },
  { key: "restaurants", label: "Restaurants", api: restaurantApi, icon: "restaurant-outline" },
  { key: "stays", label: "Stays", api: stayApi, icon: "bed-outline" },
  { key: "trips", label: "Trips", api: tripApiWithGetAll, icon: "airplane-outline" },
  { key: "activities", label: "Activities", api: activityApi, icon: "bicycle-outline" },
]

// Enhanced field configuration
const ENTITY_FIELDS: Record<
  string,
  {
    key: string
    label: string
    type: string
    required?: boolean
    multiline?: boolean
    isArray?: boolean
    isGroup?: boolean
    groupFields?: any[]
    icon?: string
  }[]
> = {
  rentals: [
    { key: "type", label: "Type", type: "text", required: true, icon: "pricetag-outline" },
    { key: "name", label: "Name", type: "text", required: true, icon: "text-outline" },
    { key: "brand", label: "Brand", type: "text", icon: "business-outline" },
    { key: "model", label: "Model", type: "text", icon: "car-outline" },
    { key: "location", label: "Location", type: "text", icon: "location-outline" },
    { key: "destination", label: "Destination ID", type: "text", icon: "map-outline" },
    { key: "pricing.perHour", label: "Price Per Hour", type: "number", icon: "cash-outline" },
    { key: "pricing.perDay", label: "Price Per Day", type: "number", icon: "card-outline" },
    { key: "availability.from", label: "Available From (YYYY-MM-DD)", type: "text", icon: "calendar-outline" },
    { key: "availability.to", label: "Available To (YYYY-MM-DD)", type: "text", icon: "calendar-outline" },
    { key: "images", label: "Images (comma-separated URLs)", type: "text", isArray: true, icon: "images-outline" },
    { key: "features", label: "Features (comma-separated)", type: "text", isArray: true, icon: "list-outline" },
    { key: "description", label: "Description", type: "text", multiline: true, icon: "document-text-outline" },
  ],
  activities: [
    { key: "name", label: "Name", type: "text", required: true, icon: "text-outline" },
    { key: "type", label: "Type", type: "text", required: true, icon: "pricetag-outline" },
    { key: "location", label: "Location", type: "text", icon: "location-outline" },
    { key: "destination", label: "Destination ID", type: "text", icon: "map-outline" },
    { key: "description", label: "Description", type: "text", multiline: true, icon: "document-text-outline" },
    { key: "difficulty", label: "Difficulty", type: "text", icon: "fitness-outline" },
    { key: "cost", label: "Cost", type: "number", icon: "cash-outline" },
    { key: "images", label: "Images (comma-separated URLs)", type: "text", isArray: true, icon: "images-outline" },
    {
      key: "availableDates",
      label: "Available Dates (comma-separated YYYY-MM-DD)",
      type: "text",
      isArray: true,
      icon: "calendar-outline",
    },
    { key: "safetyInfo", label: "Safety Info", type: "text", multiline: true, icon: "shield-outline" },
  ],
  stays: [
    { key: "name", label: "Name", type: "text", required: true, icon: "text-outline" },
    { key: "type", label: "Type", type: "text", required: true, icon: "pricetag-outline" },
    { key: "location", label: "Location", type: "text", icon: "location-outline" },
    { key: "destination", label: "Destination ID", type: "text", icon: "map-outline" },
    { key: "description", label: "Description", type: "text", multiline: true, icon: "document-text-outline" },
    { key: "amenities", label: "Amenities (comma-separated)", type: "text", isArray: true, icon: "list-outline" },
    { key: "images", label: "Images (comma-separated URLs)", type: "text", isArray: true, icon: "images-outline" },
    { key: "policies", label: "Policies", type: "text", multiline: true, icon: "document-outline" },
    { key: "availability.from", label: "Available From (YYYY-MM-DD)", type: "text", icon: "calendar-outline" },
    { key: "availability.to", label: "Available To (YYYY-MM-DD)", type: "text", icon: "calendar-outline" },
    { key: "pricing.perNight", label: "Price Per Night", type: "number", icon: "cash-outline" },
  ],
  restaurants: [
    { key: "name", label: "Name", type: "text", required: true, icon: "text-outline" },
    { key: "location", label: "Location", type: "text", required: true, icon: "location-outline" },
    { key: "cuisines", label: "Cuisines (comma-separated)", type: "text", isArray: true, icon: "restaurant-outline" },
    { key: "menu", label: "Menu (name:price, comma-separated)", type: "text", icon: "list-outline" },
    { key: "images", label: "Images (comma-separated URLs)", type: "text", isArray: true, icon: "images-outline" },
    { key: "description", label: "Description", type: "text", multiline: true, icon: "document-text-outline" },
    { key: "openingHours", label: "Opening Hours", type: "text", icon: "time-outline" },
    { key: "averageCost", label: "Average Cost", type: "number", icon: "cash-outline" },
    { key: "contactInfo.phone", label: "Contact Phone", type: "text", icon: "call-outline" },
    { key: "contactInfo.email", label: "Contact Email", type: "text", icon: "mail-outline" },
    { key: "contactInfo.address", label: "Contact Address", type: "text", icon: "location-outline" },
    { key: "destination", label: "Destination ID", type: "text", icon: "map-outline" },
  ],
  trips: [{ key: "title", label: "Title", type: "text", required: true, icon: "text-outline" }],
}

const AdminScreen = () => {
  const { userId, isAdmin, storeAdminRequest } = useAuth()
  const [selectedTab, setSelectedTab] = useState<"entities" | "users" | "requests">("entities")
  const [selected, setSelected] = useState("rentals")
  const [items, setItems] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [adminRequests, setAdminRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [currentItem, setCurrentItem] = useState<any>(null)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [formFields, setFormFields] = useState<{ [key: string]: string }>({})
  const [destinations, setDestinations] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const fetchItems = async () => {
    setLoading(true)
    setError(null)
    setItems([])
    try {
      const entity = ENTITY_TYPES.find((e) => e.key === selected)
      if (!entity) return

      const api = entity.api
      const response = await api.getAll()

      if (response.success && response.data) {
        let data: any[] = []
        if (selected === "trips") {
          if (Array.isArray(response.data)) {
            data = response.data
          } else if (
            response.data &&
            typeof response.data === "object" &&
            Array.isArray((response.data as any).trips)
          ) {
            data = (response.data as any).trips
          } else {
            data = []
          }
        } else {
          data = Array.isArray(response.data) ? response.data : []
        }

        // Only show own items for store admins
        if (!isAdmin) {
          data = data.filter((item) => item.owner === userId)
        }

        setItems(data)
      } else {
        setError(response.message || "Failed to fetch data")
      }
    } catch (err: any) {
      setError("Could not connect to the server.")
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    if (!isAdmin) return
    try {
      const response = await authApi.getAllUsers()
      if (response.success && response.data) {
        setUsers(Array.isArray(response.data) ? response.data : [])
      }
    } catch (err: any) {
      console.error("Error fetching users:", err)
    }
  }

  const fetchAdminRequests = async () => {
    if (!isAdmin) return
    try {
      const response = await authApi.getAdminRequests()
      if (response.success && response.data) {
        setAdminRequests(Array.isArray(response.data) ? response.data : [])
      }
    } catch (err: any) {
      console.error("Error fetching admin requests:", err)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchItems(), fetchUsers(), fetchAdminRequests()])
    setRefreshing(false)
  }

  useEffect(() => {
    fetchItems()
    fetchUsers()
    fetchAdminRequests()

    // Fetch destinations for dropdown
    const fetchDestinations = async () => {
      const response = await destinationsApi.getAll()
      if (response.success && Array.isArray(response.data)) {
        setDestinations(response.data)
      } else if (
        response.success &&
        response.data &&
        typeof (response.data as any) === "object" &&
        Array.isArray((response.data as any).data)
      ) {
        setDestinations((response.data as any).data)
      }
    }
    fetchDestinations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, selectedTab])

  const handleDelete = (itemId: string) => {
    Alert.alert("Delete", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const entity = ENTITY_TYPES.find((e) => e.key === selected)
            if (!entity) return

            const api = entity.api
            setLoading(true)
            setError(null)
            const response = await api.delete(itemId)

            if (response.success) {
              fetchItems()
            } else {
              setError(response.message || "Failed to delete item")
            }
          } catch (err: any) {
            setError("Could not connect to the server.")
          } finally {
            setLoading(false)
          }
        },
      },
    ])
  }

  const handleApproveStoreAdmin = async (userId: string) => {
    try {
      const response = await authApi.approveStoreAdmin(userId)
      if (response.success) {
        Alert.alert("Success", "Store admin request approved")
        fetchAdminRequests()
        fetchUsers()
      } else {
        Alert.alert("Error", response.message || "Failed to approve request")
      }
    } catch (err: any) {
      Alert.alert("Error", "Could not connect to the server")
    }
  }

  const handleRejectStoreAdmin = async (userId: string) => {
    try {
      const response = await authApi.rejectStoreAdmin(userId)
      if (response.success) {
        Alert.alert("Success", "Store admin request rejected")
        fetchAdminRequests()
        fetchUsers()
      } else {
        Alert.alert("Error", response.message || "Failed to reject request")
      }
    } catch (err: any) {
      Alert.alert("Error", "Could not connect to the server")
    }
  }

  const openAddModal = () => {
    setModalMode("add")
    setCurrentItem(null)
    setFormFields({})
    setModalVisible(true)
  }

  const openEditModal = (item: any) => {
    setModalMode("edit")
    setCurrentItem(item)
    const fields = ENTITY_FIELDS[selected]?.reduce(
      (acc, field) => {
        acc[field.key] = item[field.key] || ""
        return acc
      },
      {} as { [key: string]: string },
    )
    setFormFields(fields || {})
    setModalVisible(true)
  }

  const closeModal = () => {
    setModalVisible(false)
    setFormFields({})
    setCurrentItem(null)
    setSelectedImages([])
    setSubmitError(null)
    setSubmitSuccess(null)
  }

  const handleFieldChange = (key: string, value: string) => {
    setFormFields((prev) => ({ ...prev, [key]: value }))
  }

  const parseFormFields = (fields: any, values: any) => {
    const result: any = {}
    for (const field of fields) {
      let value = values[field.key]
      if (field.isArray && typeof value === "string") {
        value = value
          .split(",")
          .map((v: string) => v.trim())
          .filter((v: string) => v)
      }
      if (field.key.includes(".")) {
        // Nested field (e.g., pricing.perHour)
        const [parent, child] = field.key.split(".")
        if (!result[parent]) result[parent] = {}
        result[parent][child] = value
      } else if (field.key === "menu" && typeof value === "string") {
        // Special: menu (name:price, comma-separated)
        result.menu = value
          .split(",")
          .map((item: string) => {
            const [name, price] = item.split(":")
            return { name: name?.trim() || "", price: price ? Number(price.trim()) : undefined }
          })
          .filter((item: any) => item.name)
      } else {
        result[field.key] = value
      }
    }
    return result
  }

  const handleSubmit = async () => {
    setSubmitLoading(true)
    setSubmitError(null)
    setSubmitSuccess(null)

    try {
      const entity = ENTITY_TYPES.find((e) => e.key === selected)
      if (!entity) return

      const api = entity.api
      const fields = ENTITY_FIELDS[selected]

      // Validate required fields
      for (const field of fields) {
        if (field.required && !formFields[field.key]) {
          setSubmitError(`${field.label} is required.`)
          setSubmitLoading(false)
          return
        }
      }

      const payload: any = parseFormFields(fields, formFields)

      if (modalMode === "add") {
        if (!isAdmin && storeAdminRequest !== "approved") {
          setSubmitError("Not authorized to create this item.")
          setSubmitLoading(false)
          return
        }
        
        // Create with images if available
        const response = await api.create(payload, selectedImages.length > 0 ? selectedImages : undefined, {
          tags: ['admin-created'],
          imageDescriptions: selectedImages.map((_, index) => `Image ${index + 1}`)
        })
        
        if (response.success) {
          setSubmitSuccess("Created successfully!")
          setTimeout(() => {
            closeModal()
            fetchItems()
          }, 1500)
        } else {
          setSubmitError(response.message || "Failed to create item")
        }
      } else if (modalMode === "edit" && currentItem) {
        if (!isAdmin && currentItem.owner !== userId) {
          setSubmitError("Not authorized to edit this item.")
          setSubmitLoading(false)
          return
        }
        if (typeof (api as any).update === "function") {
          const response = await (api as any).update(currentItem._id, payload, selectedImages.length > 0 ? selectedImages : undefined, {
            tags: ['admin-updated'],
            imageDescriptions: selectedImages.map((_, index) => `Updated Image ${index + 1}`)
          })
          if (response.success) {
            setSubmitSuccess("Updated successfully!")
            setTimeout(() => {
              closeModal()
              fetchItems()
            }, 1500)
          } else {
            setSubmitError(response.message || "Failed to update item")
          }
        } else {
          setSubmitError("Update not supported for this entity.")
        }
      }
    } catch (err: any) {
      setSubmitError("Could not connect to the server.")
    } finally {
      setSubmitLoading(false)
    }
  }

  const renderTabButton = (tab: "entities" | "users" | "requests", icon: string, label: string) => (
    <TouchableOpacity
      style={[styles.tabButton, selectedTab === tab && styles.tabButtonActive]}
      onPress={() => setSelectedTab(tab)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={selectedTab === tab ? ["#667eea", "#764ba2"] : ["transparent", "transparent"]}
        style={styles.tabButtonGradient}
      >
        <Ionicons name={icon as any} size={22} color={selectedTab === tab ? "#fff" : "#8e8e93"} />
        <Text style={[styles.tabButtonText, selectedTab === tab && styles.tabButtonTextActive]}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  )

  const renderEntityCard = ({ item }: { item: any }) => (
    <View style={styles.entityCard}>
      <LinearGradient colors={["#ffffff", "#f8f9ff"]} style={styles.cardGradient}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Ionicons name="cube-outline" size={24} color="#667eea" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.name || item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.type || "Item"}</Text>
          </View>
          <View style={styles.ownerBadge}>
            <Text style={styles.ownerText}>{item.owner === userId ? "Mine" : "Other"}</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          {(isAdmin || item.owner === userId) && (
            <>
              <TouchableOpacity style={styles.editActionButton} onPress={() => openEditModal(item)} activeOpacity={0.7}>
                <Ionicons name="create-outline" size={18} color="#667eea" />
                <Text style={styles.editActionText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteActionButton}
                onPress={() => handleDelete(item._id)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
                <Text style={styles.deleteActionText}>Delete</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </LinearGradient>
    </View>
  )

  const renderUserCard = (user: any) => (
    <View key={user._id} style={styles.userCard}>
      <LinearGradient colors={["#ffffff", "#f8f9ff"]} style={styles.cardGradient}>
        <View style={styles.userCardHeader}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userPhone}>{user.phoneNumber}</Text>
          </View>
        </View>

        <View style={styles.userBadges}>
          <View style={[styles.statusBadge, user.isAdmin && styles.adminBadge]}>
            <Ionicons
              name={user.isAdmin ? "shield-checkmark" : "person"}
              size={14}
              color={user.isAdmin ? "#fff" : "#667eea"}
            />
            <Text style={[styles.statusText, user.isAdmin && styles.adminText]}>{user.isAdmin ? "Admin" : "User"}</Text>
          </View>

          {user.storeAdminRequest !== "none" && (
            <View style={[styles.statusBadge, styles.storeAdminBadge]}>
              <Ionicons name="storefront" size={14} color="#fff" />
              <Text style={styles.storeAdminText}>{user.storeAdminRequest}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  )

  const renderRequestCard = (request: any) => (
    <View key={request._id} style={styles.requestCard}>
      <LinearGradient colors={["#ffffff", "#fff8f0"]} style={styles.cardGradient}>
        <View style={styles.requestHeader}>
          <View style={styles.requestIcon}>
            <Ionicons name="time-outline" size={24} color="#ff9500" />
          </View>
          <View style={styles.requestInfo}>
            <Text style={styles.requestName}>
              {request.firstName} {request.lastName}
            </Text>
            <Text style={styles.requestEmail}>{request.email}</Text>
            <Text style={styles.requestPhone}>{request.phoneNumber}</Text>
            <Text style={styles.requestDate}>{new Date(request.updatedAt).toLocaleDateString()}</Text>
          </View>
        </View>

        {isAdmin && request.storeAdminRequest === "pending" && (
          <View style={styles.requestActions}>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => handleApproveStoreAdmin(request._id)}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => handleRejectStoreAdmin(request._id)}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle" size={18} color="#fff" />
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </View>
  )

  const renderEntitiesTab = () => (
    <View style={styles.tabContent}>
      {/* Entity Type Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.entitySelector}
        contentContainerStyle={styles.entitySelectorContent}
      >
        {ENTITY_TYPES.map((entity) => (
          <TouchableOpacity
            key={entity.key}
            style={[styles.entityChip, selected === entity.key && styles.entityChipSelected]}
            onPress={() => setSelected(entity.key)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={selected === entity.key ? ["#667eea", "#764ba2"] : ["#f8f9fa", "#f8f9fa"]}
              style={styles.entityChipGradient}
            >
              <Ionicons name={entity.icon as any} size={20} color={selected === entity.key ? "#fff" : "#667eea"} />
              <Text style={[styles.entityChipText, selected === entity.key && styles.entityChipTextSelected]}>
                {entity.label}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <View style={styles.contentContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{ENTITY_TYPES.find((e) => e.key === selected)?.label}</Text>
          <Text style={styles.itemCount}>{items.length} items</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item._id || item.id || Math.random().toString()}
            renderItem={renderEntityCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="cube-outline" size={64} color="#c7c7cc" />
                <Text style={styles.emptyText}>No items found</Text>
                <Text style={styles.emptySubtext}>Add your first item to get started</Text>
              </View>
            }
          />
        )}

        {/* Floating Add Button */}
        {(isAdmin || storeAdminRequest === "approved") && (
          <TouchableOpacity style={styles.floatingAddButton} onPress={openAddModal} activeOpacity={0.8}>
            <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.floatingButtonGradient}>
              <Ionicons name="add" size={28} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  const renderUsersTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.contentContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>User Management</Text>
          <Text style={styles.itemCount}>{users.length} users</Text>
        </View>

        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {users.map(renderUserCard)}
        </ScrollView>
      </View>
    </View>
  )

  const renderRequestsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.contentContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Store Admin Requests</Text>
          <Text style={styles.itemCount}>{adminRequests.length} pending</Text>
        </View>

        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {adminRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={64} color="#c7c7cc" />
              <Text style={styles.emptyText}>No pending requests</Text>
              <Text style={styles.emptySubtext}>All requests have been processed</Text>
            </View>
          ) : (
            adminRequests.map(renderRequestCard)
          )}
        </ScrollView>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      {/* Header */}
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Manage your business</Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {renderTabButton("entities", "grid-outline", "Entities")}
        {isAdmin && renderTabButton("users", "people-outline", "Users")}
        {isAdmin && renderTabButton("requests", "clipboard-outline", "Requests")}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {selectedTab === "entities" && renderEntitiesTab()}
        {selectedTab === "users" && renderUsersTab()}
        {selectedTab === "requests" && renderRequestsTab()}
      </View>

      {/* Enhanced Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={closeModal}>
        <BlurView intensity={20} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient colors={["#ffffff", "#f8f9ff"]} style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name={modalMode === "add" ? "add-circle" : "create"} size={32} color="#667eea" />
                </View>
                <Text style={styles.modalTitle}>
                  {modalMode === "add" ? "Add New" : "Edit"}{" "}
                  {ENTITY_TYPES.find((e) => e.key === selected)?.label.slice(0, -1)}
                </Text>
                <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
                  <Ionicons name="close" size={24} color="#8e8e93" />
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                {ENTITY_FIELDS[selected]?.map((field) => {
                  if (field.key === "destination") {
                    return (
                      <View key={field.key} style={styles.inputContainer}>
                        <View style={styles.inputLabel}>
                          <Ionicons name={(field.icon as any) || "map-outline"} size={18} color="#667eea" />
                          <Text style={styles.inputLabelText}>{field.label}</Text>
                          {field.required && <Text style={styles.requiredStar}>*</Text>}
                        </View>
                        <View style={styles.pickerContainer}>
                          <Picker
                            selectedValue={formFields["destination"] || ""}
                            onValueChange={(value) => handleFieldChange("destination", value)}
                            style={styles.picker}
                          >
                            <Picker.Item label="Select Destination" value="" />
                            {destinations.map((dest) => (
                              <Picker.Item
                                key={dest._id}
                                label={`${dest.name} (${dest.city || dest.country})`}
                                value={dest._id}
                              />
                            ))}
                          </Picker>
                        </View>
                      </View>
                    )
                  }

                  return (
                    <View key={field.key} style={styles.inputContainer}>
                      <View style={styles.inputLabel}>
                        <Ionicons name={(field.icon as any) || "text-outline"} size={18} color="#667eea" />
                        <Text style={styles.inputLabelText}>{field.label}</Text>
                        {field.required && <Text style={styles.requiredStar}>*</Text>}
                      </View>
                      <TextInput
                        style={[styles.input, field.multiline && styles.textArea]}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        value={formFields[field.key] || ""}
                        onChangeText={(value) => handleFieldChange(field.key, value)}
                        keyboardType={field.type === "number" ? "numeric" : "default"}
                        multiline={!!field.multiline}
                        numberOfLines={field.multiline ? 4 : 1}
                      />
                    </View>
                  )
                })}
                
                {/* Image Upload Section */}
                <View style={styles.imageUploadSection}>
                  <Text style={styles.sectionTitle}>Images</Text>
                  <Text style={styles.sectionSubtitle}>
                    Upload images for this {selected.slice(0, -1)}. The first image will be set as primary.
                  </Text>
                  <ImageUpload
                    entityType={selected.slice(0, -1)}
                    entityId="temp"
                    onImagesSelected={(images) => {
                      setSelectedImages(images);
                    }}
                    onUploadSuccess={(images) => {
                      console.log('Images uploaded:', images);
                    }}
                    onUploadError={(error) => {
                      console.error('Image upload error:', error);
                      setSubmitError('Failed to upload images: ' + error);
                    }}
                    maxImages={5}
                    allowMultiple={true}
                    showPreview={true}
                    style={styles.imageUploadContainer}
                  />
                </View>
              </ScrollView>

              {/* Status Messages */}
              {submitError && (
                <View style={styles.statusMessage}>
                  <Ionicons name="alert-circle" size={20} color="#ff6b6b" />
                  <Text style={styles.errorMessage}>{submitError}</Text>
                </View>
              )}

              {submitSuccess && (
                <View style={[styles.statusMessage, styles.successMessage]}>
                  <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
                  <Text style={styles.successText}>{submitSuccess}</Text>
                </View>
              )}

              {/* Modal Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeModal}
                  disabled={submitLoading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={submitLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.submitButtonGradient}>
                    {submitLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name={modalMode === "add" ? "add" : "save"} size={18} color="#fff" />
                        <Text style={styles.submitButtonText}>{modalMode === "add" ? "Create" : "Update"}</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </BlurView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f7",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  tabNavigation: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  tabButtonActive: {},
  tabButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  tabButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#8e8e93",
  },
  tabButtonTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
    marginTop: 8,
  },
  tabContent: {
    flex: 1,
  },
  entitySelector: {
    marginBottom: 16,
  },
  entitySelectorContent: {
    paddingHorizontal: 20,
  },
  entityChip: {
    marginRight: 12,
  },
  entityChipSelected: {},
  entityChipGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  entityChipText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#667eea",
  },
  entityChipTextSelected: {
    color: "#fff",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1c1c1e",
  },
  itemCount: {
    fontSize: 14,
    color: "#8e8e93",
    backgroundColor: "#f2f2f7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#8e8e93",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#ff6b6b",
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "600",
    color: "#8e8e93",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#c7c7cc",
    textAlign: "center",
  },
  entityCard: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1c1c1e",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#8e8e93",
  },
  ownerBadge: {
    backgroundColor: "#e8f4fd",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ownerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007aff",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  editActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f4ff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  editActionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#667eea",
  },
  deleteActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffe8e8",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  deleteActionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#ff6b6b",
  },
  userCard: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1c1c1e",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#8e8e93",
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: "#8e8e93",
  },
  userBadges: {
    flexDirection: "row",
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f4ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#667eea",
  },
  adminBadge: {
    backgroundColor: "#667eea",
  },
  adminText: {
    color: "#fff",
  },
  storeAdminBadge: {
    backgroundColor: "#4caf50",
  },
  storeAdminText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  requestCard: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  requestIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff5e6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1c1c1e",
    marginBottom: 4,
  },
  requestEmail: {
    fontSize: 14,
    color: "#8e8e93",
    marginBottom: 2,
  },
  requestPhone: {
    fontSize: 14,
    color: "#8e8e93",
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: "#c7c7cc",
  },
  requestActions: {
    flexDirection: "row",
    gap: 12,
  },
  approveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4caf50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
  },
  approveButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  rejectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
  },
  rejectButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  scrollContent: {
    flex: 1,
  },
  floatingAddButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: width - 32,
    maxHeight: "80%",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#1c1c1e",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f2f2f7",
    justifyContent: "center",
    alignItems: "center",
  },
  modalForm: {
    maxHeight: 300,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  inputLabelText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#1c1c1e",
  },
  requiredStar: {
    marginLeft: 4,
    fontSize: 16,
    color: "#ff6b6b",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e5ea",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#1c1c1e",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e5e5ea",
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
  },
  statusMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffe8e8",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  successMessage: {
    backgroundColor: "#e8f5e8",
  },
  errorMessage: {
    marginLeft: 8,
    fontSize: 14,
    color: "#ff6b6b",
  },
  successText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#4caf50",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f2f2f7",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8e8e93",
  },
  submitButton: {
    flex: 1,
    borderRadius: 12,
  },
  submitButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  imageUploadSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  imageUploadContainer: {
    marginTop: 8,
  },
})

export default AdminScreen
