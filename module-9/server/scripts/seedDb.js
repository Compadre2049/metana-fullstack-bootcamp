import mongoose from 'mongoose';
import User from '../models/User.js';
import Blog from '../models/Blog.js';
import { connectToDatabase } from '../db/dbconn.js';
import bcrypt from 'bcrypt';

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectToDatabase();

    // Clear existing data
    await User.deleteMany({});
    await Blog.deleteMany({});

    // Hash passwords
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedUserPassword = await bcrypt.hash('user123', 10);

    // Create admin user
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedAdminPassword,
      role: "admin"
    });

    // After creating the admin user
    console.log('Created admin user details:', {
      id: adminUser._id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      password: adminUser.password ? 'exists' : 'missing'
    });

    // Create normal user
    const normalUser = await User.create({
      name: "Normal User",
      email: "user@example.com",
      password: hashedUserPassword,
      role: "normal"
    });

    // Create some test blogs
    const blogs = await Blog.create([
      {
        title: "Admin's First Blog",
        content: "This is the admin's first blog post",
        user: adminUser._id
      },
      {
        title: "User's First Blog",
        content: "This is the normal user's first blog post",
        user: normalUser._id
      }
    ]);

    console.log('Database seeded!');
    console.log('Admin user created:', adminUser);
    console.log('Normal user created:', normalUser);
    console.log('Blogs created:', blogs);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
