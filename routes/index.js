const express = require('express');
const router = express.Router();

// Define the root route
router.get('/', (req, res) => {
  res.render('index', { title: 'Home', user: req.session.user });
});

module.exports = router;
