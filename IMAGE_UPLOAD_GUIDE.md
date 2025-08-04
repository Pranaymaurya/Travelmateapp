# TravelMate Image Upload System

## Overview

The TravelMate app implements a comprehensive image upload system using Multer for handling file uploads and storing images directly in MongoDB as base64 encoded data. This system provides secure, efficient image management for all travel-related content.

## Features

### 🖼️ Image Upload Capabilities
- **Single and multiple image uploads**
- **Image optimization** with Sharp library
- **Base64 storage** in MongoDB
- **Role-based access control**
- **Image metadata management**
- **Primary image designation**

### 📱 Mobile App Integration
- **Camera and gallery access**
- **Real-time preview**
- **Progress indicators**
- **Error handling**
- **Permission management**

### 🔒 Security Features
- **File type validation**
- **Size limits** (5MB per image)
- **Authentication required**
- **Owner-based permissions**
- **Input sanitization**

## Backend Implementation

### Dependencies
```json
{
  "multer": "^1.4.5-lts.1",
  "sharp": "^0.33.2"
}
```

### File Structure
```
Backend/
├── Middleware/
│   └── uploadMiddleware.js    # Multer configuration
├── models/
│   └── Image.js              # Image schema
└── routes/
    └── images.js             # Image API endpoints
```

### Image Model Schema
```javascript
{
  originalName: String,        // Original filename
  mimetype: String,           // Image MIME type
  size: Number,               // File size in bytes
  data: String,               // Base64 encoded image
  uploadedAt: Date,           // Upload timestamp
  uploadedBy: ObjectId,       // User who uploaded
  entityType: String,         // Type of entity (trip, activity, etc.)
  entityId: ObjectId,         // ID of the entity
  isPrimary: Boolean,         // Primary image flag
  tags: [String],             // Image tags
  description: String         // Image description
}
```

### API Endpoints

#### Upload Images
```http
POST /api/images/upload
POST /api/images/upload-multiple
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:**
```
image: <file>                    # Single image
images: <files>                  # Multiple images
entityType: string              # trip, activity, restaurant, stay, rental, destination, user
entityId: string                # Entity ID
isPrimary: boolean              # Set as primary image
tags: string[]                  # Image tags
description: string             # Image description
```

#### Retrieve Images
```http
GET /api/images/:id              # Get image by ID
GET /api/images/entity/:entityType/:entityId  # Get entity images
GET /api/images/user/:userId     # Get user's images
```

#### Manage Images
```http
PUT /api/images/:id              # Update image metadata
DELETE /api/images/:id           # Delete image
```

## Mobile App Implementation

### Dependencies
```json
{
  "expo-image-picker": "^14.7.1"
}
```

### Components

#### ImageUpload Component
```typescript
interface ImageUploadProps {
  entityType: string;           // Type of entity
  entityId: string;             // Entity ID
  onUploadSuccess?: (images: any[]) => void;
  onUploadError?: (error: string) => void;
  maxImages?: number;           // Maximum images (default: 10)
  allowMultiple?: boolean;      // Allow multiple selection
  showPreview?: boolean;        // Show preview
  style?: any;                  // Custom styles
}
```

### API Integration
```typescript
// Upload single image
const result = await imageApi.uploadSingle(
  imageUri,
  entityType,
  entityId,
  { isPrimary: true }
);

// Upload multiple images
const result = await imageApi.uploadMultiple(
  imageUris,
  entityType,
  entityId
);

// Get image URL
const imageUrl = imageApi.getImage(imageId);

// Get entity images
const images = await imageApi.getEntityImages(entityType, entityId);
```

## Usage Examples

### Backend - Adding Image Upload to Routes

```javascript
const { uploadAndProcessSingle } = require('../Middleware/uploadMiddleware');

