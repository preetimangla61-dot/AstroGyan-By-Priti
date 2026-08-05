import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
      <p className="text-foreground/50 animate-pulse text-sm">Consulting the charts...</p>
    </div>
  );
}
