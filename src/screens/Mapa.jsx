import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Map,
  MapMarker,
  MapControls,
  ControlGroup,
  ControlButton,
  MarkerContent,
  MarkerLabel,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  LocationModal
} from './MapLibre';
import { Info, MessageSquare, MapPin, Plus, X, Globe, Car, Footprints, Navigation } from 'lucide-react';
import { getPlaceById, getEventById } from '@/services/api';
import FormularioLugar from '@/components/features/formulario/FormularioLugar';
import ModalPin from './ModalPin';
import Profile from '@/components/features/profile/Profile';
import { LiquidActionButton } from '@/components/features/buttons/LiquidActionButton';
import stardustPattern from '@/assets/stardust.png';


// ─── BillboardMarker Component ──────────────────────────────────────────
import { BACKEND_URL, resolveUrl } from '@/services/api';

const BillboardMarker = React.memo(({ item, isEvent = false, isSelected, darkMode, onClick }) => {
  const name = item.nombre_evento || item.nombre_lugar || item.nombre || item.title || item.titulo || '';
  const lat = item.latitud ?? item.lat;
  const lng = item.longitud ?? item.lng;
  const avatarColor = item.color || (isEvent ? '#facc15' : '#3b82f6');
  const imageUrl = resolveUrl(item.imagen_principal || item.imagen);

  if (lat == null || lng == null || isNaN(Number(lat)) || isNaN(Number(lng))) return null;

  return (
    <MapMarker
      latitude={lat}
      longitude={lng}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <MarkerContent>
        <div className="relative group cursor-pointer animate-spring-in">
          {/* Estructura del Billboard */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
            
            {/* Label Badge (Solo en Hover, por ARRIBA) - Se oculta si está seleccionado */}
            <div className={`
              absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full shadow-lg border border-white/10 
              transition-all duration-300 scale-95 group-hover:scale-100 group-hover:-translate-y-1 
              pointer-events-none z-30 whitespace-nowrap
              ${isEvent ? 'bg-yellow-400 text-black border-black/5' : (darkMode ? 'bg-white text-black' : 'bg-black text-white')}
              ${isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}
            `}>
              <span className={`font-black uppercase tracking-[0.2em] ${isEvent ? 'text-[11px]' : 'text-[10px]'}`}>
                {name}
              </span>
            </div>

            {/* Avatar Circular Flotante - Se oculta si está seleccionado */}
            <div className={`
              mb-[-10px] transform transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2 animate-bounce-slow z-10
              ${isSelected ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}
            `} style={{ animationDelay: isEvent ? '0.2s' : '0s' }}>
              <div className={`
                relative w-12 h-12 rounded-full shadow-xl overflow-hidden
                ${isEvent ? 'bg-yellow-400 shadow-yellow-400/20' : 'bg-[#3b82f6]'}
              `}>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center rounded-full text-white font-bold text-lg"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {isEvent ? '★' : name.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* La Línea Conectora (Stem) - SIEMPRE VISIBLE */}
            <div className="w-[1.5px] h-8 bg-gradient-to-t from-white/80 to-transparent opacity-60" />
            
            {/* El Punto de Anclaje (Dot) - SIEMPRE VISIBLE */}
            <div className={`
              w-2.5 h-2.5 rounded-full border-2 border-white shadow-lg
              ${isEvent ? 'bg-yellow-400' : 'bg-red-500'}
            `} />
          </div>
        </div>
      </MarkerContent>
    </MapMarker>
  );
});

export default function Mapa(props) {
  const {
    lugares,
    eventos = [],
    onLugarClick,
    onEventClick,
    onMapClick,
    selectedLugar,
    selectedEvento,
    onToggleChat,
    chatState,
    mapTheme,
    starrySky,
    user,
    setUser,
    showTools,
    setShowTools,
    setMapTheme,
    setStarrySky,
    liquidGlassEnabled,
    setLiquidGlassEnabled,
    darkMode,
    toggleDarkMode,
    domCanvas,
    pageRef,
    onCanvasReady,
    userRole,
    isSearchSheetOpen = false,
    isDashboard = false,
    searchRadius = 0,
    isEditingRadius = false,
    onSubmitLugar,
    isPickingLocation = false,
    onLocationPicked,
  } = props;
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const starryBgRef = useRef(null);

  const [userLocationInternal, setUserLocationInternal] = useState(null);
  const userLocation = props.userLocation !== undefined ? props.userLocation : userLocationInternal;
  
  // Sincronizar con el estado de App
  const setUserLocation = useCallback((coords) => {
    setUserLocationInternal(coords);
    props.setUserLocation?.(coords);
  }, [props.setUserLocation]);
  const isManualLocation = useRef(false);
  const [isManualLocationMode, setIsManualLocationMode] = useState(false);
  const [locationModal, setLocationModal] = useState(null); // null | 'request' | 'denied' | 'error'
  const [isMarkerVisible, setIsMarkerVisible] = useState(true);

  const watchIdRef = useRef(null);

  const startWatchingLocation = useCallback((highAccuracy = true) => {
    if (!navigator.geolocation) return;
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setUserLocation(coords);
        isManualLocation.current = false;
      },
      (err) => {
        if (err.code === 3 && highAccuracy) {
          // Timeout with GPS — retry with network/wifi location
          startWatchingLocation(false);
        } else {
          console.warn("watchPosition error:", err);
        }
      },
      { enableHighAccuracy: highAccuracy, timeout: highAccuracy ? 20000 : Infinity, maximumAge: 5000 }
    );
  }, [setUserLocation]);

  const onLocateSuccess = useCallback((pos) => {
    const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    setUserLocation?.(coords);
    isManualLocation.current = false;
    mapRef.current?.easeTo({ center: [coords.longitude, coords.latitude], zoom: 14, duration: 1500 });
    startWatchingLocation();
  }, [startWatchingLocation, setUserLocation]);

  const doLocateLowAccuracy = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      onLocateSuccess,
      (err) => setLocationModal(err.code === 1 ? 'denied' : 'error'),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 }
    );
  }, [onLocateSuccess]);

  const doLocate = useCallback(() => {
    setLocationModal(null);
    navigator.geolocation.getCurrentPosition(
      onLocateSuccess,
      (err) => {
        if (err.code === 3) {
          // GPS timeout — fall back to network/wifi silently
          doLocateLowAccuracy();
        } else {
          setLocationModal(err.code === 1 ? 'denied' : 'error');
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
    );
  }, [onLocateSuccess, doLocateLowAccuracy]);

  // Auto-solicitar ubicación al cargar el mapa — solo una vez.
  // Se usa un ref para evitar que el effect se dispare varias veces cuando
  // doLocate cambia de referencia por re-renders del padre.
  const autoLocateFiredRef = useRef(false);

  useEffect(() => {
    if (isDashboard || autoLocateFiredRef.current) return;
    autoLocateFiredRef.current = true;

    const check = async () => {
      if (!('geolocation' in navigator)) return;
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        if (status.state === 'granted') doLocate();
        else if (status.state === 'prompt') setLocationModal('request');
      } catch {
        setLocationModal('request');
      }
    };
    const t = setTimeout(check, 800);
    return () => clearTimeout(t);
  }, [doLocate, isDashboard]);

  // Limpiar el watchPosition solo al desmontar el componente.
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  // Soporte para control externo o interno del modo "Agregar Punto"
  const [isAddingPointInternal, setIsAddingPointInternal] = useState(false);
  const isAddingPoint = props.isAddingPoint !== undefined ? props.isAddingPoint : isAddingPointInternal;
  const setIsAddingPoint = props.setIsAddingPoint !== undefined ? props.setIsAddingPoint : setIsAddingPointInternal;

  const [isExtractingMode, setIsExtractingMode] = useState(false);
  const [newPoints, setNewPoints] = useState([]);
  const [tempPoint, setTempPoint] = useState(null);
  const [showPointForm, setShowPointForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 }); // Manteniendo para state inicial pero actualizando ref para fluidez
  const [routeData, setRouteData] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationProfile, setNavigationProfile] = useState(null); // 'driving' | 'walking'
  const [shouldAutoCenter, setShouldAutoCenter] = useState(true);

  const lastRecalculateTime = useRef(0);
  const isRecalculating = useRef(false);
  const isNavigatingRef = useRef(false);
  const modalPinRef = useRef(null);
  const [isRouting, setIsRouting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false); // Nuevo estado de carga
  const abortControllerRef = useRef(null);
  // Real-time canvas capture for liquid glass refraction
  // Uses a SINGLE persistent canvas updated every frame (no throttle)
  // setState is called only ONCE to pass the initial reference
  // The modified local LiquidGlassButton re-reads pixels every frame
  const offscreenCanvasRef = useRef(null);
  const offscreenCtxRef = useRef(null);
  const [mapDomCanvas, setMapDomCanvas] = useState(null);
  const hasSetInitialRef = useRef(false);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleRender = () => {
      try {
        const mapCanvas = map.getCanvas();
        if (!mapCanvas || mapCanvas.width === 0 || mapCanvas.height === 0) return;

        // Lazy-init the persistent offscreen canvas
        if (!offscreenCanvasRef.current) {
          offscreenCanvasRef.current = document.createElement('canvas');
        }

        const oc = offscreenCanvasRef.current;

        // Scale down the offscreen canvas for performance on low-end devices
        // The liquid glass relies on blur, so a low-res texture works perfectly
        // and cuts CPU/GPU memory bandwidth by 75%
        const SCALE = 0.5;
        const targetWidth = Math.floor(mapCanvas.width * SCALE);
        const targetHeight = Math.floor(mapCanvas.height * SCALE);

        // Only resize if dimensions changed
        if (oc.width !== targetWidth || oc.height !== targetHeight) {
          oc.width = targetWidth;
          oc.height = targetHeight;
          offscreenCtxRef.current = null; // force re-acquire context
        }

        if (!offscreenCtxRef.current) {
          offscreenCtxRef.current = oc.getContext('2d', { alpha: false, willReadFrequently: true });
        }
        if (!offscreenCtxRef.current) return;

        // Fill with the actual background color first, then composite the map on top
        // This is critical for globe mode: the map canvas renders the globe with
        // transparent pixels for the space/sky area. The CSS bg-black shows through
        // visually, but the captured canvas must include that background explicitly.
        const ctx = offscreenCtxRef.current;
        const bgColor = starrySky || darkMode ? '#000000' : '#f3f4f6';
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, oc.width, oc.height);
        ctx.drawImage(mapCanvas, 0, 0, mapCanvas.width, mapCanvas.height, 0, 0, oc.width, oc.height);

        // Track a version so the buttons only upload to GPU when pixels actually change
        oc.__mapVersion = (oc.__mapVersion || 0) + 1;

        // Only call setState ONCE to pass the canvas reference
        // After that, the button reads updated pixels directly via gl.texImage2D
        if (!hasSetInitialRef.current) {
          hasSetInitialRef.current = true;
          setMapDomCanvas(oc);
          if (onCanvasReady) {
            onCanvasReady(oc);
          }
        }
      } catch (e) {
        // Silently fail
      }
    };

    map.on('render', handleRender);

    return () => {
      map.off('render', handleRender);
    };
  }, []);


  // Verificar visibilidad del marcador (ocultar completamente si está detrás del globo)
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    const checkVisibility = () => {
      const map = mapRef.current;

      try {
        // Proyectar coordenadas a píxeles de pantalla
        const point = map.project([userLocation.longitude, userLocation.latitude]);
        const canvas = map.getCanvas();

        // Verificar si está dentro del canvas visible
        const inViewport = point.x >= 0 && point.x <= canvas.width &&
          point.y >= 0 && point.y <= canvas.height;

        // Para proyección globe, verificar si está en el hemisferio visible
        const center = map.getCenter();
        const lng1 = userLocation.longitude;
        const lng2 = center.lng;

        // Calcular diferencia de longitud (rango -180 a 180)
        let deltaLng = Math.abs(lng1 - lng2);
        if (deltaLng > 180) deltaLng = 360 - deltaLng;

        // Si la diferencia es mayor a 90°, está en el hemisferio opuesto
        const inFrontHemisphere = deltaLng <= 90;

        setIsMarkerVisible(inViewport && inFrontHemisphere);
      } catch (error) {
        // Si hay error en la proyección, asumir no visible
        setIsMarkerVisible(false);
      }
    };

    const map = mapRef.current;
    map.on('move', checkVisibility);
    map.on('zoom', checkVisibility);
    map.on('rotate', checkVisibility);
    map.on('pitch', checkVisibility);

    checkVisibility();

    return () => {
      map.off('move', checkVisibility);
      map.off('zoom', checkVisibility);
      map.off('rotate', checkVisibility);
      map.off('pitch', checkVisibility);
    };
  }, [userLocation]);

  // Efecto para mover el fondo estrellado
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !starrySky || !starryBgRef.current) return;

    const updateBackground = () => {
      const center = map.getCenter();
      const { lng, lat } = center;
      // Factor de movimiento: ajusta para más o menos sensibilidad
      const x = -lng * 10;
      const y = -lat * 10;

      if (starryBgRef.current) {
        starryBgRef.current.style.backgroundPosition = `${x}px ${y}px`;
      }
    };

    map.on('move', updateBackground);
    // Inicializar posición
    updateBackground();

    return () => {
      map.off('move', updateBackground);
    };
  }, [starrySky]); // Re-ejecutar si se activa/desactiva el modo cielo estrellado

  const handleMapClick = useCallback(async (e) => {
    const { lng, lat } = e.lngLat;

    if (isPickingLocation && onLocationPicked) {
      const CONT_ES = {
        'South America':'América del Sur', 'North America':'América del Norte',
        'Europe':'Europa', 'Asia':'Asia', 'Africa':'África',
        'Oceania':'Oceanía', 'Antarctica':'Antártida',
      };
      try {
        // BigDataCloud: CORS-friendly, browser-safe, no rate limit, no API key
        const r = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`
        );
        const d = r.ok ? await r.json() : {};
        onLocationPicked({
          latitud_lugar:    lat, longitud_lugar: lng,
          latitud_evento:   lat, longitud_evento: lng,
          direccion_lugar:  [d.locality, d.principalSubdivision, d.countryName].filter(Boolean).join(', ') || '',
          direccion_evento: [d.locality, d.principalSubdivision, d.countryName].filter(Boolean).join(', ') || '',
          continente_nombre: CONT_ES[d.continent] || d.continent || '',
          pais_nombre:  d.countryName || '',
          pais_codigo:  d.countryCode || '',
          region_nombre: d.principalSubdivision || '',
          ciudad_nombre: d.locality || d.city || '',
        });
      } catch (_) {
        onLocationPicked({ latitud_lugar: lat, longitud_lugar: lng, latitud_evento: lat, longitud_evento: lng });
      }
      return;
    }

    if (isManualLocationMode) {
      const coords = { latitude: lat, longitude: lng };
      setUserLocation?.(coords);
      isManualLocation.current = true;
      setIsManualLocationMode(false);
      mapRef.current?.easeTo({ center: [lng, lat], zoom: 15, duration: 800 });
      return;
    }

    if (isAddingPoint) {
      // Efecto visual inmediato de carga
      setTempPoint({
        longitud: lng,
        latitud: lat,
        nombre: 'Cargando datos...',
        continente_nombre: '',
        pais_nombre: '',
        region_nombre: '',
        ciudad_nombre: '',
        direccion_completa: '',
        direccion: ''
      });
      setShowPointForm(true);

      try {
        const fetchParams = {
          headers: {
            'Accept-Language': 'es',
            'User-Agent': 'MemoriaSPOT/2.0 (Point-Extractor)'
          }
        };

        const [data1, data2, data3, data4] = await Promise.all([
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, fetchParams).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`, fetchParams).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=5&addressdetails=1`, fetchParams).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=3&addressdetails=1`, fetchParams).then(r => r.ok ? r.json() : null).catch(() => null)
        ]);

        const main = data1 || data2 || data3 || data4;
        if (!main) throw new Error('No se pudo obtener información de ubicación');

        const addr = main.address || {};

        const paisNombre = addr.country || data4?.address?.country || data3?.address?.country || '';
        const countryCode = (addr.country_code || data4?.address?.country_code || '').toUpperCase();
        const regionNombre = addr.state || addr.province || addr.region || data3?.address?.state || '';
        const ciudadNombre = addr.city || addr.town || addr.village || addr.municipality || data2?.address?.city || '';

        const continentMap = {
          'PE': 'América del Sur', 'CO': 'América del Sur', 'AR': 'América del Sur', 'CL': 'América del Sur',
          'MX': 'América del Norte', 'US': 'América del Norte', 'CA': 'América del Norte', 'ES': 'Europa'
        };
        const continente = addr.continent || data4?.address?.continent || continentMap[countryCode] || 'América';

        const road = addr.road || '';
        const houseNumber = addr.house_number || '';
        const displayName = main.display_name || '';
        setTempPoint({
          longitud: lng,
          latitud: lat,
          nombre: main.name || road || ciudadNombre || 'Nuevo Lugar',
          direccion_completa: displayName,
          direccion: road + (houseNumber ? ` ${houseNumber}` : ''),
          continente_nombre: continente,
          pais_nombre: paisNombre,
          pais_codigo: countryCode,
          region_nombre: regionNombre,
          ciudad_nombre: ciudadNombre,
          tipo: addr.amenity || addr.shop || addr.tourism || addr.historic || null
        });
      } catch (error) {
        console.error('Error in robust reverse geocoding:', error);
        setTempPoint({ longitud: lng, latitud: lat, nombre: '' });
      }
    } else if (isExtractingMode && !isExtracting) {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsExtracting(true);

      const fetchParams = {
        headers: {
          'Accept-Language': 'es',
          'User-Agent': 'MemoriaSPOT/2.0 (Fast-Extractor)'
        },
        signal: controller.signal
      };

      try {
        const [data1, data2, data3, data4] = await Promise.all([
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, fetchParams).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`, fetchParams).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=5&addressdetails=1`, fetchParams).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=3&addressdetails=1`, fetchParams).then(r => r.ok ? r.json() : null).catch(() => null)
        ]);

        if (!data1 && !data2 && !data3 && !data4) {
          throw new Error('Sin conexión o API límite alcanzado');
        }

        const main = data1 || data2 || data3 || data4;
        const addr = main.address || {};

        const paisNombre = addr.country || data4?.address?.country || data3?.address?.country || 'N/A';
        const countryCode = (addr.country_code || data4?.address?.country_code || 'N/A').toUpperCase();
        const regionNombre = addr.state || addr.province || addr.region || data3?.address?.state || 'N/A';
        const ciudadNombre = addr.city || addr.town || addr.village || addr.municipality || data2?.address?.city || 'N/A';

        const countryID = data4?.osm_id || data3?.osm_id || 'N/A';
        const regionID = data3?.osm_id || data2?.osm_id || data4?.osm_id || 'N/A';
        const cityID = data2?.osm_id || data1?.osm_id || 'N/A';

        const continentMap = {
          'PE': 'América del Sur', 'CO': 'América del Sur', 'AR': 'América del Sur', 'CL': 'América del Sur',
          'MX': 'América del Norte', 'US': 'América del Norte', 'CA': 'América del Norte', 'ES': 'Europa'
        };
        const continente = addr.continent || data4?.address?.continent || continentMap[countryCode] || 'América';

        const info = `
IDENTIFICADORES JERÁRQUICOS (Extracción Rápida):
----------------------------------------------
CONTINENTE: ${continente}
   -> ID sugerido: ${countryCode === 'PE' ? 1 : countryCode}

PAÍS: ${paisNombre}
   -> ID (ISO): ${countryCode}
   -> OSM ID: ${countryID}

REGIÓN/ESTADO: ${regionNombre}
   -> OSM ID: ${regionID}

CIUDAD/MUNICIPIO: ${ciudadNombre}
   -> OSM ID: ${cityID}

DETALLES:
---------
DIRECCIÓN: ${main.display_name || 'Ubicación aproximada'}
OBJETO: ${main.osm_id} (${main.type})
        `;

        alert(info);
        setIsExtractingMode(false);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Fast extraction error:', error);
        alert(`Error: ${error.message}. Por favor, aguarda un segundo e intenta de nuevo.`);
      } finally {
        setIsExtracting(false);
        abortControllerRef.current = null;
      }
    }
  }, [isPickingLocation, onLocationPicked, isAddingPoint, isExtractingMode, isManualLocationMode, isExtracting, setUserLocation]);

  // Manejar clicks en el mapa cuando está en modo agregar o modo extracción
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.on('click', handleMapClick);

    // Cambiar cursor según el modo activo
    if (isPickingLocation || isManualLocationMode || isAddingPoint || (isExtractingMode && !isExtracting)) {
      map.getCanvas().style.cursor = 'crosshair';
    } else if (isExtracting) {
      map.getCanvas().style.cursor = 'wait';
    } else {
      map.getCanvas().style.cursor = '';
    }

    return () => {
      map.off('click', handleMapClick);
      map.getCanvas().style.cursor = '';
    };
  }, [handleMapClick, isPickingLocation, isManualLocationMode, isAddingPoint, isExtractingMode, isExtracting]);

  // Función para activar/desactivar modo agregar
  const toggleAddingMode = () => {
    setIsAddingPoint(!isAddingPoint);
    setIsExtractingMode(false); // Asegurar que el otro modo esté apagado
    setTempPoint(null);
    setShowPointForm(false);
  };

  // Función para activar modo extracción (Pruebas)
  const toggleExtractingMode = () => {
    setIsExtractingMode(!isExtractingMode);
    setIsAddingPoint(false); // Asegurar que el otro modo esté apagado
    setTempPoint(null);
    setShowPointForm(false);
  };

  // Función para guardar el nuevo punto desde FormularioLugar
  const handleSavePoint = async (fd) => {
    if (onSubmitLugar) {
      try {
        await onSubmitLugar(fd);
        // Solo cerrar si el guardado fue exitoso
        setTempPoint(null);
        setShowPointForm(false);
        setIsAddingPoint(false);
      } catch (_) {
        // El error ya fue mostrado por onSubmitLugar (alert)
        // Mantener el formulario abierto
      }
    } else {
      // Fallback local (sin API)
      setNewPoints(prev => [...prev, fd]);
      setTempPoint(null);
      setShowPointForm(false);
      setIsAddingPoint(false);
    }
  };

  // Función para cancelar agregar punto
  const handleCancelPoint = () => {
    setTempPoint(null);
    setShowPointForm(false);
  };

  const handleSelectSpot = (spot) => {
    // Identificar si es lugar o evento para llamar al handler correcto
    // Los eventos suelen tener 'date' o 'title' en lugar de 'nombre'
    const isEvento = spot.date || spot.title;

    if (isEvento) {
      if (onEventClick) onEventClick(spot);
    } else {
      if (onLugarClick) onLugarClick(spot);
    }

    // El useEffect que escucha a selectedLugar/selectedEvento se encargará
    // de llamar a handleMarkerClick y hacer el flyTo automáticamente.
  };

  // Función para manejar click en marcador
  const handleMarkerClick = (point, isEvent = false) => {
    // Calcular posición del modal basada en las coordenadas del marcador
    if (mapRef.current) {
      const map = mapRef.current;
      const lng = point.longitud ?? point.lng ?? point.ubicacion?.lng;
      const lat = point.latitud ?? point.lat ?? point.ubicacion?.lat;

      if (lng === undefined || lat === undefined || isNaN(lng) || isNaN(lat)) {
        console.error('Invalid coordinates for point:', point);
        return;
      }

      setSelectedLocation(point);

      // Fetch full details including imagenes[]
      if (point.id) {
        const fetcher = isEvent
          ? getEventById(point.id).then(res => res?.data?.evento)
          : getPlaceById(point.id).then(res => res?.data?.lugar);

        fetcher.then(full => { if (full) setSelectedLocation(full); }).catch(() => {});
      }

      const coords = map.project([lng, lat]);
      setModalPosition({ x: coords.x, y: coords.y });
      if (modalPinRef.current) {
        modalPinRef.current.style.transform = `translate3d(${coords.x}px, ${coords.y}px, 0) translateX(-50%) translateY(-100%) translateY(-25px)`;
      }

      // Deferimos la animación ligeramente para permitir que React termine de actualizar el DOM 
      // y se libere el hilo principal para la animación suave.
      setTimeout(() => {
        if (!mapRef.current) return;
        mapRef.current.flyTo({
          center: [lng, lat],
          padding: { top: 320, bottom: 0, left: 0, right: 0 },
          zoom: 17.5, 
          speed: 0.8, // Velocidad reducida para mayor suavidad (antes 1.2)
          curve: 1.4, 
          essential: true
        });
      }, 100);
    }
  };

  // Sincronizar selección externa (ej. desde sidebar) con el estado interno del mapa
  useEffect(() => {
    if (selectedLugar && selectedLugar !== selectedLocation) {
      handleMarkerClick(selectedLugar);
    }
  }, [selectedLugar]);

  useEffect(() => {
    if (selectedEvento) {
      handleMarkerClick(selectedEvento, true);
    }
  }, [selectedEvento]);

  // Función para cerrar el modal de pin
  const handleCloseModal = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  // Función para limpiar la ruta sin cerrar el modal
  const handleClearRoute = useCallback(() => {
    setRouteData(null);
  }, []);

  // Helper to calculate distance in meters between two lat/lng coordinates
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // meters
    const phi1 = lat1 * Math.PI/180;
    const phi2 = lat2 * Math.PI/180;
    const deltaPhi = (lat2-lat1) * Math.PI/180;
    const deltaLambda = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get shortest distance from user location to the route line
  const getDeviationDistance = useCallback((userLat, userLng, coords) => {
    if (!coords || coords.length === 0) return 0;
    let minDistance = Infinity;

    for (let i = 0; i < coords.length - 1; i++) {
      const p1 = coords[i];
      const p2 = coords[i + 1];
      
      const lng1 = p1[0], lat1 = p1[1];
      const lng2 = p2[0], lat2 = p2[1];
      
      const x = userLng - lng1;
      const y = userLat - lat1;
      const dx = lng2 - lng1;
      const dy = lat2 - lat1;
      
      const lenSq = dx * dx + dy * dy;
      let t = 0;
      if (lenSq > 0) {
        t = (x * dx + y * dy) / lenSq;
        t = Math.max(0, Math.min(1, t)); // clamp to segment
      }
      
      const closestLng = lng1 + t * dx;
      const closestLat = lat1 + t * dy;
      
      const dist = getDistance(userLat, userLng, closestLat, closestLng);
      if (dist < minDistance) {
        minDistance = dist;
      }
    }
    return minDistance;
  }, []);

  // Llama al proxy serverless /api/route (sin CORS — misma origen en Vercel)
  const fetchRoute = useCallback(async (profile, startLng, startLat, endLng, endLat) => {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 20000);
      const res = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, startLng, startLat, endLng, endLat }),
        signal: controller.signal
      });
      clearTimeout(tid);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.geometry) return data;
    } catch (_) { }
    return null;
  }, []);

  const handleRecalculateRoute = useCallback(async (startLat, startLng) => {
    if (isRecalculating.current || !selectedLocation) return;
    const now = Date.now();
    if (now - lastRecalculateTime.current < 5000) return; // Cooldown 5s

    isRecalculating.current = true;
    lastRecalculateTime.current = now;

    try {
      const endLng = selectedLocation.longitud ?? selectedLocation.lng;
      const endLat = selectedLocation.latitud ?? selectedLocation.lat;
      const profile = navigationProfile || 'driving';

      const updatedRoute = await fetchRoute(profile, startLng, startLat, endLng, endLat);
      if (updatedRoute && isNavigatingRef.current) {
        setRouteData(prev => ({
          ...prev,
          [profile]: updatedRoute
        }));
      }
    } catch (error) {
      console.warn("Recalculate error:", error);
    } finally {
      isRecalculating.current = false;
    }
  }, [selectedLocation, navigationProfile, fetchRoute]);

  const handleStartNavigation = useCallback((profile) => {
    isNavigatingRef.current = true;
    setIsNavigating(true);
    setNavigationProfile(profile);
    setShouldAutoCenter(true);
    if (userLocation && mapRef.current) {
      mapRef.current.easeTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 18,
        pitch: 50,
        duration: 1500
      });
    }
  }, [userLocation]);

  const handleEndNavigation = useCallback(() => {
    isNavigatingRef.current = false;
    setIsNavigating(false);
    setNavigationProfile(null);
    if (mapRef.current) {
      mapRef.current.easeTo({
        pitch: 0,
        zoom: 14.5,
        duration: 1000
      });
    }
  }, []);

  // Recalcular ruta en tiempo real si el usuario se desvía, y auto-centrar el mapa
  useEffect(() => {
    if (!isNavigating || !userLocation || !routeData || !navigationProfile) return;

    const activeRoute = routeData[navigationProfile];
    if (!activeRoute || !activeRoute.geometry || !activeRoute.geometry.coordinates) return;

    const userLat = userLocation.latitude;
    const userLng = userLocation.longitude;

    const deviation = getDeviationDistance(userLat, userLng, activeRoute.geometry.coordinates);

    if (deviation > 45) {
      handleRecalculateRoute(userLat, userLng);
    }

    if (shouldAutoCenter && mapRef.current && !mapRef.current.isMoving()) {
      mapRef.current.easeTo({
        center: [userLng, userLat],
        zoom: 18,
        pitch: 50,
        duration: 300
      });
    }
  }, [userLocation, isNavigating, routeData, navigationProfile, shouldAutoCenter, getDeviationDistance, handleRecalculateRoute]);

  // Si el usuario arrastra el mapa manualmente, desactivar el auto-centrado temporalmente
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let restoreTimer = null;

    const onDragStart = () => {
      if (isNavigatingRef.current) {
        clearTimeout(restoreTimer);
        setShouldAutoCenter(false);
      }
    };

    const onDragEnd = () => {
      if (isNavigatingRef.current) {
        restoreTimer = setTimeout(() => setShouldAutoCenter(true), 5000);
      }
    };

    map.on('dragstart', onDragStart);
    map.on('dragend', onDragEnd);
    return () => {
      map.off('dragstart', onDragStart);
      map.off('dragend', onDragEnd);
      clearTimeout(restoreTimer);
    };
  }, []);

  // Calcula ruta en auto y a pie en paralelo
  const handleCalculateRoute = useCallback(async () => {
    if (!userLocation || !selectedLocation) {
      alert('No se puede calcular la ruta. Asegúrate de que tu ubicación esté disponible.');
      return;
    }
    setIsRouting(true);
    try {
      const startLng = userLocation.longitude;
      const startLat = userLocation.latitude;
      const endLng = selectedLocation.longitud ?? selectedLocation.lng;
      const endLat = selectedLocation.latitud ?? selectedLocation.lat;

      const [driving, walking] = await Promise.all([
        fetchRoute('driving', startLng, startLat, endLng, endLat),
        fetchRoute('walking', startLng, startLat, endLng, endLat),
      ]);

      if (!driving && !walking) throw new Error('Sin resultado de ningún servidor');
      setRouteData({ driving, walking });
    } catch (error) {
      console.error('Error calculando ruta:', error);
      alert('Error al calcular la ruta. Por favor intenta de nuevo.');
    } finally {
      setIsRouting(false);
    }
  }, [userLocation, selectedLocation]);
  // Sincronización Manual Ultra-Fluida del Modal con el Mapa
  // Usamos manipulación directa del DOM en el evento 'render' para latencia cero
  useEffect(() => {
    if (!selectedLocation || !mapRef.current) return;

    const map = mapRef.current;
    const updateModalPosition = () => {
      if (!modalPinRef.current) return;
      
      const lng = selectedLocation.longitud ?? selectedLocation.lng ?? selectedLocation.ubicacion?.lng;
      const lat = selectedLocation.latitud ?? selectedLocation.lat ?? selectedLocation.ubicacion?.lat;
      
      if (lng === undefined || lat === undefined || isNaN(lng) || isNaN(lat)) return;

      const coords = map.project([lng, lat]);
      // Aplicamos transform3d para activar aceleración por hardware y sincronizar con los markers del mapa
      modalPinRef.current.style.transform = `translate3d(${coords.x}px, ${coords.y}px, 0) translateX(-50%) translateY(-100%) translateY(-25px)`;
    };

    // Escuchamos 'move' y 'render' para asegurar que el modal siga al pin en cada frame
    map.on('move', updateModalPosition);
    map.on('render', updateModalPosition);
    
    // Posicionamiento inicial inmediato
    updateModalPosition();

    return () => {
      map.off('move', updateModalPosition);
      map.off('render', updateModalPosition);
    };
  }, [selectedLocation]);


  // Efecto para dibujar ambas rutas (driving=azul, walking=verde punteada)
  // Persiste al cambiar estilo/tema/zoom usando el evento 'idle'
  const routeDataRef = useRef(null);
  routeDataRef.current = routeData;

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !routeData) return;

    const LAYERS = ['route-walking-casing', 'route-walking', 'route-driving-casing', 'route-driving'];
    const SOURCES = ['route-walking', 'route-driving'];

    const removeRoutes = () => {
      try {
        LAYERS.forEach(id => { if (map.getLayer(id)) map.removeLayer(id); });
        SOURCES.forEach(id => { if (map.getSource(id)) map.removeSource(id); });
      } catch (_) { }
    };

    const addRoutes = () => {
      removeRoutes();
      const data = routeDataRef.current;
      if (!data) return;

      // Ruta a pie — verde punteada
      if (data.walking && (!isNavigating || navigationProfile === 'walking')) {
        map.addSource('route-walking', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: data.walking.geometry }
        });
        map.addLayer({
          id: 'route-walking-casing',
          type: 'line', source: 'route-walking',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#ffffff', 'line-width': 8, 'line-opacity': 0.5 }
        });
        map.addLayer({
          id: 'route-walking',
          type: 'line', source: 'route-walking',
          layout: { 'line-join': 'round', 'line-cap': 'butt' },
          paint: { 'line-color': '#22c55e', 'line-width': 4, 'line-opacity': 0.95, 'line-dasharray': [2, 2.5] }
        });
      }

      // Ruta en auto — azul sólida (encima)
      if (data.driving && (!isNavigating || navigationProfile === 'driving')) {
        map.addSource('route-driving', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: data.driving.geometry }
        });
        map.addLayer({
          id: 'route-driving-casing',
          type: 'line', source: 'route-driving',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#ffffff', 'line-width': 9, 'line-opacity': 0.65 }
        });
        map.addLayer({
          id: 'route-driving',
          type: 'line', source: 'route-driving',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#3b82f6', 'line-width': 5, 'line-opacity': 0.97 }
        });
      }
    };

    // 'idle' garantiza que el estilo está 100% aplicado.
    // Re-dibuja solo si alguna fuente esperada ya no existe (post setStyle).
    const onIdle = () => {
      const d = routeDataRef.current;
      if (!d) return;
      const drivingMissing = d.driving && !map.getSource('route-driving');
      const walkingMissing = d.walking && !map.getSource('route-walking');
      if (drivingMissing || walkingMissing) addRoutes();
    };

    if (map.isStyleLoaded()) {
      addRoutes();
    } else {
      map.once('load', addRoutes);
    }

    map.on('idle', onIdle);

    return () => {
      map.off('load', addRoutes);
      map.off('idle', onIdle);
      removeRoutes();
    };
  }, [routeData, isNavigating, navigationProfile]);

  // Definición del círculo fuera del efecto para seguir las reglas de los hooks
  const addCircle = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    
    if (!map.isStyleLoaded()) return;

    const SOURCE_ID = 'search-radius';
    const LAYER_ID = 'search-radius-fill';
    const OUTLINE_ID = 'search-radius-outline';

    if (!isEditingRadius || searchRadius <= 0) {
      try {
        if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
        if (map.getLayer(OUTLINE_ID)) map.removeLayer(OUTLINE_ID);
        if (map.getLayer(OUTLINE_ID + '-glow')) map.removeLayer(OUTLINE_ID + '-glow');
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      } catch (error) {
        console.warn("Error removing radius layers", error);
      }
      return;
    }

    const centerLngLat = userLocation 
      ? { lat: Number(userLocation.latitude), lng: Number(userLocation.longitude) }
      : map.getCenter();

    const points = 128;
    const km = Number(searchRadius);
    const ring = [];
    const latRad = centerLngLat.lat * Math.PI / 180;
    const dX = km / (111.32 * Math.cos(latRad));
    const dY = km / 110.574;

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      ring.push([centerLngLat.lng + dX * Math.cos(theta), centerLngLat.lat + dY * Math.sin(theta)]);
    }
    ring.push(ring[0]);

    const geojson = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {},
        geometry: { type: 'Polygon', coordinates: [ring] }
      }]
    };

    try {
      const source = map.getSource(SOURCE_ID);
      if (source && map.getLayer(LAYER_ID)) {
        source.setData(geojson);
      } else {
        if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
        if (map.getLayer(OUTLINE_ID)) map.removeLayer(OUTLINE_ID);
        if (map.getLayer(OUTLINE_ID + '-glow')) map.removeLayer(OUTLINE_ID + '-glow');
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);

        map.addSource(SOURCE_ID, { type: 'geojson', data: geojson });
        map.addLayer({
          id: LAYER_ID, type: 'fill', source: SOURCE_ID,
          paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.25 }
        });
        map.addLayer({
          id: OUTLINE_ID + '-glow', type: 'line', source: SOURCE_ID,
          paint: { 'line-color': '#3b82f6', 'line-width': 12, 'line-opacity': 0.4, 'line-blur': 6 }
        });
        map.addLayer({
          id: OUTLINE_ID, type: 'line', source: SOURCE_ID,
          paint: { 'line-color': '#3b82f6', 'line-width': 3, 'line-opacity': 1, 'line-dasharray': [2, 2] }
        });
      }
    } catch (error) {
      console.warn("Error adding search radius circle", error);
    }
  }, [searchRadius, userLocation, isEditingRadius]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const onStyleLoad = () => addCircle();
    map.on('styledata', onStyleLoad);
    addCircle();

    if (searchRadius > 0 && isEditingRadius) {
      const centerLngLat = userLocation 
        ? { lat: userLocation.latitude, lng: userLocation.longitude }
        : map.getCenter();

      const km = Number(searchRadius);
      const dX = km / (111.32 * Math.cos(centerLngLat.lat * Math.PI / 180));
      const dY = km / 110.574;
      const bounds = [
        [centerLngLat.lng - dX * 1.5, centerLngLat.lat - dY * 1.5],
        [centerLngLat.lng + dX * 1.5, centerLngLat.lat + dY * 1.5]
      ];
      
      clearTimeout(map.fitBoundsTimeout);
      map.fitBoundsTimeout = setTimeout(() => {
        try {
          const isDesktop = window.innerWidth >= 768;
          map.fitBounds(bounds, { 
            padding: { top: 60, bottom: 60, left: 60, right: isDesktop ? 480 : 60 }, 
            duration: 600, 
            essential: true 
          });
        } catch(e) {
          console.warn("Error applying fitBounds", e);
        }
      }, 150);
    }

    return () => {
      map.off('styledata', onStyleLoad);
      if (map) clearTimeout(map.fitBoundsTimeout);
    };
  }, [searchRadius, userLocation, addCircle]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full rounded-none overflow-hidden border-none transition-colors duration-500 ${!starrySky ? 'bg-gray-100 dark:bg-black' : 'bg-black'} ${(isManualLocationMode || isPickingLocation) ? 'cursor-crosshair' : ''}`}
    >
      {/* Modal de permiso de ubicación */}
      {locationModal && (
        <LocationModal
          type={locationModal}
          onConfirm={doLocate}
          onDismiss={() => setLocationModal(null)}
          onManual={() => { setLocationModal(null); setIsManualLocationMode(true); }}
        />
      )}

      {/* Banner: modo ubicación manual activo */}
      {isManualLocationMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] animate-in slide-in-from-top-4 duration-300 w-max max-w-[calc(100vw-2rem)]">
          <div className="flex items-center gap-3 bg-white/20 dark:bg-[#1c1c1e]/75 backdrop-blur-[24px] text-white px-5 py-3.5 rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/20 dark:border-white/[0.1]">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border-[0.5px] border-blue-500/20 backdrop-blur-xl flex items-center justify-center shrink-0 animate-pulse">
              <MapPin size={15} className="text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none mb-0.5">Modo manual</p>
              <p className="text-sm font-bold text-white leading-tight">Toca el mapa para fijar tu ubicación</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setIsManualLocationMode(false); }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border-[0.5px] border-white/20 flex items-center justify-center transition-all active:scale-95 shrink-0"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Banner: modo seleccionar ubicación para edición */}
      {isPickingLocation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] animate-in slide-in-from-top-4 duration-300 w-max max-w-[calc(100vw-2rem)]">
          <div className="flex items-center gap-3 bg-[#1c1c1e]/85 backdrop-blur-[24px] text-white px-5 py-3.5 rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/15">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center shrink-0 animate-pulse">
              <MapPin size={15} className="text-yellow-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none mb-0.5">Seleccionar ubicación</p>
              <p className="text-sm font-bold text-white leading-tight">Haz clic en el mapa para marcar la posición</p>
            </div>
          </div>
        </div>
      )}

      {/* HUD de Navegación en Tiempo Real */}
      {isNavigating && selectedLocation && routeData && routeData[navigationProfile] && (
        <div className="absolute top-4 left-4 right-4 md:top-auto md:left-[420px] md:right-auto md:w-[380px] md:bottom-6 z-[500] animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-3 bg-white/20 dark:bg-[#1c1c1e]/40 backdrop-blur-[24px] text-white p-5 rounded-[48px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/20 dark:border-white/[0.1]">
            {/* Cabecera del Destino */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex gap-2.5 items-center min-w-0">
                <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center backdrop-blur-xl border-[0.5px] ${navigationProfile === 'walking' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/20 text-blue-400 border-blue-500/20'}`}>
                  {navigationProfile === 'walking' ? <Footprints size={20} /> : <Car size={20} />}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black tracking-widest text-white/50 uppercase leading-none block mb-0.5">Guiando hacia</span>
                  <h3 className="text-sm font-black truncate text-white leading-tight uppercase tracking-wider">
                    {selectedLocation.nombre_lugar || selectedLocation.nombre || selectedLocation.title || 'Tu Destino'}
                  </h3>
                </div>
              </div>
              <button
                onClick={handleEndNavigation}
                className="shrink-0 w-12 h-12 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 backdrop-blur-xl border-[0.5px] border-red-500/20 flex items-center justify-center transition-all active:scale-95 duration-200"
                title="Finalizar navegación"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Información del Trayecto */}
            <div className="grid grid-cols-2 gap-2 bg-white/5 dark:bg-white/[0.04] p-3 rounded-3xl border border-white/10">
              <div className="flex flex-col items-center justify-center py-1 border-r border-white/10">
                <span className="text-[10px] font-black text-white/40 tracking-widest uppercase mb-0.5">Tiempo</span>
                <span className="text-xl font-black tracking-tighter text-white">
                  {routeData[navigationProfile].duration}
                  <small className="text-[10px] font-black ml-0.5 text-white/70">MIN</small>
                </span>
              </div>
              <div className="flex flex-col items-center justify-center py-1">
                <span className="text-[10px] font-black text-white/40 tracking-widest uppercase mb-0.5">Distancia</span>
                <span className="text-xl font-black tracking-tighter text-white">
                  {routeData[navigationProfile].distance}
                  <small className="text-[10px] font-black ml-0.5 text-white/70">KM</small>
                </span>
              </div>
            </div>

            {/* Botón de Recentrado / Estado del Auto-centrado */}
            {!shouldAutoCenter && (
              <button
                onClick={() => {
                  setShouldAutoCenter(true);
                  if (userLocation && mapRef.current) {
                    mapRef.current.easeTo({
                      center: [userLocation.longitude, userLocation.latitude],
                      zoom: 18,
                      pitch: 50,
                      duration: 1000
                    });
                  }
                }}
                className="w-full py-3 rounded-3xl bg-blue-600/90 hover:bg-blue-500/90 active:scale-[0.98] font-bold text-xs uppercase tracking-widest transition-all duration-200 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 border border-blue-400/20 backdrop-blur-md animate-in fade-in-50 zoom-in-95"
              >
                <Navigation size={14} className="fill-current rotate-45 animate-pulse" />
                Recentrar Cámara
              </button>
            )}
          </div>
        </div>
      )}
      {starrySky && (
        <div
          ref={starryBgRef}
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `url("${stardustPattern}")`,
            backgroundRepeat: 'repeat',
            opacity: 1, // Al máximo para que resalten más
            filter: 'contrast(500%) brightness(100%) grayscale(100%)', // Mayor contraste y brillo al máximo para estrellas blancas super brillantes
          }}
        />
      )}
      <div className="relative w-full h-full">
        <Map
          ref={mapRef}
          projection={{ type: 'globe' }}
          mapTheme={mapTheme}
          starrySky={starrySky}
          center={[-75.21, -12.06805]}
          zoom={14.5}
          attributionControl={false}
        >
          <MapControls
            position="bottom-right"
            showCompass
            showLocate
            onLocate={(coords) => {
              setUserLocation(coords);
              startWatchingLocation();
            }}
            onManualLocation={() => setIsManualLocationMode(true)}
            chatState={chatState}
            isSearchSheetOpen={isSearchSheetOpen}
            domCanvas={mapDomCanvas || domCanvas}
            pageRef={containerRef}
            isDarkMode={darkMode}
            liquidGlassEnabled={liquidGlassEnabled}
          >
            {!isDashboard && (
              <ControlGroup>
                <ControlButton
                  onClick={onToggleChat}
                  label={chatState === 'closed' ? 'Abrir Chat' : 'Cerrar Chat'}
                  liquidGlassEffect={liquidGlassEnabled}
                >
                  <MessageSquare className="size-4" />
                </ControlButton>
              </ControlGroup>
            )}
          </MapControls>

          {/* Atribución Discreta */}
          <div className="absolute bottom-1 left-1 z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded-full bg-black/20 text-white/30 hover:bg-black/40 hover:text-white/80 transition-all backdrop-blur-sm">
                  <Info className="w-3 h-3" />
                  <span className="sr-only">Map credits</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-[10px] bg-black/80 text-white/70 border-none backdrop-blur-md">
                <p>© CARTO, © OpenStreetMap contributors</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Marcador de Ubicación del Usuario - Estilo Apple Maps con Soporte para Radio */}
          {userLocation && isMarkerVisible && (
            <MapMarker
              latitude={userLocation.latitude}
              longitude={userLocation.longitude}
            >
              <MarkerContent>
                <div className="relative flex items-center justify-center w-8 h-8">
                  {/* Etiqueta de distancia (Solo en modo edición de radio) */}
                  {(searchRadius > 0 && isEditingRadius) && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg whitespace-nowrap animate-in zoom-in duration-300">
                      {searchRadius} KM
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-blue-600"></div>
                    </div>
                  )}

                  {/* Efectos de pulso / radar para radio o standard */}
                  {isEditingRadius ? (
                    <>
                      <div className="absolute w-full h-full bg-blue-500 rounded-full opacity-30 animate-ping"></div>
                      <div className="absolute w-12 h-12 bg-blue-500 rounded-full opacity-10 animate-pulse"></div>
                    </>
                  ) : (
                    <div className="absolute w-full h-full bg-blue-500 rounded-full animate-ping opacity-20" />
                  )}
                  
                  {/* El punto central - Estilo Apple/Facebook */}
                  <div className={`relative flex items-center justify-center rounded-full shadow-lg transition-all duration-300 ${isEditingRadius ? 'w-6 h-6 bg-white border-2 border-white' : 'w-5 h-5 bg-[#C7C7C7] ring-1 ring-black/10'}`}>
                    <div className={`rounded-full transition-all duration-300 ${isEditingRadius ? 'w-4 h-4 bg-[#007AFF] border-2 border-white' : 'w-3 h-3 bg-blue-500'}`} />
                  </div>
                </div>
              </MarkerContent>
              {!isEditingRadius && (
                <MarkerLabel className="text-xs font-bold text-blue-500 bg-white px-2 py-1 rounded shadow-md mt-1">
                  Tu Ubicación
                </MarkerLabel>
              )}
            </MapMarker>
          )}

          {/* Marcadores de puntos de interés agregados por el usuario */}
          {newPoints.map((point, i) => {
            const lat = Number(point.latitud);
            const lng = Number(point.longitud);
            if (isNaN(lat) || isNaN(lng)) return null;
            return (
            <MapMarker
              key={point.id ?? `np-${i}`}
              latitude={lat}
              longitude={lng}
              onClick={() => handleMarkerClick(point)}
            >
              <MarkerContent>
                <div className="relative flex items-center justify-center w-8 h-8">
                  <div className="absolute w-full h-full bg-green-500 rounded-full opacity-20 animate-pulse"></div>
                  <MapPin className="w-6 h-6 text-green-600 drop-shadow-lg" fill="currentColor" />
                </div>
              </MarkerContent>
              <MarkerLabel className="text-xs font-semibold text-green-600 bg-white px-2 py-1 rounded shadow-md mt-1">
                {point.nombre}
              </MarkerLabel>
            </MapMarker>
            );
          })}

          {/* Marcador temporal al agregar punto */}
          {tempPoint && (
            <MapMarker
              latitude={tempPoint.latitud}
              longitude={tempPoint.longitud}
            >
              <MarkerContent>
                <div className="relative flex items-center justify-center w-8 h-8">
                  <div className="absolute w-full h-full bg-yellow-500 rounded-full opacity-30 animate-ping"></div>
                  <MapPin className="w-6 h-6 text-yellow-500 drop-shadow-lg" fill="currentColor" />
                </div>
              </MarkerContent>
            </MapMarker>
          )}

          {/* Marcadores de lugares desde el backend - Estilo Billboard Premium */}
          {lugares.map((lugar, i) => (
            <BillboardMarker
              key={lugar.id ?? `l-${i}`}
              item={lugar}
              isSelected={selectedLocation?.id === lugar.id}
              darkMode={darkMode}
              onClick={() => handleMarkerClick(lugar)}
            />
          ))}

          {/* Marcadores de EVENTOS - Estilo Billboard Premium */}
          {eventos.map((evento, i) => (
            <BillboardMarker
              key={evento.id ?? `e-${i}`}
              item={evento}
              isEvent={true}
              isSelected={selectedLocation?.id === evento.id}
              darkMode={darkMode}
              onClick={() => {
                handleMarkerClick(evento, true);
                if (onEventClick) onEventClick(evento);
              }}
            />
          ))}

        </Map>
      </div>

      {/* Herramientas Flotantes */}
      <div className={`absolute z-[110] flex flex-col gap-2 items-center ignore-capture ${isDashboard ? 'bottom-[150px] right-4 md:right-6' : 'top-[72px] md:top-[80px] right-4 md:right-6'}`}>


        {/* Botón de Extracción de Datos (PRUEBAS) - Solo Administradores y Negocios */}
        {(userRole === 'admin' || userRole === 'business') && !isDashboard && (
          <Tooltip>
            <TooltipTrigger asChild>
              <LiquidActionButton
                onClick={toggleExtractingMode}
                domCanvas={mapDomCanvas || domCanvas}
                pageRef={containerRef}
                isDarkMode={darkMode}
                liquidGlassEffect={false}
                className={`w-12 h-12 ${isExtractingMode ? 'ring-2 ring-blue-500' : ''}`}
              >
                <Globe
                  size={20}
                  className={isExtracting ? 'animate-spin' : ''}
                  strokeWidth={2.5}
                />
              </LiquidActionButton>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-black/60 text-white/90 border-none backdrop-blur-xl">
              <p>{isExtractingMode ? 'Cancelar Extracción' : 'Pruebas: Extraer Datos'}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Botón flotante para agregar puntos de interés */}
        {(userRole === 'admin' || userRole === 'business') && !isDashboard && (
          <Tooltip>
            <TooltipTrigger asChild>
              <LiquidActionButton
                onClick={toggleAddingMode}
                domCanvas={mapDomCanvas || domCanvas}
                pageRef={containerRef}
                isDarkMode={darkMode}
                liquidGlassEffect={false}
                className={`w-12 h-12 ${isAddingPoint ? 'ring-2 ring-red-500' : ''}`}
              >
                {isAddingPoint ? (
                  <X size={20} strokeWidth={2.5} className="text-red-500" />
                ) : (
                  <Plus size={20} strokeWidth={2.5} className="text-green-600 dark:text-green-400" />
                )}
              </LiquidActionButton>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-black/60 text-white/90 border-none backdrop-blur-xl">
              <p>{isAddingPoint ? 'Cancelar' : 'Agregar Punto'}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>


      {/* Formulario profesional para agregar detalles del punto */}
      <FormularioLugar
        isOpen={showPointForm && tempPoint !== null}
        onClose={handleCancelPoint}
        onSubmit={handleSavePoint}
        initialCoords={tempPoint}
      />

      {/* Indicador de modo extracción activo */}
      {isExtractingMode && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl animate-pulse border border-white/20 flex items-center gap-3">
            <Globe className="w-5 h-5" />
            <p className="text-sm font-bold uppercase tracking-wider">Modo Extracción: Haz clic en el mapa</p>
          </div>
        </div>
      )}

      {/* Indicador de modo agregar activo */}
      {isAddingPoint && !showPointForm && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
            <p className="text-sm font-semibold">📍 Haz clic en el mapa para agregar un punto</p>
          </div>
        </div>
      )}

      {/* Modal de detalles del pin - Renderizado fuera para máximo rendimiento y sincronización manual */}
      {!isNavigating && selectedLocation && (
        <div
          ref={modalPinRef}
          className="absolute top-0 left-0 z-[115] pointer-events-none"
          style={{ willChange: 'transform' }}
        >
          <div className="pointer-events-auto">
            <ModalPin
              selectedLocation={selectedLocation}
              onClose={handleCloseModal}
              onCalculateRoute={handleCalculateRoute}
              onClearRoute={handleClearRoute}
              routeInfo={routeData}
              isRouting={isRouting}
              onStartNavigation={handleStartNavigation}
            />
          </div>
        </div>
      )}

    </div>
  );
}
