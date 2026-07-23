import { cache } from "react";

import { cookies } from "next/headers";

import type { AuthUser } from "@/types/auth-user";

export const getAuthenticatedUser = cache(async (): Promise<AuthUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return null
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/me`, {
    headers: {
      Cookie: `access_token=${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return null
  }

  return (await res.json()) as AuthUser;
});
