import React, { useState } from 'react';
import { Map, MapMarker, MapControls, MarkerContent } from './MapLibre';

const recyclingPoints = [
  { id: 1, lat: -12.0671, lng: -75.2100, name: 'Punto Ecológico Centro', img: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=100&h=100&fit=crop' },
  { id: 2, lat: -12.0620, lng: -75.2010, name: 'Reciclaje El Tambo', img: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=100&h=100&fit=crop' },
  { id: 3, lat: -12.0710, lng: -75.2080, name: 'Acopio Chilca', img: 'https://images.unsplash.com/photo-1591193686104-fdd2d0d9540b?w=100&h=100&fit=crop' },
  { id: 4, lat: -12.0600, lng: -75.2150, name: 'Punto Verde San Carlos', img: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=100&h=100&fit=crop' },
  { id: 5, lat: -12.0680, lng: -75.1980, name: 'EcoPunto Mercado', img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100&h=100&fit=crop' },
];

const MapScreen = ({ navigate }) => {
  const [userLocation, setUserLocation] = useState(null);

  return (
    <div className="w-full h-full absolute inset-0 bg-[#050505]">
      {/* Simple Starry CSS Background */}
      <div className="absolute inset-0 z-0 opacity-60 pointer-events-none" style={{ backgroundImage: 'radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 70px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 50px 160px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 90px 40px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 130px 80px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 160px 120px, #ffffff, rgba(0,0,0,0))', backgroundSize: '200px 200px' }}></div>
      
      <Map mapTheme="satellite" zoom={13} center={[-75.2048, -12.0651]} projection={{ type: 'globe' }}>
         <MapControls 
            showZoom={true} 
            showCompass={true} 
            showLocate={true} 
            position="top-right" 
            onLocate={(coords) => setUserLocation(coords)}
         />
         
         {/* User Location Marker */}
         {userLocation && (
           <MapMarker longitude={userLocation.longitude} latitude={userLocation.latitude}>
             <MarkerContent>
               <div className="relative flex items-center justify-center pointer-events-none">
                  <div className="w-5 h-5 bg-blue-500 rounded-full border-[3px] border-white shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10"></div>
                  <div className="absolute w-12 h-12 bg-blue-500/40 rounded-full animate-ping z-0"></div>
               </div>
             </MarkerContent>
           </MapMarker>
         )}

         {/* Recycling Points */}
         {recyclingPoints.map(point => (
           <MapMarker key={point.id} longitude={point.lng} latitude={point.lat}>
             <MarkerContent>
                <div className="relative group cursor-pointer flex flex-col items-center hover:-translate-y-1 transition-transform">
                  {/* Tooltip */}
                  <div className="absolute -top-10 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg border border-white/20 pointer-events-none z-[100]">
                    {point.name}
                  </div>
                  {/* Image Circle */}
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[2.5px] border-white shadow-[0_4px_15px_rgba(0,0,0,0.6)] overflow-hidden z-10 bg-white">
                    <img src={point.img} alt={point.name} className="w-full h-full object-cover" />
                  </div>
                  {/* Stem */}
                  <div className="w-[2.5px] h-5 md:h-6 bg-gradient-to-t from-white to-white/40 -mt-2 z-0 shadow-sm" />
                  {/* Dot */}
                  <div className="w-3.5 h-3.5 bg-green-500 rounded-full border-[2px] border-white shadow-md -mt-1" />
                </div>
             </MarkerContent>
           </MapMarker>
         ))}
      </Map>
    </div>
  );
};

export default MapScreen;
