// Youth Computing Color Palette selon la charte graphique
export const colors = {
  // Couleurs principales
  primary: {
    main: '#010b40', // Bleu marine
    light: '#1a237e',
    dark: '#000051',
    contrastText: '#ffffff'
  },
  secondary: {
    main: '#f13544', // Fuchsia
    light: '#ff6b74',
    dark: '#ba000d',
    contrastText: '#ffffff'
  },
  // Couleurs secondaires
  grey: {
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    500: '#808080', // Gris moyen
    700: '#616161',
    900: '#212121'
  },
  // États
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c'
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00'
  },
  error: {
    main: '#f13544',
    light: '#e57373',
    dark: '#d32f2f'
  },
  info: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2'
  },
  // Background
  background: {
    default: '#fafafa',
    paper: '#ffffff'
  },
  // Text
  text: {
    primary: '#010b40',
    secondary: '#808080',
    disabled: '#bdbdbd'
  }
};

// Gradients Youth Computing
export const gradients = {
  primary: 'linear-gradient(135deg, #010b40 0%, #1a237e 100%)',
  secondary: 'linear-gradient(135deg, #f13544 0%, #ba000d 100%)',
  premium: 'linear-gradient(135deg, #010b40 0%, #f13544 100%)',
  light: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)'
};