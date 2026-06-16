import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import SideNav from './components/SideNav';
import BottomNav from './components/BottomNav';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import ReportScreen from './screens/ReportScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import ConfirmationScreen from './screens/ConfirmationScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import MapScreen from './screens/MapScreen';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [darkMode, setDarkMode] = useState(false);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash': return <SplashScreen navigate={setCurrentScreen} />;
      case 'login': return <LoginScreen navigate={setCurrentScreen} />;
      case 'dashboard': return <DashboardScreen navigate={setCurrentScreen} darkMode={darkMode} setDarkMode={setDarkMode} />;
      case 'report': return <ReportScreen navigate={setCurrentScreen} />;
      case 'analysis': return <AnalysisScreen navigate={setCurrentScreen} />;
      case 'confirmation': return <ConfirmationScreen navigate={setCurrentScreen} />;
      case 'history': return <HistoryScreen navigate={setCurrentScreen} />;
      case 'profile': return <ProfileScreen navigate={setCurrentScreen} />;
      case 'map': return <MapScreen navigate={setCurrentScreen} />;
      default: return <SplashScreen navigate={setCurrentScreen} />;
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ... (inside the component return)
  const showNav = ['dashboard', 'history', 'profile', 'map'].includes(currentScreen);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="h-screen w-full bg-[#e8f1fb] dark:bg-[#050505] transition-colors duration-500 flex font-sans relative overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Decorative backgrounds (only for non-map screens) */}
        {currentScreen !== 'map' && (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-300/40 dark:bg-blue-900/20 blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-300/40 dark:bg-indigo-900/20 blur-[100px] pointer-events-none"></div>
          </>
        )}

        {showNav ? (
          <div className="w-full h-full relative flex overflow-hidden">
            
            {/* The Floating SideNav */}
            <div className="hidden md:block">
              <SideNav currentScreen={currentScreen} navigate={setCurrentScreen} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            </div>

            {/* Menu Toggle Button (when sidebar is closed) */}
            <div className="hidden md:block absolute top-6 left-6 z-[900]">
               <button
                 onClick={() => setIsSidebarOpen(true)}
                 className={`w-12 h-12 rounded-full bg-white/40 dark:bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-white/60 transition-all duration-300 ${isSidebarOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
               </button>
            </div>

            {/* Main Content Area */}
            <div 
              className={`flex-1 w-full h-full overflow-y-auto no-scrollbar relative transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isSidebarOpen && currentScreen !== 'map' ? 'md:pl-[clamp(332px,calc(25vw+32px),392px)]' : 'md:pl-0'
              }`}
            >
              {renderScreen()}
            </div>

            {/* BottomNav for Mobile */}
            <div className="md:hidden z-[1000] pointer-events-auto">
              <BottomNav currentScreen={currentScreen} navigate={setCurrentScreen} />
            </div>
          </div>
        ) : (
          renderScreen()
        )}
      </div>
    </div>
  );
};

export default App;
