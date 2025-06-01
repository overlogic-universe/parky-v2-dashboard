"use client";

import { createContext, useContext, useState, ReactNode, useId } from "react";
import clsx from "clsx";

interface TabsContextProps {
  value: string;
  setValue: (value: string) => void;
  idPrefix: string;
}

const TabsContext = createContext<TabsContextProps | null>(null);

export function Tabs({
  defaultValue,
  onValueChange,
  children,
  className,
}: {
  defaultValue: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}) {
  const [value, setValueState] = useState(defaultValue);
  const idPrefix = useId();

  const setValue = (newValue: string) => {
    setValueState(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, setValue, idPrefix }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("flex gap-1", className)}>{children}</div>;
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.value === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => context.setValue(value)}
      className={clsx(
        "px-4 py-2 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-brand-500 text-white shadow"
          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-white/90 hover:bg-gray-200 dark:hover:bg-gray-600",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.value !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`${context.idPrefix}-panel-${value}`}
      aria-labelledby={`${context.idPrefix}-tab-${value}`}
      className={clsx("mt-4", className)}
    >
      {children}
    </div>
  );
}
