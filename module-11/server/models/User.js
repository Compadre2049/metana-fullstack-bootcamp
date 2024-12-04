import mongoose from "mongoose";
import Blog from './Blog.js';  // Import the Blog model

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "normal"],
      default: "normal",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Define the index at schema level instead of using pre-save hook
UserSchema.index(
  { email: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 },
    background: true,
    name: 'email_unique_custom'  // Custom name to avoid conflicts
  }
);

// Add this to ensure indexes are created when the model is compiled
UserSchema.set('autoIndex', true);

// Add pre-remove middleware to delete associated blogs
UserSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    console.log('Deleting blogs for user:', this._id);

    // Delete all blogs associated with this user
    const result = await Blog.deleteMany({ user: this._id });
    console.log(`Deleted ${result.deletedCount} blogs`);

    next();
  } catch (error) {
    console.error('Error deleting user blogs:', error);
    next(error);
  }
});

// Also handle deleteMany
UserSchema.pre('deleteMany', async function (next) {
  try {
    // Get the filter conditions used in the deleteMany operation
    const filter = this.getFilter();

    // Find all users that match the filter
    const users = await this.model.find(filter).select('_id');
    const userIds = users.map(user => user._id);

    // Delete all blogs associated with these users
    const result = await Blog.deleteMany({ user: { $in: userIds } });
    console.log(`Deleted ${result.deletedCount} blogs for ${userIds.length} users`);

    next();
  } catch (error) {
    console.error('Error in deleteMany middleware:', error);
    next(error);
  }
});

const User = mongoose.model("User", UserSchema);

// Create indexes immediately after model creation
User.createIndexes().catch(error => {
  console.error('Error creating indexes:', error);
});

export default User;
