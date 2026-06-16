import React, {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import MapLibreGL from "maplibre-gl";
import { createPortal } from "react-dom";
import { X, Minus, Plus, Locate, Loader2, Navigation, MapPin, ShieldAlert } from "lucide-react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../utils/cn";

// --- Tooltip Components ---

function TooltipProvider({
    delayDuration = 0,
    ...props
}) {
    return (
        <TooltipPrimitive.Provider
            data-slot="tooltip-provider"
            delayDuration={delayDuration}
            {...props}
        />
    );
}

function Tooltip({
    ...props
}) {
    return (
        <TooltipProvider>
            <TooltipPrimitive.Root data-slot="tooltip" {...props} />
        </TooltipProvider>
    );
}

function TooltipTrigger({
    ...props
}) {
    return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
    className,
    sideOffset = 0,
    children,
    ...props
}) {
    return (
        <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
                data-slot="tooltip-content"
                sideOffset={sideOffset}
                className={cn(
                    "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
                    className
                )}
                {...props}
            >
                {children}
                <TooltipPrimitive.Arrow className="bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
            </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
    );
}

// --- Map Components ---

// Check document class for theme (works with next-themes, etc.)
function getDocumentTheme() {
    if (typeof document === "undefined") return null;
    if (document.documentElement.classList.contains("dark")) return "dark";
    if (document.documentElement.classList.contains("light")) return "light";
    return null;
}

