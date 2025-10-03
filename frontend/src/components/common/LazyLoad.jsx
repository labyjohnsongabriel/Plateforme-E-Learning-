import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import {
    Box,
    CircularProgress,
    Skeleton,
    Typography,
    Button,
    Alert,
    Card,
    CardContent
} from '@mui/material';
import { Refresh, Visibility } from '@mui/icons-material';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';

// Hook personnalisé pour le lazy loading avec intersection observer
export const useLazyLoad = (options = {}) => {
    const {
        threshold = 0.1,
        rootMargin = '50px',
        triggerOnce = true,
        delay = 0
    } = options;

    const [ref, inView] = useInView({
        threshold,
        rootMargin,
        triggerOnce
    });

    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        if (inView) {
            if (delay > 0) {
                const timer = setTimeout(() => setShouldLoad(true), delay);
                return () => clearTimeout(timer);
            } else {
                setShouldLoad(true);
            }
        }
    }, [inView, delay]);

    return { ref, shouldLoad, inView };
};

// Composant de loading par défaut
const DefaultLoader = ({ height = 200, variant = 'circular' }) => (
    <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={height}
        width="100%"
    >
        {variant === 'circular' ? (
            <CircularProgress />
        ) : variant === 'skeleton' ? (
            <Box width="100%">
                <Skeleton variant="rectangular" height={height * 0.6} />
                <Skeleton variant="text" />
                <Skeleton variant="text" width="60%" />
            </Box>
        ) : (
            <Typography>Chargement...</Typography>
        )}
    </Box>
);

// Composant d'erreur par défaut
const DefaultError = ({ error, retry, height = 200 }) => (
    <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height={height}
        p={2}
    >
        <Alert
            severity="error"
            action={
                retry && (
                    <Button
                        color="inherit"
                        size="small"
                        onClick={retry}
                        startIcon={<Refresh />}
                    >
                        Réessayer
                    </Button>
                )
            }
            sx={{ width: '100%', maxWidth: 400 }}
        >
            <Typography variant="body2">
                {error?.message || 'Erreur lors du chargement'}
            </Typography>
        </Alert>
    </Box>
);

// Composant principal de lazy loading
export const LazyLoad = ({
    children,
    loader: CustomLoader = DefaultLoader,
    errorComponent: CustomError = DefaultError,
    height = 200,
    threshold = 0.1,
    rootMargin = '50px',
    delay = 0,
    triggerOnce = true,
    placeholder,
    onLoad,
    onError,
    retryable = true,
    animateIn = true,
    className,
    style,
    ...props
}) => {
    const { ref, shouldLoad } = useLazyLoad({
        threshold,
        rootMargin,
        triggerOnce,
        delay
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasLoaded, setHasLoaded] = useState(false);
    const retryCount = useRef(0);
    const maxRetries = 3;

    const handleLoad = async () => {
        if (hasLoaded || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            if (onLoad) {
                await onLoad();
            }
            setHasLoaded(true);
            retryCount.current = 0;
        } catch (err) {
            console.error('LazyLoad error:', err);
            setError(err);
            if (onError) {
                onError(err);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetry = () => {
        if (retryCount.current < maxRetries) {
            retryCount.current++;
            handleLoad();
        }
    };

    useEffect(() => {
        if (shouldLoad && !hasLoaded && !isLoading) {
            handleLoad();
        }
    }, [shouldLoad]);

    const containerProps = {
        ref,
        className,
        style: {
            minHeight: height,
            ...style
        },
        ...props
    };

    // Affichage du placeholder avant le trigger
    if (!shouldLoad) {
        return (
            <Box {...containerProps}>
                {placeholder || (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height={height}
                        sx={{
                            backgroundColor: 'grey.50',
                            borderRadius: 1,
                            border: '1px dashed',
                            borderColor: 'grey.300'
                        }}
                    >
                        <Box textAlign="center">
                            <Visibility sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                                Contenu à charger
                            </Typography>
                        </Box>
                    </Box>
                )}
            </Box>
        );
    }

    // Affichage du loader
    if (isLoading) {
        return (
            <Box {...containerProps}>
                <CustomLoader height={height} />
            </Box>
        );
    }

    // Affichage de l'erreur
    if (error && !hasLoaded) {
        return (
            <Box {...containerProps}>
                <CustomError
                    error={error}
                    retry={retryable && retryCount.current < maxRetries ? handleRetry : null}
                    height={height}
                />
            </Box>
        );
    }

    // Affichage du contenu chargé
    if (hasLoaded) {
        const content = (
            <Box {...containerProps}>
                {children}
            </Box>
        );

        if (animateIn) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {content}
                </motion.div>
            );
        }

        return content;
    }

    return null;
};

// HOC pour lazy loading de composants React
export const withLazyLoad = (
    Component,
    loaderOptions = {}
) => {
    return React.forwardRef((props, ref) => (
        <LazyLoad {...loaderOptions}>
            <Component {...props} ref={ref} />
        </LazyLoad>
    ));
};

// Composant pour lazy loading d'images
export const LazyImage = ({
    src,
    alt,
    placeholder,
    errorPlaceholder,
    onLoad,
    onError,
    className,
    style,
    ...props
}) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const { ref, shouldLoad } = useLazyLoad();

    const handleImageLoad = () => {
        setImageLoaded(true);
        if (onLoad) onLoad();
    };

    const handleImageError = (error) => {
        setImageError(true);
        if (onError) onError(error);
    };

    return (
        <Box ref={ref} className={className} style={style}>
            <AnimatePresence mode="wait">
                {!shouldLoad && (
                    <motion.div
                        key="placeholder"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {placeholder || (
                            <Skeleton
                                variant="rectangular"
                                width="100%"
                                height={200}
                                animation="wave"
                            />
                        )}
                    </motion.div>
                )}

                {shouldLoad && !imageLoaded && !imageError && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Skeleton
                            variant="rectangular"
                            width="100%"
                            height={200}
                            animation="pulse"
                        />
                    </motion.div>
                )}

                {shouldLoad && imageError && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {errorPlaceholder || (
                            <Box
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                height={200}
                                bgcolor="grey.100"
                                color="text.secondary"
                            >
                                <Typography variant="body2">
                                    Impossible de charger l'image
                                </Typography>
                            </Box>
                        )}
                    </motion.div>
                )}

                {shouldLoad && imageLoaded && (
                    <motion.img
                        key="image"
                        src={src}
                        alt={alt}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block'
                        }}
                        {...props}
                    />
                )}
            </AnimatePresence>
        </Box>
    );
};

