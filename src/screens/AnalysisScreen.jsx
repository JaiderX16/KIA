import React, { useState, useEffect } from 'react';
import { ChevronLeft, Leaf, Droplet, Trash2, FileText, Loader2, Sparkles } from 'lucide-react';
import { glassCard, primaryBtn } from '../utils/styles';

const AnalysisScreen = ({ navigate }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    // Simulate AI analysis delay
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full overflow-y-auto no-scrollbar flex flex-col w-full pb-32 md:pb-12">
      <div className="flex items-center px-6 pt-8 md:pt-8 pb-4 bg-white/60 backdrop-blur-xl border-b border-white/50 sticky top-0 z-20">
        <button onClick={() => navigate('report')} className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center text-gray-700 shadow-sm border border-white hover:bg-white transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h2 className="flex-1 text-center font-extrabold text-lg md:text-xl text-gray-800">
          {isAnalyzing ? 'Analizando...' : 'Resultados del Análisis'}
        </h2>
        <div className="w-10 flex justify-end">
          {isAnalyzing ? (
            <Loader2 className="text-blue-500 animate-spin" size={20} />
          ) : (
            <Sparkles className="text-emerald-500 animate-pulse" size={20} />
          )}
        </div>
      </div>

      <div className="p-6 md:p-10 flex-1 flex flex-col md:flex-row gap-8 md:gap-12 max-w-[1200px] mx-auto w-full">
        <div className="flex-1 w-full flex flex-col">
          <p className="font-extrabold text-gray-800 mb-4 px-2 text-lg">Imagen analizada</p>
          <div className="relative rounded-[2rem] overflow-hidden flex-1 min-h-[250px] shadow-sm border border-white bg-gray-100 group">
            <img 
              src="https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&q=80&w=1200" 
              alt="Analyzed materials" 
              className={`w-full h-full object-cover transition-all duration-1000 ${isAnalyzing ? 'grayscale-[50%] scale-100 blur-[2px]' : 'grayscale-0 blur-0 group-hover:scale-105'}`}
            />
            
            {/* Animated Scanning Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 z-10 pointer-events-none bg-blue-500/20 animate-pulse mix-blend-color"></div>
            )}

            <div className={`absolute top-6 right-6 bg-white/90 backdrop-blur-md text-blue-700 text-sm md:text-base font-bold px-5 py-2.5 rounded-full shadow-lg border border-white flex items-center gap-2 transition-all duration-700 delay-100 ${isAnalyzing ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0 hover:scale-105'}`}>
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Botella PET x8
            </div>
            <div className={`absolute bottom-16 right-8 bg-white/90 backdrop-blur-md text-yellow-700 text-sm md:text-base font-bold px-5 py-2.5 rounded-full shadow-lg border border-white flex items-center gap-2 transition-all duration-700 delay-300 ${isAnalyzing ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0 hover:scale-105'}`}>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div> Aluminio x5
            </div>
            <div className={`absolute bottom-6 left-6 bg-white/90 backdrop-blur-md text-emerald-700 text-sm md:text-base font-bold px-5 py-2.5 rounded-full shadow-lg border border-white flex items-center gap-2 transition-all duration-700 delay-500 ${isAnalyzing ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0 hover:scale-105'}`}>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Cartón x3
            </div>
          </div>
        </div>

        <div className="w-full md:w-[420px] flex flex-col relative">
          
          {isAnalyzing ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] bg-white/40 backdrop-blur-sm rounded-[2rem] border border-white/50">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
              <h3 className="font-extrabold text-gray-800 text-xl mb-2">IA en proceso</h3>
              <p className="text-gray-500 font-medium animate-pulse text-center px-6">Identificando materiales reciclables en la imagen...</p>
            </div>
          ) : (
            <div className="flex flex-col transition-all duration-500 opacity-100 translate-y-0">
              <p className="font-extrabold text-gray-800 mb-4 px-2 text-lg">Materiales detectados</p>
              
              <div className={glassCard + " p-4 space-y-3 mb-8"}>
                <div className="flex items-center justify-between p-3 md:p-4 bg-white/60 hover:bg-white/80 transition-colors rounded-2xl border border-white shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[1rem] bg-blue-100 flex items-center justify-center text-blue-600"><Droplet size={20}/></div>
                    <div>
                      <span className="block text-sm md:text-base font-bold text-gray-800">Botellas PET</span>
                      <span className="text-xs text-gray-500 font-medium">8 unidades</span>
                    </div>
                  </div>
                  <span className="font-black text-blue-600 text-lg bg-blue-50 px-3 py-1 rounded-xl">+24</span>
                </div>

                <div className="flex items-center justify-between p-3 md:p-4 bg-white/60 hover:bg-white/80 transition-colors rounded-2xl border border-white shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[1rem] bg-yellow-100 flex items-center justify-center text-yellow-600"><Trash2 size={20}/></div>
                    <div>
                      <span className="block text-sm md:text-base font-bold text-gray-800">Latas Aluminio</span>
                      <span className="text-xs text-gray-500 font-medium">5 unidades</span>
                    </div>
                  </div>
                  <span className="font-black text-yellow-600 text-lg bg-yellow-50 px-3 py-1 rounded-xl">+15</span>
                </div>

                <div className="flex items-center justify-between p-3 md:p-4 bg-white/60 hover:bg-white/80 transition-colors rounded-2xl border border-white shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[1rem] bg-emerald-100 flex items-center justify-center text-emerald-600"><FileText size={20}/></div>
                    <div>
                      <span className="block text-sm md:text-base font-bold text-gray-800">Cartón</span>
                      <span className="text-xs text-gray-500 font-medium">3 unidades</span>
                    </div>
                  </div>
                  <span className="font-black text-emerald-600 text-lg bg-emerald-50 px-3 py-1 rounded-xl">+9</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-md rounded-[1.5rem] p-6 flex justify-between items-center mb-8 border border-white shadow-sm">
                <span className="font-bold text-gray-700 text-lg">Puntos estimados</span>
                <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-100">
                  <span className="text-2xl font-black text-blue-600">48</span>
                  <Leaf size={20} className="text-emerald-500" />
                </div>
              </div>

              <button onClick={() => navigate('confirmation')} className={primaryBtn + " py-5 mt-auto text-lg"}>
                CONFIRMAR RECICLAJE
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisScreen;
