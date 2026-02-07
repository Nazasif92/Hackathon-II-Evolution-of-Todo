import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function HomePage() {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: headers(),
  });

  if (session) {
    // User is authenticated, redirect to todos
    redirect("/todos");
  } else {
    // User is not authenticated, redirect to signin
    redirect("/signin");
  }
}
