import { RequestHandler } from 'express';
import multer from 'multer';
import { upload } from '../config/upload';

// Middleware for handling single file upload
export const uploadFile: RequestHandler = upload.single('file');