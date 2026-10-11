import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  X,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { profileService } from '../../services/profile';

interface AvatarUploaderProps {
  userId: string;
  currentAvatarPath?: string | null;
  displayName?: string;
  handle?: string;
  onAvatarUpdated: (newPath: string | null, newUrl: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  userId,
  currentAvatarPath,
  displayName = 'Student',
  handle = 'student',
  onAvatarUpdated,
  size = 'md',
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() =>
    profileService.getAvatarUrl(currentAvatarPath)
  );
  const [imageLoadError, setImageLoadError] = useState(false);

  // Sync avatar URL when path changes
  useEffect(() => {
    setAvatarUrl(profileService.getAvatarUrl(currentAvatarPath));
    setImageLoadError(false);
  }, [currentAvatarPath]);

  // Cropper Modal States
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Processing & Feedback States
  const [validating, setValidating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Compute initials fallback
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w: string) => w.charAt(0).toUpperCase())
      .join('') || handle.slice(0, 2).toUpperCase();

  // Size styling
  const sizeClasses = {
    sm: 'h-12 w-12 text-sm',
    md: 'h-20 w-20 text-xl',
    lg: 'h-28 w-28 text-3xl',
  }[size];

  // Draw the image onto the preview canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Fill background with light neutral
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, width, height);

    // Calculate aspect ratio
    const imgAspect = img.width / img.height;
    let baseWidth = width;
    let baseHeight = height;

    if (imgAspect > 1) {
      baseHeight = height;
      baseWidth = height * imgAspect;
    } else {
      baseWidth = width;
      baseHeight = width / imgAspect;
    }

    const drawWidth = baseWidth * zoom;
    const drawHeight = baseHeight * zoom;

    const drawX = (width - drawWidth) / 2 + pan.x;
    const drawY = (height - drawHeight) / 2 + pan.y;

    ctx.save();
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();

    // Darkened vignette outside circle
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.arc(width / 2, height / 2, width / 2 - 4, 0, Math.PI * 2, true);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.fill();

    // Subtle circle boundary stroke
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width / 2 - 4, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0d9488'; // teal-600
    ctx.stroke();
    ctx.restore();
  }, [zoom, pan]);

  useEffect(() => {
    if (isCropModalOpen && rawImageSrc) {
      drawCanvas();
    }
  }, [isCropModalOpen, rawImageSrc, drawCanvas]);

  // Handle file selection and magic byte validation
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-selected if needed
    e.target.value = '';

    setErrorMessage(null);
    setSuccessMessage(null);
    setValidating(true);

    const validation = await profileService.validateAvatarFile(file);
    setValidating(false);

    if (!validation.valid || validation.error) {
      setErrorMessage(validation.error || 'Invalid file format.');
      return;
    }

    // Read into object URL for interactive canvas cropping
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setRawImageSrc(objectUrl);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setIsCropModalOpen(true);
    };
    img.onerror = () => {
      setErrorMessage('Could not decode the selected image file.');
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  };

  // Mouse / Touch Pan Events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    setIsDragging(true);
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    if (!touch) return;
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Zoom control helpers
  const handleZoomChange = (newZoom: number) => {
    setZoom(Math.max(1, Math.min(3, newZoom)));
  };

  // Export cropped circle/square and upload to Supabase
  const handleApplyCropAndUpload = async () => {
    const img = imageRef.current;
    if (!img) return;

    setUploading(true);
    setErrorMessage(null);

    // Create a 400x400 high-res export canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 400;
    exportCanvas.height = 400;
    const ctx = exportCanvas.getContext('2d');

    if (!ctx) {
      setUploading(false);
      setErrorMessage('Browser does not support canvas export.');
      return;
    }

    const previewSize = 300; // Size of the interactive preview canvas
    const scaleFactor = 400 / previewSize;

    const imgAspect = img.width / img.height;
    let baseWidth = previewSize;
    let baseHeight = previewSize;

    if (imgAspect > 1) {
      baseHeight = previewSize;
      baseWidth = previewSize * imgAspect;
    } else {
      baseWidth = previewSize;
      baseHeight = previewSize / imgAspect;
    }

    const drawWidth = baseWidth * zoom * scaleFactor;
    const drawHeight = baseHeight * zoom * scaleFactor;
    const drawX = ((previewSize - baseWidth * zoom) / 2 + pan.x) * scaleFactor;
    const drawY = ((previewSize - baseHeight * zoom) / 2 + pan.y) * scaleFactor;

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    // Convert to webp blob
    exportCanvas.toBlob(
      async (blob) => {
        if (!blob) {
          setUploading(false);
          setErrorMessage('Failed to generate image data.');
          return;
        }

        const res = await profileService.uploadAvatar(userId, blob);
        setUploading(false);

        if (res.error || !res.data) {
          setErrorMessage(res.error || 'Failed to upload avatar.');
        } else {
          setAvatarUrl(res.data.publicUrl);
          setImageLoadError(false);
          setIsCropModalOpen(false);
          setSuccessMessage('Profile avatar updated successfully!');
          onAvatarUpdated(res.data.path, res.data.publicUrl);

          // Clean up raw image object URL
          if (rawImageSrc) {
            URL.revokeObjectURL(rawImageSrc);
            setRawImageSrc(null);
          }

          setTimeout(() => setSuccessMessage(null), 3000);
        }
      },
      'image/webp',
      0.9
    );
  };

  // Remove avatar handler
  const handleDeleteAvatar = async () => {
    setDeleting(true);
    setErrorMessage(null);

    const res = await profileService.deleteAvatar(userId, currentAvatarPath);
    setDeleting(false);
    setIsDeleteConfirmOpen(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setAvatarUrl(null);
      setImageLoadError(false);
      setSuccessMessage('Avatar removed. Initials fallback restored.');
      onAvatarUpdated(null, null);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-3">
      {/* Messages */}
      {errorMessage && (
        <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold">Avatar Notice</p>
            <p>{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 hover:text-rose-800 p-0.5"
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-teal-50 border border-teal-200 p-3 text-xs text-teal-800">
          <Check className="h-4 w-4 text-teal-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Avatar Display and Controls */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        {/* Avatar Circle Container */}
        <div className="relative group shrink-0">
          <div
            className={`rounded-full overflow-hidden border-2 border-teal-500/30 shadow-xs flex items-center justify-center font-bold bg-slate-900 text-teal-300 select-none ${sizeClasses}`}
          >
            {avatarUrl && !imageLoadError ? (
              <img
                src={avatarUrl}
                alt={`${displayName}'s avatar`}
                className="h-full w-full object-cover"
                onError={() => setImageLoadError(true)}
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          {/* Quick upload overlay button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={validating || uploading}
            className="absolute inset-0 rounded-full bg-slate-950/60 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
            title="Change Profile Photo"
            aria-label="Upload profile photo"
          >
            <Camera className="h-4 w-4" />
            <span>Edit</span>
          </button>
        </div>

        {/* Buttons & Metadata */}
        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              id="avatar-file-input"
              aria-label="Upload avatar image file"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={validating || uploading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 transition-colors shadow-2xs disabled:opacity-50"
            >
              {validating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  <span>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
                </>
              )}
            </button>

            {avatarUrl && (
              <>
                {isDeleteConfirmOpen ? (
                  <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-xl px-2.5 py-1">
                    <span className="text-[11px] text-rose-800 font-medium">Remove photo?</span>
                    <button
                      type="button"
                      onClick={handleDeleteAvatar}
                      disabled={deleting}
                      className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline"
                    >
                      {deleting ? 'Removing...' : 'Yes, Remove'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDeleteConfirmOpen(false)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 ml-1"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-700 hover:border-rose-200 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </>
            )}
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Upload an authentic JPEG, PNG, or WebP photo up to 5MB. Crop and zoom to center your face before saving.
          </p>
        </div>
      </div>

      {/* Accessible Interactive Crop Modal */}
      {isCropModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="crop-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-600" />
                <h3 id="crop-modal-title" className="text-sm font-bold text-slate-900">
                  Crop &amp; Center Profile Photo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCropModalOpen(false);
                  if (rawImageSrc) URL.revokeObjectURL(rawImageSrc);
                  setRawImageSrc(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                aria-label="Close crop modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Interactive Crop Canvas Viewport */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-900">
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={300}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className="cursor-move select-none touch-none"
                  aria-label="Avatar crop canvas. Click or touch and drag to position."
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Click and drag to position your image inside the circle
              </p>
            </div>

            {/* Zoom Slider and Controls */}
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <ZoomIn className="h-3.5 w-3.5 text-teal-600" />
                  <span>Zoom Image</span>
                </span>
                <span className="text-teal-700 font-mono text-[11px]">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleZoomChange(zoom - 0.2)}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-200"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>

                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                  className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  aria-label="Zoom level"
                />

                <button
                  type="button"
                  onClick={() => handleZoomChange(zoom + 0.2)}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-200"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-200"
                  title="Reset zoom and position"
                  aria-label="Reset zoom and position"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsCropModalOpen(false);
                  if (rawImageSrc) URL.revokeObjectURL(rawImageSrc);
                  setRawImageSrc(null);
                }}
                disabled={uploading}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApplyCropAndUpload}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-xs disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Save Avatar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
