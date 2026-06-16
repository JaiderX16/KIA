import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { glassCard } from '../utils/styles';

const HistoryScreen = ({ navigate }) => (
  <div className="min-h-full flex flex-col pb-24 md:pb-10 w-full max-w-[1200px] mx-auto">
    <div className="flex items-center px-6 md:px-10 pt-8 md:pt-8 pb-6 sticky top-0 z-20 backdrop-blur-xl border-b border-white/20 dark:border-white/10 mb-6">
      <h2 className="flex-1 font-extrabold text-3xl tracking-tight">Tu Actividad</h2>
      
      <div className="hidden md:flex bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-full p-1.5 shadow-sm border border-white dark:border-white/10">
        <button className="px-8 bg-white dark:bg-white/20 font-bold py-2 rounded-full text-sm shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all">Historial</button>
        <button className="px-8 text-gray-500 dark:text-gray-400 font-bold py-2 rounded-full text-sm hover:text-gray-700 dark:hover:text-gray-200 transition-all">Estadísticas</button>
      </div>
    </div>

    <div className="md:hidden px-6 py-2 mb-4">
      <div className="flex bg-white/50 dark:bg-white/10 backdrop-blur-md rounded-full p-1.5 shadow-sm border border-white dark:border-white/10">
        <button className="flex-1 bg-white dark:bg-white/20 font-bold py-2.5 rounded-full text-sm shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all">Historial</button>
        <button className="flex-1 text-gray-500 dark:text-gray-400 font-bold py-2.5 rounded-full text-sm hover:text-gray-700 dark:hover:text-gray-200 transition-all">Estadísticas</button>
      </div>
    </div>

    <div className="flex-1 px-6 md:px-10 space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 items-start content-start">
      {[
        { date: 'Hoy, 10:30 a.m.', desc: 'Botellas PET x8, Latas x5, Cartón x3', pts: '+48', img: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&q=80&w=300', color: 'blue' },
        { date: 'Ayer, 04:15 p.m.', desc: 'Botellas PET x5, Cartón x2', pts: '+30', img: 'https://images.unsplash.com/photo-1605600659873-d808a1d85f7a?auto=format&fit=crop&q=80&w=300', color: 'emerald' },
        { date: '12 mayo, 11:20 a.m.', desc: 'Papel x10, Cartón x1', pts: '+22', img: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=300', color: 'yellow' },
        { date: '10 mayo, 09:45 a.m.', desc: 'Botellas PET x6', pts: '+18', img: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=300', color: 'blue' },
        { date: '05 mayo, 14:00 p.m.', desc: 'Cartón x8, Papel x15', pts: '+42', img: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&q=80&w=300', color: 'emerald' },
        { date: '01 mayo, 08:15 a.m.', desc: 'Latas Aluminio x12', pts: '+36', img: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=300', color: 'yellow' },
      ].map((item, idx) => (
        <div key={idx} className={glassCard + " p-6 flex flex-col gap-4 group cursor-pointer hover:bg-white/80 dark:hover:bg-white/10 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1"}>
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] bg-gray-100 dark:bg-white/5 overflow-hidden shrink-0 border border-white dark:border-white/10 shadow-inner flex items-center justify-center text-gray-300">
              {item.img ? 
                <img src={item.img} alt="Reciclaje" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/> 
                : <ImageIcon size={24} />
              }
            </div>
            <div className="text-right shrink-0">
              <span className={`font-black text-${item.color}-600 dark:text-${item.color}-400 text-lg md:text-xl bg-${item.color}-50 dark:bg-${item.color}-500/10 px-3 py-1.5 rounded-xl border border-white dark:border-white/10 shadow-sm`}>{item.pts}</span>
            </div>
          </div>
          <div className="flex-1 mt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-bold uppercase tracking-wider">{item.date}</p>
            <p className="text-base md:text-lg font-bold leading-snug">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default HistoryScreen;
