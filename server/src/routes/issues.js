import express from 'express';
import { upload } from '../config/cloudinary.js';
import { createIssue, getIssue, listIssues, toggleUpvote, updateStatus } from '../controllers/issueController.js';

const router = express.Router();

router.get('/', listIssues);
router.get('/:id', getIssue);
router.post('/', upload.single('photo'), createIssue);
router.post('/:id/upvote', toggleUpvote);
router.patch('/:id/status', updateStatus);

export default router;
