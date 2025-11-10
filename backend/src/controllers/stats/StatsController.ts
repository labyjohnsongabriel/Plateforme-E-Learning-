// src/controllers/stats/StatsController.ts
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import * as StatisticsService from '../../services/report/StatisticsService';

export class StatsController {
  /**
   * Récupérer les statistiques globales
   */
  public static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await StatisticsService.getGlobalStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupérer les statistiques d'un utilisateur
   */
  public static async getUserStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      
      // Vérifier que userId est défini et valide
      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'ID utilisateur manquant'
        });
        return;
      }

      // Convertir en ObjectId si c'est une chaîne valide
      const userObjectId = Types.ObjectId.isValid(userId) 
        ? new Types.ObjectId(userId)
        : userId;

      const stats = await StatisticsService.getUserStats(userObjectId);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupérer les statistiques d'un cours
   */
  public static async getCourseStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params;
      
      // Vérifier que courseId est défini et valide
      if (!courseId) {
        res.status(400).json({
          success: false,
          message: 'ID cours manquant'
        });
        return;
      }

      // Convertir en ObjectId si c'est une chaîne valide
      const courseObjectId = Types.ObjectId.isValid(courseId) 
        ? new Types.ObjectId(courseId)
        : courseId;

      const stats = await StatisticsService.getCourseStats(courseObjectId);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupérer les utilisateurs récents
   */
  public static async getRecentUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const users = await StatisticsService.getRecentUsers(limit);
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupérer le taux de complétion global
   */
  public static async getCompletionRate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rate = await StatisticsService.getCompletionRate();
      res.json({
        success: true,
        data: rate
      });
    } catch (error) {
      next(error);
    }
  }
}

export default StatsController;