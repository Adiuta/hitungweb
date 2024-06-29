const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'proyek_konstruksi';
const client = new MongoClient(url);

// Rute untuk menampilkan formulir lupa sandi
router.get('/forgotPassword', (req, res) => {
  res.render('forgotPassword', { title: 'Forgot Password' });
});

// Rute untuk mengirim email reset sandi
router.post('/forgotPassword', async (req, res) => {
  const { email } = req.body;
  try {
    await client.connect();
    const db = client.db(dbName);
    const userCollection = db.collection('users');

    const normalizedEmail = email ? email.toLowerCase() : '';
    const user = await userCollection.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).send('User not found');
    }

    const token = crypto.randomBytes(20).toString('hex');
    const resetPasswordExpires = Date.now() + 3600000; // 1 jam

    await userCollection.updateOne(
      { email: normalizedEmail },
      { $set: { resetPasswordToken: token, resetPasswordExpires: resetPasswordExpires } }
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password',
      },
    });

    const mailOptions = {
      to: user.email,
      from: 'passwordreset@demo.com',
      subject: 'Password Reset',
      text: `Please click on the following link, or paste it into your browser to complete the process: http://${req.headers.host}/reset-password/${token}`,
    };

    transporter.sendMail(mailOptions, (err, response) => {
      if (err) {
        console.error('There was an error: ', err);
      } else {
        res.status(200).send('Recovery email sent');
      }
    });
  } catch (error) {
    console.error('Error during password reset request:', error);
    res.status(500).send('Terjadi kesalahan saat meminta reset password.');
  }
});

module.exports = router;
