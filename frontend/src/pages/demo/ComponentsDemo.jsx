import React, { useState } from 'react';
import { Box, Typography, Grid, Stack, Divider } from '@mui/material';
import {
    User,
    Mail,
    Lock,
    Search,
    Heart,
    Star,
    Download,
    Settings,
    Bell,
    Check
} from 'lucide-react';

// Import de nos composants personnalisés
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';

const ComponentsDemo = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        search: '',
    });

    const handleInputChange = (field) => (event) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleLoadingDemo = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 3000);
    };

    return (
        <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ mb: 6, textAlign: 'center' }}>
                <Typography
                    variant="h2"
                    sx={{
                        fontFamily: 'var(--font-primary)',
                        fontWeight: 'var(--font-bold)',
                        color: 'var(--primary-navy)',
                        mb: 2,
                    }}
                >
                    Youth Computing Design System
                </Typography>
                <Typography
                    variant="h6"
                    sx={{
                        color: 'var(--gray-600)',
                        fontFamily: 'var(--font-secondary)',
                    }}
                >
                    Démonstration des composants modernes et professionnels
                </Typography>
            </Box>

            {/* Boutons */}
            <Box sx={{ mb: 8 }}>
                <Typography variant="h4" sx={{ mb: 4, color: 'var(--primary-navy)' }}>
                    Boutons
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <Card.Header title="Boutons Contained" />
                            <Card.Content>
                                <Stack spacing={3}>
                                    <Stack direction="row" spacing={2} flexWrap="wrap">
                                        <Button variant="contained" color="primary">
                                            Primaire
                                        </Button>
                                        <Button variant="contained" color="secondary">
                                            Secondaire
                                        </Button>
                                        <Button variant="contained" color="success">
                                            Succès
                                        </Button>
                                        <Button variant="contained" color="warning">
                                            Attention
                                        </Button>
                                        <Button variant="contained" color="error">
                                            Erreur
                                        </Button>
                                    </Stack>

                                    <Stack direction="row" spacing={2} flexWrap="wrap">
                                        <Button variant="contained" size="small" startIcon={<Download size={16} />}>
                                            Petit
                                        </Button>
                                        <Button variant="contained" size="medium" startIcon={<Heart size={18} />}>
                                            Moyen
                                        </Button>
                                        <Button variant="contained" size="large" startIcon={<Star size={20} />}>
                                            Grand
                                        </Button>
                                    </Stack>

                                    <Button
                                        variant="contained"
                                        loading={loading}
                                        onClick={handleLoadingDemo}
                                    >
                                        Bouton avec chargement
                                    </Button>
                                </Stack>
                            </Card.Content>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <Card.Header title="Boutons Outlined & Text" />
                            <Card.Content>
                                <Stack spacing={3}>
                                    <Stack direction="row" spacing={2} flexWrap="wrap">
                                        <Button variant="outlined" color="primary">
                                            Outlined
                                        </Button>
                                        <Button variant="outlined" color="secondary">
                                            Secondaire
                                        </Button>
                                        <Button variant="text" color="primary">
                                            Texte
                                        </Button>
                                        <Button variant="text" color="secondary">
                                            Texte
                                        </Button>
                                    </Stack>

                                    <Stack direction="row" spacing={2} flexWrap="wrap">
                                        <Button variant="ghost" color="primary">
                                            Ghost
                                        </Button>
                                        <Button variant="glass" color="secondary">
                                            Glass
                                        </Button>
                                    </Stack>

                                    <Button variant="outlined" disabled>
                                        Désactivé
                                    </Button>
                                </Stack>
                            </Card.Content>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Cartes */}
            <Box sx={{ mb: 8 }}>
                <Typography variant="h4" sx={{ mb: 4, color: 'var(--primary-navy)' }}>
                    Cartes
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card variant="default" interactive>
                            <Card.Header
                                title="Carte par défaut"
                                subheader="Avec interaction hover"
                            />
                            <Card.Content>
                                <Typography>
                                    Cette carte utilise le style par défaut avec des effets d'interaction au survol.
                                </Typography>
                            </Card.Content>
                            <Card.Actions>
                                <Button size="small">Action</Button>
                                <Button size="small" variant="text">Annuler</Button>
                            </Card.Actions>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card variant="gradient" interactive>
                            <Card.Header
                                title="Carte gradient"
                                subheader="Style moderne"
                            />
                            <Card.Content>
                                <Typography>
                                    Carte avec arrière-plan dégradé pour un look moderne et professionnel.
                                </Typography>
                            </Card.Content>
                            <Card.Actions>
                                <Button size="small" variant="outlined" sx={{ color: 'white', borderColor: 'white' }}>
                                    Voir plus
                                </Button>
                            </Card.Actions>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card variant="feature" interactive>
                            <Card.Header
                                title="Carte feature"
                                subheader="Avec accent coloré"
                            />
                            <Card.Content>
                                <Typography>
                                    Parfaite pour mettre en avant des fonctionnalités importantes.
                                </Typography>
                            </Card.Content>
                            <Card.Actions>
                                <Button size="small" color="secondary">
                                    Découvrir
                                </Button>
                            </Card.Actions>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Inputs */}
            <Box sx={{ mb: 8 }}>
                <Typography variant="h4" sx={{ mb: 4, color: 'var(--primary-navy)' }}>
                    Champs de saisie
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <Card.Header title="Inputs standards" />
                            <Card.Content>
                                <Stack spacing={3}>
                                    <Input
                                        label="Nom complet"
                                        placeholder="Entrez votre nom"
                                        value={formData.name}
                                        onChange={handleInputChange('name')}
                                        startIcon={<User size={20} />}
                                        required
                                    />

                                    <Input
                                        label="Email"
                                        type="email"
                                        placeholder="votre@email.com"
                                        value={formData.email}
                                        onChange={handleInputChange('email')}
                                        startIcon={<Mail size={20} />}
                                        success={formData.email.includes('@')}
                                        helperText={formData.email.includes('@') ? "Email valide" : "Entrez un email valide"}
                                    />

                                    <Input
                                        label="Mot de passe"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleInputChange('password')}
                                        startIcon={<Lock size={20} />}
                                        showPasswordToggle
                                        error={formData.password.length > 0 && formData.password.length < 6}
                                        helperText={formData.password.length > 0 && formData.password.length < 6 ? "Minimum 6 caractères" : ""}
                                    />
                                </Stack>
                            </Card.Content>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <Card.Header title="Inputs avec variantes" />
                            <Card.Content>
                                <Stack spacing={3}>
                                    <Input
                                        label="Recherche"
                                        placeholder="Rechercher..."
                                        value={formData.search}
                                        onChange={handleInputChange('search')}
                                        startIcon={<Search size={20} />}
                                        variant="filled"
                                    />

                                    <Input
                                        label="Input avec succès"
                                        placeholder="Validation réussie"
                                        success
                                        helperText="Parfait !"
                                        endIcon={<Check size={20} />}
                                    />

                                    <Input
                                        label="Input désactivé"
                                        placeholder="Non modifiable"
                                        disabled
                                        value="Valeur fixe"
                                    />
                                </Stack>
                            </Card.Content>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Loading */}
            <Box sx={{ mb: 8 }}>
                <Typography variant="h4" sx={{ mb: 4, color: 'var(--primary-navy)' }}>
                    États de chargement
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <Card.Header title="Spinners" />
                            <Card.Content>
                                <Stack spacing={4} alignItems="center">
                                    <Loading variant="spinner" size="small" message="Petit spinner" />
                                    <Loading variant="ring" size="medium" message="Ring loader" />
                                    <Loading variant="dots" message="Points animés" />
                                </Stack>
                            </Card.Content>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <Card.Header title="Animations avancées" />
                            <Card.Content>
                                <Stack spacing={4} alignItems="center">
                                    <Loading variant="wave" message="Onde" />
                                    <Loading variant="pulse" message="Pulsation" />
                                    <Loading variant="skeleton" />
                                </Stack>
                            </Card.Content>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Modal */}
            <Box sx={{ mb: 8 }}>
                <Typography variant="h4" sx={{ mb: 4, color: 'var(--primary-navy)' }}>
                    Modales
                </Typography>

                <Card>
                    <Card.Header title="Démonstration des modales" />
                    <Card.Content>
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                            <Button onClick={() => setModalOpen(true)}>
                                Ouvrir modale
                            </Button>
                        </Stack>
                    </Card.Content>
                </Card>
            </Box>

            {/* Classes utilitaires */}
            <Box sx={{ mb: 8 }}>
                <Typography variant="h4" sx={{ mb: 4, color: 'var(--primary-navy)' }}>
                    Classes utilitaires CSS
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <Card.Header title="Effets visuels" />
                            <Card.Content>
                                <Stack spacing={3}>
                                    <Box className="glass-effect" sx={{ p: 3, borderRadius: 'var(--radius-xl)' }}>
                                        <Typography>Effet de verre (glass-effect)</Typography>
                                    </Box>

                                    <Box className="hover-lift" sx={{ p: 3, bg: 'var(--gray-100)', borderRadius: 'var(--radius-xl)' }}>
                                        <Typography>Effet de levée au survol (hover-lift)</Typography>
                                    </Box>

                                    <Box className="hover-glow" sx={{ p: 3, bg: 'var(--secondary-red-50)', borderRadius: 'var(--radius-xl)' }}>
                                        <Typography>Effet de lueur au survol (hover-glow)</Typography>
                                    </Box>
                                </Stack>
                            </Card.Content>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <Card.Header title="Animations" />
                            <Card.Content>
                                <Stack spacing={3}>
                                    <Box className="animate-fade-in-up" sx={{ p: 3, bg: 'var(--primary-navy-50)', borderRadius: 'var(--radius-xl)' }}>
                                        <Typography>Animation fade-in-up</Typography>
                                    </Box>

                                    <Box className="animate-slide-in-left" sx={{ p: 3, bg: 'var(--accent-purple)', color: 'white', borderRadius: 'var(--radius-xl)' }}>
                                        <Typography>Animation slide-in-left</Typography>
                                    </Box>

                                    <Typography className="gradient-text" variant="h5" sx={{ fontWeight: 'var(--font-bold)' }}>
                                        Texte avec gradient
                                    </Typography>
                                </Stack>
                            </Card.Content>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Modal de démonstration */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Modale de démonstration"
                size="md"
                transition="zoom"
            >
                <Typography sx={{ mb: 3 }}>
                    Ceci est une modale moderne avec notre design system Youth Computing.
                </Typography>
                <Typography sx={{ mb: 3 }}>
                    Elle utilise des animations fluides, un design cohérent et une excellente accessibilité.
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button variant="text" onClick={() => setModalOpen(false)}>
                        Annuler
                    </Button>
                    <Button variant="contained" onClick={() => setModalOpen(false)}>
                        Confirmer
                    </Button>
                </Stack>
            </Modal>
        </Box>
    );
};

export default ComponentsDemo;
