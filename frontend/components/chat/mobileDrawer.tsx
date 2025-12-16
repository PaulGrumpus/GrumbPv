'use client';

import { ReactNode, useEffect } from "react";

interface MobileProfileDrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  slideDirection?: "up" | "down";
}

const MobileDrawer = ({
  open,
  onClose,
  children,
  slideDirection = "up",
}: MobileProfileDrawerProps) => {
  // Prevent background scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-0 flex items-center justify-center px-4 pointer-events-none">
        <div
          className={[
            "w-full max-w-[80%]",
            "rounded-2xl",
            "bg-white",
            "shadow-2xl",
            "overflow-y-auto",
            "max-h-[80vh]",
            slideDirection === "up"
              ? "animate-slide-from-bottom"
              : "animate-slide-from-top",
            "pointer-events-auto",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {/* Header */}
          {/* <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="w-12" />
            <div className="h-1.5 w-12 rounded-full bg-gray-300" />
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-2xl font-semibold text-gray-700 shadow transition hover:border-gray-300 active:shadow-inner"
              aria-label="Close drawer"
            >
              ✕
            </button>
          </div> */}

          {/* Content */}
          <div className="p-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDrawer;
