"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X, Route } from "lucide-react";

const DEMO_STEPS = [
  { label: "Quotation", short: "Quote", path: "/quotations/Q7" },
  { label: "Engineering Drawing", short: "Drawing", path: "/engineering/DWG3" },
  { label: "Bill of Materials", short: "BOM", path: "/bom/3" },
  { label: "Bill of Quantities", short: "BOQ", path: "/boq/BOQ3" },
  { label: "Sales Order", short: "SO", path: "/sales-orders/SO6" },
  { label: "Project", short: "Project", path: "/projects/EP6" },
  { label: "Work Order", short: "WO", path: "/production/work-orders" },
  { label: "Shopfloor", short: "Shop", path: "/production/shopfloor" },
  { label: "Delivery Order", short: "DO", path: "/delivery-orders/SH2" },
  { label: "Invoice", short: "Invoice", path: "/invoicing/INV6" },
  { label: "Dashboard", short: "Dash", path: "/" },
];

const STORAGE_KEY = "demo-journey-bar-visible";

function matchStep(stepPath: string, pathname: string): boolean {
  if (stepPath === "/") return pathname === "/";
  const basePath = stepPath.split("?")[0];
  return pathname.startsWith(basePath);
}

export default function DemoJourneyBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setIsVisible(stored === "true");
    }
    setMounted(true);
  }, []);

  const toggleVisibility = () => {
    const next = !isVisible;
    setIsVisible(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  const currentIndex = DEMO_STEPS.findIndex((step) =>
    matchStep(step.path, pathname)
  );

  const goToPrev = () => {
    if (currentIndex > 0) {
      router.push(DEMO_STEPS[currentIndex - 1].path);
    }
  };

  const goToNext = () => {
    if (currentIndex < DEMO_STEPS.length - 1) {
      router.push(DEMO_STEPS[currentIndex + 1].path);
    }
  };

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) return null;

  // Toggle button when bar is hidden
  if (!isVisible) {
    return (
      <button
        onClick={toggleVisibility}
        className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/95 text-slate-300 shadow-lg backdrop-blur-sm border border-slate-700 hover:bg-slate-800 hover:text-white transition-colors"
        aria-label="Show demo journey bar"
      >
        <Route className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-700 bg-slate-900/95 backdrop-blur-sm px-4 py-3">
      <div className="flex items-center gap-2">
        {/* Prev button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrev}
          disabled={currentIndex <= 0}
          className="shrink-0 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30"
          aria-label="Previous step"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Steps container */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-0">
            {DEMO_STEPS.map((step, index) => {
              const isCurrent = index === currentIndex;
              const isBefore = currentIndex >= 0 && index < currentIndex;
              const isAfter = currentIndex >= 0 ? index > currentIndex : true;

              return (
                <button
                  key={step.path}
                  onClick={() => router.push(step.path)}
                  className={cn(
                    "shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors border",
                    "md:px-3 md:py-1.5 md:text-sm",
                    isCurrent &&
                      "bg-blue-600 text-white border-blue-600 shadow-sm",
                    isBefore &&
                      "bg-green-600/20 text-green-400 border-green-600 hover:bg-green-600/30",
                    isAfter &&
                      !isCurrent &&
                      "bg-slate-700/50 text-slate-400 border-slate-600 hover:bg-slate-700"
                  )}
                >
                  <span className="md:hidden">
                    {index + 1}. {step.short}
                  </span>
                  <span className="hidden md:inline">
                    {index + 1}. {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Next button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNext}
          disabled={currentIndex >= DEMO_STEPS.length - 1}
          className="shrink-0 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30"
          aria-label="Next step"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Close button */}
        <button
          onClick={toggleVisibility}
          className="shrink-0 ml-1 text-slate-500 hover:text-white transition-colors"
          aria-label="Hide demo journey bar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
