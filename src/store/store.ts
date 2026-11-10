import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface GameState {
  coins: number;
  difficulty: DifficultyLevel;
}

const initialState: GameState = {
  coins: 0,
  difficulty: 'easy',
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    addCoins: (state, action: PayloadAction<number>) => {
      state.coins += action.payload;
    },
    spendCoins: (state, action: PayloadAction<number>) => {
      state.coins = Math.max(0, state.coins - action.payload);
    },
    setDifficulty: (state, action: PayloadAction<DifficultyLevel>) => {
      state.difficulty = action.payload;
    },
  },
});

export const { addCoins, spendCoins, setDifficulty } = gameSlice.actions;

const rootReducer = combineReducers({
  game: gameSlice.reducer,
});

const persistConfig = {
  key: 'mabi-root',
  storage: AsyncStorage,
  whitelist: ['game'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
