"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-client";
import { LoadingSpinner } from "@/components/ui/loading";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication status and redirect
    if (isAuthenticated()) {
      router.push("/todos");
    } else {
      router.push("/signin");
    }
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
