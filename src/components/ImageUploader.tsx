
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import UploadIcon from './icons/UploadIcon';
import XCircleIcon from './icons/XCircleIcon';

interface ImageUploaderProps {
  title: string;
  onFileSelect: (file: File | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ title, onFileSelect }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const currentFile = acceptedFiles[0];
      onFileSelect(currentFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(currentFile);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false,
  });

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onFileSelect(null);
  };

  return (
    <div className="w-full p-6 space-y-4 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50">
      <h2 className="text-xl font-semibold text-center text-slate-700">{title}</h2>
      <div
        {...getRootProps()}
        className={`relative p-4 aspect-[4/5] border-2 border-dashed rounded-xl flex items-center justify-center text-center cursor-pointer transition-colors duration-300
        ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'}`}
      >
        <input {...getInputProps()} />
        {preview ? (
            <div className='w-full h-full'>
                <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-md" />
                <button onClick={handleRemoveImage} className="absolute -top-3 -right-3 p-0 bg-white text-slate-600 hover:text-red-500 rounded-full transition-transform hover:scale-110 shadow-md">
                  <XCircleIcon className="w-8 h-8"/>
                </button>
            </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 pointer-events-none">
            <UploadIcon className="w-12 h-12 mb-3 text-slate-400" />
            {isDragActive ? (
              <p>将图片拖到此处</p>
            ) : (
              <p>拖拽或点击上传</p>
            )}
             <p className="text-xs mt-1 text-slate-400">支持 JPG, PNG, WEBP</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
