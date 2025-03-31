import "@/styles/globals.css";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Head from "next/head";
import { SessionProvider } from "next-auth/react";

export default function App({ Component, pageProps: { session, ...pageProps }, }) {

  const getLayout = Component.getLayout || ((page) => page);
  
  return (
    <>
    <Head>
    <title>Digicase</title>
    </Head>
    <SessionProvider session={session}>
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
      {getLayout(<Component {...pageProps} />)}
    </SessionProvider>
    </>
  );
}
