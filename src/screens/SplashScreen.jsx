import React from 'react';
import { Recycle, Trash2 } from 'lucide-react';
import { glassCard, primaryBtn } from '../utils/styles';

const SplashScreen = ({ navigate }) => (
  <div className="min-h-full flex flex-col md:flex-row items-center justify-center p-8 pt-20 md:p-16 relative overflow-hidden gap-10 md:gap-20">
    <div className="flex-1 flex flex-col items-center md:items-start justify-center w-full z-10">
      <div className="w-28 h-28 bg-white/50 backdrop-blur-xl border border-white shadow-xl rounded-[2.5rem] flex items-center justify-center mb-8 text-blue-600 transform transition hover:scale-105 duration-300">
        <Recycle size={56} strokeWidth={1.5} />
      </div>
      <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 mb-6 tracking-tight text-center md:text-left">Eco Point</h1>
      <p className="text-center md:text-left text-gray-500 mb-12 text-xl leading-relaxed font-medium max-w-sm">
        Recicla hoy,<br/>suma puntos,<br/>mejora el mañana <span className="text-blue-500 animate-pulse inline-block">💙</span>
      </p>

      <div className="flex justify-center md:justify-start gap-5 items-end w-full">
        {[
          { color: 'blue', name: 'PAPEL' },
          { color: 'yellow', name: 'PLÁSTICO' },
          { color: 'green', name: 'ORGÁNICO' }
        ].map((bin) => (
          <div key={bin.name} className="flex flex-col items-center group">
            <div className={`w-16 md:w-20 h-20 md:h-24 rounded-t-2xl shadow-lg flex items-center justify-center text-white/90 border-t border-white/50 backdrop-blur-md transition-transform group-hover:-translate-y-3 
              ${bin.color === 'blue' ? 'bg-blue-500/80' : bin.color === 'yellow' ? 'bg-yellow-400/80' : 'bg-emerald-500/80'}`}>
              <Trash2 size={24} strokeWidth={1.5} />
            </div>
            <span className={`text-[10px] md:text-xs font-bold mt-3 px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm border border-white shadow-sm
              ${bin.color === 'blue' ? 'text-blue-700' : bin.color === 'yellow' ? 'text-yellow-700' : 'text-emerald-700'}`}>
              {bin.name}
            </span>
          </div>
        ))}
      </div>
    </div>

    <div className="w-full md:w-[400px] z-10 flex flex-col justify-center">
      <div className={glassCard + " p-8 md:p-10 flex flex-col gap-6"}>
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Comienza tu impacto</h2>
        <button onClick={() => navigate('login')} className={primaryBtn}>
          INICIAR AHORA
        </button>
        <button onClick={() => navigate('dashboard')} className="w-full bg-white/50 backdrop-blur-md text-gray-700 font-bold py-4 rounded-full border border-white shadow-sm hover:bg-white/80 transition-all active:scale-95">
          EXPLORAR COMO INVITADO
        </button>
      </div>
    </div>
  </div>
);

export default SplashScreen;
