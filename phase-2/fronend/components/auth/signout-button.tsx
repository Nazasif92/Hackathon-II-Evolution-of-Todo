"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export function SignoutButton() {
  const { signout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignout = async () => {
    setLoading(true);
    try {
      await signout();
    } catch (error) {
      console.error("Signout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleSignout}
      loading={loading}
      disabled={loading}
    >
      Sign out
    </Button>
  );
}
