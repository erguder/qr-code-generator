const express = require('express');
const bcrypt = require('becryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const supabase = createClient(config.supabaseUrl, config.supabaseKey);

router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
        .from('users')
        .insert([{ email, password: hashedPassword}]);

    if(error) return res.status(400).send(error.message);

    res.status(201).send(data);
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (error) return res.status(400).send(error.message);

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (isValidPassword) return res.status(400).send('Invalid password!');

    const token = jwt.sign([ id: user.id ], config.jwtSecret, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    res.status(200).send('Login successful');
});

