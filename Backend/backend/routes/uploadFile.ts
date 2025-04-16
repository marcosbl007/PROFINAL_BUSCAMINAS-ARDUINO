import express from 'express';
import multer from 'multer';
import { uploadController } from '../controllers/uploadController';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), uploadController.processUploadedFile);

export default router;