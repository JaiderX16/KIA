import React from 'react';
import { Home, Map, Camera, FileText, User } from 'lucide-react';

const BottomNav = ({ currentScreen, navigate }) => (
  <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-white shadow-[0_-10px_40px_rgba(0,0,0,0.08)] px-6 py-4 flex justify-between items-center z-50 pb-safe">
    <button onClick={() => navigate('dashboard')} className={`flex flex-col items-center gap-1.5 transition-colors ${currentScreen === 'dashboard' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
      <Home size={24} strokeWidth={currentScreen === 'dashboard' ? 2.5 : 2} className={currentScreen === 'dashboard' ? 'fill-blue-100' : ''} />
      <span className="text-[10px] font-bold">Inicio</span>
    </button>
    <button className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors">
      <Map size={24} strokeWidth={2} />
      <span className="text-[10px] font-bold">Mapa</span>
    </button>
    <div className="relative -top-8">
      <button onClick={() => navigate('report')} className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-[0_8px_24px_rgba(59,130,246,0.5)] transform transition-all hover:scale-105 active:scale-95 border-4 border-white/80 backdrop-blur-md">
        <Camera size={28} strokeWidth={2} />
      </button>
    </div>
    <button onClick={() => navigate('history')} className={`flex flex-col items-center gap-1.5 transition-colors ${currentScreen === 'history' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
      <FileText size={24} strokeWidth={currentScreen === 'history' ? 2.5 : 2} className={currentScreen === 'history' ? 'fill-blue-100' : ''} />
      <span className="text-[10px] font-bold">Reportes</span>
    </button>
    <button onClick={() => navigate('profile')} className={`flex flex-col items-center gap-1.5 transition-colors ${currentScreen === 'profile' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
      <User size={24} strokeWidth={currentScreen === 'profile' ? 2.5 : 2} className={currentScreen === 'profile' ? 'fill-blue-100' : ''} />
      <span className="text-[10px] font-bold">Perfil</span>
    </button>
  </div>
);

export default BottomNav;
