// Import multer using ES Modules syntax
import multer from 'multer';

// Factory function to create Multer middleware with custom storage configuration
export function createMulterMiddleware(storageConfig) {
    const storage = multer.diskStorage({
        destination: storageConfig.destination,
        filename: function (req, file, cb) { // filename will be as follows: drm33-1607670464-image.jpg
            cb(null, storageConfig.fieldName + req.params.id + '-' + Date.now() + '-' + file.originalname);
        }
    });

    return multer({ storage }).single(storageConfig.fieldName);
}
