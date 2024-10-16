import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
import { PORT } from './config.js';
import blogsRouter from './routes/blogsRouter.js';

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/blogs', blogsRouter);

app.get('/', (req, res) => {
  res.send('Hello from index page');
});

app.listen(PORT, () => console.log(`server started on port ${PORT}`));
