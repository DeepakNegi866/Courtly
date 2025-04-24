import NextAuth from "next-auth/next";
import CredentialsProvider  from "next-auth/providers/credentials";

const authOptions = {
    providers:[
        CredentialsProvider({
            id:"credentials",
            name:"credentials",
            credentials:{},
            async authorize(credentials){
                const {email, password} = credentials;
                const url = process.env.NEXT_PUBLIC_APIURL+"/auth/login";
                try {
                  const res = await fetch(url, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                  });
        
                  if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || "Invalid credentials");
                  }
        
                  const { data } = await res.json();
                  if (data && data.token) {
                    
                    const user = {
                      id: data.id,
                      email: data.email,
                      role: data.role,
                      access_token: data.token,
                      mobile: data.phoneNumber,
                    };
                    return user;
                  } else {
                    throw new Error("Invalid credentials");
                  }
                } catch (error) {
                  console.error("Authorization error:", error);
                  throw new Error("Authorization failed");
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    secret:process.env.NEXTAUTH_SECRET,
    pages: {
        signIn:"/",
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