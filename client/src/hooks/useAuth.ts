import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    queryFn: async () => {
      const res = await fetch("/api/auth/user", {
        credentials: "include",
      });
      
      // Return null for unauthorized users (not logged in)
      if (res.status === 401) {
        return null;
      }
      
      // Throw for other errors
      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }
      
      return await res.json();
    },
  });

  return {
    user: user ?? undefined,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
