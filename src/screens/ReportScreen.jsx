import React from 'react';
import { ChevronLeft, Camera, Image as ImageIcon, Leaf } from 'lucide-react';
import { glassCard, primaryBtn } from '../utils/styles';

const ReportScreen = ({ navigate }) => (
  <div className="min-h-full flex flex-col w-full h-full">
    <div className="flex items-center px-6 pt-8 md:pt-8 pb-4 bg-white/60 backdrop-blur-xl border-b border-white/50 sticky top-0 z-20">
      <button onClick={() => navigate('dashboard')} className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center text-gray-700 shadow-sm border border-white hover:bg-white transition-colors">
        <ChevronLeft size={20} />
      </button>
      <h2 className="flex-1 text-center font-extrabold text-lg md:text-xl text-gray-800">Nuevo reciclaje</h2>
      <div className="w-10"></div>
    </div>

    <div className="p-6 md:p-10 flex-1 flex flex-col md:flex-row gap-8 md:gap-12 w-full max-w-[1200px] mx-auto">
      <div className="flex-1 order-2 md:order-1 h-64 md:h-auto min-h-[300px] bg-white/40 rounded-[2.5rem] relative overflow-hidden group border border-white shadow-sm flex items-center justify-center p-3">
        <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
          <img 
            src="https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&q=80&w=800" 
            alt="Recycling items" 
            className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
            <button className="w-20 md:w-24 h-20 md:h-24 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.15)] transform transition-all active:scale-90 hover:scale-105 text-blue-600 border border-white">
              <Camera size={36} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      <div className="w-full md:w-96 flex flex-col order-1 md:order-2 justify-center">
        <div className="flex justify-between items-center mb-10 relative px-2">
          <div className="absolute top-1/2 left-10 right-10 h-[2px] bg-gray-200/80 -z-10 -translate-y-1/2"></div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/30 border-2 border-white">1</div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Foto</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white text-gray-400 border-2 border-gray-200 flex items-center justify-center font-bold text-sm shadow-sm">2</div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Detalles</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white text-gray-400 border-2 border-gray-200 flex items-center justify-center font-bold text-sm shadow-sm">3</div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Confirmar</span>
          </div>
        </div>

        <h3 className="font-extrabold text-3xl md:text-4xl text-gray-800 mb-3 tracking-tight">Toma una foto</h3>
        <p className="text-base md:text-lg text-gray-500 mb-8 font-medium leading-relaxed">Asegúrate de que se vean claramente los residuos que estás entregando.</p>

        <button onClick={() => navigate('analysis')} className={primaryBtn + " py-5 text-lg"}>
          <ImageIcon size={22} />
          ANALIZAR FOTO
        </button>

        <div className={glassCard + " p-4 mt-8 flex gap-3 items-start"}>
           <div className="bg-blue-100 text-blue-600 p-2 rounded-full shrink-0"><Leaf size={16}/></div>
           <p className="text-sm text-gray-600 leading-relaxed font-medium">
             <span className="font-bold text-gray-800">Consejo:</span> Entre más clara la foto y mejor separados estén los objetos, más precisión y puntos.
           </p>
        </div>
      </div>
    </div>
  </div>
);

export default ReportScreen;
