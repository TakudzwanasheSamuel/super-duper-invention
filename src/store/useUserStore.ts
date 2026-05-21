import { create } from 'zustand';

type State = {
  userName: string;
  primaryCurrency: 'USD' | 'ZiG';
  isFirstLaunch: boolean;
  themeMode: 'Hachi' | 'Standard';
  isUnlocked: boolean;
};

type Actions = {
  setUserName: (userName: string) => void;
  setPrimaryCurrency: (primaryCurrency: 'USD' | 'ZiG') => void;
  setIsFirstLaunch: (isFirstLaunch: boolean) => void;
  setThemeMode: (themeMode: 'Hachi' | 'Standard') => void;
  setUnlocked: (isUnlocked: boolean) => void;
};

export const useUserStore = create<State & Actions>((set) => ({
  userName: 'Guest',
  primaryCurrency: 'USD',
  isFirstLaunch: true,
  themeMode: 'Hachi',
  isUnlocked: false,
  setUserName: (userName) => set({ userName }),
  setPrimaryCurrency: (primaryCurrency) => set({ primaryCurrency }),
  setIsFirstLaunch: (isFirstLaunch) => set({ isFirstLaunch }),
  setThemeMode: (themeMode) => set({ themeMode }),
  setUnlocked: (isUnlocked) => set({ isUnlocked }),
}));
