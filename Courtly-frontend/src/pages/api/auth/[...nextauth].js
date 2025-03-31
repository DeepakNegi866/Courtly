import NextAuth from "next-auth/next";
import CredentialsProvider  from "next-auth/providers/credentials";

const authOptions = {
    providers:[
        CredentialsProvider({
            id:"credentials",
            name:"credentials",
            credentials:{},
            async authorize(credentials){
                const {username, password} = credentials;
                const url = process.env.NEXT_PUBLIC_APIURL+"v1/auth/sign-in";
                const res = await fetch(url, {
                    method: 'POST',
                    body: JSON.stringify({username, password}),
                    headers: { "Content-Type": "application/json" }
                  })
                  const {user,access_token} = await res.json()
                  // If no error and we have user data, return it
                  if (res.ok && user) {
                    const {fullName:name,email,id,role} = user;
                    const payload = {name,email,id,role:role.title,access_token};
                    return payload
                  }
                  // Return null if user data could not be retrieved
                  return null;

            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    secret:process.env.NEXTAUTH_SECRET,
    pages: {
        signIn:"/login",
    },
    callbacks: {
          async jwt({ token, user }) {
            if(user) {
                token.role = user.role;
                token.id = user.id;
                token.accessToken = user.access_token
            }
            return token
          },
          async session({ session, token }) {
            session.user.role = token.role;
            session.user.id = token.id;
            session.user.accessToken = token.accessToken;
            return session
          }
      }
};

export default NextAuth(authOptions);