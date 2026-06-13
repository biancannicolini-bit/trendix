import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    subscriptionStatus?: string;
    isAdmin?: boolean;
  }

  interface Session {
    user: {
      id: string;
      subscriptionStatus: string;
      isAdmin: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    subscriptionStatus?: string;
    isAdmin?: boolean;
  }
}
