import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { glassCard } from '../utils/styles';

const HistoryScreen = ({ navigate }) => (
  <div className="min-h-full flex flex-col pb-24 md:pb-10 w-full max-w-[1200px] mx-auto">
    <div className="flex items-center px-6 md:px-10 pt-16 md:pt-12 pb-6 sticky top-0 z-20 bg-white/30 backdrop-blur-xl border-b border-white/20 mb-6">
      <h2 className="flex-1 font-extrabold text-3xl text-gray-800 tracking-tight">Tu Actividad</h2>
      
      <div className="hidden md:flex bg-white/60 backdrop-blur-md rounded-full p-1.5 shadow-sm border border-white">
        <button className="px-8 bg-white text-gray-800 font-bold py-2 rounded-full text-sm shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all">Historial</button>
        <button className="px-8 text-gray-500 font-bold py-2 rounded-full text-sm hover:text-gray-700 transition-all">Estadísticas</button>
      </div>
    </div>

    <div className="md:hidden px-6 py-2 mb-4">
      <div className="flex bg-white/50 backdrop-blur-md rounded-full p-1.5 shadow-sm border border-white">
        <button className="flex-1 bg-white text-gray-800 font-bold py-2.5 rounded-full text-sm shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all">Historial</button>
        <button className="flex-1 text-gray-500 font-bold py-2.5 rounded-full text-sm hover:text-gray-700 transition-all">Estadísticas</button>
      </div>
    </div>

    <div className="flex-1 px-6 md:px-10 space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 items-start content-start">
      {[
        { date: 'Hoy, 10:30 a.m.', desc: 'Botellas PET x8, Latas x5, Cartón x3', pts: '+48', img: true, color: 'blue' },
        { date: 'Ayer, 04:15 p.m.', desc: 'Botellas PET x5, Cartón x2', pts: '+30', img: false, color: 'emerald' },
        { date: '12 mayo, 11:20 a.m.', desc: 'Papel x10, Cartón x1', pts: '+22', img: false, color: 'yellow' },
        { date: '10 mayo, 09:45 a.m.', desc: 'Botellas PET x6', pts: '+18', img: false, color: 'blue' },
        { date: '05 mayo, 14:00 p.m.', desc: 'Cartón x8, Papel x15', pts: '+42', img: false, color: 'emerald' },
        { date: '01 mayo, 08:15 a.m.', desc: 'Latas Aluminio x12', pts: '+36', img: false, color: 'yellow' },
      ].map((item, idx) => (
        <div key={idx} className={glassCard + " p-5 flex gap-5 items-center group cursor-pointer hover:bg-white/80 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1"}>
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.25rem] md:rounded-[1.5rem] bg-gray-100 overflow-hidden shrink-0 border border-white shadow-inner flex items-center justify-center text-gray-300">
            {item.img ? 
              <img src="https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&q=80&w=300" alt="Reciclaje" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/> 
              : <ImageIcon size={28} />
            }
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-1 font-bold uppercase tracking-wider">{item.date}</p>
            <p className="text-sm md:text-base font-bold text-gray-800 leading-snug">{item.desc}</p>
          </div>
          <div className="text-right shrink-0">
            <span className={`font-black text-${item.color}-600 text-lg md:text-xl bg-${item.color}-50 px-3 py-1.5 rounded-xl border border-white shadow-sm`}>{item.pts}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default HistoryScreen;
