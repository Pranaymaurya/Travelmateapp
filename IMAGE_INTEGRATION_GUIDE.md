# TravelMate App Image Integration Guide

## Overview

This guide covers the complete image integration implementation in the TravelMate React Native app, including API updates, component enhancements, and usage examples.

## 🚀 **What's New**

### **Enhanced API Layer**
- **FormData Support**: All entity creation/update operations now support image uploads
- **Profile Image Support**: User registration and profile updates with image upload
- **Review Images**: Users can attach photos to their reviews
- **Comprehensive Image Management**: Full CRUD operations for images

### **Updated Components**
- **AdminScreen**: Enhanced with image upload functionality for entity management
- **ImageUpload Component**: Reusable component for image selection and upload
- **API Integration**: Seamless integration with backend image endpoints

## 📱 **API Updates**

### **Authentication API**
```typescript
// Registration with profile image
authApi.register(userData, profileImageUri?)

// Profile update with image
authApi.updateProfile(userData, profileImageUri?)

// Get current user (now includes profile image)
authApi.getCurrentUser()
```

### **Entity APIs with Image Support**
```typescript
// All entity APIs now support image uploads
tripApi.createTrip(tripData, images?, options?)
tripApi.updateTrip(id, tripData, images?, options?)

activityApi.create(activityData, images?, options?)
activityApi.update(id, activityData, images?, options?)

stayApi.create(stayData, images?, options?)
stayApi.update(id, stayData, images?, options?)

restaurantApi.create(restaurantData, images?, options?)
restaurantApi.update(id, restaurantData, images?, options?)

rentalApi.create(rentalData, images?, options?)
rentalApi.update(id, rentalData, images?, options?)

destinationsApi.create(destinationData, images?, options?)
destinationsApi.update(id, destinationData, images?, options?)
```

### **Review API with Images**
```typescript
// Create review with images
reviewApi.createReview(reviewData, images?, options?)

// Update review with images
reviewApi.updateReview(reviewId, reviewData, images?, options?)
```

### **Image API**
```typescript
// Direct image operations
imageApi.uploadSingle(imageUri, entityType, entityId, options?)
imageApi.uploadMultiple(imageUris, entityType, entityId, options?)
imageApi.getImage(imageId)
imageApi.getEntityImages(entityType, entityId)
imageApi.updateImage(imageId, data)
imageApi.deleteImage(imageId)
imageApi.getUserImages(userId)
```

## 🎨 **Component Updates**

### **ImageUpload Component**

A reusable component for image selection and upload:

```typescript
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
```

**Usage Example:**
```typescript
<ImageUpload
  entityType="trip"
  entityId="trip123"
  onImagesSelected={(images) => {
    console.log('Selected images:', images);
  }}
  onUploadSuccess={(uploadedImages) => {
    console.log('Uploaded images:', uploadedImages);
  }}
  onUploadError={(error) => {
    console.error('Upload error:', error);
  }}
  maxImages={5}
  allowMultiple={true}
  showPreview={true}
/>
```

### **AdminScreen Enhancements**

The AdminScreen now includes comprehensive image upload functionality:

- **Image Upload Section**: Available for both add and edit modes
- **Multiple Image Support**: Upload up to 5 images per entity
- **Image Preview**: See selected images before upload
- **Automatic Primary Image**: First image is set as primary
- **Error Handling**: Comprehensive error handling for upload failures

## 🔧 **Implementation Details**

### **FormData Helper Function**

The API layer includes a helper function for creating FormData:

