import { Router } from 'express';
import { 
    getRides, 
    getRideById, 
    createRide, 
    updateRide, 
    deleteRide, 
    getDepartList,
    getDestList,
    getRidesByUserId
} from './controllers.js';

const router = Router();

router.get('/', getRides);
router.get('/user/:id', getRidesByUserId);
router.get('/driver/:id', getRidesByUserId);
router.get('/departList', getDepartList);
router.get('/destList', getDestList);
router.get('/:id', getRideById);
router.post('/', createRide);
router.patch('/:id', updateRide);
router.delete('/:id', deleteRide);

export default router;