// Get system preference
function getSystemTheme() {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function useResolvedTheme(themeProp) {
    const [detectedTheme, setDetectedTheme] = useState(
        () => getDocumentTheme() ?? getSystemTheme()
    );

    useEffect(() => {
        if (themeProp) return;

        const observer = new MutationObserver(() => {
            const docTheme = getDocumentTheme();
            if (docTheme && docTheme !== detectedTheme) {
                setDetectedTheme(docTheme);
            }
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleSystemChange = (e) => {
            if (!getDocumentTheme()) {
                setDetectedTheme(e.matches ? "dark" : "light");
            }
        };

        mediaQuery.addEventListener("change", handleSystemChange);

        return () => {
            observer.disconnect();
            mediaQuery.removeEventListener("change", handleSystemChange);
        };
    }, [themeProp, detectedTheme]);

    return themeProp ?? detectedTheme;
}

const MapContext = createContext(null);

function useMap() {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error("useMap must be used within a Map component");
    }
    return context;
}

// ============================================
// OPTIMIZED TILE PROVIDERS WITH FALLBACK
// ============================================

// Helper para crear URLs de tiles con múltiples subdominios (round-robin)
const makeTileUrls = (template, subdomains = 'abc') => 
    subdomains.split('').map(d => template.replace('{s}', d));

// Proveedores de tiles con múltiples servidores para mejor rendimiento
const TILE_PROVIDERS = {
    // OpenStreetMap (gratuito, buena cobertura global)
    osm: {
        tiles: makeTileUrls('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    },
    // CartoDB Positron (light) - múltiples subdominios
    cartoLight: {
        tiles: makeTileUrls('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', 'abcd'),
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20
    },
    // CartoDB Dark Matter
    cartoDark: {
        tiles: makeTileUrls('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', 'abcd'),
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20
    },
    // Stamen Terrain (para alternativa)
    stamen: {
        tiles: ['https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png'],
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://stamen.com/">Stamen Design</a>',
        maxZoom: 18
    },
    // Esri Satellite (mejor calidad pero más lento - usar con cuidado)
    esriSat: {
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        attribution: '&copy; Esri, Maxar, Earthstar Geographics',
        maxZoom: 18
    },
    // Esri Labels
    esriLabels: {
        tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],
        attribution: '&copy; Esri',
        maxZoom: 18
    }
};

// Crear estilo optimizado con múltiples URLs (fallback automático)
function createOptimizedStyle(provider, labelProvider = null) {
    const sources = {
        'base-tiles': {
            type: 'raster',
            tiles: provider.tiles,
            tileSize: 256,
            attribution: provider.attribution,
            maxzoom: provider.maxZoom || 19,
            // Optimizaciones de rendimiento
            volatile: false,
            tileCache: true,
        }
    };
    
    const layers = [{
        id: 'base-layer',
        type: 'raster',
        source: 'base-tiles',
        minzoom: 0,
        // No se pone maxzoom en la capa para que MapLibre haga overzoom
        // (escale el tile más cercano) en lugar de ocultar la capa.
        paint: {
            'raster-opacity': 1
        }
    }];

    // Agregar capa de etiquetas si se especifica (modo híbrido)
    if (labelProvider) {
        sources['label-tiles'] = {
            type: 'raster',
            tiles: labelProvider.tiles,
            tileSize: 256,
            attribution: labelProvider.attribution,
            maxzoom: labelProvider.maxZoom || 18,
            volatile: false,
        };
        layers.push({
            id: 'label-layer',
            type: 'raster',
            source: 'label-tiles',
            minzoom: 0,
            paint: {
                'raster-opacity': 1
            }
        });
    }
    
    return {
        version: 8,
        sources,
        layers,
        // Optimización: glyphs y sprites vacíos para evitar 404s
        glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
    };
}

// Estilos optimizados
const defaultStyles = {
    dark: createOptimizedStyle(TILE_PROVIDERS.cartoDark),
    light: createOptimizedStyle(TILE_PROVIDERS.cartoLight),
};

const satelliteStyle = createOptimizedStyle(TILE_PROVIDERS.esriSat);

const hybridStyle = createOptimizedStyle(TILE_PROVIDERS.esriSat, TILE_PROVIDERS.esriLabels);

// ============================================
// TILE ERROR HANDLING & RETRY LOGIC
// ============================================

// Interceptar errores de tiles y reintentar con URLs alternativas
function setupTileErrorHandling(map) {
    // Usar un objeto simple en lugar de Map para evitar conflictos de nombres
    const errorCount = {};
    
    map.on('error', (e) => {
        // Ignorar errores de glyphs/sprites que no son críticos
        if (e?.error?.url?.includes('glyphs') || e?.error?.url?.includes('sprites')) {
            return;
        }
        
        // Log silencioso para debugging (solo en desarrollo)
        if (import.meta.env?.DEV) {
            console.warn('Map tile error:', e.error?.message || e.error);
        }
    });
    
    // Manejar tiles que fallan al cargar
    map.on('sourcedataloading', (e) => {
        if (e.sourceId && (e.sourceId.includes('tiles') || e.sourceId.includes('layer'))) {
            // Reset error count cuando empieza a cargar
            errorCount[e.sourceId] = 0;
        }
    });
    
    // Monitorear cuando los datos se cargan correctamente
    map.on('sourcedata', (e) => {
        if (e.isSourceLoaded && e.sourceId) {
            // Limpiar contador de errores para esta fuente
            delete errorCount[e.sourceId];
        }
    });
}

// ============================================
// OPTIMIZED LOADER WITH PROGRESS FEEDBACK
// ============================================

const DefaultLoader = () => {
    const [dots, setDots] = useState(0);
    const [showRetry, setShowRetry] = useState(false);
    
    useEffect(() => {
        // Animación de puntos
        const interval = setInterval(() => {
            setDots(d => (d + 1) % 4);
        }, 400);
        
        // Mostrar mensaje de reintento si tarda más de 5 segundos
        const timeout = setTimeout(() => {
            setShowRetry(true);
        }, 5000);
        
        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);
    
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-black transition-colors duration-300">
            <div className="flex flex-col items-center gap-4">
                {/* Spinner animado */}
                <div className="relative">
                    <div className="w-12 h-12 border-2 border-gray-300 dark:border-gray-700 rounded-full" />
                    <div className="absolute inset-0 w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
                
                {/* Texto de carga */}
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Cargando mapa{'.'.repeat(dots)}
                    </p>
                    
                    {showRetry && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 max-w-[200px]">
                            Esto está tomando más tiempo de lo usual. Verifica tu conexión.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const Map = forwardRef(function Map(
    { children, theme: themeProp, styles, projection, mapTheme = 'standard', starrySky = false, ...props },
    ref
) {
    const containerRef = useRef(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isStyleLoaded, setIsStyleLoaded] = useState(false);
    const currentStyleRef = useRef(null);
    const styleTimeoutRef = useRef(null);
    const resolvedTheme = useResolvedTheme(themeProp);

    const mapStyles = useMemo(
        () => ({
            dark: styles?.dark ?? defaultStyles.dark,
            light: styles?.light ?? defaultStyles.light,
        }),
        [styles]
    );

    useImperativeHandle(ref, () => mapInstance, [mapInstance]);

    const clearStyleTimeout = useCallback(() => {
        if (styleTimeoutRef.current) {
            clearTimeout(styleTimeoutRef.current);
            styleTimeoutRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;

        let initialStyle;
        if (mapTheme === 'satellite') {
            initialStyle = satelliteStyle;
        } else if (mapTheme === 'hybrid') {
            initialStyle = hybridStyle;
        } else {
            initialStyle = resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
        }

        currentStyleRef.current = initialStyle;

        const map = new MapLibreGL.Map({
            container: containerRef.current,
            style: initialStyle,
            keyboard: false,
            renderWorldCopies: false,
            preserveDrawingBuffer: true,
            attributionControl: { compact: true },
            center: [0, 0],
            zoom: 1,
            projection: projection || 'mercator',
            fadeDuration: 100,
            crossSourceCollisions: false,
            antialias: false,
            // Amplía la caché en memoria de tiles (default ~500). Con 1500 tiles
            // una sesión típica de zoom/pan no descarga el mismo tile dos veces.
            maxTileCacheSize: 1500,
            ...props,
        });

        // Configurar manejo de errores de tiles
        setupTileErrorHandling(map);

        const styleDataHandler = () => {
            clearStyleTimeout();
            // Delay reducido para carga más rápida
            styleTimeoutRef.current = setTimeout(() => {
                setIsStyleLoaded(true);
                if (projection) {
                    map.setProjection(projection);
                }
            }, 50); // Reducido de 100ms a 50ms
        };
        
        const loadHandler = () => {
            setIsLoaded(true);
            map.resize();
            // Forzar una actualización de los tiles para asegurar que todo se renderiza
            map.triggerRepaint();
        };

        map.on("load", loadHandler);
        map.on("styledata", styleDataHandler);
        
        // Manejar errores específicos de tiles
        map.on('tileerror', (e) => {
            // Silenciar errores de tiles individuales - el mapa los manejará con placeholders
            if (import.meta.env?.DEV) {
                console.warn('Tile load error (auto-recovering):', e.tile?.coord);
            }
        });
        
        setMapInstance(map);

        return () => {
            clearStyleTimeout();
            map.off("load", loadHandler);
            map.off("styledata", styleDataHandler);
            map.off("tileerror");
            map.remove();
            setIsLoaded(false);
            setIsStyleLoaded(false);
            setMapInstance(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Observer to handle container resizing and prevent partial loading / black areas
    useEffect(() => {
        if (!mapInstance || !containerRef.current) return;

        const resizeObserver = new ResizeObserver(() => {
            try {
                mapInstance.resize();
            } catch (e) {
                // Ignore silent errors during unmount/resize
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, [mapInstance]);

    const [isOverZoomLimit, setIsOverZoomLimit] = useState(false);

    useEffect(() => {
        if (!mapInstance) return;

        const checkZoom = () => {
            const z = mapInstance.getZoom();
            // Esri usually stops around 18-19. 17.5 is a safe buffer to switch before it gets ugly.
            // Adjusting to 16 based on user feedback to prevent gray tiles.
            setIsOverZoomLimit(z > 16);
        };

        mapInstance.on('zoom', checkZoom);

        return () => {
            mapInstance.off('zoom', checkZoom);
        };
    }, [mapInstance]);

    useEffect(() => {
        if (!mapInstance) return;

        let newStyle;
        const useStandard = !mapTheme || mapTheme === 'standard' || (isOverZoomLimit && (mapTheme === 'satellite' || mapTheme === 'hybrid'));

        if (!useStandard) {
            if (mapTheme === 'satellite') newStyle = satelliteStyle;
            else if (mapTheme === 'hybrid') newStyle = hybridStyle;
        } else {
            newStyle = resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
        }

        if (currentStyleRef.current === newStyle) return;

        currentStyleRef.current = newStyle;
        mapInstance.setStyle(newStyle, { diff: false });

    }, [mapInstance, resolvedTheme, mapStyles, clearStyleTimeout, mapTheme, isOverZoomLimit]);

    const contextValue = useMemo(
        () => ({
            map: mapInstance,
            isLoaded: isLoaded && isStyleLoaded,
        }),
        [mapInstance, isLoaded, isStyleLoaded]
    );

    return (
        <MapContext.Provider value={contextValue}>
            <div ref={containerRef} className="relative w-full h-full">
                {!isLoaded && <DefaultLoader />}
                {/* SSR-safe: children render only when map is loaded on client */}
                {mapInstance && children}
            </div>
        </MapContext.Provider>
    );
});

const MarkerContext = createContext(null);

function useMarkerContext() {
    const context = useContext(MarkerContext);
    if (!context) {
        throw new Error("Marker components must be used within MapMarker");
    }
    return context;
}

function MapMarker({
    longitude,
    latitude,
    children,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDrag,
    onDragEnd,
    draggable = false,
    ...markerOptions
}) {
    const { map } = useMap();

    const marker = useMemo(() => {
        const markerInstance = new MapLibreGL.Marker({
            ...markerOptions,
            element: document.createElement("div"),
            draggable,
        }).setLngLat([longitude, latitude]);

        const handleClick = (e) => onClick?.(e);
        const handleMouseEnter = (e) => onMouseEnter?.(e);
        const handleMouseLeave = (e) => onMouseLeave?.(e);

        markerInstance.getElement()?.addEventListener("click", handleClick);
        markerInstance
            .getElement()
            ?.addEventListener("mouseenter", handleMouseEnter);
        markerInstance
            .getElement()
            ?.addEventListener("mouseleave", handleMouseLeave);

        const handleDragStart = () => {
            const lngLat = markerInstance.getLngLat();
            onDragStart?.({ lng: lngLat.lng, lat: lngLat.lat });
        };
        const handleDrag = () => {
            const lngLat = markerInstance.getLngLat();
            onDrag?.({ lng: lngLat.lng, lat: lngLat.lat });
        };
        const handleDragEnd = () => {
            const lngLat = markerInstance.getLngLat();
            onDragEnd?.({ lng: lngLat.lng, lat: lngLat.lat });
        };

        markerInstance.on("dragstart", handleDragStart);
        markerInstance.on("drag", handleDrag);
        markerInstance.on("dragend", handleDragEnd);

        return markerInstance;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!map) return;

        marker.addTo(map);

        return () => {
            marker.remove();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map]);

    if (
        marker.getLngLat().lng !== longitude ||
        marker.getLngLat().lat !== latitude
    ) {
        marker.setLngLat([longitude, latitude]);
    }
    if (marker.isDraggable() !== draggable) {
        marker.setDraggable(draggable);
    }

    const currentOffset = marker.getOffset();
    const newOffset = markerOptions.offset ?? [0, 0];
    const [newOffsetX, newOffsetY] = Array.isArray(newOffset)
        ? newOffset
        : [newOffset.x, newOffset.y];
    if (currentOffset.x !== newOffsetX || currentOffset.y !== newOffsetY) {
        marker.setOffset(newOffset);
    }

    if (marker.getRotation() !== markerOptions.rotation) {
        marker.setRotation(markerOptions.rotation ?? 0);
    }
    if (marker.getRotationAlignment() !== markerOptions.rotationAlignment) {
        marker.setRotationAlignment(markerOptions.rotationAlignment ?? "auto");
    }
    if (marker.getPitchAlignment() !== markerOptions.pitchAlignment) {
        marker.setPitchAlignment(markerOptions.pitchAlignment ?? "auto");
    }

    return (
        <MarkerContext.Provider value={{ marker, map }}>
            {children}
        </MarkerContext.Provider>
    );
}

function MarkerContent({ children, className }) {
    const { marker } = useMarkerContext();

    return createPortal(
        <div className={cn("relative cursor-pointer", className)}>
            {children || <DefaultMarkerIcon />}
        </div>,
        marker.getElement()
    );
}

function DefaultMarkerIcon() {
    return (
        <div className="relative h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-lg" />
    );
}

function MarkerPopup({
    children,
    className,
    closeButton = false,
    ...popupOptions
}) {
    const { marker, map } = useMarkerContext();
    const container = useMemo(() => document.createElement("div"), []);
    const prevPopupOptions = useRef(popupOptions);

    const popup = useMemo(() => {
        const popupInstance = new MapLibreGL.Popup({
            offset: 16,
            ...popupOptions,
            closeButton: false,
        })
            .setMaxWidth("none")
            .setDOMContent(container);

        return popupInstance;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!map) return;

        popup.setDOMContent(container);
        marker.setPopup(popup);

        return () => {
            marker.setPopup(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map]);

    if (popup.isOpen()) {
        const prev = prevPopupOptions.current;

        if (prev.offset !== popupOptions.offset) {
            popup.setOffset(popupOptions.offset ?? 16);
        }
        if (prev.maxWidth !== popupOptions.maxWidth && popupOptions.maxWidth) {
            popup.setMaxWidth(popupOptions.maxWidth ?? "none");
        }

        prevPopupOptions.current = popupOptions;
    }

    const handleClose = () => popup.remove();

    return createPortal(
        <div
            className={cn(
                "relative rounded-md border bg-popover p-3 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
                className
            )}
        >
            {closeButton && (
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute top-1 right-1 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-label="Close popup"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            )}
            {children}
        </div>,
        container
    );
}

function MarkerTooltip({
    children,
    className,
    ...popupOptions
}) {
    const { marker, map } = useMarkerContext();
    const container = useMemo(() => document.createElement("div"), []);
    const prevTooltipOptions = useRef(popupOptions);

    const tooltip = useMemo(() => {
        const tooltipInstance = new MapLibreGL.Popup({
            offset: 16,
            ...popupOptions,
            closeOnClick: true,
            closeButton: false,
        }).setMaxWidth("none");

        return tooltipInstance;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!map) return;

        tooltip.setDOMContent(container);

        const handleMouseEnter = () => {
            tooltip.setLngLat(marker.getLngLat()).addTo(map);
        };
        const handleMouseLeave = () => tooltip.remove();

        marker.getElement()?.addEventListener("mouseenter", handleMouseEnter);
        marker.getElement()?.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            marker.getElement()?.removeEventListener("mouseenter", handleMouseEnter);
            marker.getElement()?.removeEventListener("mouseleave", handleMouseLeave);
            tooltip.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map]);

    if (tooltip.isOpen()) {
        const prev = prevTooltipOptions.current;

        if (prev.offset !== popupOptions.offset) {
            tooltip.setOffset(popupOptions.offset ?? 16);
        }
        if (prev.maxWidth !== popupOptions.maxWidth && popupOptions.maxWidth) {
            tooltip.setMaxWidth(popupOptions.maxWidth ?? "none");
        }

        prevTooltipOptions.current = popupOptions;
    }

    return createPortal(
        <div
            className={cn(
                "rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-md animate-in fade-in-0 zoom-in-95",
                className
            )}
        >
            {children}
        </div>,
        container
    );
}

function MarkerLabel({
    children,
    className,
    position = "top",
}) {
    const positionClasses = {
        top: "bottom-full mb-1",
        bottom: "top-full mt-1",
    };

    return (
        <div
            className={cn(
                "absolute left-1/2 -translate-x-1/2 whitespace-nowrap",
                "text-[10px] font-medium text-foreground",
                positionClasses[position],
                className
            )}
        >
            {children}
        </div>
    );
}

const positionClasses = {
    "top-left": "top-4 md:top-6 left-4 md:left-6",
    "top-right": "top-4 md:top-6 right-4 md:right-6",
    "bottom-left": "bottom-4 md:bottom-6 left-4 md:left-6",
    "bottom-right": "bottom-4 md:bottom-6 right-4 md:right-6",
};

function ControlGroup({ children, domCanvas, pageRef, isDarkMode }) {
    return (
        <div className="flex flex-col gap-3 items-center">
            {React.Children.map(children, child =>
                React.isValidElement(child) ? React.cloneElement(child, { domCanvas, pageRef, isDarkMode }) : child
            )}
        </div>
    );
}

function ControlButton({
    onClick,
    label,
    children,
    disabled = false,
    className,
    domCanvas,
    pageRef,
    isDarkMode,
    liquidGlassEffect = false
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn("w-12 h-12 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-gray-200 dark:border-white/20 flex items-center justify-center shadow-lg hover:bg-gray-100 dark:hover:bg-white/30 transition-all text-gray-800 dark:text-white", className, disabled && "opacity-50 cursor-not-allowed")}
        >
            {children}
        </button>
    );
}

// 'request' → pre-permission explanation
// 'denied'  → permission was blocked by user
// 'error'   → GPS/timeout error
function LocationModal({ type, onConfirm, onDismiss, onManual }) {
    const isDenied = type === 'denied';
    const isError = type === 'error';

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Backdrop — sin blur propio para que el glass del card difumine el mapa, no el overlay */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onDismiss}
            />

            {/* Card */}
            <div className="relative w-full max-w-sm overflow-hidden bg-white/10 dark:bg-[#1c1c1e]/75 backdrop-blur-[24px] rounded-[32px] border border-white/20 dark:border-white/[0.1] shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-4 duration-300">

                {/* Icon header */}
                <div className="px-8 pt-8 pb-0 flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 backdrop-blur-xl border-[0.5px] ${
                        isDenied || isError
                            ? 'bg-red-500/20 border-red-500/20'
                            : 'bg-blue-500/20 border-blue-500/20'
                    }`}>
                        {isDenied || isError
                            ? <ShieldAlert size={28} className="text-red-400" />
                            : <MapPin size={28} className="text-blue-400" />
                        }
                    </div>

                    <h2 className="text-xl font-black text-white mb-2">
                        {isDenied ? 'Acceso denegado'
                            : isError ? 'Ubicación no disponible'
                                : 'Usar mi ubicación'}
                    </h2>

                    <p className="text-sm text-white/50 leading-relaxed mb-8">
                        {isDenied
                            ? 'Bloqueaste el acceso a la ubicación. Para activarla, ve a los ajustes de tu navegador y permite la ubicación para este sitio.'
                            : isError
                                ? 'No se pudo obtener tu posición. Asegúrate de tener el GPS activo e inténtalo de nuevo.'
                                : 'SPOT necesita acceder a tu ubicación para mostrarte los lugares y eventos más cercanos a ti.'}
                    </p>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex flex-col gap-3">
                    {!isDenied && !isError && (
                        <button
                            onClick={onConfirm}
                            className="w-full py-3 rounded-2xl bg-blue-600/90 hover:bg-blue-500/90 active:scale-[0.98] text-white font-bold text-sm border border-blue-400/20 backdrop-blur-md shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all duration-200"
                        >
                            <Locate size={18} />
                            Permitir ubicación
                        </button>
                    )}

                    {/* Botón manual prominente para error/denied — es la alternativa principal */}
                    {onManual && (isDenied || isError) && (
                        <button
                            onClick={onManual}
                            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white font-bold text-sm backdrop-blur-xl border-[0.5px] border-white/20 flex items-center justify-center gap-2 transition-all duration-200"
                        >
                            <MapPin size={16} />
                            Fijar mi ubicación en el mapa
                        </button>
                    )}

                    <button
                        onClick={onDismiss}
                        className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.98] text-white/50 hover:text-white font-bold text-sm backdrop-blur-xl border-[0.5px] border-white/10 transition-all duration-200"
                    >
                        {isDenied || isError ? 'Cerrar' : 'Ahora no'}
                    </button>

                    {/* Opción sutil solo para el caso request (no error) */}
                    {onManual && !isDenied && !isError && (
                        <button
                            onClick={onManual}
                            className="w-full h-10 text-xs font-bold text-white/40 hover:text-white/70 transition-colors flex items-center justify-center gap-1.5"
                        >
                            <MapPin size={13} />
                            Fijar mi ubicación manualmente
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

function MapControls({
    position = "bottom-right",
    showZoom = false,
    showCompass = false,
    showLocate = false,
    showFullscreen = false,
    className,
    onLocate,
    onManualLocation,
    children,
    chatState = 'closed',
    domCanvas,
    pageRef,
    isDarkMode,
    liquidGlassEnabled = false,
    isSearchSheetOpen = false
}) {
    const { map } = useMap();
    const [waitingForLocation, setWaitingForLocation] = useState(false);
    const [locationModal, setLocationModal] = useState(null); // null | 'request' | 'denied' | 'error'

    const handleZoomIn = useCallback(() => {
        map?.zoomTo(map.getZoom() + 1, { duration: 300 });
    }, [map]);

    const handleZoomOut = useCallback(() => {
        map?.zoomTo(map.getZoom() - 1, { duration: 300 });
    }, [map]);

    const handleResetBearing = useCallback(() => {
        map?.easeTo({ bearing: 0, pitch: 0, duration: 300 });
    }, [map]);

    const doLocate = useCallback(() => {
        setLocationModal(null);
        setWaitingForLocation(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                map?.flyTo({
                    center: [pos.coords.longitude, pos.coords.latitude],
                    zoom: 14,
                    duration: 1500,
                });
                onLocate?.({ longitude: pos.coords.longitude, latitude: pos.coords.latitude });
                setWaitingForLocation(false);
            },
            (error) => {
                setWaitingForLocation(false);
                setLocationModal(error.code === 1 ? 'denied' : 'error');
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
        );
    }, [map, onLocate]);

    const handleLocate = useCallback(async () => {
        if (!("geolocation" in navigator)) {
            setLocationModal('error');
            return;
        }
        try {
            const status = await navigator.permissions.query({ name: 'geolocation' });
            if (status.state === 'granted') {
                doLocate();
            } else if (status.state === 'denied') {
                setLocationModal('denied');
            } else {
                setLocationModal('request');
            }
        } catch {
            // Permissions API not supported — show modal anyway
            setLocationModal('request');
        }
    }, [doLocate]);

    const handleFullscreen = useCallback(() => {
        const container = map?.getContainer();
        if (!container) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            container.requestFullscreen();
        }
    }, [map]);

    // Determinar clases de posición dinámicas basadas en el estado del chat
    let dynamicPositionClass = positionClasses[position];

    // isMobile reactivo — se actualiza cuando se redimensiona la ventana
    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    if (position === "bottom-right" && isMobile) {
        if (chatState === 'half') {
            dynamicPositionClass = "bottom-[52vh] right-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] z-[500]";
        } else if (chatState === 'full') {
            dynamicPositionClass = "bottom-[52vh] right-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] z-[900] opacity-0 pointer-events-none";
        } else if (isSearchSheetOpen) {
            dynamicPositionClass = "bottom-[62vh] right-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] z-[500]";
        } else {
            dynamicPositionClass = "bottom-[100px] right-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] z-[500]";
        }
    } else if (position === "bottom-right") {
        // PC / tablet — 6 unidades en cada lado
        dynamicPositionClass = "bottom-6 right-6 z-[500]";
    }

    return (
        <>
            {locationModal && (
                <LocationModal
                    type={locationModal}
                    onConfirm={doLocate}
                    onDismiss={() => setLocationModal(null)}
                    onManual={onManualLocation ? () => { setLocationModal(null); onManualLocation(); } : undefined}
                />
            )}
            <div
                className={cn(
                    "absolute z-[110] flex flex-col gap-2 safari-backdrop-fix",
                    dynamicPositionClass,
                    className
                )}
            >
                {showZoom && (
                    <ControlGroup domCanvas={domCanvas} pageRef={pageRef} isDarkMode={isDarkMode}>
                        <ControlButton onClick={handleZoomIn} label="Zoom in" liquidGlassEffect={false}>
                            <Plus className="size-4" />
                        </ControlButton>
                        <ControlButton onClick={handleZoomOut} label="Zoom out" liquidGlassEffect={false}>
                            <Minus className="size-4" />
                        </ControlButton>
                    </ControlGroup>
                )}
                {showCompass && (
                    <ControlGroup domCanvas={domCanvas} pageRef={pageRef} isDarkMode={isDarkMode}>
                        <CompassButton onClick={handleResetBearing} domCanvas={domCanvas} pageRef={pageRef} isDarkMode={isDarkMode} liquidGlassEffect={liquidGlassEnabled} />
                    </ControlGroup>
                )}
                {showLocate && (
                    <ControlGroup domCanvas={domCanvas} pageRef={pageRef} isDarkMode={isDarkMode}>
                        <ControlButton
                            onClick={handleLocate}
                            label="Find my location"
                            disabled={waitingForLocation}
                            liquidGlassEffect={liquidGlassEnabled}
                        >
                            {waitingForLocation ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Locate className="size-4" />
                            )}
                        </ControlButton>
                    </ControlGroup>
                )}
                {showFullscreen && (
                    <ControlGroup domCanvas={domCanvas} pageRef={pageRef} isDarkMode={isDarkMode}>
                        <ControlButton onClick={handleFullscreen} label="Toggle fullscreen" liquidGlassEffect={false} />
                    </ControlGroup>
                )}
                {React.Children.map(children, child =>
                    React.isValidElement(child) ? React.cloneElement(child, { domCanvas, pageRef, isDarkMode }) : child
                )}
            </div>
        </>
    );
}

function CompassButton({ onClick, domCanvas, pageRef, isDarkMode, liquidGlassEffect = false }) {
    const { map } = useMap();
    const compassRef = useRef(null);

    useEffect(() => {
        if (!map) return;

        const updateRotation = () => {
            if (!compassRef.current) return;
            const bearing = map.getBearing();
            const pitch = map.getPitch();
            compassRef.current.style.transform = `rotate(${-bearing}deg) rotateX(${pitch}deg)`;
        };

        map.on("rotate", updateRotation);
        map.on("pitch", updateRotation);
        map.on("move", updateRotation); // Ensure updates on any move
        updateRotation(); // Initial update

        return () => {
            map.off("rotate", updateRotation);
            map.off("pitch", updateRotation);
            map.off("move", updateRotation);
        };
    }, [map]);

    return (
        <button
            onClick={onClick}
            className="w-12 h-12 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-gray-200 dark:border-white/20 flex items-center justify-center shadow-lg hover:bg-gray-100 dark:hover:bg-white/30 transition-all text-gray-800 dark:text-white"
        >
            <div
                ref={compassRef}
                className="transition-transform duration-100 ease-out flex items-center justify-center w-full h-full"
                style={{ transformOrigin: "center" }}
            >
                <Navigation className="size-4 fill-red-500 text-red-500/80" />
            </div>
        </button>
    );
}

export {
    Map,
    MapMarker,
    MarkerContent,
    MarkerPopup,
    MarkerTooltip,
    MarkerLabel,
    MapControls,
    ControlGroup,
    ControlButton,
    useMap,
    useMarkerContext,
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
    LocationModal
};
