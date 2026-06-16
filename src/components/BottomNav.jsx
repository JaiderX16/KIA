import React from 'react';
import { Home, Map, Camera, FileText, User } from 'lucide-react';

const BottomNav = ({ currentScreen, navigate }) => (
  <div className="md:hidden absolute bottom-6 left-4 right-4 bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-[32px] px-6 py-3 flex justify-between items-center z-[1000] pb-safe">
    <button onClick={() => navigate('dashboard')} className={`flex flex-col items-center gap-1.5 transition-colors ${currentScreen === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
      <Home size={22} strokeWidth={currentScreen === 'dashboard' ? 2.5 : 2} className={currentScreen === 'dashboard' ? 'fill-blue-100 dark:fill-blue-900/50' : ''} />
      <span className="text-[10px] font-bold">Inicio</span>
    </button>
    <button onClick={() => navigate('map')} className={`flex flex-col items-center gap-1.5 transition-colors ${currentScreen === 'map' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
      <Map size={22} strokeWidth={currentScreen === 'map' ? 2.5 : 2} className={currentScreen === 'map' ? 'fill-blue-100 dark:fill-blue-900/50' : ''} />
      <span className="text-[10px] font-bold">Mapa</span>
    </button>
    <div className="relative -top-6">
      <button onClick={() => navigate('report')} className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-[0_8px_24px_rgba(59,130,246,0.5)] transform transition-all hover:scale-105 active:scale-95 border-4 border-white/50 dark:border-[#1c1c1e]/50 backdrop-blur-md">
        <Camera size={26} strokeWidth={2} />
      </button>
    </div>
    <button onClick={() => navigate('history')} className={`flex flex-col items-center gap-1.5 transition-colors ${currentScreen === 'history' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
      <FileText size={22} strokeWidth={currentScreen === 'history' ? 2.5 : 2} className={currentScreen === 'history' ? 'fill-blue-100 dark:fill-blue-900/50' : ''} />
      <span className="text-[10px] font-bold">Reportes</span>
    </button>
    <button onClick={() => navigate('profile')} className={`flex flex-col items-center gap-1.5 transition-colors ${currentScreen === 'profile' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
      <User size={22} strokeWidth={currentScreen === 'profile' ? 2.5 : 2} className={currentScreen === 'profile' ? 'fill-blue-100 dark:fill-blue-900/50' : ''} />
      <span className="text-[10px] font-bold">Perfil</span>
    </button>
  </div>
);

export default BottomNav;
