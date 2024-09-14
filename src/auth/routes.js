const express = require('express');
const { registerUser, loginUser } = require('./controllers'); // Adjust the path to the controllers module

const router = express.Router();

router.post("/register", registerUser);
router.post('/login', loginUser);

module.exports = router;
