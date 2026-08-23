"use client";

import { useState } from "react";
import { Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function PhotoUploader({ photos = [], onChange, maxPhotos = 4, className }) {
  const addPhoto = () => {
    if (photos.length >= maxPhotos) return;
    const fakeUrl = `/images/completion-${(photos.length % 2) + 1}.svg`;
    onChange([...photos, fakeUrl]);
  };

  const removePhoto = (index) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("grid grid-cols-4 gap-2", className)}>
      {photos.map((url, i) => (
        <div key={i} className="relative aspect-square rounded-xl bg-coco-cream border border-coco-border overflow-hidden">
          <img src={url} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => removePhoto(i)}
            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center"
          >
            <X size={12} />
          </button>
        </div>
      ))}
      {photos.length < maxPhotos && (
        <button
          type="button"
          onClick={addPhoto}
          className="aspect-square rounded-xl border-2 border-dashed border-coco-border flex flex-col items-center justify-center gap-1 text-coco-muted hover:border-coco-green hover:text-coco-green transition-colors"
        >
          <Camera size={20} />
          <span className="text-[10px] font-medium">Add</span>
        </button>
      )}
    </div>
  );
}
