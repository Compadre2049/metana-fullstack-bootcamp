import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, Navigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import RootLayout from '../components/RootLayout';
import Home from '../pages/Home';
import About from '../pages/About';
import Projects from '../pages/Projects';
import Contact from '../pages/Contact';
import Blogs from '../pages/Blogs';
import BlogPost from '../pages/BlogPost';
import NotFound from '../pages/NotFound';
import Login from '../pages/Login';
import Profile from '../pages/Profile';
import ExamplePrivatePage from '../pages/ExamplePrivatePage';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route element={<RootLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blogs" element={<Blogs />} />        {/* Made public */}
            <Route path="/blogs/:id" element={<BlogPost />} /> {/* Made public */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/private"
                element={
                    <ProtectedRoute>
                        <ExamplePrivatePage />
                    </ProtectedRoute>
                }
            />

            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
        </Route>
    )
);