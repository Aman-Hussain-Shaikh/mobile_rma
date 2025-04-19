import { Slot } from "expo-router";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../redux/store';
import { QueryClient, QueryClientProvider } from 'react-query';
import Toast from 'react-native-toast-message';

const queryClient = new QueryClient();

export default function RootLayout() {
    return (
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <QueryClientProvider client={queryClient}>
                <Toast />
                    <Slot />
                </QueryClientProvider>
            </PersistGate>
        </Provider>
    );
}
