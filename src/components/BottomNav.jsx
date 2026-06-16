import React from 'react';
import { Home, Map, Camera, FileText, User } from 'lucide-react';

const BottomNav = ({ currentScreen, navigate }) => (
  <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl border border-white/50 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] rounded-full px-4 py-3.5 flex justify-between items-center z-[1000]">
    
    <button onClick={() => navigate('dashboard')} className={`flex flex-col items-center gap-1 w-12 transition-colors z-10 ${currentScreen === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
      <Home size={22} strokeWidth={currentScreen === 'dashboard' ? 2.5 : 2} className={currentScreen === 'dashboard' ? 'fill-blue-100 dark:fill-blue-900/50' : ''} />
      <span className="text-[10px] font-bold">Inicio</span>
    </button>
    
    <button onClick={() => navigate('map')} className={`flex flex-col items-center gap-1 w-12 transition-colors mr-6 z-10 ${currentScreen === 'map' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
      <Map size={22} strokeWidth={currentScreen === 'map' ? 2.5 : 2} className={currentScreen === 'map' ? 'fill-blue-100 dark:fill-blue-900/50' : ''} />
      <span className="text-[10px] font-bold">Mapa</span>
    </button>

    {/* Center Camera Button perfectly positioned to overlap the top edge */}
    <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-20">
      <button onClick={() => navigate('report')} className="w-[64px] h-[64px] bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-[0_8px_24px_rgba(59,130,246,0.6)] transform transition-all hover:scale-105 active:scale-95 border-[5px] border-white dark:border-[#1c1c1e]">
        <Camera size={26} strokeWidth={2.5} />
      </button>
    </div>

    <button onClick={() => navigate('history')} className={`flex flex-col items-center gap-1 w-12 transition-colors ml-6 z-10 ${currentScreen === 'history' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
      <FileText size={22} strokeWidth={currentScreen === 'history' ? 2.5 : 2} className={currentScreen === 'history' ? 'fill-blue-100 dark:fill-blue-900/50' : ''} />
      <span className="text-[10px] font-bold">Reportes</span>
    </button>

    <button onClick={() => navigate('profile')} className={`flex flex-col items-center gap-1 w-12 transition-colors z-10 ${currentScreen === 'profile' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
      <User size={22} strokeWidth={currentScreen === 'profile' ? 2.5 : 2} className={currentScreen === 'profile' ? 'fill-blue-100 dark:fill-blue-900/50' : ''} />
      <span className="text-[10px] font-bold">Perfil</span>
    </button>

  </div>
);

export default BottomNav;
