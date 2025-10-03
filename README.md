# 🎓 Plateforme E-Learning Youth Computing

Une plateforme d'apprentissage en ligne moderne et complète développée avec les dernières technologies web.

## 🚀 Fonctionnalités

### 👨‍🎓 Pour les Étudiants
- **Catalogue de cours** - Parcourir et rechercher des cours par catégorie, niveau, et instructeur
- **Apprentissage interactif** - Vidéos, quiz, exercices pratiques et projets
- **Suivi des progrès** - Tableau de bord personnalisé avec statistiques détaillées
- **Certificats** - Génération automatique de certificats de completion
- **Notifications** - Alertes en temps réel pour les nouveaux contenus et échéances

### 👨‍🏫 Pour les Instructeurs
- **Création de cours** - Éditeur intuitif pour créer du contenu riche
- **Gestion des étudiants** - Suivi des inscriptions et des performances
- **Analytics** - Statistiques détaillées sur l'engagement des étudiants
- **Communication** - Système de messagerie intégré

### 👨‍💼 Pour les Administrateurs
- **Gestion des utilisateurs** - Administration complète des comptes
- **Modération du contenu** - Validation et gestion des cours
- **Rapports** - Analytics avancées et rapports personnalisables
- **Configuration système** - Paramètres globaux de la plateforme

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** avec **TypeScript** - Runtime JavaScript moderne et typé
- **Express.js** - Framework web minimaliste et flexible
- **MongoDB** avec **Mongoose** - Base de données NoSQL et ODM
- **JWT** - Authentification sécurisée par tokens
- **Socket.IO** - Communication en temps réel
- **Winston** - Logging structuré et configurable
- **Joi** - Validation des données d'entrée
- **Helmet** - Sécurisation des headers HTTP
- **Rate Limiting** - Protection contre les abus

### Frontend
- **React 18** avec **TypeScript** - Bibliothèque UI moderne et typée
- **Vite** - Build tool ultra-rapide avec HMR
- **Material-UI (MUI)** - Composants UI élégants et accessibles
- **Zustand** - Gestion d'état simple et performante
- **React Query** - Gestion des données serveur avec cache
- **React Router** - Navigation côté client
- **Framer Motion** - Animations fluides et interactives
- **Chart.js** - Visualisation de données
- **Axios** - Client HTTP avec intercepteurs

### DevOps & Qualité
- **ESLint** & **Prettier** - Linting et formatage du code
- **Husky** - Git hooks pour la qualité
- **Jest** & **Vitest** - Tests unitaires et d'intégration
- **TypeScript** - Typage statique pour plus de robustesse

## 📁 Structure du Projet

```
plateforme-elearning/
├── backend1/                 # API Backend
│   ├── src/
│   │   ├── config/          # Configuration (DB, auth, etc.)
│   │   ├── controllers/     # Contrôleurs des routes
│   │   ├── middleware/      # Middlewares personnalisés
│   │   ├── models/         # Modèles Mongoose
│   │   ├── routes/         # Définition des routes
│   │   ├── services/       # Logique métier
│   │   ├── utils/          # Utilitaires et helpers
│   │   ├── validators/     # Schémas de validation
│   │   └── types/          # Types TypeScript
│   ├── tests/              # Tests backend
│   ├── uploads/            # Fichiers uploadés
│   └── logs/               # Logs de l'application
├── frontend/                # Application React
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── hooks/          # Hooks personnalisés
│   │   ├── services/       # Services API
│   │   ├── store/          # Gestion d'état Zustand
│   │   ├── utils/          # Utilitaires frontend
│   │   ├── styles/         # Styles globaux
│   │   └── assets/         # Images, fonts, etc.
│   └── public/             # Assets statiques
└── docs/                   # Documentation
```

## 🚀 Installation et Démarrage

### Prérequis
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **MongoDB** >= 5.0

### 1. Cloner le projet
```bash
git clone https://github.com/youthcomputing/elearning-platform.git
cd elearning-platform
```

### 2. Configuration Backend
```bash
cd backend1
npm install

# Créer le fichier .env
cp .env.example .env
# Éditer .env avec vos configurations
```

