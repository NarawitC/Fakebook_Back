const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

require('dotenv').config();
const app = express();
const port = process.env.PORT || 8000;
const notFoundMiddleware = require('./middlewares/notFound');
const errorMiddleware = require('./middlewares/error');
const authenticateMiddleware = require('./middlewares/authenticate');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const friendRouter = require('./routes/friendRoutes');
const postRouter = require('./routes/postRoutes');
// ----------------------------- Sync to create database -----------------------------
// const { sequelize } = require('./models/index');
// sequelize.sync({ alter: true });
// ----------------------------- Sync to create database -----------------------------

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/auth', authRouter);
app.use('/user', authenticateMiddleware, userRouter);
app.use('/friends', authenticateMiddleware, friendRouter);
app.use('/posts', authenticateMiddleware, postRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(port, () => console.log(`\n\n\nRunning port ${port}`));
