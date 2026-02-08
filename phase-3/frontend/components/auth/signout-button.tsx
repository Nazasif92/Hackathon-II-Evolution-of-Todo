"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signout } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SignoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignout = async () => {
    setLoading(true);
    try {
      await signout();
      router.push("/signin");
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
