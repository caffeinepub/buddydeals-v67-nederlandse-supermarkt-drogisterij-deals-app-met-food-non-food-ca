import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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

const categoryLabels: Record<ProductCategory, string> = {
  [ProductCategory.groentenFruit]: 'Groenten & Fruit',
  [ProductCategory.vlees]: 'Vlees',
  [ProductCategory.zuivel]: 'Zuivel',
  [ProductCategory.dranken]: 'Dranken',
  [ProductCategory.bakkerij]: 'Bakkerij',
  [ProductCategory.snacks]: 'Snacks',
  [ProductCategory.overig]: 'Overig',
};

interface FilterPanelProps {
  selectedSupermarket: Supermarket | null;
  selectedCategory: ProductCategory | null;
  onSupermarketChange: (supermarket: Supermarket | null) => void;
  onCategoryChange: (category: ProductCategory | null) => void;
  onClose?: () => void;
}

export default function FilterPanel({
  selectedSupermarket,
  selectedCategory,
  onSupermarketChange,
  onCategoryChange,
  onClose,
}: FilterPanelProps) {
  const handleClearFilters = () => {
    onSupermarketChange(null);
    onCategoryChange(null);
  };

  const hasActiveFilters = selectedSupermarket !== null || selectedCategory !== null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Filters</h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full transition-all duration-300 hover:bg-destructive/10 hover:text-destructive">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleClearFilters} 
          className="w-full rounded-full transition-all duration-300 hover:shadow-soft border-border/50"
        >
          Wis alle filters
        </Button>
      )}

      <div>
        <h4 className="mb-4 font-medium text-foreground">Supermarkt</h4>
        <div className="space-y-3">
          {Object.entries(supermarketLabels).map(([key, label]) => (
            <div key={key} className="flex items-center space-x-3 p-2 rounded-xl transition-all duration-200 hover:bg-muted/50">
              <Checkbox
                id={`filter-supermarket-${key}`}
                checked={selectedSupermarket === key}
                onCheckedChange={(checked) => {
                  onSupermarketChange(checked ? (key as Supermarket) : null);
                }}
                className="transition-all duration-200"
              />
              <Label htmlFor={`filter-supermarket-${key}`} className="cursor-pointer flex-1 transition-colors duration-200 hover:text-primary">
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-border/50" />

      <div>
        <h4 className="mb-4 font-medium text-foreground">Categorie</h4>
        <div className="space-y-3">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <div key={key} className="flex items-center space-x-3 p-2 rounded-xl transition-all duration-200 hover:bg-muted/50">
              <Checkbox
                id={`filter-category-${key}`}
                checked={selectedCategory === key}
                onCheckedChange={(checked) => {
                  onCategoryChange(checked ? (key as ProductCategory) : null);
                }}
                className="transition-all duration-200"
              />
              <Label htmlFor={`filter-category-${key}`} className="cursor-pointer flex-1 transition-colors duration-200 hover:text-primary">
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
