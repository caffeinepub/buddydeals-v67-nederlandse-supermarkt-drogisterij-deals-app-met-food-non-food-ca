import { Link } from '@tanstack/react-router';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm mt-20 animate-fade-in">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025. Gebouwd met{' '}
            <Heart className="inline h-4 w-4 text-destructive fill-destructive animate-pulse" />{' '}
            met behulp van{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:text-secondary transition-colors duration-300 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <div className="flex gap-6">
            <Link
              to="/uitleg"
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 hover:underline"
            >
              Uitleg
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

