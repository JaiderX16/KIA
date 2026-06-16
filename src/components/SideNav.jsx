import React from 'react';
import { Home, Map, FileText, User, Camera, LogOut, Leaf } from 'lucide-react';

const SideNav = ({ currentScreen, navigate }) => {
  const NavItem = ({ id, icon, label }) => {
    const isActive = currentScreen === id;
    return (
      <button 
        onClick={() => navigate(id)}
        className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 w-full font-bold text-sm
          ${isActive ? 'bg-white/80 text-blue-600 shadow-sm border border-white' : 'text-gray-500 hover:bg-white/40 hover:text-gray-700'}`}
      >
        {React.cloneElement(icon, { strokeWidth: isActive ? 2.5 : 2, className: isActive ? 'fill-blue-100' : '' })}
        {label}
      </button>
    );
  };

  return (
    <div className="hidden md:flex flex-col w-72 bg-white/30 backdrop-blur-md border-r border-white/50 p-6 pt-10 relative z-20">
      <div className="flex items-center gap-3 text-blue-700 mb-10 px-2">
        <div className="bg-white/80 p-2 rounded-xl shadow-sm border border-white"><Leaf size={24} /></div>
        <h1 className="text-2xl font-extrabold tracking-tight">Eco Point</h1>
      </div>
      
      <div className="flex flex-col gap-2 flex-1">
        <NavItem id="dashboard" icon={<Home size={22} />} label="Inicio" />
        <NavItem id="map" icon={<Map size={22} />} label="Mapa de puntos" />
        <NavItem id="history" icon={<FileText size={22} />} label="Mis Reportes" />
        <NavItem id="profile" icon={<User size={22} />} label="Mi Perfil" />
      </div>

      <button 
        onClick={() => navigate('report')}
        className="mt-8 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center gap-3 text-white shadow-[0_8px_24px_rgba(59,130,246,0.4)] transform transition-all hover:scale-[1.02] active:scale-95 border border-white/40 p-4 font-bold"
      >
        <Camera size={24} strokeWidth={2} />
        Reportar Reciclaje
      </button>

      <button onClick={() => navigate('login')} className="mt-6 flex items-center gap-3 px-6 py-4 text-gray-400 hover:text-red-500 transition-colors font-bold text-sm w-full">
        <LogOut size={20} /> Cerrar Sesión
      </button>
    </div>
  );
};

export default SideNav;
