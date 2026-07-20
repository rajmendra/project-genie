import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => res.json([]));
router.post('/', (req, res) => res.json({ success: true }));
router.patch('/:id', (req, res) => res.json({ success: true }));
router.delete('/:id', (req, res) => res.json({ success: true }));

export default router;
