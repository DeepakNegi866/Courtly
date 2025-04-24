import "@/styles/globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { AppProvider } from "@/components/AppContext/provider";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  const router = useRouter();

  useEffect(() => {
    // Redirect logic
    if (router.pathname === "/management/case-configurations") {
      router.replace("/management/case-configurations/high_courts");
    }
  }, [router]);

  // If `getLayout` is defined, use it; otherwise, render the component as-is
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <>
      <AppProvider>
        <SessionProvider session={session}>
          {getLayout(
            <>
              <Component {...pageProps} />
              <Head>
                <title>Digikase</title>
              </Head>
              <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </>
          )}
        </SessionProvider>
      </AppProvider>
    </>
  );
}
