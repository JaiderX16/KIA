import React from 'react';
import { Home, Map, FileText, User, Camera, LogOut, Leaf, X } from 'lucide-react';

const SideNav = ({ currentScreen, navigate, isOpen, setIsOpen }) => {
  const NavItem = ({ id, icon, label }) => {
    const isActive = currentScreen === id;
    return (
      <button 
        onClick={() => navigate(id)}
        className={`flex items-center gap-4 px-6 py-4 rounded-full transition-all duration-300 w-full font-bold text-sm
          ${isActive ? 'bg-white/80 dark:bg-white/20 text-blue-600 dark:text-blue-400 shadow-sm border border-white dark:border-white/10' : 'text-gray-500 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-gray-200'}`}
      >
        {React.cloneElement(icon, { strokeWidth: isActive ? 2.5 : 2, className: isActive ? 'fill-blue-100 dark:fill-blue-900' : '' })}
        {label}
      </button>
    );
  };

  const userSidebarClasses = `
    absolute z-[1000] overflow-hidden will-change-transform
    transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]
    top-4 left-4 bottom-4 w-[calc(100%-32px)] md:w-[clamp(300px,25vw,360px)]
    flex flex-col rounded-[48px] border
    bg-white/40 dark:bg-[#1c1c1e]/60 backdrop-blur-[24px] border-white/40 dark:border-white/[0.1]
    shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]
    ${!isOpen ? '-translate-x-[105%] opacity-0 scale-95 pointer-events-none' : 'translate-x-0 opacity-100 scale-100'}
  `;

  return (
    <div className={userSidebarClasses}>
      <div className="p-6 pt-8 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-blue-700 dark:text-blue-400 px-2">
          <div className="bg-white/80 dark:bg-white/10 p-2 rounded-full shadow-sm border border-white dark:border-white/10"><Leaf size={24} /></div>
          <h1 className="text-2xl font-extrabold tracking-tight">Eco Point</h1>
        </div>
        
        <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 rounded-full bg-white/50 dark:bg-white/10 border border-white/50 dark:border-white/10 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/20 transition-all"
        >
            <X size={18} />
        </button>
      </div>
      
      <div className="flex flex-col gap-2 flex-1 p-6 pt-2 overflow-y-auto no-scrollbar">
        <NavItem id="dashboard" icon={<Home size={22} />} label="Inicio" />
        <NavItem id="map" icon={<Map size={22} />} label="Mapa de puntos" />
        <NavItem id="history" icon={<FileText size={22} />} label="Mis Reportes" />
        <NavItem id="profile" icon={<User size={22} />} label="Mi Perfil" />
        
        <button 
          onClick={() => navigate('report')}
          className="mt-8 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center gap-3 text-white shadow-[0_8px_24px_rgba(59,130,246,0.4)] transform transition-all hover:scale-[1.02] active:scale-95 border border-white/40 dark:border-white/10 p-4 font-bold"
        >
          <Camera size={24} strokeWidth={2} />
          Reportar Reciclaje
        </button>
      </div>

      <div className="p-6">
        <button onClick={() => navigate('login')} className="flex items-center gap-3 px-6 py-4 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-bold text-sm w-full bg-white/20 dark:bg-white/5 rounded-full border border-white/30 dark:border-white/5">
          <LogOut size={20} /> Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default SideNav;
