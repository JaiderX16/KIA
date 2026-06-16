import React from 'react';
import { Menu, Bell, Leaf, Award, Recycle, CheckCircle2, Trash2, Sun, Moon } from 'lucide-react';
import { glassCard } from '../utils/styles';

const DashboardScreen = ({ navigate, darkMode, setDarkMode }) => (
  <div className="min-h-full flex flex-col pb-6 md:pb-10 w-full">
    <div className="bg-gradient-to-br from-blue-600/90 to-indigo-600/90 backdrop-blur-2xl text-white p-6 pt-8 md:pt-8 pb-20 md:pb-16 md:rounded-[2.5rem] md:m-6 md:mb-0 relative shadow-[0_10px_30px_-10px_rgba(59,130,246,0.5)] border-b md:border border-white/20">
      <div className="flex justify-between items-center mb-8">
        <button className="md:hidden p-2 bg-white/10 rounded-full backdrop-blur-md border border-white/10 hover:bg-white/20 transition">
          <Menu size={20} />
        </button>
        <div className="hidden md:block"></div>
        <div className="flex items-center gap-3">
          {setDarkMode && (
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 bg-white/10 rounded-full backdrop-blur-md border border-white/10 hover:bg-white/20 transition relative"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
          <button className="p-2 bg-white/10 rounded-full backdrop-blur-md border border-white/10 hover:bg-white/20 transition relative">
            <Bell size={20} />
            <div className="absolute top-1.5 right-2 w-2 h-2 bg-red-400 rounded-full border border-indigo-600"></div>
          </button>
        </div>
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-1 md:mb-2">¡Hola, Ana!</h1>
      <p className="text-blue-100/80 text-sm md:text-base font-medium">Aquí está tu resumen de impacto.</p>
    </div>

    <div className="px-6 md:px-10 -mt-12 md:-mt-8 relative z-10 flex flex-col gap-5 max-w-[1200px] mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className={glassCard + " p-6 flex justify-between items-center md:col-span-2 shadow-lg"}>
          <div>
            <p className="text-gray-500 text-xs md:text-sm font-bold uppercase tracking-wider mb-2">Tus puntos actuales</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl md:text-5xl font-black text-blue-600 tracking-tight">245</span>
              <div className="bg-emerald-100 text-emerald-500 p-2 rounded-full shadow-sm"><Leaf size={24} /></div>
            </div>
          </div>
          <div className="h-16 w-[1px] bg-gray-200/50 hidden md:block"></div>
          <div className="text-right">
            <p className="text-gray-500 text-xs md:text-sm font-bold uppercase tracking-wider mb-2">Tu Nivel</p>
            <div className="flex items-center gap-2 justify-end">
              <span className="font-bold text-gray-800 text-lg md:text-xl">Guardián</span>
              <div className="bg-blue-100 text-blue-500 p-2 rounded-full shadow-sm"><Award size={20} /></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:col-span-1">
          <div className={glassCard + " p-5 flex items-center gap-4"}>
            <div className="bg-blue-50 text-blue-500 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white"><Recycle size={22} /></div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase mb-0.5">Reciclados</p>
              <p className="text-2xl font-black text-gray-800 tracking-tight leading-none">12.5 <span className="text-sm text-gray-400 font-medium">kg</span></p>
            </div>
          </div>
          <div className={glassCard + " p-5 flex items-center gap-4"}>
            <div className="bg-emerald-50 text-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white"><CheckCircle2 size={22} /></div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase mb-0.5">Acciones</p>
              <p className="text-2xl font-black text-gray-800 tracking-tight leading-none">18</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-end mb-5 px-2">
          <h3 className="font-extrabold text-gray-800 text-lg md:text-xl">Tus contenedores</h3>
          <span className="text-sm text-blue-600 font-bold cursor-pointer hover:text-blue-700 transition-colors">Ver todos</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { color: 'blue', name: 'Papel', fill: '85%', val: 85 },
            { color: 'yellow', name: 'Plástico', fill: '60%', val: 60 },
            { color: 'emerald', name: 'Orgánico', fill: '30%', val: 30 }
          ].map((bin) => (
            <div key={bin.name} className={glassCard + " p-5 flex md:flex-col items-center md:items-start gap-4 md:gap-5 group"}>
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-[1.25rem] md:rounded-[1.5rem] flex items-center justify-center shrink-0 border group-hover:scale-105 transition-transform shadow-sm
                ${bin.color === 'blue' ? 'bg-blue-100/80 text-blue-600 border-blue-200' : 
                  bin.color === 'yellow' ? 'bg-yellow-100/80 text-yellow-600 border-yellow-200' : 'bg-emerald-100/80 text-emerald-600 border-emerald-200'}`}>
                <Trash2 size={24} strokeWidth={1.5} />
              </div>
              <div className="flex-1 w-full">
                <div className="flex justify-between text-sm md:text-base font-bold mb-2">
                  <span className="text-gray-700">{bin.name}</span>
                  <span className={`text-${bin.color}-600`}>{bin.fill}</span>
                </div>
                <div className="w-full bg-gray-200/60 rounded-full h-2.5 overflow-hidden shadow-inner">
                  <div className={`h-full rounded-full transition-all duration-1000 ease-out bg-${bin.color}-500`} style={{ width: bin.fill }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default DashboardScreen;
