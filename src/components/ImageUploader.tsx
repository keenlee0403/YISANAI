
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface ImageUploaderProps {
  id: string;
  title: string;
  onImageChange: (data: { file: File | null; base64: string | null; mimeType: string | null }) => void;
}

/**
 * Processes an image file by resizing it and converting it to a standard JPEG format.
 * This ensures compatibility with the Gemini API and optimizes image size.
 * @param file The image file to process.
 * @returns A promise that resolves with the base64 encoded string and 'image/jpeg' MIME type.
 */
const processImage = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      if (!event.target?.result) {
        return reject(new Error("Failed to read file."));
      }
      img.src = event.target.result as string;
      img.onload = () => {
        const MAX_DIMENSION = 1024;
        let { width, height } = img;

        // Resize the image while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_DIMENSION) {
            height = Math.round(height * (MAX_DIMENSION / width));
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width = Math.round(width * (MAX_DIMENSION / height));
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to a base64 string in JPEG format
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // 90% quality
        const base64 = dataUrl.split(',')[1];
        
        resolve({ base64, mimeType: 'image/jpeg' });
      };
      img.onerror = (error) => reject(new Error("Failed to load image for processing."));
    };
    reader.onerror = (error) => reject(new Error("Failed to read file."));
  });
};


export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, title, onImageChange }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setPreview(URL.createObjectURL(file));
        const { base64, mimeType } = await processImage(file);
        onImageChange({ file, base64, mimeType });
      } catch (error) {
        console.error("Error processing image:", error);
        // Optionally, display an error to the user
        resetImage(null);
      }
    }
  }, [onImageChange]);

  const resetImage = (e: React.MouseEvent | null) => {
    e?.stopPropagation();
    setPreview(null);
    onImageChange({ file: null, base64: null, mimeType: null });
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="relative flex flex-col items-center justify-center w-full aspect-square bg-slate-800 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:bg-slate-700 hover:border-brand-secondary transition-colors duration-300 group"
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
            <button 
                onClick={resetImage} 
                className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-all"
                aria-label="Remove image"
            >
              <XCircleIcon />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
            <UploadIcon />
            <p className="mb-2 text-sm text-slate-400 font-semibold">{title}</p>
            <p className="text-xs text-slate-500">点击或拖拽上传</p>
          </div>
        )}
        <input id={id} ref={fileInputRef} type="file" accept="image/png, image/jpeg, image/webp, image/heic, image/heif" className="hidden" onChange={handleFileChange} />
      </label>
    </div>
  );
};
