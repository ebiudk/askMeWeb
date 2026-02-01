import type { NextAuthConfig } from "next-auth"
import Twitter from "next-auth/providers/twitter"

export default {
  providers: [
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnLoginPage = nextUrl.pathname === "/login"
      const isPublicPage = nextUrl.pathname === "/"

      if (isOnLoginPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl))
        }
        return true
      }

      if (isPublicPage) return true

      return isLoggedIn
    },
  },
} satisfies NextAuthConfig
