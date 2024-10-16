export var blogs = [
  { id: 1, title: 'Blog post 1', content: 'Example blog post 1.' },
  { id: 2, title: 'Blog post 2', content: 'Example blog post 2.' },
  { id: 3, title: 'Blog post 3', content: 'Example blog post 3.' },
  { id: 4, title: 'Blog post 4', content: 'Example blog post 4.' },
];

export const toInt = (id) => parseInt(id, 10);

const blogsMaxId = (id) => Math.max(...blogs.map((b) => b.id));

const blogExists = (id) => !!blogs.find((x) => x.id === id);

export function blogsFindById(blogId) {
  blogId = toInt(blogId);
  return blogs.find((x) => x.id === blogId);
}

export function newBlog({ id, title, content }) {
  const blogId = id || (blogsMaxId() || 0) + 1;
  return { id: blogId, title, content };
}

export function addBlog({ title, content }) {
  const blog = newBlog({ title, content });
  blogs.push(blog);
  return blog;
}

export function updateBlog(updatedBlog) {
  const id = toInt(updatedBlog.id);
  if (!blogExists(id)) {
    throw new Error(`blog with id ${id} not found`);
  }
  const filtered = blogs.filter((x) => x.id !== id);
  blogs = [...filtered, { ...updatedBlog, id }].sort((a, b) => a.id - b.id);
  return updatedBlog;
}

export function deleteBlog(blogId) {
  blogId = toInt(blogId);
  blogs = blogs.filter((x) => x.id !== blogId);
}
