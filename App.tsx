import React, { useState, useRef } from 'react';
import { NutritionInfo, Meal } from './types';
import { analyzeImageForNutrition } from './services/geminiService';
import {
  BackArrowIcon, MoreIcon, ProteinIcon, CarbsIcon, FatsIcon, FireIcon,
  HealthScoreIcon, PencilIcon, SparkleIcon, AppleIcon, BellIcon,
  HomeIcon, AnalyticsIcon, SettingsIcon, PlusIcon
} from './components/icons';

// --- MOCK DATA ---
const mockMeals: Meal[] = [
  {
    id: '1',
    mealName: 'Caesar Salad',
    mealType: 'Lunch',
    calories: 133,
    protein: 12,
    carbs: 10,
    fats: 5,
    healthScore: 8,
    advice: 'A light and healthy choice with lean protein.',
    timestamp: '9:00am',
    imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '2',
    mealName: 'Sweet Corn Panner',
    mealType: 'Dinner',
    calories: 455,
    protein: 25,
    carbs: 55,
    fats: 15,
    healthScore: 6,
    advice: 'A balanced meal with good amount of carbs and protein.',
    timestamp: '9:00am',
    imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop',
  }
];

const DAILY_GOAL = 2000;

// --- SUB-COMPONENTS ---

const AnalysisScreen = ({ nutritionInfo, imageUrl, onDone, onBack }: { nutritionInfo: NutritionInfo, imageUrl: string, onDone: () => void, onBack: () => void }) => {
  const [servings, setServings] = useState(1);
  
  interface NutrientCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    unit: string;
  }
  
  const NutrientCard: React.FC<NutrientCardProps> = ({ icon, label, value, unit }) => (
    <div className="bg-gray-100/50 rounded-2xl p-3 flex items-center space-x-3">
      <div className="bg-white rounded-lg p-2 shadow-sm">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-gray-600 text-sm">{label}</p>
        <p className="text-gray-900 font-bold text-lg">{value}{unit}</p>
      </div>
      <PencilIcon />
    </div>
  );

  return (
    <div className="w-full max-w-sm md:max-w-lg mx-auto bg-black font-sans min-h-screen">
      <div className="relative">
        <img src={imageUrl} alt="Meal" className="w-full h-80 object-cover" />
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent flex justify-between items-center text-white">
          <button onClick={onBack} className="p-2 bg-black/30 rounded-full"><BackArrowIcon /></button>
          <h1 className="font-semibold text-lg">Nutrition</h1>
          <button className="p-2 bg-black/30 rounded-full"><MoreIcon /></button>
        </div>
      </div>
      
      <div className="bg-white rounded-t-3xl -mt-8 p-6 relative min-h-[calc(100vh-18rem)] flex flex-col">
          <>
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">{nutritionInfo.mealType}</span>
                <h2 className="text-2xl font-bold text-gray-900 mt-2 max-w-xs">{nutritionInfo.mealName}</h2>
              </div>
              <div className="flex items-center space-x-2 border border-gray-200 rounded-full px-3 py-1.5">
                <button onClick={() => setServings(s => Math.max(1, s - 1))} className="text-gray-500 text-xl">-</button>
                <span className="font-bold text-gray-900 text-lg w-6 text-center">{servings}</span>
                <button onClick={() => setServings(s => s + 1)} className="text-gray-500 text-xl">+</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 my-6">
              <NutrientCard icon={<FireIcon className="h-6 w-6 text-orange-500" />} label="Calories" value={nutritionInfo.calories * servings} unit="" />
              <NutrientCard icon={<CarbsIcon className="h-6 w-6 text-yellow-600" />} label="Carbs" value={nutritionInfo.carbs * servings} unit="g" />
              <NutrientCard icon={<ProteinIcon className="h-6 w-6 text-red-500" />} label="Protein" value={nutritionInfo.protein * servings} unit="g" />
              <NutrientCard icon={<FatsIcon className="h-6 w-6 text-blue-500" />} label="Fats" value={nutritionInfo.fats * servings} unit="g" />
            </div>

            <div className="bg-gray-100/50 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                         <div className="bg-white rounded-lg p-2 shadow-sm">
                            <HealthScoreIcon />
                        </div>
                        <p className="text-gray-600">Health score</p>
                    </div>
                    <p className="font-bold text-gray-900">{nutritionInfo.healthScore}/10</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-400 h-1.5 rounded-full" style={{ width: `${nutritionInfo.healthScore * 10}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 pt-1">{nutritionInfo.advice}</p>
            </div>

            <div className="mt-auto pt-6 grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center space-x-2 border border-gray-300 rounded-full py-3 text-gray-900 font-semibold">
                <SparkleIcon />
                <span>Fix Results</span>
              </button>
              <button onClick={onDone} className="bg-gray-900 text-white rounded-full py-3 font-semibold">
                Done
              </button>
            </div>
          </>
      </div>
    </div>
  );
};


