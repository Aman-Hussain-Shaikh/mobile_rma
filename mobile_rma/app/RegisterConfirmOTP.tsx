import { View, Text, StyleSheet, Alert } from 'react-native';
import React from 'react';
import Logo from "../assets/images/logo.svg";
import OTPGirl from "../assets/images/OTP-Girl.svg";
import BackButton from "../assets/images/BackButton.svg";
import { Button } from "react-native-paper";
import OTPInput from '../components/OTPInput'; // Import the OTP input component

const RegisterConfirmOTP = () => {
    // Handle OTP completion
    const handleOTPComplete = (otp: string) => {
        console.log('Completed OTP:', otp);
        // Add your verification logic here
    };

    // Handle resend code
    const handleResendCode = () => {
        // Add your resend logic here
        Alert.alert('Resend Code', 'A new code has been sent to your email.');
    };

    return (
        <View className="flex flex-1 items-center justify-center bg-white">
            <Logo width={150} height={150} className="border border-gray-300" />

            <OTPGirl width={250} height={250} className="border border-gray-300" />

            <Text className="text-[#1F486B] text-lg mx-2 font-serif mt-4">
                Enter The 4 Digit Code Sent To Your email-Id
            </Text>

            {/* Add the OTP Input component */}
            <OTPInput length={4} onComplete={handleOTPComplete} />

            <Text className="text-[#1F486B] text-xl mt-4">
                Don't receive code?{" "}
                <Text className="underline font-bold" onPress={handleResendCode}>
                    Re-send
                </Text>
            </Text>

            <View className="flex flex-1 flex-row justify-between px-5 items-center w-full">
                <BackButton width={80} height={80} className="border border-gray-300" />

                <Button
                    mode="contained"
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                    style={styles.button}
                >
                    SUBMIT
                </Button>
            </View>
        </View>
    );
};

export default RegisterConfirmOTP;

const styles = StyleSheet.create({
    container: {
        width: '100%', // Full width
        alignItems: 'center', // Center the button
        marginTop: 32, // mt-8 equivalent
    },
    button: {
        width: '45%', // Full width on small screens
        maxWidth: 400, // Auto width on larger screens (adjust as needed)
        backgroundColor: '#1F486B', // bg-[#1F486B]
        borderWidth: 1, // Border width
        borderColor: '#9DFE01', // Border color
        borderRadius: 8, // rounded-lg
        shadowColor: '#000', // Shadow color
        shadowOffset: { width: 0, height: 4 }, // Shadow offset
        shadowOpacity: 0.3, // Shadow opacity
        shadowRadius: 5, // Shadow radius
        elevation: 5, // Android shadow
    },
    buttonContent: {
        paddingVertical: 8, // py-2 equivalent
        paddingHorizontal: 16, // px-4 equivalent
    },
    buttonLabel: {
        color: '#9DFE01', // text-[#9DFE01]
        fontSize: 14, // text-sm equivalent
        fontWeight: 'bold',
    },
})

