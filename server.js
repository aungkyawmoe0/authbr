// server.js
const express = require('express');
const serverless = require("serverless-http");
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const router = express.Router();
const app = express();

app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb+srv://akm:2132001akm@akm.d9cx4ad.mongodb.net/?retryWrites=true&w=majority&appName=AKM', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
 // useCreateIndex: true,
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

// Register route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword });

  try {
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user._id }, 'secretkey');
  res.json({ token });
});

// app.listen(5000, () => {
//   console.log('Server is running on port 5000');
// });

app.use("/.netlify/functions/app", router);
module.exports.handler = serverless(app);