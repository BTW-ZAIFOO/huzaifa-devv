/**
 * Simple utility to check server connectivity
 * Run with: node serverCheck.js in the terminal
 */

const checkServerStatus = () => {
  console.log("Checking server connectivity...");

  // Use the browser's fetch API instead of importing axios
  fetch("http://localhost:4000/api/health", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    mode: "cors",
  })
    .then((response) => {
      if (response.ok) {
        console.log("✅ Server is running and accessible");
        return response.json();
      }
      throw new Error(`Server returned status: ${response.status}`);
    })
    .then((data) => {
      console.log("Server response:", data);
    })
    .catch((error) => {
      console.error("❌ Server connection failed:", error);
      console.log("\nPossible reasons:");
      console.log(
        '1. Server is not running - start it with "npm start" in the server directory'
      );
      console.log(
        "2. Server is running on a different port - check your server configuration"
      );
      console.log("3. Firewall or network issues are blocking the connection");
      console.log(
        "4. CORS policy is preventing the connection - check server CORS settings"
      );

      console.log("\nTroubleshooting steps:");
      console.log("1. Make sure the server is running");
      console.log(
        "2. Try opening http://localhost:4000/api/health in your browser"
      );
      console.log("3. Check server logs for any errors");
      console.log(
        "4. Ensure the server is configured to accept connections from your client"
      );
    });
};

// This function can be used in the browser console or as a module
if (typeof window !== "undefined") {
  window.checkServerStatus = checkServerStatus;
  console.log(
    "Server check utility loaded. Run checkServerStatus() to test server connection."
  );
}

export default checkServerStatus;
