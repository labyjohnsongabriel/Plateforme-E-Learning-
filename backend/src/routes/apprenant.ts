import { Router, Request, Response, NextFunction } from 'express';
import AdministrateurController from '../controllers/user/AdministrateurController';
import authMiddleware from '../middleware/auth';
import authorize from '../middleware/authorization';
import { RoleUtilisateur } from '../types'; // Updated to match AdministrateurController

const router: Router = Router();

// Stats routes
router.get('/stats/global', authMiddleware, authorize([RoleUtilisateur.ADMIN]), AdministrateurController.getGlobalStats);
router.get('/stats/user/:userId', authMiddleware, authorize([RoleUtilisateur.ADMIN]), AdministrateurController.getUserStats);
router.get('/stats/course/:coursId', authMiddleware, authorize([RoleUtilisateur.ADMIN]), AdministrateurController.getCourseStats);

// User management routes
router.get('/users', authMiddleware, authorize([RoleUtilisateur.ADMIN]), AdministrateurController.getAllUsers);
router.put('/users/:userId', authMiddleware, authorize([RoleUtilisateur.ADMIN]), AdministrateurController.updateUser);
router.delete('/users/:userId', authMiddleware, authorize([RoleUtilisateur.ADMIN]), AdministrateurController.deleteUser);

// Course management routes
router.post('/courses', authMiddleware, authorize([RoleUtilisateur.ADMIN]), AdministrateurController.createCourse);
router.get('/courses', authMiddleware, authorize([RoleUtilisateur.ADMIN]), AdministrateurController.getAllCourses);
router.put('/courses/:coursId', authMiddleware, authorize([RoleUtilisateur.ADMIN]), AdministrateurController.updateCourse);
router.delete('/courses/:coursId', authMiddleware, authorize([RoleUtilisateur.ADMIN]), AdministrateurController.deleteCourse);

export default router;