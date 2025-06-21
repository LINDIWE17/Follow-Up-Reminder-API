require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Optional middleware logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Mongoose model
const reminderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  remindAt: { type: Date, required: true }
}, { timestamps: true });

const Reminder = mongoose.model('Reminder', reminderSchema);

// Routes

// Create
app.post('/reminders', async (req, res) => {
  const { title, description, remindAt } = req.body;
  if (!title || !remindAt) return res.status(400).json({ message: 'Title and remindAt are required.' });

  try {
    const reminder = await Reminder.create({ title, description, remindAt });
    res.status(201).json(reminder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all
app.get('/reminders', async (req, res) => {
  const reminders = await Reminder.find().sort({ remindAt: 1 });
  res.json(reminders);
});

// Get one
app.get('/reminders/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
app.delete('/reminders/:id', async (req, res) => {
  try {
    const deleted = await Reminder.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Reminder not found' });
    res.json({ message: 'Reminder deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));