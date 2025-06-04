// Import necessary modules from React and other libraries
import React, { createContext, StrictMode, useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary";

// Create a Context to share authentication and user state across the app
export const Context = createContext({

  isAuthenticated: false, // Tracks if the user is authenticated
  setIsAuthenticated: () => { }, // Function to update authentication status
  user: null, // Stores user information
  setUser: () => { }, // Function to update user info
  isAdmin: false, // Tracks if the user is an admin
  isAuthLoading: true, // Tracks if authentication status is loading
  setIsAuthLoading: () => { }, // Function to update loading status
});

// Wrapper component to provide context and error boundary to the app
const AppWrapper = () => {

  // State to track if the user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // State to store user information
  const [user, setUser] = useState(null);

  // State to track if authentication status is loading
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Memoized value to determine if the user is an admin based on their role
  const isAdmin = useMemo(() => user?.role === "admin", [user]);

  return (

    // Provide context values to all child components
    <Context.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        isAdmin,
        isAuthLoading,
        setIsAuthLoading
      }}
    >

      {/* ErrorBoundary catches errors in the component tree and displays a fallback UI */}
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </Context.Provider>
  );
};

// Find the root element in the HTML and render the app inside it
createRoot(
  document.getElementById("root") || (() => {

    // Throw an error if the root element is not found
    throw new Error("Root element not found! Make sure you have a div with id 'root' in your HTML file.");
  })
).render(

  // StrictMode helps highlight potential problems in an application
  <StrictMode>
    <AppWrapper />
  </StrictMode>
);