import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/Router";
import { AuthProvider } from "./context/AuthContext"; // Add this import

function App() {
  console.log('App component rendered');
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;