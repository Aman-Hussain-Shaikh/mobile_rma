import { Text, View, TextInput, StyleSheet, ImageBackground, Pressable } from "react-native";
import Logo from "../assets/images/logo.svg";
import backgroundImage from "../assets/images/RegisterBackgroundImage.svg";
import React, { useState } from "react";
import { Button } from "react-native-paper";
import { Link, router } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { publicRequest } from '../utils/requestMethods';
import Toast from 'react-native-toast-message';

// Define interfaces for type safety
interface ApiError {
    status?: number;
    data?: {
        message?: string;
        type?: string;
    };
    message?: string;
    type?: string;
}

interface FormData {
    fullName: string;
    email: string;
    telephone: string;
    password: string;
    confirmPassword: string;
}

export default function Register(): React.JSX.Element {
    // Form state management
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        email: '',
        telephone: '',
        password: '',
        confirmPassword: ''
    });

    // UI state management
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Toast message handler
    const showToast = (type: 'success' | 'error', title: string, message: string) => {
        Toast.show({
            type,
            text1: title,
            text2: message,
            position: 'top',
            visibilityTime: 4000,
            autoHide: true,
            topOffset: 50,
            text1Style: styles.toastTitle,
            text2Style: styles.toastMessage,
        });
    };

    // Validation function
    const validateForm = () => {
        if (!formData.fullName.trim()) {
            showToast('error', 'Validation Error', 'Full name is required');
            return false;
        }

        if (!formData.email.trim()) {
            showToast('error', 'Validation Error', 'Email is required');
            return false;
        }

        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email.trim())) {
            showToast('error', 'Validation Error', 'Invalid email address');
            return false;
        }

        if (!formData.telephone.trim()) {
            showToast('error', 'Validation Error', 'Phone number is required');
            return false;
        }

        // Basic phone validation (adjust regex based on your requirements)
        if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.telephone.trim())) {
            showToast('error', 'Validation Error', 'Invalid phone number format');
            return false;
        }

        if (!formData.password) {
            showToast('error', 'Validation Error', 'Password is required');
            return false;
        }

        if (formData.password.length < 6) {
            showToast('error', 'Validation Error', 'Password must be at least 6 characters long');
            return false;
        }

        if (!formData.confirmPassword) {
            showToast('error', 'Validation Error', 'Please confirm your password');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            showToast('error', 'Validation Error', 'Passwords do not match');
            return false;
        }

        return true;
    };

    // Split full name into first and last name
    const splitFullName = (fullName: string) => {
        const nameParts = fullName.trim().split(/\s+/);
        return {
            firstname: nameParts[0] || '',
            lastname: nameParts.slice(1).join(' ') || ''
        };
    };

    // Handle registration
    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            const { firstname, lastname } = splitFullName(formData.fullName);

            const requestData = {
                email: formData.email.trim().toLowerCase(),
                telephone: formData.telephone.trim(),
                firstname: firstname,
                lastname: lastname,
                userType: "Customer",
                password: formData.password
            };

            console.log('Sending registration data:', requestData); // Debug log

            const response = await publicRequest({
                url: '/auth/register',
                method: 'POST',
                data: requestData
            });

            console.log('Registration response:', response); // Debug log

            showToast(
                'success',
                'Success',
                'Registration successful! Please check your email for verification.'
            );

            // Clear form data
            setFormData({
                fullName: '',
                email: '',
                telephone: '',
                password: '',
                confirmPassword: ''
            });

            // Navigate to login after success
            setTimeout(() => {
                router.replace('/SignIn');
            }, 2000);

        } catch (error: any) {
            console.error('Registration error:', error);
            console.error('Error response:', error.response); // Debug log

            // Handle different error cases
            if (error.response) {
                const { status, data } = error.response;

                switch (status) {
                    case 403:
                        if (data?.type === 'email') {
                            showToast('error', 'Registration Failed', 'This email is already registered. Please use a different email or login.');
                        } else if (data?.type === 'telephone') {
                            showToast('error', 'Registration Failed', 'This phone number is already registered. Please use a different number.');
                        } else {
                            showToast('error', 'Registration Failed', data?.message || 'Registration failed. Please try again.');
                        }
                        break;

                    case 400:
                        showToast('error', 'Invalid Input', data?.message || 'Please check your details and try again.');
                        break;

                    case 500:
                        showToast('error', 'Server Error', 'Server error. Please try again later.');
                        break;

                    default:
                        showToast('error', 'Error', data?.message || 'An unexpected error occurred. Please try again.');
                }
            } else if (error.request) {
                // Network error
                showToast('error', 'Network Error', 'Unable to connect to server. Please check your internet connection.');
            } else {
                // Other error
                showToast('error', 'Error', 'An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground
            source={backgroundImage}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <View className="flex flex-1 items-center justify-center bg-white">
                <Logo width={150} height={150} className="border border-gray-300" />
                <Text className="text-[#1F486B] text-3xl font-bold font-serif mt-4">
                    New User Registration
                </Text>

                <View className="w-11/12 mt-6">
                    {/* Full Name Input */}
                    <View className="mb-5 relative">
                        <View className="absolute -top-0.5 left-4 bg-white px-2 z-10">
                            <Text className="text-[#1F486B] text-sm font-bold">Enter Your Full Name</Text>
                        </View>
                        <TextInput
                            placeholder="Enter your full name"
                            className="border border-[#1F486B] rounded-md p-4 mt-2"
                            value={formData.fullName}
                            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Email Input */}
                    <View className="mb-5 relative">
                        <View className="absolute -top-0.5 left-4 bg-white px-2 z-10">
                            <Text className="text-[#1F486B] text-sm font-bold">Email Id</Text>
                        </View>
                        <TextInput
                            placeholder="Enter your email"
                            className="border border-[#1F486B] rounded-md p-4 mt-2"
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {/* Phone Input */}
                    <View className="mb-5 relative">
                        <View className="absolute -top-0.5 left-4 bg-white px-2 z-10">
                            <Text className="text-[#1F486B] text-sm font-bold">Contact Number</Text>
                        </View>
                        <TextInput
                            placeholder="Enter your contact number"
                            className="border border-[#1F486B] rounded-md p-4 mt-2"
                            value={formData.telephone}
                            onChangeText={(text) => setFormData({ ...formData, telephone: text })}
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* Password Input */}
                    <View className="mb-5 relative">
                        <View className="absolute -top-0.5 left-4 bg-white px-2 z-10">
                            <Text className="text-[#1F486B] text-sm font-bold">Enter Your New Password</Text>
                        </View>
                        <View className="relative">
                            <TextInput
                                placeholder="Enter your password"
                                secureTextEntry={!showPassword}
                                className="border border-[#1F486B] rounded-md p-4 mt-2 pr-12"
                                value={formData.password}
                                onChangeText={(text) => setFormData({ ...formData, password: text })}
                                autoCapitalize="none"
                            />
                            <Pressable
                                onPress={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2"
                                style={{ top: '50%', marginTop: 8 }}
                            >
                                <MaterialIcons
                                    name={showPassword ? "visibility-off" : "visibility"}
                                    size={24}
                                    color="#1F486B"
                                />
                            </Pressable>
                        </View>
                    </View>

                    {/* Confirm Password Input */}
                    <View className="mb-5 relative">
                        <View className="absolute -top-0.5 left-4 bg-white px-2 z-10">
                            <Text className="text-[#1F486B] text-sm font-bold">Confirm Your New Password</Text>
                        </View>
                        <View className="relative">
                            <TextInput
                                placeholder="Confirm your password"
                                secureTextEntry={!showConfirmPassword}
                                className="border border-[#1F486B] rounded-md p-4 mt-2 pr-12"
                                value={formData.confirmPassword}
                                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                                autoCapitalize="none"
                            />
                            <Pressable
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2"
                                style={{ top: '50%', marginTop: 8 }}
                            >
                                <MaterialIcons
                                    name={showConfirmPassword ? "visibility-off" : "visibility"}
                                    size={24}
                                    color="#1F486B"
                                />
                            </Pressable>
                        </View>
                    </View>
                </View>

                <View className="w-11/12 mt-2">
                    <Button
                        mode="contained"
                        onPress={handleRegister}
                        loading={loading}
                        disabled={loading}
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.buttonLabel}
                        style={styles.button}
                    >
                        {loading ? 'PROCESSING...' : 'CONTINUE'}
                    </Button>
                </View>

                <Text className="text-[#1F486B] text-xl mt-4">
                    Already have an account?{" "}
                    <Link href="/SignIn">
                        <Text className="underline font-bold">SIGN IN</Text>
                    </Link>
                </Text>

                <Toast />
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    button: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: "#1F486B",
        borderWidth: 1,
        borderColor: "#9DFE01",
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonContent: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    buttonLabel: {
        color: "#9DFE01",
        fontSize: 14,
        fontWeight: "bold",
    },
    toastTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
    },
    toastMessage: {
        fontSize: 14,
        color: 'grey',
        lineHeight: 22,
    }
});