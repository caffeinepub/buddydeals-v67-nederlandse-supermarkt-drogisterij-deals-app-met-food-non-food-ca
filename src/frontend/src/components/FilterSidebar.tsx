import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Supermarket, ProductCategory } from '../backend';
import { X } from 'lucide-react';

const supermarketLabels: Record<Supermarket, string> = {
  [Supermarket.albertHeijn]: 'Albert Heijn',
  [Supermarket.jumbo]: 'Jumbo',
  [Supermarket.lidl]: 'Lidl',
  [Supermarket.dekamarkt]: 'Dekamarkt',
  [Supermarket.aldi]: 'Aldi',
  [Supermarket.spar]: 'Spar',
  [Supermarket.dirk]: 'Dirk',
  [Supermarket.deen]: 'Deen',
};

const supermarketLogos: Record<Supermarket, string> = {
  [Supermarket.albertHeijn]: '/assets/generated/albert-heijn-logo.dim_200x200.png',
  [Supermarket.jumbo]: '/assets/generated/jumbo-logo.dim_200x200.png',
  [Supermarket.lidl]: '/assets/generated/lidl-logo.dim_200x200.png',
  [Supermarket.dekamarkt]: '/assets/generated/dekamarkt-logo.dim_200x200.png',
  [Supermarket.aldi]: '/assets/generated/aldi-logo.dim_200x200.png',
  [Supermarket.spar]: '/assets/generated/spar-logo.dim_200x200.png',
  [Supermarket.dirk]: '/assets/generated/dirk-logo.dim_200x200.png',
  [Supermarket.deen]: '/assets/generated/deen-logo.dim_200x200.png',
};

const categoryLabels: Record<ProductCategory, string> = {
  [ProductCategory.groentenFruit]: 'Groenten & Fruit',
  [ProductCategory.vlees]: 'Vlees',
  [ProductCategory.zuivel]: 'Zuivel',
  [ProductCategory.dranken]: 'Dranken',
  [ProductCategory.bakkerij]: 'Bakkerij',
  [ProductCategory.snacks]: 'Snacks',
  [ProductCategory.overig]: 'Overig',
};

interface FilterSidebarProps {
  selectedSupermarket: Supermarket | null;
  selectedCategory: ProductCategory | null;
  priceRange: [number, number];
  onSupermarketChange: (supermarket: Supermarket | null) => void;
  onCategoryChange: (category: ProductCategory | null) => void;
  onPriceRangeChange: (range: [number, number]) => void;
}

export default function FilterSidebar({
  selectedSupermarket,
  selectedCategory,
  priceRange,
  onSupermarketChange,
  onCategoryChange,
  onPriceRangeChange,
}: FilterSidebarProps) {
  const handleClearFilters = () => {
    onSupermarketChange(null);
    onCategoryChange(null);
    onPriceRangeChange([0, 20]);
  };

  const hasActiveFilters = selectedSupermarket !== null || selectedCategory !== null || priceRange[0] !== 0 || priceRange[1] !== 20;

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearFilters}
            className="h-8 text-xs rounded-lg"
          >
            <X className="h-3 w-3 mr-1" />
            Wissen
          </Button>
        )}
      </div>

      <Separator />

      {/* Supermarkets */}
      <div>
        <h4 className="mb-4 font-medium text-sm text-muted-foreground uppercase tracking-wide">Supermarkt</h4>
        <div className="space-y-3">
          {Object.entries(supermarketLabels).map(([key, label]) => (
            <div key={key} className="flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 hover:bg-muted/50 group">
              <img
                src={supermarketLogos[key as Supermarket]}
                alt={label}
                className="h-8 w-8 object-contain rounded-lg bg-white p-1"
              />
              <Checkbox
                id={`filter-supermarket-${key}`}
                checked={selectedSupermarket === key}
                onCheckedChange={(checked) => {
                  onSupermarketChange(checked ? (key as Supermarket) : null);
                }}
              />
              <Label htmlFor={`filter-supermarket-${key}`} className="cursor-pointer flex-1 text-sm group-hover:text-primary transition-colors">
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <div>
        <h4 className="mb-4 font-medium text-sm text-muted-foreground uppercase tracking-wide">Categorie</h4>
        <div className="space-y-2">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <div key={key} className="flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 hover:bg-muted/50 group">
              <Checkbox
                id={`filter-category-${key}`}
                checked={selectedCategory === key}
                onCheckedChange={(checked) => {
                  onCategoryChange(checked ? (key as ProductCategory) : null);
                }}
              />
              <Label htmlFor={`filter-category-${key}`} className="cursor-pointer flex-1 text-sm group-hover:text-primary transition-colors">
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h4 className="mb-4 font-medium text-sm text-muted-foreground uppercase tracking-wide">Prijsbereik</h4>
        <div className="space-y-4">
          <Slider
            min={0}
            max={20}
            step={0.5}
            value={priceRange}
            onValueChange={(value) => onPriceRangeChange(value as [number, number])}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">€{priceRange[0].toFixed(2)}</span>
            <span className="text-muted-foreground">tot</span>
            <span className="font-medium">€{priceRange[1].toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Prijs per stuk bij 1+1 gratis
          </p>
        </div>
      </div>
    </div>
  );
}
