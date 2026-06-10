// AUTH BYPASS: Returning mock session for development
// To re-enable real auth, restore the original code below

export async function getSession() {
  return {
    user: {
      id: "dev-user-bypass",
      name: "Dev User",
      email: "dev@pulsetrack.local",
      image: null,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

// --- ORIGINAL SESSION (re-enable when login is fixed) ---
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// export function getSession() {
//   return getServerSession(authOptions);
// }
