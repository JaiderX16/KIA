import React, { useState } from 'react';
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

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('splash');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash': return <SplashScreen navigate={setCurrentScreen} />;
      case 'login': return <LoginScreen navigate={setCurrentScreen} />;
      case 'dashboard': return <DashboardScreen navigate={setCurrentScreen} />;
      case 'report': return <ReportScreen navigate={setCurrentScreen} />;
      case 'analysis': return <AnalysisScreen navigate={setCurrentScreen} />;
      case 'confirmation': return <ConfirmationScreen navigate={setCurrentScreen} />;
      case 'history': return <HistoryScreen navigate={setCurrentScreen} />;
      case 'profile': return <ProfileScreen navigate={setCurrentScreen} />;
      default: return <SplashScreen navigate={setCurrentScreen} />;
    }
  };

  const showNav = ['dashboard', 'history', 'profile'].includes(currentScreen);

  return (
    <div className="min-h-screen w-full bg-[#e8f1fb] flex items-center justify-center font-sans relative overflow-hidden md:p-6 lg:p-10">
      
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-300/40 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-300/40 blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-emerald-200/40 blur-[80px] pointer-events-none hidden md:block"></div>

      <div className={`w-full h-[100dvh] md:h-auto md:min-h-[85vh] md:max-h-[95vh] bg-white/40 backdrop-blur-xl border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col md:flex-row z-10 transition-all duration-500
        ${!showNav && currentScreen !== 'splash' && currentScreen !== 'login' ? 'md:max-w-3xl' : 'md:max-w-6xl'}
        ${['splash', 'login'].includes(currentScreen) ? 'md:max-w-4xl' : ''}
        md:rounded-[2.5rem] md:border-[1px]
      `}>
        
        <div className="md:hidden flex h-6 w-full justify-between items-center px-6 pt-4 text-xs font-medium text-gray-700 z-50 bg-transparent absolute top-0 pointer-events-none">
          <span>9:41</span>
          <div className="flex gap-1.5 items-center">
            <div className="w-4 h-3 bg-gray-700 rounded-sm"></div>
            <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
          </div>
        </div>

        {showNav && <SideNav currentScreen={currentScreen} navigate={setCurrentScreen} />}

        <div className="flex-1 overflow-y-auto no-scrollbar relative w-full h-full flex flex-col pb-24 md:pb-0 scroll-smooth">
          {renderScreen()}
        </div>

        {showNav && <BottomNav currentScreen={currentScreen} navigate={setCurrentScreen} />}
      </div>
    </div>
  );
};

export default App;
