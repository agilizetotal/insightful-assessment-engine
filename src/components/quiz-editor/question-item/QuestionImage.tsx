
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image } from "lucide-react";
import { toast } from "sonner";

interface QuestionImageProps {
  imageUrl?: string;
  onImageChange: (url: string) => void;
}

export const QuestionImage = ({ imageUrl, onImageChange }: QuestionImageProps) => {
  const [showImageInput, setShowImageInput] = useState(!!imageUrl);
  const [imageError, setImageError] = useState(false);

  const handleImageChange = (url: string) => {
    setImageError(false);
    onImageChange(url);
  };

  const handleImageLoadError = () => {
    setImageError(true);
    toast.error("Não foi possível carregar a imagem. Verifique o URL.");
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowImageInput(!showImageInput)}
          className="flex items-center gap-1"
        >
          <Image className="h-4 w-4" />
          {showImageInput ? 'Remover imagem' : 'Adicionar imagem'}
        </Button>
      </div>
      
      {showImageInput && (
        <div className="space-y-2">
          <Label htmlFor="question-image">URL da Imagem</Label>
          <Input 
            id="question-image" 
            value={imageUrl || ''} 
            onChange={(e) => handleImageChange(e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
          />
          {imageUrl && (
            <div className="mt-2 border rounded-md overflow-hidden">
              <img 
                src={imageUrl} 
                alt="Preview da imagem" 
                className="w-full h-auto max-h-48 object-contain"
                onError={handleImageLoadError}
                style={{ display: imageError ? 'none' : 'block' }}
              />
              {imageError && (
                <div className="p-4 text-center text-red-500">
                  Erro ao carregar imagem. Verifique o URL.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
