"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getMe, User } from "@/lib/auth-client";
import { SignoutButton } from "@/components/auth/signout-button";
import { LoadingSpinner } from "@/components/ui/loading";
import { CheckSquare, MessageSquare } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getMe();
      if (!currentUser) {
        router.push("/signin");
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navItems = [
    {
      href: "/todos",
      label: "Todos",
      icon: CheckSquare,
      isActive: pathname === "/todos",
    },
    {
      href: "/chat",
      label: "Chat",
      icon: MessageSquare,
      isActive: pathname === "/chat",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-semibold text-gray-900">
                Todo App
              </h1>
              <div className="flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={clsx(
                        "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        item.isActive
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <SignoutButton />
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
