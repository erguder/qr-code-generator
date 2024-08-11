require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const qrRoutes = require('./routes/qrRoutes');
const { supabase } = require('./config'); // Import supabase client
const { authenticateToken } = require('./middleware/auth'); // Assuming you have an auth middleware file

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/user', userRoutes);
app.use('/qr', qrRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the QR Code Generator App!');
});

app.use((req, res, next) => {
  res.status(404).send('Page not found');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/generate', (req, res) => {
  res.render('generate');
});

app.get('/dashboard', authenticateToken, async (req, res) => {
  const { data: qrcodes, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('user_id', req.user.id);

  if (error) return res.status(400).send(error.message);

  res.render('dashboard', { qrcodes });
});

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
