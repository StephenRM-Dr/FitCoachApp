import { create } from 'zustand';

interface Macro {
  name: string;
  value: number;
  color: string;
  grams?: number;
}

interface Habit {
  id: string;
  name: string;
  completed: boolean;
}

interface AdherenceDay {
  dia: string;
  sesion: boolean;
  agua: boolean;
  sueno: boolean;
}

interface NutritionState {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityFactor: number;
  macros: Macro[];
  dailyHabits: Habit[];
  weeklyAdherence: AdherenceDay[];
  
  // Computed values
  getIMC: () => string;
  getTMB: () => number;
  getTDEE: () => number;
  
  // Actions
  updateWeight: (weight: number) => void;
  toggleHabit: (id: string) => void;
  updateAdherence: (day: string, type: 'sesion' | 'agua' | 'sueno') => void;
}

export const useNutritionStore = create<NutritionState>((set, get) => ({
  weight: 78.8,
  height: 175,
  age: 32,
  gender: 'male',
  activityFactor: 1.55,
  macros: [
    { name: "Proteínas", value: 30, color: "#3b82f6" },
    { name: "Carbohidratos", value: 45, color: "#10b981" },
    { name: "Grasas", value: 25, color: "#f59e0b" },
  ],
  dailyHabits: [
    { id: '1', name: "Desayuno completo con proteína", completed: true },
    { id: '2', name: "2L de agua antes de las 14:00", completed: true },
    { id: '3', name: "Snack pre-entrenamiento", completed: true },
    { id: '4', name: "Sesión de entrenamiento", completed: false },
    { id: '5', name: "Comida post-entrenamiento", completed: false },
  ],
  weeklyAdherence: [
    { dia: "Lun", sesion: true, agua: true, sueno: true },
    { dia: "Mar", sesion: true, agua: true, sueno: false },
    { dia: "Mié", sesion: true, agua: false, sueno: true },
    { dia: "Jue", sesion: false, agua: true, sueno: true },
    { dia: "Vie", sesion: true, agua: true, sueno: true },
    { dia: "Sáb", sesion: true, agua: true, sueno: true },
    { dia: "Dom", sesion: false, agua: true, sueno: false },
  ],

  getIMC: () => {
    const { weight, height } = get();
    return (weight / ((height / 100) ** 2)).toFixed(1);
  },

  getTMB: () => {
    const { weight, height, age, gender } = get();
    if (gender === 'male') {
      return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    }
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  },

  getTDEE: () => {
    return Math.round(get().getTMB() * get().activityFactor);
  },

  updateWeight: (weight) => set({ weight }),
  
  toggleHabit: (id) => set((state) => ({
    dailyHabits: state.dailyHabits.map((h) => 
      h.id === id ? { ...h, completed: !h.completed } : h
    )
  })),

  updateAdherence: (day, type) => set((state) => ({
    weeklyAdherence: state.weeklyAdherence.map((d) => 
      d.dia === day ? { ...d, [type]: !d[type] } : d
    )
  })),
}));
