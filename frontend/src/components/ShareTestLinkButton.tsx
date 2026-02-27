import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGetTestLink } from '../hooks/useQueries';
import { Share2, Copy, Check, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareTestLinkButton() {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data: testLink = '', isLoading } = useGetTestLink();

  const handleCopyLink = async () => {
    if (!testLink) return;

    try {
      await navigator.clipboard.writeText(testLink);
      setCopied(true);
      toast.success('Testlink gekopieerd naar klembord!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Fout bij kopiëren:', error);
      toast.error('Kon link niet kopiëren');
    }
  };

  const handleButtonClick = () => {
    setShowModal(true);
  };

  const getQRCodeUrl = (url: string): string => {
    // Using Google Charts API to generate QR code
    const size = 220;
    const encodedUrl = encodeURIComponent(url);
    return `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodedUrl}&choe=UTF-8`;
  };

  const handleDownloadQR = async () => {
    if (!testLink) return;

    try {
      const qrUrl = getQRCodeUrl(testLink);
      
      // Fetch the image
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      
      // Create download link
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = 'buddydeals-qr-code.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);

      toast.success('QR-code gedownload!');
    } catch (error) {
      console.error('Fout bij downloaden QR-code:', error);
      toast.error('Kon QR-code niet downloaden');
    }
  };

  if (isLoading || !testLink) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleButtonClick}
        className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Deel testlink</span>
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              Deel BuddyDeals Testlink
            </DialogTitle>
            <DialogDescription>
              Deel deze link met anderen zodat zij kunnen deelnemen aan het testen van BuddyDeals.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* QR Code Section with Styled Frame - Now shown by default */}
            <div className="space-y-3 animate-scale-in">
              <div className="qr-frame-container relative p-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-2xl border-2 border-primary/30 shadow-soft-lg">
                {/* Decorative corner elements */}
                <div className="absolute top-3 left-3 w-8 h-8 border-t-[3px] border-l-[3px] border-primary/50 rounded-tl-xl"></div>
                <div className="absolute top-3 right-3 w-8 h-8 border-t-[3px] border-r-[3px] border-secondary/50 rounded-tr-xl"></div>
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-[3px] border-l-[3px] border-secondary/50 rounded-bl-xl"></div>
                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-[3px] border-r-[3px] border-primary/50 rounded-br-xl"></div>
                
                {/* Inner frame with gradient border */}
                <div className="relative bg-white dark:bg-gray-900 rounded-xl p-5 shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-secondary/15 to-accent/15 rounded-xl opacity-40"></div>
                  
                  {/* QR Code */}
                  <div className="relative flex flex-col items-center gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-md ring-2 ring-primary/30 hover:ring-primary/50 transition-all">
                      <img
                        src={getQRCodeUrl(testLink)}
                        alt="QR Code voor BuddyDeals testlink"
                        className="w-[220px] h-[220px] block"
                        loading="eager"
                      />
                    </div>
                    
                    {/* BuddyDeals branding */}
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
                      <p className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        BuddyDeals
                      </p>
                      <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse delay-75"></div>
                    </div>
                  </div>
                </div>
                
                {/* Instruction text */}
                <p className="text-sm text-center text-foreground/80 mt-4 font-medium">
                  Scan deze QR-code om de BuddyDeals-app te testen
                </p>
              </div>

              <Button
                variant="secondary"
                onClick={handleDownloadQR}
                className="w-full gap-2 bg-gradient-to-r from-primary/15 to-secondary/15 hover:from-primary/25 hover:to-secondary/25 border border-primary/30 transition-all shadow-sm hover:shadow-md"
              >
                <Download className="h-4 w-4" />
                Download QR-code
              </Button>
            </div>

            {/* Link Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Of deel de link:</label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
                <code className="flex-1 text-xs break-all">{testLink}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyLink}
                  className="shrink-0 hover:bg-primary/10"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Hoe werkt het?</strong>
                <br />
                Iedereen die deze link opent, kan deelnemen aan het testen van BuddyDeals door in te loggen met Internet Identity.
              </p>
            </div>

            {/* Features List */}
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span>Testgebruikers kunnen hun eigen profiel aanmaken</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span>Producten selecteren voor matching</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span>Match notificaties ontvangen en versturen</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span>Volledige app functionaliteit gebruiken</span>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
