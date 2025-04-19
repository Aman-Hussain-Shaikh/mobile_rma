import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from "@reduxjs/toolkit";
import userReducer from './userRedux';

const persistConfig = {
    key: 'root',
    version: 1,
    storage: AsyncStorage // Using AsyncStorage instead of localStorage
};

const reducer = combineReducers({
    user: userReducer,
});

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Needed for Redux Persist
        })
});

export const persistor = persistStore(store);