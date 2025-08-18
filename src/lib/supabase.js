import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

/**
 * Supabase client instance
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

/**
 * Upload an image file to Supabase Storage
 * @param {File} file - The image file to upload
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path within the bucket
 * @returns {Promise<{data: any, error: any}>}
 */
export async function uploadImage(file, bucket = 'images', path) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file);
  return { data, error };
}

/**
 * Get public URL for a stored file
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path within the bucket
 * @returns {string} Public URL
 */
export function getImageUrl(bucket = 'images', path) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Compress image file before upload
 * @param {File} file - Original image file
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} quality - Image quality (0-1)
 * @returns {Promise<File>} Compressed image file
 */
export async function compressImage(file, maxWidth = 1080, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
}