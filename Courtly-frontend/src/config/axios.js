import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const baseURL = process.env.NEXT_PUBLIC_APIURL;

const Axios = axios.create({
  baseURL: baseURL, // Replace with your API base URL
});

Axios.interceptors.request.use(
  async (config) => {
    if (config.headers["Authorization"]) {
      return config;
    }

    if (config.authenticated && config.context) {
      const session = await getSession(config.context);

      if (session?.user?.accessToken) {
        config.headers["Authorization"] = `Bearer ${session.user.accessToken}`;
      }

      delete config.authenticated;
      delete config.context;
    } else if (config.authenticated) {
      const session = await getSession();

      if (session?.user?.accessToken) {
        config.headers["Authorization"] = `Bearer ${session.user.accessToken}`;
      }

      delete config.authenticated;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

Axios.interceptors.response.use(
  (response) => {
    // If the response is successful (status code 2xx), return it as is
    return response;
  },
  async (error) => {
    if (error.response) {
      // const { status } = error.response;

      // Handle 403 Forbidden error
      // if (status === 403) {
      //   await signOut({ redirect: true, callbackUrl: "/" });
      // }
    }

    // For other errors, return the error as is
    return Promise.reject(error);
  }
);

export default Axios;
