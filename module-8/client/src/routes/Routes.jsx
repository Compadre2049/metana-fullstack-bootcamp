import React from 'react'
import Home from "../pages/Home";
import About from "../pages/About";
import Projects from "../pages/Projects";
import Contact from "../pages/Contact";
import Blogs from "../pages/Blogs";

export const ROUTES = [
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/about",
        element: <About />,
    },
    {
        path: "/projects",
        element: <Projects />,
    },
    {
        path: "/contact",
        element: <Contact />,
    },
    {
        path: "/blogs",
        element: <Blogs />,
    },
];
