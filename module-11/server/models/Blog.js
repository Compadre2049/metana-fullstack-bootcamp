import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      return ret;
    }
  }
});

blogSchema.pre('save', async function (next) {
  if (!this.user) {
    return next(new Error('User is required'));
  }

  if (typeof this.user === 'string') {
    this.user = new mongoose.Types.ObjectId(this.user);
  }

  next();
});

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
