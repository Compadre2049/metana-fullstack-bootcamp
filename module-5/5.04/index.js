const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var blogs = [
  { id: 1, title: 'Blog post 1', content: 'Example blog post 1.' },
  { id: 2, title: 'Blog post 2', content: 'Example blog post 2.' },
  { id: 3, title: 'Blog post 3', content: 'Example blog post 3.' },
  { id: 4, title: 'Blog post 4', content: 'Example blog post 4.' },
];

app.get('/', (req, res) => {
  res.send('Hello from index page');
});

app.get('/blogs', (req, res) => {
  res.json(blogs);
});

app.get('/blogs/:id', (req, res) => {
  const { id } = req.params;
  const blog = blogs.find((x) => x.id.toString() === id);
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
    const lastId = blogs[blogs.length - 1]?.id || 0;
    const blog = {
      id: lastId + 1,
      title,
      content,
    };
    blogs.push(blog);
    console.log('posted blog: ', blog);
  } catch (err) {
    return res.status(400).json({
      error: err.toString(),
    });
  }
  res.json(blogs);
});

app.listen(PORT, () => console.log(`server started on port ${PORT}`));
