import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import Logo from "../assets/images/logo.svg";
import SucessGirl from "../assets/images/Sucess-Girl.svg";
import { Checkbox, Button } from "react-native-paper";

const RegisterSuccess = () => {
    return (
        <View className="flex flex-1 items-center justify-center bg-white">
            <Logo width={150} height={150} className="border border-gray-300" />

            <SucessGirl width={250} height={250} className="border border-gray-300" />

            <Text className="text-[#1F486B] text-4xl  font-serif mt-4">
                Successful!
            </Text>

            <Text className="text-[#1F486B] text-lg mx-2 font-serif mt-4">
                Your password has been reset successfully
            </Text>

            <View className="w-11/12 mt-10">
                <Button
                    mode="contained"
                    // onPress={handleSignIn}
                    // loading={loading}
                    // disabled={loading}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                    style={styles.button}
                >
                    BACK TO LOGIN
                </Button>
            </View>

        </View>
    )
}

export default RegisterSuccess


const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    container: {
        width: "100%",
        alignItems: "center",
        marginTop: 32,
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
});