**Variables d'environnement requises :**
```env
# Base de données
MONGODB_URI=mongodb://localhost:27017/elearning
MONGO_URI=mongodb://localhost:27017/elearning

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_ISSUER=elearning-platform
JWT_AUDIENCE=elearning-users

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=50000000

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
ADMIN_CORS_ORIGINS=http://localhost:5173

# Autres
NODE_ENV=development
PORT=3000
TRUST_PROXY=false
MAX_REQUEST_SIZE=10mb
```

### 3. Configuration Frontend
```bash
cd ../frontend
npm install

# Créer le fichier .env
cp .env.example .env
# Éditer .env avec vos configurations
```

**Variables d'environnement frontend :**
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Youth Computing E-Learning
VITE_APP_VERSION=1.0.0
```

### 4. Démarrage en développement

**Terminal 1 - Backend :**
```bash
cd backend1
npm run dev
```

**Terminal 2 - Frontend :**
```bash
cd frontend
npm run dev
```

L'application sera accessible sur :
- **Frontend :** http://localhost:5173
- **Backend API :** http://localhost:3000
- **Health Check :** http://localhost:3000/health

## 🧪 Tests

### Backend
```bash
cd backend1
npm test                    # Tests unitaires
npm run test:watch         # Tests en mode watch
npm run test:coverage      # Tests avec couverture
```

### Frontend
```bash
cd frontend
npm test                   # Tests unitaires
npm run test:ui           # Interface de test Vitest
npm run test:coverage     # Tests avec couverture
```

## 🔧 Scripts Disponibles

### Backend
```bash
npm run dev              # Démarrage en développement
npm run build           # Build de production
npm start               # Démarrage en production
npm run lint            # Linting du code
npm run lint:fix        # Correction automatique
npm run format          # Formatage avec Prettier
npm run typecheck       # Vérification TypeScript
npm run validate        # Validation complète (lint + test + typecheck)
```

### Frontend
```bash
npm run dev             # Serveur de développement
npm run build           # Build de production
npm run build:analyze   # Build avec analyse du bundle
npm run preview         # Prévisualisation du build
npm run lint            # Linting du code
npm run lint:fix        # Correction automatique
npm run format          # Formatage avec Prettier
npm run type-check      # Vérification TypeScript
npm run validate        # Validation complète
```

## 🏗️ Architecture

### Backend - Architecture en Couches

```
┌─────────────────┐
│   Routes        │ ← Définition des endpoints
├─────────────────┤
│   Middleware    │ ← Auth, validation, cache, etc.
├─────────────────┤
│   Controllers   │ ← Logique de contrôle
├─────────────────┤
│   Services      │ ← Logique métier
├─────────────────┤
│   Models        │ ← Modèles de données
├─────────────────┤
│   Database      │ ← MongoDB avec Mongoose
└─────────────────┘
```

### Frontend - Architecture Modulaire

```
┌─────────────────┐
│     Pages       │ ← Composants de page
├─────────────────┤
│   Components    │ ← Composants réutilisables
├─────────────────┤
│     Hooks       │ ← Logique réutilisable
├─────────────────┤
│    Services     │ ← Communication API
├─────────────────┤
│     Store       │ ← Gestion d'état globale
└─────────────────┘
```

## 🔒 Sécurité

### Mesures Implémentées
- **Authentification JWT** avec refresh tokens
- **Validation des entrées** avec Joi
- **Rate limiting** adaptatif par endpoint
- **Headers de sécurité** avec Helmet
- **CORS** configuré strictement
- **Sanitisation** des données utilisateur
- **Chiffrement** des mots de passe avec bcrypt
- **Protection CSRF** pour les formulaires
- **Validation des uploads** de fichiers

### Bonnes Pratiques
- Tokens JWT avec expiration courte
- Logs de sécurité détaillés
- Validation côté client ET serveur
- Gestion sécurisée des erreurs
- Principe du moindre privilège

## 🚀 Performance

### Optimisations Backend
- **Mise en cache** intelligente avec TTL adaptatif
- **Compression** des réponses (gzip/brotli)
- **Pagination** optimisée pour les listes
- **Indexation** MongoDB appropriée
- **Connection pooling** pour la DB
- **Lazy loading** des relations

### Optimisations Frontend
- **Code splitting** automatique par route
- **Lazy loading** des composants lourds
- **Memoization** des composants coûteux
- **Virtualisation** des longues listes
- **Optimisation des images** avec formats modernes
- **Service Worker** pour le cache offline
- **Bundle analysis** pour optimiser la taille

## 📊 Monitoring et Logs

### Logs Structurés
- **Winston** pour le logging backend
- **Niveaux de log** : error, warn, info, debug
- **Rotation** automatique des fichiers de log
- **Métadonnées** contextuelles (user ID, request ID, etc.)

### Métriques
- **Performance** des requêtes API
- **Taux d'erreur** par endpoint
- **Utilisation** des ressources
- **Engagement** utilisateur

## 🤝 Contribution

### Workflow de Développement
1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/amazing-feature`)
3. **Commit** les changements (`git commit -m 'Add amazing feature'`)
4. **Push** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrir** une Pull Request

