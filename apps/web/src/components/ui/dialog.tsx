"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[100] bg-ink/60 backdrop-blur-sm data-[state=open]:animate-overlay-in",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Fullskjerm på mobil, sentrert kort fra sm og oppover.
        "fixed inset-0 z-[101] flex flex-col overflow-hidden bg-white outline-none data-[state=open]:animate-sheet-in",
        "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[92vh] sm:w-[calc(100vw-1.5rem)] sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border sm:border-leaf-100 sm:shadow-2xl sm:shadow-ink/25 sm:data-[state=open]:animate-dialog-in",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        aria-label="Lukk"
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-soft shadow-sm transition-colors hover:bg-leaf-50 hover:text-ink focus-visible:ring-2 focus-visible:ring-leaf-400/40"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden
        >
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("font-display text-xl font-bold text-ink", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("mt-1.5 text-sm leading-relaxed text-ink-soft", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
};
