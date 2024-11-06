import React from 'react'
import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import RootLayout from '../components/RootLayout';
import Home from '../pages/Home';
import About from '../pages/About';
import Projects from '../pages/Projects';
import Contact from '../pages/Contact';
import Blogs from '../pages/Blogs';
import BlogPost from '../pages/BlogPost';
import NotFound from '../pages/NotFound';

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:id" element={<BlogPost />} />
            <Route path="*" element={<NotFound />} />
        </Route>
    )
);
