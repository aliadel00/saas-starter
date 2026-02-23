"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#18181b",
          color: "#fafafa",
          borderRadius: "0.75rem",
          fontSize: "0.875rem",
        },
        success: {
          iconTheme: { primary: "#22c55e", secondary: "#fafafa" },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "#fafafa" },
        },
      }}
    />
  );
}
