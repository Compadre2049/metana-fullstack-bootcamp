import React from 'react'
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/Router";
import Navbar from './components/Navbar';
import './index.css'




function App() {

  return (
    <div className='bg-tan h-screen w-screen font-Jost'>
      <div>
        <Navbar />
        <RouterProvider router={router} />
      </div >
    </div>
  );
}

export default App;
