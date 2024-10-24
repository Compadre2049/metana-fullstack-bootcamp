import React from "react"
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/Router";

function App() {
  console.log('App component rendered');
  return (
    <RouterProvider router={router} />
  );
}

export default App;
