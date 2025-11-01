// src/models/enums/StatutInscription.ts
export enum StatutInscription {
  ACTIVE = 'ACTIVE',
  COMPLETE = 'COMPLETE', // Correction: COMPLETE au lieu de COMPLETED
  CANCELLED = 'CANCELLED',
  SUSPENDED = 'SUSPENDED'
}

// Fonction utilitaire pour valider le statut
export const isValidStatut = (statut: string): boolean => {
  return Object.values(StatutInscription).includes(statut as StatutInscription);
};

// Fonction pour obtenir le statut display name
export const getStatutDisplayName = (statut: StatutInscription): string => {
  const displayNames = {
    [StatutInscription.ACTIVE]: 'Actif',
    [StatutInscription.COMPLETE]: 'Terminé',
    [StatutInscription.CANCELLED]: 'Annulé',
    [StatutInscription.SUSPENDED]: 'Suspendu',
  };
  return displayNames[statut] || statut;
};