"use client";

import { ConvexProvider } from "convex/react";
import convex from "@/lib/convex-client";
import { ReactNode } from "react";

interface ConvexClientProviderProps {
  children: ReactNode;
}

export default function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}