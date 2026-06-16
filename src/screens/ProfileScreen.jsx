import React from 'react';
import { Settings, Award, Leaf, Recycle } from 'lucide-react';
import { glassCard } from '../utils/styles';

const ProfileScreen = ({ navigate }) => (
  <div className="min-h-full flex flex-col pb-24 md:pb-10 w-full max-w-[1200px] mx-auto">
    <div className="flex items-center justify-between px-6 md:px-10 pt-8 md:pt-8 pb-6 sticky top-0 z-20 backdrop-blur-xl border-b border-white/20 dark:border-white/10 mb-6">
      <h2 className="font-extrabold text-3xl tracking-tight">Mi Perfil</h2>
      <button className="w-12 h-12 bg-white/50 dark:bg-white/10 rounded-full flex items-center justify-center shadow-sm border border-white dark:border-white/10 hover:bg-white dark:hover:bg-white/20 transition-colors">
        <Settings size={24} />
      </button>
    </div>

    <div className="px-6 md:px-10 flex flex-col md:flex-row gap-8 items-start w-full">
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        <div className={glassCard + " p-8 flex flex-col items-center relative overflow-hidden"}>
          <div className="absolute top-0 left-0 w-full h-32 md:h-40 bg-gradient-to-br from-blue-400/80 to-indigo-500/80"></div>
          
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-blue-100 mb-4 overflow-hidden border-4 border-white shadow-xl relative z-10 mt-6 md:mt-10">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400" alt="Avatar" className="w-full h-full object-cover"/>
          </div>
          <h3 className="text-3xl font-black text-gray-800 z-10 tracking-tight mt-2">Ana Torres</h3>
          <p className="text-gray-500 text-base mb-6 font-bold z-10 uppercase tracking-widest">Estudiante</p>
          
          <div className="bg-white/90 backdrop-blur-md text-blue-700 px-6 py-3 rounded-full text-base font-bold flex items-center gap-2 border border-white shadow-md z-10 hover:scale-105 transition-transform cursor-pointer">
            <Award size={20} className="text-blue-500"/> Nivel: Eco Guardián
          </div>

          <div className="mt-8 flex flex-col items-center w-full pt-8 border-t border-gray-200/50 z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-6xl font-black text-blue-600 tracking-tighter">245</span>
              <Leaf size={32} className="text-emerald-500" />
            </div>
            <span className="text-sm text-gray-400 font-bold tracking-widest uppercase">Puntos Totales</span>
          </div>
        </div>
      </div>

      <div className="w-full md:w-2/3 flex flex-col">
        <h4 className="font-extrabold text-gray-800 mb-6 px-2 text-xl md:text-2xl">Tu Impacto Ambiental</h4>
        
        <div className={glassCard + " p-2 md:p-4"}>
          <div className="flex items-center justify-between p-4 md:p-6 hover:bg-white/60 rounded-3xl transition-colors cursor-default">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-white"><Recycle size={28} strokeWidth={1.5}/></div>
              <span className="text-base md:text-lg font-bold text-gray-700">Residuos reciclados</span>
            </div>
            <span className="font-black text-gray-800 text-2xl md:text-3xl">12.5 <span className="text-sm md:text-base text-gray-400">kg</span></span>
          </div>
          
          <div className="w-full h-px bg-gray-200/50 my-1 mx-4"></div>
          
          <div className="flex items-center justify-between p-4 md:p-6 hover:bg-white/60 rounded-3xl transition-colors cursor-default">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm border border-white"><Leaf size={28} strokeWidth={1.5}/></div>
              <span className="text-base md:text-lg font-bold text-gray-700">CO₂ evitado al planeta</span>
            </div>
            <span className="font-black text-gray-800 text-2xl md:text-3xl">8.2 <span className="text-sm md:text-base text-gray-400">kg</span></span>
          </div>
          
          <div className="w-full h-px bg-gray-200/50 my-1 mx-4"></div>
          
          <div className="flex items-center justify-between p-4 md:p-6 hover:bg-white/60 rounded-3xl transition-colors cursor-default">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] bg-yellow-50 flex items-center justify-center text-yellow-500 shadow-sm border border-white">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-8"/><path d="M12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z"/><path d="M12 2c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6z"/></svg>
              </div>
              <span className="text-base md:text-lg font-bold text-gray-700">Árboles salvados</span>
            </div>
            <span className="font-black text-gray-800 text-2xl md:text-3xl">1.2</span>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-3xl p-6 md:p-8 text-white shadow-lg border border-white/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="z-10 text-center md:text-left">
            <h4 className="font-black text-2xl mb-1">¡Sigue así, Ana!</h4>
            <p className="text-emerald-50 font-medium">Estás a solo 55 puntos del nivel "Héroe Ambiental".</p>
          </div>
          <button onClick={() => navigate('report')} className="z-10 bg-white text-emerald-600 font-bold px-6 py-3 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all whitespace-nowrap">
            Reciclar Ahora
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default ProfileScreen;
