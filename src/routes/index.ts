import { Router } from 'express';
import adminRoutes from './admin';
import authRoutes from './auth';
import courseRoutes from './course';
import learningRoutes from './learning';
import notificationRoutes from './notification';
import statsRoutes from './stats';

const router: Router = Router();

// Utilisation correcte des variables importées
router.use('/auth', authRoutes);
router.use('/users', adminRoutes); // 'users' géré par les routes admin
router.use('/courses', courseRoutes);
router.use('/learning', learningRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', statsRoutes);

export default router;
