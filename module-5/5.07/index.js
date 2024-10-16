import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {
  blogs,
  addBlog,
  deleteBlog,
  updateBlog,
  blogsFindById,
} from './blogs.js';

const app = express();
const PORT = 3000;
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello from index page');
});

app.get('/blogs', (req, res) => {
  res.json(blogs);
});

app.get('/blogs/:id', (req, res) => {
  const { id } = req.params;
  const blog = blogsFindById(id);
  if (!blog) {
    return res.status(404).json({ error: 'blog not found' });
  }
  res.status(200).json(blog);
});

app.post('/blogs', (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      throw new Error('title or content is empty');
    }
    const blog = addBlog({ title, content });
    console.log('posted blog: ', blog);
  } catch (err) {
    return res.status(400).json({
      error: err.toString(),
    });
  }
  res.json(blogs);
});

app.get('/blogs/:id', (req, res) => {
  const { id } = req.params;
  const blog = blogsFindById(id);
  if (!blog) {
    return res.status(404).json({ error: 'blog not found' });
  }
  res.status(200).json(blog);
});

app.put('/blogs/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    if (!title || !content) {
      throw new Error('title or content is empty');
    }
    const existing = blogsFindById(id);
    if (!existing) {
      throw new Error(`blog with id ${id} not found`);
    }
    const updated = updateBlog({ id, title, content });
    console.log(`updated blog: ${updated}`);
    res.status(200).json(updated);
  } catch (err) {
    return res.status(400).json({
      error: err.toString(),
    });
  }
});

app.delete('/blogs/:id', (req, res) => {
  try {
    const { id } = req.params;
    const blog = blogsFindById(id);
    deleteBlog(id);
    console.log(`deleted blog: ${id}`);
    res.status(200).json(blog || {});
  } catch (err) {
    return res.status(400).json({
      error: err.toString(),
    });
  }
});

app.listen(PORT, () => console.log(`server started on port ${PORT}`));
