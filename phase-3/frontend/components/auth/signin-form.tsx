"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signin } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function SigninForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[SigninForm] Form submitted");
    setErrors({});

    if (!validateForm()) {
      console.log("[SigninForm] Validation failed");
      return;
    }

    setLoading(true);

    try {
      console.log("[SigninForm] Calling signin function");
      const result = await signin(formData.email, formData.password);
      console.log("[SigninForm] Signin result:", result);

      if (!result.success) {
        const errorMsg = result.error || "Invalid email or password";
        console.log("[SigninForm] Signin failed:", errorMsg);
        setErrors({ general: errorMsg });
        setLoading(false);
        return;
      }

      console.log("[SigninForm] Signin successful, redirecting to /todos");
      // Redirect to todos on success
      router.push("/todos");
    } catch (error) {
      console.error("[SigninForm] Unexpected error:", error);
      setErrors({ general: "An unexpected error occurred" });
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Sign in to your account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              {errors.general}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="you@example.com"
            error={errors.email}
            disabled={loading}
            required
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="Enter your password"
            error={errors.password}
            disabled={loading}
            required
          />

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            Sign in
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary-600 hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
