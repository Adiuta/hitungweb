const express = require('express');
const router = express.Router();

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      res.status(500).send('Terjadi kesalahan saat logout.');
    } else {
      res.redirect('/'); // Arahkan ke halaman utama setelah logout
    }
  });
});

module.exports = router;
