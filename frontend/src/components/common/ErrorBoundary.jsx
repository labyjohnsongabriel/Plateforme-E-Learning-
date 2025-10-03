// frontend/src/components/common/ErrorBoundary.jsx
import React, { Component } from 'react';
import { Typography, Button } from '@mui/material';

class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Typography variant='h4' color='error'>
            Une erreur s'est produite
          </Typography>
          <Typography variant='body1' sx={{ mt: 2 }}>
            {this.state.error?.message ||
              "Quelque chose s'est mal passé. Veuillez recharger la page."}
          </Typography>
          <Button
            variant='contained'
            color='primary'
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Recharger la page
          </Button>
          <Button
            variant='outlined'
            color='secondary'
            onClick={() => (window.location.href = '/')}
            sx={{ mt: 2, ml: 2 }}
          >
            Retour à l'accueil
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
