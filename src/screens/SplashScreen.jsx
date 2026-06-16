import React from 'react';
import { Recycle, Trash2 } from 'lucide-react';
import { glassCard, primaryBtn } from '../utils/styles';

const SplashScreen = ({ navigate }) => (
  <div className="h-full w-full flex flex-col items-center justify-center p-8 pt-20 md:p-16 relative overflow-hidden">
    <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-24 w-full max-w-5xl z-10">
      <div className="flex-1 flex flex-col items-center md:items-start justify-center w-full">
        <div className="w-28 h-28 bg-white/50 dark:bg-white/10 backdrop-blur-xl border border-white dark:border-white/10 shadow-xl rounded-[2.5rem] flex items-center justify-center mb-8 text-blue-600 dark:text-blue-400 transform transition hover:scale-105 duration-300">
          <Recycle size={56} strokeWidth={1.5} />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 dark:text-white mb-6 tracking-tight text-center md:text-left">Eco Point</h1>
        <p className="text-center md:text-left text-gray-500 dark:text-gray-400 mb-12 text-xl leading-relaxed font-medium max-w-sm">
          Recicla hoy,<br/>suma puntos,<br/>mejora el mañana <span className="text-blue-500 animate-pulse inline-block">💙</span>
        </p>

        <div className="flex justify-center md:justify-start gap-5 items-end w-full">
          {[
            { color: 'blue', name: 'PAPEL' },
            { color: 'yellow', name: 'PLÁSTICO' },
            { color: 'green', name: 'ORGÁNICO' }
          ].map((bin) => (
            <div key={bin.name} className="flex flex-col items-center group">
              <div className={`w-16 md:w-20 h-20 md:h-24 rounded-t-2xl shadow-lg flex items-center justify-center text-white/90 border-t border-white/50 dark:border-white/20 backdrop-blur-md transition-transform group-hover:-translate-y-3 
                ${bin.color === 'blue' ? 'bg-blue-500/80' : bin.color === 'yellow' ? 'bg-yellow-400/80' : 'bg-emerald-500/80'}`}>
                <Trash2 size={24} strokeWidth={1.5} />
              </div>
              <span className={`text-[10px] md:text-xs font-bold mt-3 px-3 py-1 rounded-full bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-sm border border-white dark:border-white/10 shadow-sm
                ${bin.color === 'blue' ? 'text-blue-700 dark:text-blue-400' : bin.color === 'yellow' ? 'text-yellow-700 dark:text-yellow-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                {bin.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full md:w-[400px] flex flex-col justify-center">
        <div className={glassCard + " p-8 md:p-10 flex flex-col gap-6"}>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-2">Comienza tu impacto</h2>
          <button onClick={() => navigate('login')} className={primaryBtn}>
            INICIAR AHORA
          </button>
          <button onClick={() => navigate('dashboard')} className="w-full bg-white/50 dark:bg-white/10 backdrop-blur-md text-gray-700 dark:text-gray-300 font-bold py-4 rounded-full border border-white dark:border-white/10 shadow-sm hover:bg-white/80 dark:hover:bg-white/20 transition-all active:scale-95">
            EXPLORAR COMO INVITADO
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default SplashScreen;
