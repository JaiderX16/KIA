import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { primaryBtn } from '../utils/styles';

const ConfirmationScreen = ({ navigate }) => (
  <div className="min-h-full flex flex-col items-center justify-center p-6 pt-24 md:pt-10 relative overflow-hidden w-full h-full">
    <div className="absolute inset-0 pointer-events-none opacity-60">
      <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-red-400 animate-bounce"></div>
      <div className="absolute top-1/3 right-1/4 w-5 h-5 rounded-full bg-blue-400 animate-pulse"></div>
      <div className="absolute bottom-1/3 left-1/3 w-3 h-3 rounded-full bg-yellow-400 animate-bounce" style={{animationDelay: '0.2s'}}></div>
      <div className="absolute top-1/2 right-1/3 w-4 h-4 rounded-full bg-emerald-400 animate-pulse" style={{animationDelay: '0.5s'}}></div>
    </div>

    <div className="bg-emerald-100 text-emerald-500 p-5 rounded-full mb-8 shadow-sm border border-emerald-200 z-10 transform hover:scale-110 transition-transform">
      <CheckCircle2 size={48} strokeWidth={2.5} />
    </div>

    <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-10 z-10 text-center tracking-tight leading-tight">
      ¡Misión cumplida!<br/>
      <span className="text-2xl md:text-3xl text-gray-500 font-bold">Reciclaje registrado</span>
    </h2>

    <div className="w-64 h-64 md:w-72 md:h-72 rounded-full bg-white/60 backdrop-blur-xl border-[8px] border-white/80 shadow-[0_10px_40px_-10px_rgba(59,130,246,0.3)] flex flex-col items-center justify-center mb-12 relative z-10 transform hover:scale-105 transition-all duration-500">
      <span className="text-7xl md:text-8xl font-black text-blue-600 mb-2 tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-blue-500 to-indigo-600">+48</span>
      <span className="text-gray-400 font-extrabold tracking-widest text-base md:text-lg uppercase mt-2">Puntos ganados</span>
    </div>

    <div className="w-full max-w-md z-10 flex flex-col gap-4">
      <button onClick={() => navigate('dashboard')} className={primaryBtn + " py-5 text-lg"}>
        VER MIS PUNTOS Y LOGROS
      </button>
      <button onClick={() => navigate('report')} className="w-full bg-white/50 backdrop-blur-md text-gray-700 font-bold py-5 rounded-full border border-white shadow-sm hover:bg-white/80 transition-all active:scale-95 text-lg">
        SEGUIR RECICLANDO
      </button>
    </div>
  </div>
);

export default ConfirmationScreen;
