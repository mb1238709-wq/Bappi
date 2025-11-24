import React, { useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { ImageState } from '../types';

interface ImageUploaderProps {
  imageState: ImageState;
  onImageChange: (newState: ImageState) => void;
  onClear: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ imageState, onImageChange, onClear }) => {
  
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      
      onImageChange({
        file,
        previewUrl: result,
        base64Data,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  }, [onImageChange]);

  if (imageState.previewUrl) {
    return (
      <div className="relative group w-full aspect-square md:aspect-video rounded-2xl overflow-hidden bg-gray-900 border border-gray-700 shadow-xl">
        <img 
          src={imageState.previewUrl} 
          alt="Original" 
          className="w-full h-full object-contain bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" 
        />
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
          <p className="text-white font-medium tracking-wide">Change Image</p>
          <button 
            onClick={onClear}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500/90 text-white rounded-full hover:bg-red-600 transform hover:scale-105 transition-all shadow-lg font-medium"
            title="Remove image"
          >
            <X className="w-4 h-4" />
            Remove
          </button>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-yellow-500 border border-yellow-500/30 shadow-lg flex items-center gap-2">
          <ImageIcon className="w-3 h-3" />
          SOURCE IMAGE
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <label className="flex flex-col items-center justify-center w-full aspect-square md:aspect-video rounded-2xl border-2 border-dashed border-gray-600 bg-gray-800/30 hover:bg-gray-800/60 hover:border-yellow-500 hover:shadow-[0_0_20px_rgba(234,179,8,0.1)] transition-all duration-300 cursor-pointer group relative overflow-hidden">
        
        {/* Decorative background accent */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10 px-4 text-center">
          <div className="bg-gray-700 p-4 rounded-full mb-4 group-hover:bg-gray-600 group-hover:scale-110 transition-all duration-300 shadow-lg border border-gray-600 group-hover:border-yellow-500/50">
            <Upload className="w-8 h-8 text-gray-300 group-hover:text-yellow-400 transition-colors" />
          </div>
          <p className="mb-2 text-xl text-gray-200 font-semibold group-hover:text-white transition-colors">
            Upload Image
          </p>
          <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors max-w-[200px]">
            Drag and drop or click to browse files
          </p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};