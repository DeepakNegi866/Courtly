import { createContext, useEffect, useState } from "react";
import Axios from "@/config/axios";

// Create the context
export const AppContext = createContext();

// Create a provider component
export const AppProvider = ({ children }) => {
  const [allNotification, setAllNotification] = useState([]);

  useEffect(() => {
    getAllNotification();
  }, []);

  const getAllNotification = async () => {
    try {
      const res = await Axios.get(`/notification/all`, {
        authenticated: true,
      });
      setAllNotification(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <AppContext.Provider
      value={{
        allNotification,
        setAllNotification,
        getAllNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
