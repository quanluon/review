/**
 * Storage utility for uploading images to Supabase Storage
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Upload an image to Supabase Storage
 * Images are stored in user-specific folders: {userId}/{timestamp}-{filename}
 */
export async function uploadReviewImage(
  supabase: SupabaseClient<Database>,
  file: File,
  userId: string
): Promise<UploadResult> {
  // Validate file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (!validTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.");
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("File too large. Maximum size is 5MB.");
  }

  // Generate unique filename
  const timestamp = Date.now();
  const fileExt = file.name.split(".").pop();
  const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("review-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("review-images").getPublicUrl(data.path);

  return {
    url: publicUrl,
    path: data.path,
  };
}

/**
 * Upload multiple images
 */
export async function uploadReviewImages(
  supabase: SupabaseClient<Database>,
  files: File[],
  userId: string
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file) =>
    uploadReviewImage(supabase, file, userId)
  );

  return Promise.all(uploadPromises);
}

/**
 * Delete an image from storage
 */
export async function deleteReviewImage(
  supabase: SupabaseClient<Database>,
  path: string
): Promise<void> {
  const { error } = await supabase.storage
    .from("review-images")
    .remove([path]);

  if (error) {
    console.error("Delete error:", error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

