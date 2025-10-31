// scripts/cleanupInvalidEnrollments.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const cleanupInvalidEnrollments = async (): Promise<void> => {
  try {
    console.log('🔗 Connexion à la base de données...');
    await mongoose.connect(process.env.MONGODB_URI!);
    
    console.log('🧹 Recherche des inscriptions invalides...');
    
    // Compter avant suppression
    const countBefore = await mongoose.connection.db.collection('inscriptions').countDocuments({
      cours: null
    });
    
    console.log(`📊 ${countBefore} inscriptions invalides trouvées`);
    
    if (countBefore > 0) {
      // Supprimer les inscriptions avec cours: null
      const result = await mongoose.connection.db.collection('inscriptions').deleteMany({
        cours: null
      });
      
      console.log(`✅ ${result.deletedCount} inscriptions invalides supprimées avec succès`);
      
      // Vérifier après suppression
      const countAfter = await mongoose.connection.db.collection('inscriptions').countDocuments({
        cours: null
      });
      
      console.log(`📊 ${countAfter} inscriptions invalides restantes`);
    } else {
      console.log('✅ Aucune inscription invalide trouvée');
    }
    
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de la base de données');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    process.exit(1);
  }
};

// Exécuter le script
cleanupInvalidEnrollments();