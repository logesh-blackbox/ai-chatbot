'use client';

import { useState, useRef, useEffect } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from './ui/button';
import { RotateLeftIcon, RotateRightIcon } from './icons';

interface ImageCropperProps {
  file: File;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export function ImageCropper({ file, onCropComplete, onCancel }: ImageCropperProps) {
  const [rotation, setRotation] = useState<number>(0);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [imageSrc, setImageSrc] = useState<string>('');
  const imageRef = useRef<HTMLImageElement>(null);

  // Load image when component mounts
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [file]);

  const rotateLeft = () => {
    setRotation((prev) => (prev - 90) % 360);
  };

  const rotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const getCroppedImg = async () => {
    if (!imageRef.current) return;

    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;

    // Adjust canvas dimensions based on rotation
    const isRotated90or270 = Math.abs(rotation % 180) === 90;
    canvas.width = isRotated90or270 ? crop.height : crop.width;
    canvas.height = isRotated90or270 ? crop.width : crop.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Move to center, rotate, and move back
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw the rotated and cropped image
    ctx.drawImage(
      imageRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob);
      }
    }, file.type);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg max-w-2xl w-full">
        <h3 className="text-lg font-semibold mb-4">Crop Image</h3>
        <div className="relative max-h-[60vh] overflow-auto">
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              aspect={1}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                className="max-w-full"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
            </ReactCrop>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={rotateLeft} className="px-3">
            <RotateLeftIcon className="size-4" />
          </Button>
          <Button variant="outline" onClick={rotateRight} className="px-3">
            <RotateRightIcon className="size-4" />
          </Button>
          <Button onClick={getCroppedImg}>
            Crop & Upload
          </Button>
        </div>
      </div>
    </div>
  );
}
