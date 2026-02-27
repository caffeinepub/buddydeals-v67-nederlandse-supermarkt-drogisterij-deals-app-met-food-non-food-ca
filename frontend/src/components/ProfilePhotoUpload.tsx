import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X } from 'lucide-react';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoSelected: (photo: ExternalBlob) => void;
  onPhotoRemoved?: () => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

export default function ProfilePhotoUpload({ 
  currentPhotoUrl, 
  onPhotoSelected, 
  onPhotoRemoved,
  disabled = false 
}: ProfilePhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Alleen JPEG en PNG bestanden zijn toegestaan');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Bestand is te groot. Maximaal 5MB toegestaan');
      return false;
    }

    return true;
  };

  const handleFileSelect = useCallback(async (file: File) => {
    if (!validateFile(file)) return;

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Convert to Uint8Array for ExternalBlob
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Create ExternalBlob with upload progress tracking
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      onPhotoSelected(blob);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Fout bij verwerken van bestand');
    }
  }, [onPhotoSelected]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onPhotoRemoved) {
      onPhotoRemoved();
    }
  };

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2">
        <Camera className="h-4 w-4 text-primary" />
        Profielfoto (optioneel)
      </Label>

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Preview */}
        <div className="relative">
          <div className="h-32 w-32 rounded-full overflow-hidden bg-muted border-2 border-border flex items-center justify-center">
            {preview ? (
              <img 
                src={preview} 
                alt="Profielfoto preview" 
                className="h-full w-full object-cover"
              />
            ) : (
              <img 
                src="/assets/generated/default-avatar-transparent.dim_64x64.png" 
                alt="Standaard avatar" 
                className="h-16 w-16 opacity-50"
              />
            )}
          </div>
          {preview && !disabled && (
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Upload area */}
        <div className="flex-1 w-full">
          <div
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={disabled}
            />
            
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {preview ? 'Foto wijzigen' : 'Foto uploaden'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Sleep een bestand of klik om te selecteren
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPEG of PNG, max 5MB
                </p>
              </div>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-4">
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Uploaden... {uploadProgress}%
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
