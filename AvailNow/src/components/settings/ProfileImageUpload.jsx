// src/components/widgets/settings/ProfileImageUpload.jsx
import React, { useState, useRef } from "react";
import { Upload, X, Camera, Loader, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

const ProfileImageUpload = ({
  currentImage,
  onImageChange,
  userId,
  className = "",
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const BUCKET_NAME = "company-logos";
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/svg+xml",
  ];

  const validateFile = (file) => {
    if (!file) {
      throw new Error("No file selected");
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(
        "Invalid file type. Please upload a JPEG, PNG, WebP, or SVG image."
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        "File size too large. Please upload an image smaller than 5MB."
      );
    }

    return true;
  };

  const uploadToSupabase = async (file) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return { publicUrl, filePath };
  };

  const deleteOldImage = async (imageUrl) => {
    if (!imageUrl || !imageUrl.includes(BUCKET_NAME)) return;

    try {
      // Extract file path from URL
      const urlParts = imageUrl.split(`${BUCKET_NAME}/`);
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      }
    } catch (error) {
      console.warn("Failed to delete old image:", error);
      // Don't throw error for deletion failures
    }
  };

  const updateUserProfile = async (imageUrl) => {
    const { error } = await supabase.from("user_profiles").upsert({
      user_id: userId,
      company_logo: imageUrl,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setUploading(true);

      // Validate file
      validateFile(file);

      // Delete old image if exists
      if (currentImage) {
        await deleteOldImage(currentImage);
      }

      // Upload new image
      const { publicUrl } = await uploadToSupabase(file);

      // Update user profile in database
      await updateUserProfile(publicUrl);

      // Update parent component
      onImageChange(publicUrl);

      toast.success("Company logo uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleRemoveImage = async () => {
    if (!currentImage) return;

    try {
      setUploading(true);

      // Delete from storage
      await deleteOldImage(currentImage);

      // Update profile to remove image
      await updateUserProfile(null);

      // Update parent component
      onImageChange(null);

      toast.success("Company logo removed successfully!");
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("Failed to remove logo");
    } finally {
      setUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Logo
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Upload your company logo (JPEG, PNG, WebP, or SVG, max 5MB)
        </p>
      </div>

      {/* Current Image Preview */}
      {currentImage && (
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-lg border-2 border-gray-200 overflow-hidden bg-white flex items-center justify-center">
            <img
              src={currentImage}
              alt="Company logo"
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentNode.innerHTML =
                  '<div class="text-gray-400 text-xs">Invalid image</div>';
              }}
            />
          </div>
          <button
            onClick={handleRemoveImage}
            disabled={uploading}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 disabled:opacity-50"
            title="Remove logo"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        className={`relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : uploading
              ? "border-gray-300 bg-gray-50"
              : "border-gray-300 hover:border-primary hover:bg-gray-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        <div className="text-center">
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader className="w-8 h-8 text-primary animate-spin mb-2" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                {currentImage ? (
                  <Camera className="w-6 h-6 text-gray-400" />
                ) : (
                  <Upload className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                {currentImage ? "Replace logo" : "Upload company logo"}
              </p>
              <p className="text-xs text-gray-500">
                Drag and drop or click to browse
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Format Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <div className="flex items-start">
          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">Logo Guidelines:</p>
            <ul className="space-y-1 text-xs">
              <li>• Use a square or horizontal format for best results</li>
              <li>• Ensure good contrast with your widget theme</li>
              <li>• SVG format recommended for crisp display at all sizes</li>
              <li>
                • Logo will appear in the widget header next to your company
                name
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageUpload;
