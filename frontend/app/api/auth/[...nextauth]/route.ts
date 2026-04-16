import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import https from "https"; 

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
    params: {
      prompt: "consent",
      access_type: "offline", 
      response_type: "code"
    }
  }
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "google") {
        try {
          // Opción A: Agente para ignorar SSL self-signed en desarrollo
          const agent = new https.Agent({ rejectUnauthorized: false });

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              googleId: user.id,
              photoUrl: user.image
            }),
            //@ts-ignore
            agent: agent 
          });

          if (response.ok) {
            const kemakData = await response.json();
            // Inyectamos la data de C# en el objeto user de NextAuth
            user.token = kemakData.token;
            user.roles = kemakData.roles;
            return true; 
          }
          
          console.error("Backend Kemak rechazó el acceso");
          return false; 

        } catch (error) {
          console.error("ERROR DE CONEXIÓN AL BACKEND:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }: any) {
      // Transferimos la data del user al token de la cookie
      if (user) {
        token.kemakToken = user.token;
        token.kemakRoles = user.roles;
      }
      return token;
    },

    async session({ session, token }: any) {
      // Transferimos la data del token a la sesión accesible desde el front
      if (session.user) {
        (session.user as any).token = token.kemakToken;
        (session.user as any).roles = token.kemakRoles;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };