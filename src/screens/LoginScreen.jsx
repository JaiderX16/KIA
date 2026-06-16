import React from 'react';
import { Leaf, Recycle, Mail, Lock, Eye, GraduationCap, Briefcase, UserCircle } from 'lucide-react';
import { primaryBtn } from '../utils/styles';

const LoginScreen = ({ navigate }) => (
  <div className="min-h-full w-full flex flex-col md:flex-row relative">
    <div className="hidden md:flex w-full md:w-[40%] max-w-[550px] bg-gradient-to-br from-blue-600/90 to-indigo-600/90 p-12 flex-col justify-between text-white relative overflow-hidden">
       <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] rounded-full bg-white/10 blur-[80px]"></div>
       <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8 bg-white/20 w-fit px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
            <Leaf size={20} />
            <h1 className="text-lg font-bold">Eco Point</h1>
          </div>
          <h2 className="text-5xl font-black mb-6 leading-tight">Únete a la<br/>comunidad verde.</h2>
          <p className="text-blue-100 text-lg max-w-md">Tu participación hace la diferencia. Inicia sesión para registrar tus reciclajes, acumular puntos y reclamar recompensas en tu campus.</p>
       </div>
       <div className="relative z-10 flex gap-4 opacity-70">
         <Recycle size={80} strokeWidth={1} />
       </div>
    </div>

    <div className="flex-1 p-8 flex flex-col justify-center items-center z-10 relative">
      <div className="w-full max-w-[420px] flex flex-col">
        <div className="md:hidden flex items-center gap-2 mb-10 text-blue-600 bg-white/40 self-start px-4 py-2 rounded-full backdrop-blur-md border border-white">
          <Leaf size={20} />
          <h1 className="text-lg font-bold">Eco Point</h1>
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white mb-2">Bienvenido</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-10 text-base font-medium">Inicia sesión para continuar</p>

        <div className="space-y-4 mb-8">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input type="email" placeholder="Correo institucional" className="w-full pl-12 pr-4 py-4 md:py-5 bg-white/50 dark:bg-[#1c1c1e]/50 backdrop-blur-sm border border-white/80 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/80 dark:focus:bg-[#1c1c1e]/80 transition-all shadow-sm text-gray-700 dark:text-white" defaultValue="kiara.unknown@universidad.edu"/>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input type="password" placeholder="Contraseña" className="w-full pl-12 pr-12 py-4 md:py-5 bg-white/50 dark:bg-[#1c1c1e]/50 backdrop-blur-sm border border-white/80 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/80 dark:focus:bg-[#1c1c1e]/80 transition-all shadow-sm text-gray-700 dark:text-white" defaultValue="password123"/>
            <Eye className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors" size={20} />
          </div>
          <div className="text-right">
            <a href="#" className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300">¿Olvidaste tu contraseña?</a>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 px-1">Selecciona tu rol</p>
          <div className="flex justify-between gap-3">
            {['Estudiante', 'Docente', 'Personal'].map((role, idx) => (
              <button key={role} className={`flex-1 flex flex-col items-center p-4 rounded-2xl backdrop-blur-md transition-all duration-300 shadow-sm
                  ${idx === 0 ? 'bg-blue-500 text-white border border-blue-400 shadow-[0_4px_12px_rgba(59,130,246,0.3)]' : 'bg-white/50 dark:bg-[#1c1c1e]/50 text-gray-500 dark:text-gray-400 border border-white dark:border-white/10 hover:bg-white/70 dark:hover:bg-[#1c1c1e]/80'}`}>
                {idx === 0 && <GraduationCap size={24} className="mb-2" strokeWidth={1.5} />}
                {idx === 1 && <Briefcase size={24} className="mb-2" strokeWidth={1.5} />}
                {idx === 2 && <UserCircle size={24} className="mb-2" strokeWidth={1.5} />}
                <span className="text-[10px] md:text-xs font-semibold">{role}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 mb-4">
          <button onClick={() => navigate('dashboard')} className={primaryBtn}>
            INICIAR SESIÓN
          </button>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 font-medium">
            ¿No tienes cuenta? <a href="#" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Regístrate</a>
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default LoginScreen;
