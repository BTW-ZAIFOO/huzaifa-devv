import React, { createContext, StrictMode, useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary";

/**
 * Application Context for global state management
 */
export const Context = createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => { },
  user: null,
  setUser: () => { },
  isAdmin: false,
});

/**
 * Main App wrapper with context provider
 */
const AppWrapper = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Derive admin status from user role
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

// Render the application
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AppWrapper />
    </StrictMode>
  );
} else {
  console.error("Root element not found! Make sure you have a div with id 'root' in your HTML file.");
}