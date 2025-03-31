import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_APIURL + 'v1';

const Axios = axios.create({
  baseURL: baseURL, // Replace with your API base URL
});

Axios.interceptors.request.use(
  async (config) => {
    if (config.token) {
      config.headers['Authorization'] = `Bearer ${config.token}`;
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
  (error) => {
    if (error.response && error.response.status === 401) {
    }

    // For other errors, return the error as is
    return Promise.reject(error);
  }
);


export default Axios;