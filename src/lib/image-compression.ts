import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1, // Max file size in MB
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp' // Convert to WebP for better compression
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    return file; // Fallback to original file on error
  }
}