### Standards de Code
- **ESLint** et **Prettier** configurés
- **Tests** requis pour les nouvelles fonctionnalités
- **Documentation** des API avec JSDoc
- **Commits** conventionnels (feat, fix, docs, etc.)
- **Review** obligatoire avant merge

## 📝 API Documentation

### Endpoints Principaux

#### Authentification
```
POST /api/auth/login          # Connexion utilisateur
POST /api/auth/register       # Inscription utilisateur
POST /api/auth/refresh        # Renouvellement du token
POST /api/auth/logout         # Déconnexion
POST /api/auth/forgot         # Mot de passe oublié
POST /api/auth/reset          # Réinitialisation du mot de passe
```

#### Cours
```
GET    /api/courses           # Liste des cours (avec pagination)
GET    /api/courses/:id       # Détails d'un cours
POST   /api/courses           # Créer un cours (instructeur)
PUT    /api/courses/:id       # Modifier un cours
DELETE /api/courses/:id       # Supprimer un cours
POST   /api/courses/:id/enroll # S'inscrire à un cours
```

#### Utilisateurs
```
GET    /api/users/profile     # Profil utilisateur
PUT    /api/users/profile     # Modifier le profil
GET    /api/users/courses     # Cours de l'utilisateur
GET    /api/users/progress    # Progression de l'utilisateur
```

#### Administration
```
GET    /api/admin/users       # Liste des utilisateurs
GET    /api/admin/stats       # Statistiques globales
GET    /api/admin/reports     # Rapports détaillés
```

## 🐛 Dépannage

### Problèmes Courants

**Erreur de connexion MongoDB :**
```bash
# Vérifier que MongoDB est démarré
sudo systemctl status mongod
# Ou sur macOS avec Homebrew
brew services list | grep mongodb
```

**Erreur CORS :**
- Vérifier la configuration `CORS_ORIGINS` dans `.env`
- S'assurer que l'URL frontend correspond exactement

**Erreur de build frontend :**
```bash
# Nettoyer le cache et réinstaller
rm -rf node_modules package-lock.json
npm install
```

**Problèmes de performance :**
- Vérifier les logs pour identifier les requêtes lentes
- Utiliser `npm run build:analyze` pour analyser le bundle

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

- **Youth Computing** - *Développement initial* - [GitHub](https://github.com/youthcomputing)

## 🙏 Remerciements

- [React](https://reactjs.org/) pour l'excellente bibliothèque UI
- [Material-UI](https://mui.com/) pour les composants élégants
- [Express.js](https://expressjs.com/) pour le framework backend robuste
- [MongoDB](https://www.mongodb.com/) pour la base de données flexible
- [TypeScript](https://www.typescriptlang.org/) pour le typage statique
- La communauté open source pour tous les outils fantastiques

---

**Développé avec ❤️ par Youth Computing**

Pour plus d'informations, visitez notre [site web](https://youthcomputing.com) ou contactez-nous à [contact@youthcomputing.com](mailto:contact@youthcomputing.com).
