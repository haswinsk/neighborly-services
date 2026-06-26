import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
  serviceId: string;
  onToggle?: (isFavorited: boolean) => void;
}

export const FavoriteButton = ({ serviceId, onToggle }: FavoriteButtonProps) => {
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    // Load favorites from localStorage
    const favorites = JSON.parse(localStorage.getItem("localserv_favorites") || "[]");
    setIsFavorited(favorites.includes(serviceId));
  }, [serviceId]);

  const handleToggle = () => {
    const favorites = JSON.parse(localStorage.getItem("localserv_favorites") || "[]");
    let updatedFavorites;

    if (isFavorited) {
      updatedFavorites = favorites.filter((id: string) => id !== serviceId);
    } else {
      updatedFavorites = [...favorites, serviceId];
    }

    localStorage.setItem("localserv_favorites", JSON.stringify(updatedFavorites));
    setIsFavorited(!isFavorited);
    onToggle?.(!isFavorited);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2 transition-colors hover:text-red-500"
      onClick={handleToggle}
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`h-5 w-5 transition-all ${
          isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground"
        }`}
      />
      <span className="hidden sm:inline text-sm">
        {isFavorited ? "Saved" : "Save"}
      </span>
    </Button>
  );
};

export default FavoriteButton;
