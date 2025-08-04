import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { imageApi } from '../api';

interface ImageUploadProps {
  entityType: string;
  entityId: string;
  onImagesSelected?: (images: string[]) => void;
  onUploadSuccess?: (images: any[]) => void;
  onUploadError?: (error: string) => void;
  maxImages?: number;
  allowMultiple?: boolean;
  showPreview?: boolean;
  style?: any;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  entityType,
  entityId,
  onImagesSelected,
  onUploadSuccess,
  onUploadError,
  maxImages = 10,
  allowMultiple = true,
  showPreview = true,
  style,
}) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to upload images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImages = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: allowMultiple,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled) {
        const newImages = result.assets.map(asset => asset.uri);
        const totalImages = selectedImages.length + newImages.length;
        
        if (totalImages > maxImages) {
          Alert.alert(
            'Too Many Images',
            `You can only upload up to ${maxImages} images.`
          );
          return;
        }

        const updatedImages = [...selectedImages, ...newImages];
        setSelectedImages(updatedImages);
        onImagesSelected?.(updatedImages);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera permissions to take photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled) {
        const newImage = result.assets[0].uri;
        const totalImages = selectedImages.length + 1;
        
        if (totalImages > maxImages) {
          Alert.alert(
            'Too Many Images',
            `You can only upload up to ${maxImages} images.`
          );
          return;
        }

        const updatedImages = [...selectedImages, newImage];
        setSelectedImages(updatedImages);
        onImagesSelected?.(updatedImages);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
    onImagesSelected?.(updatedImages);
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('No Images', 'Please select at least one image to upload.');
      return;
    }

    setUploading(true);

    try {
      let result;
      if (selectedImages.length === 1) {
        result = await imageApi.uploadSingle(
          selectedImages[0],
          entityType,
          entityId,
          { isPrimary: true }
        );
      } else {
        result = await imageApi.uploadMultiple(
          selectedImages,
          entityType,
          entityId
        );
      }

      if (result.success) {
        const uploadedImagesData = Array.isArray(result.data) ? result.data : [result.data];
        setUploadedImages(prev => [...prev, ...uploadedImagesData]);
        setSelectedImages([]);
        onUploadSuccess?.(uploadedImagesData);
        Alert.alert('Success', 'Images uploaded successfully!');
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || 'Failed to upload images';
      onUploadError?.(errorMessage);
      Alert.alert('Upload Error', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const showImageSourceOptions = () => {
    Alert.alert(
      'Add Images',
      'Choose how you want to add images',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImages },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Images</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={showImageSourceOptions}
          disabled={uploading}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Selected Images Preview */}
      {showPreview && selectedImages.length > 0 && (
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>Selected Images ({selectedImages.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.imageRow}>
              {selectedImages.map((uri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
          
          <TouchableOpacity
            style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
            onPress={uploadImages}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="cloud-upload" size={20} color="#fff" />
            )}
            <Text style={styles.uploadButtonText}>
              {uploading ? 'Uploading...' : 'Upload Images'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <View style={styles.uploadedSection}>
          <Text style={styles.sectionTitle}>Uploaded Images ({uploadedImages.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.imageRow}>
              {uploadedImages.map((image, index) => (
                <View key={image._id || index} style={styles.imageContainer}>
                  <Image 
                    source={{ uri: imageApi.getImage(image._id) }} 
                    style={styles.previewImage} 
                  />
                  {image.isPrimary && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryText}>Primary</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Upload Progress */}
      {uploading && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.progressText}>Uploading images...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  previewSection: {
    marginBottom: 16,
  },
  uploadedSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 12,
  },
  imageRow: {
    flexDirection: 'row',
    gap: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  primaryBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#667eea',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 12,
  },
  uploadButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  progressText: {
    marginTop: 8,
    color: '#667eea',
    fontWeight: '500',
  },
});

export default ImageUpload; 