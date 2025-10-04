import { Router } from 'express';
import { createEmailEntry, getEmailStats } from '../controllers/emailController.ts';

const router = Router();

router.post('/', createEmailEntry);
router.get('/stats', getEmailStats);

export default router;