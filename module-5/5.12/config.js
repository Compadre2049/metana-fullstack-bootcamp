// config.js
import 'dotenv/config';

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME;

export { PORT, MONGO_URI, MONGO_DB_NAME };
