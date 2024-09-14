const express = require('express');
const { getCitiesByName, getCitiesByCountry } = require('./controllers');

const router = express.Router();

router.get("/name/:name", getCitiesByName);
router.get("/country/:country", getCitiesByCountry);

module.exports = router;
