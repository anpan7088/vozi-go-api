import { Router } from 'express';
import { 
    getRides, 
    getRideById, 
    createRide, 
    patchRide, 
    deleteRide, 
    getDepartList,
    getDestList,
    getRidesByUserId,
    getDepartTextList, 
    getDestTextList
} from './controllers.js';

const router = Router();

router.get('/', getRides);
router.get('/user/:id', getRidesByUserId);
router.get('/driver/:id', getRidesByUserId);
router.get('/departList', getDepartList);
router.get('/departTextList', getDepartTextList);
router.get('/destTextList', getDestTextList);
router.get('/destList', getDestList);
router.get('/:id', getRideById);
router.post('/', createRide);
router.patch('/:id', patchRide);
router.delete('/:id', deleteRide);

export default router;
