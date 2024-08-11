import express from 'express';
import qrcode from 'qrcode';
import { supabase } from '../config.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

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

export default router;
