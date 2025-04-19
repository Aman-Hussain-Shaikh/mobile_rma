import { Text, View, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { Button } from "react-native-paper";
import { router } from "expo-router";
import { publicRequest } from '../utils/requestMethods';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import SVG components
import Logo from "../assets/images/logo.svg";
import GirlPic from "../assets/images/ForgotPassword-Girl.svg";
import BackButton from "../assets/images/BackButton.svg";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Email validation function
    const isValidEmail = (email: string) => {
        return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
    };

    // Handle forgot password submission
    const handleForgotPassword = async () => {
        // Reset previous error state
        setError("");

        // Validate email format
        if (!email.trim()) {
            setError("Email is required");
            Toast.show({
                type: 'error',
                text1: 'Email Required',
                text2: 'Please enter your email address',
                position: 'top',
            });
            return;
        }

        if (!isValidEmail(email.trim())) {
            setError("Invalid email format");
            Toast.show({
                type: 'error',
                text1: 'Invalid Email',
                text2: 'Please enter a valid email address',
                position: 'top',
            });
            return;
        }

        setLoading(true);

        try {
            // Call the forgot password API endpoint
            const response = await publicRequest({
                url: '/auth/forgot-password',
                method: 'post',
                data: { email: email.trim() }
            });

            if (response?.data) {
                // Store email for OTP verification - matching web app's localStorage approach
                await AsyncStorage.setItem('tempEmail', email.trim());
                
                Toast.show({
                    type: 'success',
                    text1: 'Email Sent',
                    text2: 'Password reset instructions have been sent to your email',
                    position: 'top',
                });

                // Navigate to OTP screen after delay
                setTimeout(() => {
                    router.push('/ForgotPasswordOTP');
                }, 2000);
            }
        } catch (error: any) {
            let errorMessage = 'An unexpected error occurred';
            
            if (error.response?.status === 404) {
                errorMessage = "Email not found";
            } else if (error.response?.status === 429) {
                errorMessage = "Too many attempts. Please try again later";
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }

            setError(errorMessage);
            Toast.show({
                type: 'error',
                text1: 'Request Failed',
                text2: errorMessage,
                position: 'top',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View className="flex-1 items-center justify-center bg-white px-4">
                {/* Logo */}
                <Logo width={120} height={120} />

                {/* Illustration */}
                <GirlPic width={200} height={200} className="my-4" />

                {/* Main Content */}
                <View className="w-full max-w-md">
                    <Text className="text-[#1F486B] text-xl font-bold mb-2 text-center">
                        Forgot Password?
                    </Text>
                    
                    <Text className="text-[#1F486B] text-base mb-6 text-center">
                        Enter your registered email to receive password reset instructions
                    </Text>

                    {/* Email Input */}
                    <View className="mb-4">
                        <View className="relative">
                            <Text className="text-[#1F486B] text-sm font-bold mb-2">
                                Email Address
                            </Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={styles.input}
                            />
                        </View>
                        {error ? (
                            <Text className="text-red-500 text-xs mt-1">{error}</Text>
                        ) : null}
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row justify-between items-center mt-6">
                        <Button
                            onPress={() => router.back()}
                            style={styles.backButton}
                            disabled={loading}
                        >
                            <BackButton width={70} height={70} />
                        </Button>

                        <Button
                            mode="contained"
                            onPress={handleForgotPassword}
                            loading={loading}
                            disabled={loading}
                            contentStyle={styles.buttonContent}
                            labelStyle={styles.buttonLabel}
                            style={styles.submitButton}
                        >
                            {loading ? 'SENDING...' : 'CONTINUE'}
                        </Button>
                    </View>
                </View>

                <Toast />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    input: {
        borderWidth: 1,
        borderColor: '#1F486B',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#1F486B',
        backgroundColor: 'white'
    },
    backButton: {
        backgroundColor: 'transparent'
    },
    submitButton: {
        width: '60%',
        backgroundColor: '#1F486B',
        borderWidth: 1,
        borderColor: '#9DFE01',
        borderRadius: 8,
        elevation: 4
    },
    buttonContent: {
        paddingVertical: 8,
        paddingHorizontal: 16
    },
    buttonLabel: {
        color: '#9DFE01',
        fontSize: 14,
        fontWeight: 'bold'
    }
});

export default ForgotPassword;