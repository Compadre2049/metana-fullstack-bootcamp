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
import AdminPage from '../pages/AdminPage';
import CreateBlog from '../pages/CreateBlog';
import EditBlog from '../pages/EditBlog';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    console.log('ProtectedRoute rendered');
    console.log('isAuthenticated:', isAuthenticated);

    if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to login...');
        return <Navigate to="/login" replace />;
    }
    console.log('User authenticated, rendering protected content...');
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
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Blog Routes */}
            <Route
                path="/blogs/create"
                element={
                    <ProtectedRoute>
                        <CreateBlog />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/blogs/edit/:id"
                element={
                    <ProtectedRoute>
                        <EditBlog />
                    </ProtectedRoute>
                }
            />

            {/* Public Blog Route */}
            <Route path="/blogs/:id" element={<BlogPost />} />

            {/* Other Protected Routes */}
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
                        <AdminPage />
                    </ProtectedRoute>
                }
            />

            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
        </Route>
    )
);