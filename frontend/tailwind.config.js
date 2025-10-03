/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Couleurs du design system Youth Computing
      colors: {
        primary: {
          50: 'rgba(1, 11, 64, 0.05)',
          100: 'rgba(1, 11, 64, 0.1)',
          200: 'rgba(1, 11, 64, 0.2)',
          300: 'rgba(1, 11, 64, 0.3)',
          400: 'rgba(1, 11, 64, 0.4)',
          500: '#010b40',
          600: '#000051',
          700: 'rgba(1, 11, 64, 0.7)',
          800: 'rgba(1, 11, 64, 0.8)',
          900: 'rgba(1, 11, 64, 0.9)',
          light: '#1a237e',
          dark: '#000051',
        },
        secondary: {
          50: 'rgba(241, 53, 68, 0.05)',
          100: 'rgba(241, 53, 68, 0.1)',
          200: 'rgba(241, 53, 68, 0.2)',
          300: 'rgba(241, 53, 68, 0.3)',
          400: 'rgba(241, 53, 68, 0.4)',
          500: '#f13544',
          600: '#ba000d',
          700: 'rgba(241, 53, 68, 0.7)',
          800: 'rgba(241, 53, 68, 0.8)',
          900: 'rgba(241, 53, 68, 0.9)',
          light: '#ff6b74',
          dark: '#ba000d',
        },
        accent: {
          purple: '#8b5cf6',
          blue: '#3b82f6',
          green: '#10b981',
          orange: '#f59e0b',
          pink: '#ec4899',
        },
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
      },
      
      // Polices
      fontFamily: {
        primary: ['Ubuntu', 'Century Gothic', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        secondary: ['Century Gothic', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
      },
      
      // Tailles de police
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
      },
      
      // Espacements
      spacing: {
        '0': '0',
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '32': '8rem',
      },
      
      // Border radius
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'base': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      
      // Ombres
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(1, 11, 64, 0.05)',
        'base': '0 1px 3px 0 rgba(1, 11, 64, 0.1), 0 1px 2px 0 rgba(1, 11, 64, 0.06)',
        'md': '0 4px 6px -1px rgba(1, 11, 64, 0.1), 0 2px 4px -1px rgba(1, 11, 64, 0.06)',
        'lg': '0 10px 15px -3px rgba(1, 11, 64, 0.1), 0 4px 6px -2px rgba(1, 11, 64, 0.05)',
        'xl': '0 20px 25px -5px rgba(1, 11, 64, 0.1), 0 10px 10px -5px rgba(1, 11, 64, 0.04)',
        '2xl': '0 25px 50px -12px rgba(1, 11, 64, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(1, 11, 64, 0.06)',
        'glow': '0 0 20px rgba(241, 53, 68, 0.3)',
        'glow-lg': '0 0 40px rgba(241, 53, 68, 0.4)',
      },
      
      // Transitions
      transitionDuration: {
        'fast': '150ms',
        'base': '250ms',
        'slow': '350ms',
      },
      
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      
      // Animations
      animation: {
        'spin': 'spin 1s linear infinite',
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
      },
      
      // Keyframes
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        fadeInUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeInDown: {
          'from': {
            opacity: '0',
            transform: 'translateY(-30px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideInLeft: {
          'from': {
            opacity: '0',
            transform: 'translateX(-30px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        slideInRight: {
          'from': {
            opacity: '0',
            transform: 'translateX(30px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        scaleIn: {
          'from': {
            opacity: '0',
            transform: 'scale(0.9)',
          },
          'to': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
      
      // Breakpoints personnalisés
      screens: {
        'xs': '0px',
        'sm': '600px',
        'md': '900px',
        'lg': '1200px',
        'xl': '1536px',
      },
      
      // Conteneurs
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
          xl: '2.5rem',
        },
        screens: {
          sm: '600px',
          md: '900px',
          lg: '1200px',
          xl: '1536px',
        },
      },
      
      // Backdrop blur
      backdropBlur: {
        'sm': '4px',
        'base': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
    },
  },
  plugins: [
    // Plugin pour les classes utilitaires personnalisées
    function({ addUtilities }) {
      const newUtilities = {
        '.glass-effect': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.gradient-text': {
          background: 'linear-gradient(135deg, #010b40 0%, #1a237e 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.hover-lift': {
          transition: 'transform 250ms ease-in-out',
        },
        '.hover-lift:hover': {
          transform: 'translateY(-4px)',
        },
        '.hover-glow': {
          transition: 'box-shadow 250ms ease-in-out',
        },
        '.hover-glow:hover': {
          'box-shadow': '0 0 20px rgba(241, 53, 68, 0.3)',
        },
      };
      
      addUtilities(newUtilities);
    },
  ],
};
