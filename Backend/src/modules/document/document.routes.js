import express from 'express';
import * as documentController from './document.controller.js';
import authMiddleware from "../../shared/middlewares/auth.js";
import { uploadDocument } from '../../shared/utils/documentUpload.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/upload', uploadDocument.single('file'), documentController.uploadDocument);
router.get('/all', documentController.getAllDocuments);
router.get('/employee/:employeeId', documentController.getEmployeeDocuments);
router.patch('/:id/verify', documentController.verifyDocument);
router.delete('/:id', documentController.deleteDocument);

export default router;
