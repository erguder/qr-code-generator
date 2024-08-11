const express = require('express');
const qrcode = require('qrcode');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config');
const config = require('../config');

const router = express.Router();

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

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({ data });
  } catch (err) {
    res.status(500).json({ error: 'QR Code generation failed' });
  }
});

router.get('/dashboard', authenticateToken, async (req, res) => {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', req.user.id);

  if (error) {
    return res.status(400).send(error.message);
  }

  res.status(200).json({ data });
});

module.exports = router;
