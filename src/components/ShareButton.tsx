import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Share2, Link, Check, MessageCircle, Mail, Facebook, Twitter, Instagram, Linkedin, Send, Smartphone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";


interface ShareOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  color?: string;
}
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://organiz-life.lovable.app";
  const shareText = t("share.text", "Organise ta vie avec Organiz-Life — l'app premium de développement personnel.");
  const shareTitle = t("share.title", "Organiz-Life");
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(appUrl);
  const encodedTitle = encodeURIComponent(shareTitle);

  const canNativeShare = typeof window !== "undefined" && "share" in navigator && typeof (navigator as any).share === "function";

  const handleNativeShare = useCallback(async () => {
    if (canNativeShare) {
      try {
        await (navigator as any).share({
          title: shareTitle,
          text: shareText,
          url: appUrl,
        });
        return;
      } catch {
        // User cancelled or share failed -> fallback to QR
      }
    }
    setQrOpen(true);
  }, [shareTitle, shareText, appUrl, canNativeShare]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text manually
    }
    setQrOpen(true);
  }, [appUrl]);


  const options: ShareOption[] = [
    ...(canNativeShare
      ? [
          {
            id: "native",
            label: t("share.native", "Partager…"),
            icon: <Share2 className="h-4 w-4" />,
            action: handleNativeShare,
            color: "text-primary",
          },
        ]
      : []),
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: <MessageCircle className="h-4 w-4" />,
      action: () => window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, "_blank"),
      color: "text-green-500",
    },
    {
      id: "sms",
      label: t("share.sms", "SMS"),
      icon: <Smartphone className="h-4 w-4" />,
      action: () => window.open(`sms:?body=${encodedText}%20${encodedUrl}`, "_blank"),
      color: "text-blue-500",
    },
    {
      id: "email",
      label: t("share.email", "Email"),
      icon: <Mail className="h-4 w-4" />,
      action: () => window.open(`mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`, "_blank"),
      color: "text-orange-500",
    },
    {
      id: "facebook",
      label: "Facebook",
      icon: <Facebook className="h-4 w-4" />,
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, "_blank"),
      color: "text-blue-600",
    },
    {
      id: "twitter",
      label: "X / Twitter",
      icon: <Twitter className="h-4 w-4" />,
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, "_blank"),
      color: "text-sky-500",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      icon: <Linkedin className="h-4 w-4" />,
      action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, "_blank"),
      color: "text-blue-700",
    },
    {
      id: "telegram",
      label: "Telegram",
      icon: <Send className="h-4 w-4" />,
      action: () => window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, "_blank"),
      color: "text-sky-400",
    },
    {
      id: "instagram",
      label: "Instagram",
      icon: <Instagram className="h-4 w-4" />,
      action: handleCopyLink,
      color: "text-pink-500",
    },
    {
      id: "copy",
      label: copied ? t("share.copied", "Lien copié !") : t("share.copyLink", "Copier le lien"),
      icon: copied ? <Check className="h-4 w-4" /> : <Link className="h-4 w-4" />,
      action: handleCopyLink,
      color: copied ? "text-green-500" : "text-muted-foreground",
    },
  ];

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="p-2.5 rounded-xl hover:bg-accent transition-all hover:scale-105"
            aria-label={t("share.share", "Partager")}
          >
            <Share2 className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {options.map((opt) => (
            <DropdownMenuItem
              key={opt.id}
              onClick={() => {
                opt.action();
                if (opt.id !== "native" && opt.id !== "copy" && opt.id !== "instagram") {
                  setOpen(false);
                }
              }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <span className={opt.color}>{opt.icon}</span>
              <span className="text-sm">{opt.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("share.qrTitle", "Scanner pour ouvrir")}</DialogTitle>
            <DialogDescription>
              {copied
                ? t("share.copied", "Lien copié !")
                : t("share.qrHint", "Scanne ce QR code pour ouvrir l'application.")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="rounded-2xl bg-white p-4 shadow-elevated">
              <QRCodeSVG value={appUrl} size={208} level="M" includeMargin={false} />
            </div>
            <div className="w-full flex items-center gap-2">
              <input
                readOnly
                value={appUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 min-w-0 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-medium hover:opacity-90"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Link className="h-3.5 w-3.5" />}
                {copied ? t("share.copied", "Copié") : t("share.copyLink", "Copier")}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