```typescript
const createEntityFormData = (entityData: any, images?: string[], options?: {
  isPrimary?: boolean;
  tags?: string[];
  imageDescriptions?: string[];
}) => {
  const formData = new FormData();
  
  // Add entity data
  Object.keys(entityData).forEach(key => {
    if (entityData[key] !== undefined && entityData[key] !== null) {
      if (typeof entityData[key] === 'object') {
        formData.append(key, JSON.stringify(entityData[key]));
      } else {
        formData.append(key, entityData[key].toString());
      }
    }
  });
  
  // Add images
  if (images && images.length > 0) {
    images.forEach((imageUri, index) => {
      const filename = imageUri.split('/').pop() || `image${index}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('images', {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);
    });
  }
  
  // Add options
  if (options?.isPrimary) {
    formData.append('isPrimary', 'true');
  }
  if (options?.tags) {
    formData.append('tags', options.tags.join(','));
  }
  if (options?.imageDescriptions) {
    formData.append('imageDescriptions', options.imageDescriptions.join(','));
  }
  
  return formData;
};
```

### **Image Processing**

Images are automatically processed on the backend:
- **Resizing**: Optimized dimensions for storage
- **Compression**: JPEG quality 80 for optimal size/quality ratio
- **Base64 Encoding**: Stored directly in MongoDB
- **Metadata**: Preserves original filename, type, and size

## 📋 **Usage Examples**

### **Creating a Trip with Images**

```typescript
const createTripWithImages = async () => {
  const tripData = {
    title: "Amazing Beach Trip",
    price: 1000,
    duration: "7 days",
    category: "Beach",
    description: "Experience the perfect beach vacation"
  };

  const images = [
    "file:///path/to/image1.jpg",
    "file:///path/to/image2.jpg"
  ];

  const options = {
    tags: ["beach", "vacation"],
    imageDescriptions: ["Beach view", "Sunset"]
  };

  const response = await tripApi.createTrip(tripData, images, options);
  
  if (response.success) {
    console.log('Trip created with images:', response.data);
  }
};
```

### **Updating User Profile with Image**

```typescript
const updateProfileWithImage = async () => {
  const userData = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com"
  };

  const profileImageUri = "file:///path/to/profile.jpg";

  const response = await authApi.updateProfile(userData, profileImageUri);
  
  if (response.success) {
    console.log('Profile updated with image:', response.data);
  }
};
```

### **Adding Images to Existing Entity**

```typescript
const addImagesToEntity = async () => {
  const entityId = "entity123";
  const newImages = ["file:///path/to/new-image.jpg"];
  
  const options = {
    isPrimary: true,
    tags: ["new", "updated"],
    imageDescriptions: ["New photo"]
  };

  const response = await activityApi.update(entityId, {}, newImages, options);
  
  if (response.success) {
    console.log('Images added successfully');
  }
};
```

### **Creating Review with Images**

```typescript
const createReviewWithImages = async () => {
  const reviewData = {
    itemId: "trip123",
    itemType: "trip",
    rating: 5,
    comment: "Amazing experience!"
  };

  const images = ["file:///path/to/review-photo.jpg"];

  const response = await reviewApi.createReview(reviewData, images);
  
  if (response.success) {
    console.log('Review created with images');
  }
};
```

## 🎯 **Admin Panel Features**

### **Entity Management with Images**

1. **Add New Entity**:
   - Fill in entity details
   - Upload up to 5 images
   - Images are automatically processed and stored
   - First image becomes primary

2. **Edit Existing Entity**:
   - Modify entity details
   - Add new images to existing ones
   - Set new primary image if needed

3. **Image Management**:
   - Preview selected images
   - Remove unwanted images
   - Automatic image optimization

### **Image Upload Workflow**

1. **Select Images**: Choose from camera or photo library
2. **Preview**: See selected images before upload
3. **Upload**: Images are processed and stored automatically
4. **Integration**: Images are linked to the entity

## 🔒 **Security Features**

### **Authentication**
- All image upload operations require valid JWT tokens
- User authorization checks for entity ownership
- Admin override capabilities for management

### **File Validation**
- Only image files accepted (JPEG, PNG, GIF, etc.)
- File size limits enforced
- MIME type validation

### **Data Integrity**
- Automatic cleanup of orphaned images
- Cascade deletion when entities are removed
- Proper error handling and rollback

## 📊 **Performance Optimizations**

### **Image Processing**
- Automatic resizing to reduce storage requirements
- JPEG compression for optimal quality/size ratio
- Efficient base64 encoding

### **API Efficiency**
- FormData for efficient file uploads
- Proper error handling and retry logic
- Optimized request/response patterns

## 🚀 **Getting Started**

### **1. Install Dependencies**
```bash
cd TravelMateApp
npm install
```

### **2. Configure Backend**
Ensure your backend is running with the updated image endpoints:
- Image upload routes
- Entity routes with image support
- Authentication routes with profile image support

### **3. Update API Base URL**
In `src/api/index.ts`, update the `API_BASE_URL` to point to your backend:
```typescript
const API_BASE_URL = "http://your-backend-url:5000/api"
```

### **4. Test Image Upload**
Use the AdminScreen to test image upload functionality:
1. Navigate to Admin panel
2. Select an entity type
3. Click "Add New"
4. Fill in details and upload images
5. Submit the form

## 🔧 **Troubleshooting**

### **Common Issues**

1. **Image Upload Fails**:
   - Check network connectivity
   - Verify backend is running
   - Ensure proper authentication
   - Check file size limits

2. **Permission Errors**:
   - Grant camera/photo library permissions
   - Check device settings

3. **API Errors**:
   - Verify API base URL
   - Check authentication tokens
   - Review backend logs

### **Debug Tips**

1. **Console Logging**: Check browser/device console for errors
2. **Network Tab**: Monitor API requests in developer tools
3. **Backend Logs**: Review server logs for detailed error information

## 📈 **Future Enhancements**

### **Planned Features**
1. **Image CDN Integration**: Cloud storage for better performance
2. **Advanced Image Editing**: Cropping, filters, and effects
3. **Batch Operations**: Bulk image upload and processing
4. **Image Analytics**: Usage tracking and optimization

### **Performance Improvements**
1. **Lazy Loading**: Load images on demand
2. **Caching**: Implement image caching strategies
3. **Progressive Loading**: Show image placeholders while loading

## 📚 **Additional Resources**

- [Backend Image Integration Documentation](../MODEL_IMAGE_INTEGRATION.md)
- [API Reference Documentation](../README.md)
- [User Management Guide](./USER_MANAGEMENT.md)

## 🎉 **Conclusion**

The TravelMate app now provides comprehensive image functionality across all entities, with a user-friendly interface and robust backend integration. The implementation follows best practices for security, performance, and user experience.

For support or questions, refer to the documentation or contact the development team. 