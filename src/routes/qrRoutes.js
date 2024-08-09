const express = require('express');
const qrcode = require('qrcode');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const supabase = createClient(config.supabaseUrl, config.supabaseKey);

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

router.post('/generate', authenticateToken, async (req, res) => {
  const { link } = req.body;

  try {
    const qr = await qrcode.toDataURL(link);
    const { data, error } = await supabase
      .from('qr_codes')
      .insert([{ user_id: req.user.id, link, qr_code: qr }]);

    if (error) return res.status(400).send(error.message);

    res.status(201).send(data);
  } catch (err) {
    res.status(500).send('QR Code generation failed');
  }
});

router.get('/dashboard', authenticateToken, async (req, res) => {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', req.user.id);

  if (error) return res.status(400).send(error.message);

  res.status(200).send(data);
});

module.exports = router;
