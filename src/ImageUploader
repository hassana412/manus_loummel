import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  kind?: "product" | "shop-logo" | "shop-cover";
  label?: string;
  aspect?: "square" | "wide";
}

function fileToBase64(file: File): Promise<{ base64: string; type: string; name: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve({ base64, type: file.type, name: file.name });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ImageUploader({ value, onChange, kind = "product", label = "Image", aspect = "square" }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const upload = trpc.media.upload.useMutation();

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      return toast.error("Fichier trop volumineux (max 8 Mo)");
    }
    setUploading(true);
    try {
      const { base64, type, name } = await fileToBase64(file);
      const result = await upload.mutateAsync({
        fileName: name,
        contentType: type,
        dataBase64: base64,
        kind,
      });
      onChange(result.url);
      toast.success("Image téléchargée");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onPick} />
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt={label}
            className={`${aspect === "wide" ? "w-64 h-32" : "w-32 h-32"} object-cover rounded-lg border`}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
          >
            <X className="w-3 h-3" />
          </button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 bg-background"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            Changer
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`${aspect === "wide" ? "w-64 h-32" : "w-32 h-32"} bg-muted/40 flex-col gap-1`}
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
          <span className="text-xs">{uploading ? "Upload..." : `Ajouter ${label.toLowerCase()}`}</span>
        </Button>
      )}
    </div>
  );
}
