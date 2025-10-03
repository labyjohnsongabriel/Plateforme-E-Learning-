# Youth Computing Design System

## 🎨 Vue d'ensemble

Le Design System Youth Computing est un système de conception moderne et cohérent qui fournit tous les éléments nécessaires pour créer une interface utilisateur professionnelle et accessible.

## 📁 Structure des fichiers

```
src/styles/
├── variables.css      # Variables CSS globales
├── globals.css        # Styles globaux et reset
├── components.css     # Styles des composants réutilisables
├── pages.css         # Styles spécifiques aux pages
├── responsive.css    # Styles responsive et media queries
└── README.md         # Cette documentation
```

## 🎯 Couleurs principales

### Palette primaire
- **Navy**: `#010b40` - Couleur principale de la marque
- **Light Navy**: `#1a237e` - Variante plus claire
- **Red**: `#f13544` - Couleur secondaire/accent
- **Pink**: `#ff6b74` - Variante plus claire du rouge

### Couleurs sémantiques
- **Success**: `#4caf50`
- **Warning**: `#ff9800`
- **Error**: `#f44336`
- **Info**: `#2196f3`

### Couleurs neutres
- **Gray 50-900**: Échelle complète de gris
- **White**: `#ffffff`

## 🔤 Typographie

### Polices
- **Primaire**: Ubuntu (titres, éléments importants)
- **Secondaire**: Century Gothic (corps de texte)
- **Monospace**: JetBrains Mono (code)

### Tailles
- **xs**: 0.75rem (12px)
- **sm**: 0.875rem (14px)
- **base**: 1rem (16px)
- **lg**: 1.125rem (18px)
- **xl**: 1.25rem (20px)
- **2xl**: 1.5rem (24px)
- **3xl**: 1.875rem (30px)
- **4xl**: 2.25rem (36px)
- **5xl**: 3rem (48px)
- **6xl**: 3.75rem (60px)

## 📏 Espacement

Système d'espacement basé sur une échelle de 4px :

- **space-1**: 0.25rem (4px)
- **space-2**: 0.5rem (8px)
- **space-3**: 0.75rem (12px)
- **space-4**: 1rem (16px)
- **space-6**: 1.5rem (24px)
- **space-8**: 2rem (32px)
- **space-12**: 3rem (48px)
- **space-16**: 4rem (64px)

## 🔄 Border Radius

- **radius-sm**: 0.125rem (2px)
- **radius-base**: 0.25rem (4px)
- **radius-lg**: 0.5rem (8px)
- **radius-xl**: 0.75rem (12px)
- **radius-2xl**: 1rem (16px)
- **radius-3xl**: 1.5rem (24px)
- **radius-full**: 9999px (cercle)

## 🌟 Ombres

Système d'ombres cohérent avec la palette de couleurs :

- **shadow-sm**: Ombre légère
- **shadow-base**: Ombre standard
- **shadow-md**: Ombre moyenne
- **shadow-lg**: Ombre importante
- **shadow-xl**: Ombre très importante
- **shadow-2xl**: Ombre maximale
- **shadow-glow**: Effet de lueur rouge
- **shadow-inner**: Ombre intérieure

## ⚡ Animations

### Durées de transition
- **transition-fast**: 150ms
- **transition-base**: 250ms
- **transition-slow**: 350ms

### Animations prédéfinies
- **fadeIn**: Apparition en fondu
- **fadeInUp**: Apparition depuis le bas
- **fadeInDown**: Apparition depuis le haut
- **slideInLeft**: Glissement depuis la gauche
- **slideInRight**: Glissement depuis la droite
- **scaleIn**: Apparition avec zoom

## 📱 Breakpoints

- **xs**: 0px (mobile)
- **sm**: 600px (tablette portrait)
- **md**: 900px (tablette paysage)
- **lg**: 1200px (desktop)
- **xl**: 1536px (large desktop)

## 🧩 Composants

### Button
Bouton moderne avec plusieurs variantes :
- `contained` (défaut)
- `outlined`
- `text`
- `ghost`
- `glass`

### Card
Carte flexible avec variantes :
- `default`
- `outlined`
- `glass`
- `gradient`
- `feature`
- `pricing`

### Input
Champ de saisie avec validation :
- Support des icônes
- États de validation
- Variantes de style
- Accessibilité intégrée

### Modal
Modale moderne avec :
- Animations fluides
- Différentes tailles
- Variantes de style
- Accessibilité complète

### Loading
États de chargement variés :
- `spinner`
- `dots`
- `wave`
- `pulse`
- `ring`
- `skeleton`

## 🎨 Classes utilitaires

### Effets visuels
- `.glass-effect`: Effet de verre avec backdrop-filter
- `.gradient-text`: Texte avec dégradé
- `.hover-lift`: Effet de levée au survol
- `.hover-glow`: Effet de lueur au survol

### Animations
- `.animate-fadeIn`
- `.animate-fadeInUp`
- `.animate-slideInLeft`
- `.animate-slideInRight`
- `.animate-scaleIn`

## 🔧 Utilisation

### Variables CSS
```css
/* Utilisation des variables */
.mon-element {
  color: var(--primary-navy);
  background: var(--gradient-primary);
  padding: var(--space-4);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}
```

### Composants React
```jsx
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';

function MyComponent() {
  return (
    <Card variant="feature">
      <Card.Header title="Mon titre" />
      <Card.Content>
        <Input 
          label="Email"
          type="email"
          startIcon={<Mail />}
          required
        />
      </Card.Content>
      <Card.Actions>
        <Button variant="contained" color="primary">
          Valider
        </Button>
      </Card.Actions>
    </Card>
  );
}
```

## ♿ Accessibilité

Le design system intègre les meilleures pratiques d'accessibilité :

- Contrastes de couleurs conformes WCAG 2.1
- Navigation au clavier
- Attributs ARIA appropriés
- Focus indicators visibles
- Tailles de touch targets optimales (44px minimum)

## 📚 Ressources

- [Variables CSS](./variables.css)
- [Styles globaux](./globals.css)
- [Composants](./components.css)
- [Pages](./pages.css)
- [Responsive](./responsive.css)

## 🚀 Évolutions futures

- Mode sombre
- Thèmes personnalisables
- Composants supplémentaires
- Animations avancées
- Optimisations performances

---

**Youth Computing Design System** - Version 1.0.0
Créé avec ❤️ pour une expérience utilisateur exceptionnelle.
