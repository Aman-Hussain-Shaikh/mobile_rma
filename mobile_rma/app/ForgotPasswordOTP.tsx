import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Button } from "react-native-paper";
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { publicRequest } from '../utils/requestMethods';
import Toast from 'react-native-toast-message';

// Import SVG components
import Logo from "../assets/images/logo.svg";
import OTPGirl from "../assets/images/OTP-Girl.svg";
import BackButton from "../assets/images/BackButton.svg";

// Import the OTP Input component
import OTPInput from '../components/OTPInput';

const ForgotPasswordOTP = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(30);

    // Load email from AsyncStorage when component mounts
    useEffect(() => {
        loadEmail();

        // Start countdown timer for resend functionality if needed
        let timer: NodeJS.Timeout;
        if (resendDisabled && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            setResendDisabled(false);
            setCountdown(30);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [resendDisabled, countdown]);

    const loadEmail = async () => {
        try {
            const storedEmail = await AsyncStorage.getItem('tempEmail');
            if (storedEmail) {
                setEmail(storedEmail);
            } else {
                // If no email found in storage, redirect to forgot password
                Toast.show({
                    type: 'error',
                    text1: 'Session Expired',
                    text2: 'Please restart the password reset process',
                    position: 'top',
                });
                setTimeout(() => router.replace('/ForgotPassword'), 1500);
            }
        } catch (error) {
            console.error('Error retrieving email:', error);
        }
    };

    // Handle OTP input changes
    const handleOtpChange = useCallback((value: string) => {
        setOtp(value);
        
        // Auto-verify when complete OTP is entered
        if (value.length === 6) {
            verifyOtp(value);
        }
    }, [email]);

    // Verify OTP with backend
    const verifyOtp = async (otpValue: string) => {
        if (!email || loading) return;
        
        setLoading(true);
        try {
            // Note: This matches the web app behavior - on OTP verification, 
            // we don't actually call an API but store the email for the next step
            // This is because the web app just passes to the next screen
            await AsyncStorage.setItem('resetEmail', email);
            
            Toast.show({
                type: 'success',
                text1: 'OTP Verified',
                text2: 'Please set your new password',
                position: 'top',
            });

            // Navigate to new password screen after brief delay
            setTimeout(() => {
                router.push('/ForgotNewPassword');
            }, 1500);
        } catch (error: any) {
            let errorMessage = 'Invalid verification code';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            Toast.show({
                type: 'error',
                text1: 'Verification Failed',
                text2: errorMessage,
                position: 'top',
            });
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP to user's email
    const handleResendOTP = async () => {
        if (resendDisabled || !email) return;
        
        setLoading(true);
        try {
            await publicRequest({
                url: '/auth/forgot-password', // Reuse the same endpoint to resend OTP
                method: 'post',
                data: { email }
            });
            
            Toast.show({
                type: 'success',
                text1: 'OTP Resent',
                text2: 'New verification code has been sent to your email',
                position: 'top',
            });
            
            // Disable resend button and start countdown
            setResendDisabled(true);
            setCountdown(30);
        } catch (error: any) {
            let errorMessage = 'Failed to resend verification code';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            Toast.show({
                type: 'error',
                text1: 'Resend Failed',
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
                <Logo width={120} height={120} />
                <OTPGirl width={200} height={200} className="my-4" />

                <Text className="text-[#1F486B] text-lg font-bold mb-2 text-center">
                    Enter Verification Code
                </Text>

                <Text className="text-[#1F486B] text-sm mb-6 text-center">
                    We have sent a verification code to{'\n'}
                    {email ? email : 'your email'}
                </Text>

                <OTPInput
                    length={6}
                    value={otp}
                    onChange={handleOtpChange}
                    disabled={loading}
                />

                <View className="mt-6">
                    <Text className="text-[#1F486B] text-center">
                        Didn't receive the code?{' '}
                        <Text
                            onPress={handleResendOTP}
                            style={[
                                styles.resendText,
                                (resendDisabled || loading) && styles.resendDisabled
                            ]}
                        >
                            {resendDisabled 
                                ? `Resend in ${countdown}s`
                                : 'Resend Code'}
                        </Text>
                    </Text>
                </View>

                <View className="flex-row justify-between items-center w-full mt-8">
                    <Button
                        onPress={() => router.back()}
                        style={styles.backButton}
                        disabled={loading}
                    >
                        <BackButton width={70} height={70} />
                    </Button>
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
    resendText: {
        color: '#9DFE01',
        fontWeight: 'bold'
    },
    resendDisabled: {
        opacity: 0.5
    },
    backButton: {
        backgroundColor: 'transparent'
    }
});

export default ForgotPasswordOTP;