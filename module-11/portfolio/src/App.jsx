import React from 'react'
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/Router";
import Navbar from './components/Navbar';
import './index.css'

function App() {
  return (
    <div className='bg-tan min-h-screen w-full font-Jost overflow-x-hidden'>
      <div className='flex flex-col min-h-screen'>
        <Navbar />
        <main className='flex-grow'>
          <RouterProvider router={router} />
        </main>
      </div>
    </div>
  );
}

export default App;
