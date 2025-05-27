import React, { createContext, StrictMode, useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary";

export const Context = createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => { },
  user: null,
  setUser: () => { },
  isAdmin: false,
});

const AppWrapper = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const isAdmin = useMemo(() => user?.role === "admin", [user]);

  return (
    <Context.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        isAdmin
      }}
    >
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </Context.Provider>
  );
};

createRoot(document.getElementById("root") || (() => {
  throw new Error("Root element not found! Make sure you have a div with id 'root' in your HTML file.");
})()).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>
);