import { View, Text, StyleSheet, BackHandler } from 'react-native';
import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { Button } from "react-native-paper";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import your SVG components
import Logo from "../assets/images/logo.svg";
import SuccessGirl from "../assets/images/Sucess-Girl.svg";
import SuccessTick from "../assets/images/upload_tick.svg";  // You might need to create this asset

const ForgotPasswordSuccess = () => {
    // Clear saved reset flow data when component mounts
    useEffect(() => {
        const clearResetData = async () => {
            try {
                // Remove all items related to password reset
                // This matches web app's behavior of clearing localStorage
                await AsyncStorage.multiRemove(['resetEmail', 'tempEmail']);
            } catch (error) {
                console.error('Error clearing reset data:', error);
            }
        };
        
        clearResetData();
        
        // Handle hardware back button - direct to login
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            handleBackToLogin();
            return true;
        });
        
        return () => backHandler.remove();
    }, []);
    
    // Navigate to login screen
    const handleBackToLogin = () => {
        router.replace('/SignIn');
    };
    


    return (
        <View className="flex-1 items-center justify-center bg-white px-4">
            {/* Logo */}
            <Logo width={120} height={120} />
            
            {/* Success Illustration */}
            <SuccessGirl width={220} height={220} className="my-4" />
            
            {/* Success Icon (optional, similar to web version) */}
            <View className="mb-2">
                <SuccessTick width={60} height={60} />
            </View>
            
            {/* Success Message */}
            <Text className="text-[#1F486B] text-4xl font-bold text-center mt-2">
                Successful!
            </Text>
            
            <Text className="text-[#1F486B] text-base text-center my-4">
                Your password has been reset successfully
            </Text>
            
            {/* Action Button */}
            <View className="w-full max-w-md mt-6">
                <Button
                    mode="contained"
                    onPress={handleBackToLogin}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                    style={styles.button}
                >
                    BACK TO LOGIN
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        width: '100%',
        backgroundColor: '#1F486B',
        borderWidth: 1,
        borderColor: '#9DFE01',
        borderRadius: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    buttonContent: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    buttonLabel: {
        color: '#9DFE01',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default ForgotPasswordSuccess;