// Add image upload to existing routes
router.post('/trips', protect, uploadAndProcessSingle, async (req, res) => {
  // Handle trip creation
  const trip = await Trip.create(req.body);
  
  // Handle uploaded images
  if (req.processedImages && req.processedImages.length > 0) {
    for (const imageData of req.processedImages) {
      await Image.create({
        ...imageData,
        uploadedBy: req.user._id,
        entityType: 'trip',
        entityId: trip._id,
        isPrimary: req.processedImages.indexOf(imageData) === 0
      });
    }
  }
  
  res.json({ success: true, data: trip });
});
```

### Mobile App - Using ImageUpload Component

```jsx
import ImageUpload from '../components/ImageUpload';

const TripForm = () => {
  const [tripId, setTripId] = useState(null);

  return (
    <View>
      {/* Other form fields */}
      
      {tripId && (
        <ImageUpload
          entityType="trip"
          entityId={tripId}
          onUploadSuccess={(images) => {
            console.log('Images uploaded:', images);
          }}
          onUploadError={(error) => {
            Alert.alert('Upload Error', error);
          }}
          maxImages={5}
          allowMultiple={true}
        />
      )}
    </View>
  );
};
```

### Displaying Images

```jsx
import { imageApi } from '../api';

const ImageGallery = ({ images }) => {
  return (
    <ScrollView horizontal>
      {images.map((image) => (
        <Image
          key={image._id}
          source={{ uri: imageApi.getImage(image._id) }}
          style={styles.image}
        />
      ))}
    </ScrollView>
  );
};
```

## Configuration

### Environment Variables
```env
# Backend
MONGODB_URI=mongodb://localhost:27017/travelmate
JWT_SECRET=your-secret-key
PORT=5000

# Image settings
MAX_FILE_SIZE=5242880  # 5MB in bytes
MAX_FILES=10
IMAGE_QUALITY=80
IMAGE_WIDTH=800
IMAGE_HEIGHT=600
```

### Multer Configuration
```javascript
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10
  }
});
```

## Best Practices

### Performance
- **Image optimization** before storage
- **Lazy loading** for image galleries
- **Caching** with appropriate headers
- **Compression** for faster loading

### Security
- **File type validation**
- **Size limits**
- **Authentication checks**
- **Input sanitization**
- **Permission verification**

### User Experience
- **Progress indicators**
- **Error messages**
- **Preview functionality**
- **Drag and drop** (web)
- **Multiple selection**

## Error Handling

### Common Errors
```javascript
// File too large
if (file.size > MAX_FILE_SIZE) {
  return res.status(400).json({
    success: false,
    message: 'File size exceeds limit'
  });
}

// Invalid file type
if (!file.mimetype.startsWith('image/')) {
  return res.status(400).json({
    success: false,
    message: 'Invalid file type'
  });
}

// Upload failed
try {
  await image.save();
} catch (error) {
  return res.status(500).json({
    success: false,
    message: 'Failed to save image'
  });
}
```

### Mobile App Error Handling
```typescript
const uploadImage = async () => {
  try {
    const result = await imageApi.uploadSingle(uri, type, id);
    if (result.success) {
      // Handle success
    } else {
      Alert.alert('Error', result.message);
    }
  } catch (error) {
    Alert.alert('Network Error', 'Please check your connection');
  }
};
```

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Check user authentication
   - Verify user permissions
   - Ensure proper token

2. **File Upload Fails**
   - Check file size limits
   - Verify file type
   - Ensure proper form data

3. **Images Not Displaying**
   - Check image URL format
   - Verify image exists in database
   - Check network connectivity

4. **Performance Issues**
   - Optimize image sizes
   - Implement lazy loading
   - Use appropriate caching

### Debug Tools
```javascript
// Enable debug logging
console.log('Upload request:', req.files);
console.log('Processed images:', req.processedImages);
console.log('Image data size:', imageData.size);
```

## Future Enhancements

### Planned Features
- **Cloud storage integration** (AWS S3, Cloudinary)
- **Image editing tools**
- **Batch operations**
- **Advanced filtering**
- **Image analytics**

### Scalability
- **CDN integration**
- **Image processing queue**
- **Distributed storage**
- **Load balancing**

## Support

For technical support or questions about the image upload system:
- Check the API documentation
- Review error logs
- Test with different file types
- Verify network connectivity
- Contact the development team 