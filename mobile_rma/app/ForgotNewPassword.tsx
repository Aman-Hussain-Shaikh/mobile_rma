import { Text, View, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { useState, useEffect } from "react";
import { Button } from "react-native-paper";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { publicRequest } from '../utils/requestMethods';
import Toast from 'react-native-toast-message';
import { MaterialIcons } from '@expo/vector-icons';  // Import MaterialIcons for eye icon

// Import SVG components
import Logo from "../assets/images/logo.svg";
import ForgotPasswordGirl from "../assets/images/Forgot-New-Password-Image.svg";
import BackButton from "../assets/images/BackButton.svg";

const ForgotNewPassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({
        newPassword: "",
        confirmPassword: ""
    });

    // Toggle password visibility functions
    const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    useEffect(() => {
        // Retrieve email from AsyncStorage
        const getEmail = async () => {
            try {
                // Using resetEmail (matching the web app's approach)
                const storedEmail = await AsyncStorage.getItem('resetEmail');
                if (storedEmail) {
                    setEmail(storedEmail);
                } else {
                    // If no email is found, redirect back to forgot password
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

        getEmail();
    }, []);

    // Validate form
    const validateForm = () => {
        const newErrors = {
            newPassword: "",
            confirmPassword: ""
        };
        let isValid = true;

        // Password validation - minimum 6 characters to match web app
        if (!newPassword) {
            newErrors.newPassword = "New password is required";
            isValid = false;
        } else if (newPassword.length < 6) {
            newErrors.newPassword = "Password must be at least 6 characters";
            isValid = false;
        }

        // Confirm password validation
        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
            isValid = false;
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Handle reset password submission
    const handleResetPassword = async () => {
        if (!validateForm()) {
            Toast.show({
                type: 'error',
                text1: 'Validation Error',
                text2: 'Please fix the errors before continuing',
                position: 'top',
            });
            return;
        }

        setLoading(true);

        try {
            // Call the set new password API endpoint - matching web app's approach
            const response = await publicRequest({
                url: '/auth/set-new-password',
                method: 'post',
                data: {
                    email,
                    newPassword,
                    confirmPassword
                }
            });

            if (response?.data) {
                Toast.show({
                    type: 'success',
                    text1: 'Password Reset Successful',
                    text2: 'Your password has been updated successfully',
                    position: 'top',
                });

                // Navigate to success screen after delay
                setTimeout(() => {
                    router.push('/ForgotPasswordSuccess');
                }, 1500);
            }
        } catch (error: any) {
            let errorMessage = 'Failed to reset password. Please try again.';
            
            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.response?.data?.error) {
                errorMessage = error.response.data.error;
            }

            Toast.show({
                type: 'error',
                text1: 'Reset Failed',
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
                <ForgotPasswordGirl width={200} height={200} className="my-4" />

                {/* Password Fields */}
                <View className="w-full max-w-md">
                    {/* New Password */}
                    <View className="mb-4 relative">
                        <Text className="text-[#1F486B] text-sm font-bold mb-2">
                            Enter Your New Password
                        </Text>
                        <View className="relative">
                            <TextInput
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showNewPassword}
                                placeholder="New Password"
                                style={[styles.input, {paddingRight: 50}]}
                            />
                            <Pressable 
                                onPress={toggleNewPasswordVisibility}
                                style={styles.eyeIconContainer}
                            >
                                <MaterialIcons 
                                    name={showNewPassword ? "visibility-off" : "visibility"}
                                    size={24}
                                    color="#1F486B"
                                />
                            </Pressable>
                        </View>
                        {errors.newPassword ? (
                            <Text className="text-red-500 text-xs mt-1">{errors.newPassword}</Text>
                        ) : null}
                    </View>

                    {/* Confirm Password */}
                    <View className="mb-6 relative">
                        <Text className="text-[#1F486B] text-sm font-bold mb-2">
                            Confirm Your New Password
                        </Text>
                        <View className="relative">
                            <TextInput
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                placeholder="Confirm New Password"
                                style={[styles.input, {paddingRight: 50}]}
                            />
                            <Pressable 
                                onPress={toggleConfirmPasswordVisibility}
                                style={styles.eyeIconContainer}
                            >
                                <MaterialIcons 
                                    name={showConfirmPassword ? "visibility-off" : "visibility"}
                                    size={24}
                                    color="#1F486B"
                                />
                            </Pressable>
                        </View>
                        {errors.confirmPassword ? (
                            <Text className="text-red-500 text-xs mt-1">{errors.confirmPassword}</Text>
                        ) : null}
                    </View>
                </View>

                <View className="flex-row items-center w-full max-w-md my-4">
                    <View className="flex-grow h-px bg-[#1F486B]" />
                    <Text className="mx-4 text-[#1F486B]">Or</Text>
                    <View className="flex-grow h-px bg-[#1F486B]" />
                </View>

                {/* Action Buttons */}
                <View className="flex-row justify-between items-center w-full max-w-md mt-2">
                    <Button
                        onPress={() => router.back()}
                        style={styles.backButton}
                        disabled={loading}
                    >
                        <BackButton width={50} height={50} />
                    </Button>

                    <Button
                        mode="contained"
                        onPress={handleResetPassword}
                        loading={loading}
                        disabled={loading}
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.buttonLabel}
                        style={styles.submitButton}
                    >
                        {loading ? 'PROCESSING...' : 'CONTINUE'}
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
    input: {
        borderWidth: 1,
        borderColor: '#1F486B',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#1F486B',
        backgroundColor: 'white'
    },
    eyeIconContainer: {
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: [{translateY: -12}],
        zIndex: 10
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

export default ForgotNewPassword;