const HomeScreen = ({ meals, onUpload, caloriesLeft }: { meals: Meal[], onUpload: () => void, caloriesLeft: number }) => {
    const calorieProgress = Math.max(0, (caloriesLeft / DAILY_GOAL) * 100);

    const MacroCard = ({ value, label, status, color, icon, progress }: { value: string, label: string, status: string, color: string, icon: React.ReactNode, progress: number}) => {
        const r = 24;
        const circ = 2 * Math.PI * r;
        const strokePct = ((100 - progress) * circ) / 100;
        return (
            <div className="bg-white rounded-2xl p-4 flex-shrink-0 w-32 text-center">
                <div className="relative w-16 h-16 mx-auto">
                    <svg viewBox="0 0 52 52" className="w-full h-full transform -rotate-90">
                        <circle cx="26" cy="26" r={r} fill="transparent" stroke="#f0f0f0" strokeWidth="4" />
                        <circle cx="26" cy="26" r={r} fill="transparent" stroke={color} strokeWidth="4" strokeDasharray={circ} strokeDashoffset={strokePct} strokeLinecap="round"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        {icon}
                    </div>
                </div>
                <p className="font-bold text-lg mt-2">{value}</p>
                <p className={`text-sm ${status.includes('over') ? 'text-red-500' : 'text-gray-500'}`}>{label}</p>
            </div>
        )
    };
    
    return (
        <div className="p-4 pb-28">
            <header className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-2">
                    <AppleIcon />
                    <h1 className="text-2xl font-bold">Cal AI</h1>
                </div>
                <div className="relative">
                    <BellIcon />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-green-400 ring-2 ring-white"></span>
                </div>
            </header>
            
            <div className="flex space-x-6 text-gray-500 mb-6">
                <p className="font-bold text-black relative">Today<span className="absolute -bottom-1 left-1/2 -translate-x-1/2 block h-1 w-1 rounded-full bg-black"></span></p>
                <p>Yesterday</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm flex items-center justify-between mb-6">
                <div>
                    <p className="text-5xl font-bold">{caloriesLeft}</p>
                    <p className="text-gray-500">Calories left</p>
                </div>
                <div className="relative w-24 h-24">
                     <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                        <defs>
                            <mask id="progressMask">
                                <rect x="0" y="0" width="120" height="120" fill="white" />
                                <path d="M 60,60 L 60,0 A 60,60 0 0,1 102,18 Z" fill="black" transform="rotate(-45 60 60)"/>
                            </mask>
                        </defs>
                        <circle cx="60" cy="60" r="50" fill="transparent" stroke="#f0f0f0" strokeWidth="20" pathLength="100" strokeDasharray="75 25" strokeDashoffset="25" strokeLinecap="round" />
                        <circle cx="60" cy="60" r="50" fill="transparent" stroke="black" strokeWidth="20" pathLength="100" strokeDasharray={`${calorieProgress * 0.75} ${100 - calorieProgress * 0.75}`} strokeDashoffset="25" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full m-5 shadow">
                       <FireIcon className="h-6 w-6 text-black"/>
                    </div>
                </div>
            </div>

            <div className="flex space-x-4 mb-6 overflow-x-auto md:justify-center">
                <MacroCard value="45g" label="Protein over" status="over" color="#ef4444" progress={110} icon={<ProteinIcon className="h-6 w-6 text-red-500" />}/>
                <MacroCard value="89g" label="Carbs left" status="left" color="#f97316" progress={60} icon={<CarbsIcon className="h-6 w-6 text-orange-500" />}/>
                <MacroCard value="48g" label="Fats left" status="left" color="#3b82f6" progress={75} icon={<FatsIcon className="h-6 w-6 text-blue-500" />}/>
            </div>

            <h2 className="text-xl font-bold mb-4">Recently uploaded</h2>
            <div className="space-y-4">
                {meals.map(meal => (
                    <div key={meal.id} className="bg-white p-3 rounded-2xl shadow-sm flex items-center space-x-4">
                        <img src={meal.imageUrl} alt={meal.mealName} className="w-20 h-20 object-cover rounded-lg" />
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-gray-800">{meal.mealName}</h3>
                                <p className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{meal.timestamp}</p>
                            </div>
                            <p className="text-sm text-gray-500 flex items-center space-x-1 my-1">
                                <FireIcon className="h-4 w-4 text-orange-500"/>
                                <span>{meal.calories} kcal</span>
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="flex items-center"><ProteinIcon className="h-3 w-3 mr-1 text-red-400"/> {meal.protein}g</span>
                                <span className="flex items-center"><CarbsIcon className="h-3 w-3 mr-1 text-orange-400"/> {meal.carbs}g</span>
                                <span className="flex items-center"><FatsIcon className="h-3 w-3 mr-1 text-blue-400"/> {meal.fats}g</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <footer className="fixed bottom-0 left-0 right-0 max-w-sm md:max-w-lg mx-auto bg-white/80 backdrop-blur-sm border-t border-gray-100 p-4 flex justify-around items-center rounded-t-3xl">
                <div className="text-center">
                    <HomeIcon active />
                    <span className="text-xs font-bold">Home</span>
                </div>
                 <div className="text-center text-gray-400">
                    <AnalyticsIcon />
                    <span className="text-xs">Analytics</span>
                </div>
                 <div className="text-center text-gray-400">
                    <SettingsIcon />
                    <span className="text-xs">Settings</span>
                </div>
                <button onClick={onUpload} className="absolute -top-7 right-6 bg-black rounded-full p-4 shadow-lg shadow-gray-400">
                    <PlusIcon />
                </button>
            </footer>
        </div>
    );
};

const LoadingScreen = () => (
    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-t-3xl z-10 min-h-screen">
      <div className="text-center">
        <svg className="animate-spin h-10 w-10 text-gray-700 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-2 text-gray-600">Analyzing your meal...</p>
      </div>
    </div>
);


const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'analyzing' | 'results'>('home');
  const [meals, setMeals] = useState<Meal[]>(mockMeals);
  const [analyzedData, setAnalyzedData] = useState<{ nutritionInfo: NutritionInfo, imageUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      handleAnalyze(file);
    }
  };

  const handleAnalyze = async (file: File) => {
    setView('analyzing');
    setError(null);

    try {
      const result = await analyzeImageForNutrition(file);
      setAnalyzedData({ nutritionInfo: result, imageUrl: URL.createObjectURL(file) });
      setView('results');
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setView('home'); // Go back home on error
    }
  };
  
  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleDone = () => {
    if (!analyzedData) return;

    const newMeal: Meal = {
        id: new Date().toISOString(),
        ...analyzedData.nutritionInfo,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }).replace(' AM', 'am').replace(' PM', 'pm'),
        imageUrl: analyzedData.imageUrl
    };

    setMeals(prev => [newMeal, ...prev]);
    setView('home');
    setAnalyzedData(null);
  };

  const caloriesConsumed = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const caloriesLeft = DAILY_GOAL - caloriesConsumed;

  if (view === 'results' && analyzedData) {
    return (
        <AnalysisScreen 
            nutritionInfo={analyzedData.nutritionInfo}
            imageUrl={analyzedData.imageUrl}
            onDone={handleDone}
            onBack={() => setView('home')}
        />
    );
  }

  return (
    <div className="w-full max-w-sm md:max-w-lg mx-auto bg-gray-50 font-sans min-h-screen relative">
        <HomeScreen meals={meals} onUpload={triggerFileSelect} caloriesLeft={caloriesLeft} />
        {view === 'analyzing' && <LoadingScreen />}
        {error && <p className="text-red-500 p-4">{error}</p>}
        
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />
    </div>
  );
};

export default App;
