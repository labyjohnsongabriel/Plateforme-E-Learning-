// src/routes/index.ts
import { Router } from 'express';
import adminRoutes from './admin';
import authRoutes from './auth';
import courseRoutes from './courses';
import learningRoutes from './learning';
import notificationRoutes from './notifications';
import statsRoutes from './stats';

const router: Router = Router();

// Vérification que chaque route est bien définie
console.log('Routes chargées:');
console.log('authRoutes:', typeof authRoutes);
console.log('adminRoutes:', typeof adminRoutes);
console.log('courseRoutes:', typeof courseRoutes);
console.log('learningRoutes:', typeof learningRoutes);
console.log('notificationRoutes:', typeof notificationRoutes);
console.log('statsRoutes:', typeof statsRoutes);

// Utilisation des routes avec vérification
if (typeof authRoutes === 'function') {
  router.use('/auth', authRoutes);
} else {
  console.error('❌ authRoutes n\'est pas une fonction valide');
}

if (typeof adminRoutes === 'function') {
  router.use('/users', adminRoutes);
} else {
  console.error('❌ adminRoutes n\'est pas une fonction valide');
}

if (typeof courseRoutes === 'function') {
  router.use('/courses', courseRoutes);
} else {
  console.error('❌ courseRoutes n\'est pas une fonction valide');
}

if (typeof learningRoutes === 'function') {
  router.use('/learning', learningRoutes);
} else {
  console.error('❌ learningRoutes n\'est pas une fonction valide');
}

if (typeof notificationRoutes === 'function') {
  router.use('/notifications', notificationRoutes);
} else {
  console.error('❌ notificationRoutes n\'est pas une fonction valide');
}

if (typeof statsRoutes === 'function') {
  router.use('/admin', statsRoutes);
} else {
  console.error('❌ statsRoutes n\'est pas une fonction valide');
}

export default router;