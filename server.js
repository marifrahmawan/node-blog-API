require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT;
const MONGODB_URL = process.env.DB_URL;

const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blog');

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use(blogRoutes);

app.use((err, req, res, next) => {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  const errorMessage = err.message;
  res
    .status(err.statusCode)
    .json({ message: 'Something went wrong.', errors: errorMessage });
});

mongoose
  .connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Successfully connect to database');
    app.listen(PORT, () => {
      console.log(`listening on http://localhost:${PORT}`);
    });
  });
