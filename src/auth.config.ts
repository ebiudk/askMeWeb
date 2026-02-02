import type { NextAuthConfig } from "next-auth"
import Twitter from "next-auth/providers/twitter"
import Credentials from "next-auth/providers/credentials"

export default {
  providers: [
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    }),
    ...(process.env.NODE_ENV === "test" || process.env.ALLOW_TEST_AUTH === "true"
      ? [
          Credentials({
            id: "credentials",
            name: "Test Login",
            credentials: {
              username: { label: "Username", type: "text" },
            },
            async authorize(credentials) {
              if (credentials?.username) {
                return {
                  id: `id-${credentials.username}`,
                  name: credentials.username,
                  email: `${credentials.username}@example.com`,
                }
              }
              return null
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnLoginPage = nextUrl.pathname === "/login"
      const isPublicPage = nextUrl.pathname === "/" || nextUrl.pathname === "/groups/join"

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