// Composant pour lazy loading de listes
export const LazyList = ({
    items,
    renderItem,
    itemHeight = 100,
    threshold = 5,
    loader,
    className,
    ...props
}) => {
    const [visibleItems, setVisibleItems] = useState(threshold);
    const { ref, inView } = useInView({
        threshold: 0.1,
        rootMargin: '100px'
    });

    useEffect(() => {
        if (inView && visibleItems < items.length) {
            setVisibleItems(prev => Math.min(prev + threshold, items.length));
        }
    }, [inView, items.length, threshold, visibleItems]);

    return (
        <Box className={className} {...props}>
            {items.slice(0, visibleItems).map((item, index) => (
                <Box key={index} minHeight={itemHeight}>
                    {renderItem(item, index)}
                </Box>
            ))}

            {visibleItems < items.length && (
                <Box ref={ref} py={2}>
                    {loader || <DefaultLoader height={itemHeight} />}
                </Box>
            )}
        </Box>
    );
};

// Hook pour lazy loading de données
export const useLazyData = (fetchFunction, dependencies = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { ref, shouldLoad } = useLazyLoad();

    const loadData = async () => {
        if (loading || data) return;

        setLoading(true);
        setError(null);

        try {
            const result = await fetchFunction();
            setData(result);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (shouldLoad) {
            loadData();
        }
    }, [shouldLoad, ...dependencies]);

    return { ref, data, loading, error, reload: loadData };
};

// Composant pour lazy loading de sections de page
export const LazySection = ({
    children,
    title,
    description,
    height = 300,
    ...props
}) => {
    return (
        <LazyLoad
            height={height}
            placeholder={
                <Card sx={{ height }}>
                    <CardContent>
                        <Skeleton variant="text" width="40%" height={32} />
                        <Skeleton variant="text" width="80%" />
                        <Skeleton variant="rectangular" height={height - 120} sx={{ mt: 2 }} />
                    </CardContent>
                </Card>
            }
            {...props}
        >
            <Card>
                <CardContent>
                    {title && (
                        <Typography variant="h6" gutterBottom>
                            {title}
                        </Typography>
                    )}
                    {description && (
                        <Typography variant="body2" color="text.secondary" paragraph>
                            {description}
                        </Typography>
                    )}
                    {children}
                </CardContent>
            </Card>
        </LazyLoad>
    );
};

export default LazyLoad;
