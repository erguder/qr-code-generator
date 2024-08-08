const express = require('express');
const cookieParser = require('cookie-parser');
const { createClient } = require('@supabase/supabase-js');
const config = require('./config');
const userRoutes = require('./routes/userRoutes');
const qrRoutes = require('./routes/qrRoutes');

const app = express();
const supabase = createClient(config.supabaseUrl, config.supabaseKey);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/users', userRoutes);
app.use('/api/qr', qrRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
