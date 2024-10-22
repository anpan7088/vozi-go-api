import { Router } from 'express';
import * as controllers from './controllers.js';

const { getCitiesByName, getCitiesByCountry } = controllers;

const router = Router();

router.get("/name/:name", getCitiesByName);
router.get("/country/:country", getCitiesByCountry);

export default router;
