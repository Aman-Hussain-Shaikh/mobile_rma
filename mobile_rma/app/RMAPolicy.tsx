import Sidebar from '@/components/Sidebar';
import { Text, View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import Avatar from "../assets/images/HomeScreen/Avatar.svg";
import Hamburger from "../assets/images/HomeScreen/HameBurger_3Line.svg";
import LeftArrow from '../assets/images/BackButtonLeftArrow.svg';
import Rectangle from '../assets/images/Warranty/Rectangle.svg';
import Line from '../assets/images/Warranty/Line.svg';
import Flash from '../assets/images/Warranty/Flash.svg';
import InsideBorder from '../assets/images/Warranty/InsideBorder.svg';
import React, { useState } from "react";
import BottomSheet from "@/components/BottomSheet";

import { Button } from "react-native-paper";
import { useSelector } from 'react-redux';
import { Link } from 'expo-router';


interface RootState {
    user: {
        firstname: string;

    };
}

const RMAPolicy = () => {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Handler for search button click

    const firstname = useSelector((state: RootState) => state?.user?.firstname)

    const getGreeting = () => {
        const currentHour = new Date().getHours(); // Get current hour in 24-hour format

        if (currentHour >= 5 && currentHour < 12) {
            return "Good Morning";
        } else if (currentHour >= 12 && currentHour < 17) {
            return "Good Afternoon";
        } else if (currentHour >= 17 && currentHour < 21) {
            return "Good Evening";
        } else {
            return "Good Night";
        }
    };

    const MainContent = React.memo(() => (
        <View className="bg-[#1F486B] flex flex-1 flex-col relative">
            {/* Header section */}
            <View className="h-11">
                <View className="flex flex-1 flex-row justify-between">
                    <View className="flex flex-row ml-3 mt-4">
                        <Link href="/Profile">
                            <View className="flex mt-2 pt-2">
                                <Avatar width={37} height={37} className="border border-gray-300" />
                            </View>
                        </Link>
                        <View className="flex ml-3">
                            <Text className="text-[#9DFE01] text-lg font-roboto">{getGreeting()}</Text>
                            <Text className="text-[#9DFE01] text-2xl font-roboto -mt-2">{firstname}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => setIsSidebarOpen(true)}
                        className="mr-5 mt-6 p-2"
                        activeOpacity={0.7}
                    >
                        <Hamburger width={27} height={27} className="border border-gray-300" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main white background section */}
            <View className="mt-20 h-screen flex flex-col bg-white rounded-t-[2rem] border">
                <View className="flex flex-row items-center ml-6 mt-2">
                     <Link href='/(auth)/home'>
                    <LeftArrow width={30} height={30} className="border border-gray-300" />
                    </Link>
                    <Text className="text-xl ml-2 font-medium text-[#1F486B]">RMA Policy</Text>
                </View>

                <View className="flex flex-row items-center justify-center w-12/12 mt-6">
                    <View className="flex-grow border-t border-[#1F486B]"></View>
                </View>

                <View className="flex flex-col items-center justify-center flex-1 px-6 mb-24" >
                    <Text className="text-4xl font-bold text-[#1F486B] mb-4">
                        Coming Soon
                    </Text>

                    {/* Subtitle with brand colors */}
                    <Text className="text-lg text-center text-[#1F486B]/80 ">
                        We're working on something exciting for you
                    </Text>
                </View>

            </View>
        </View>
    ));

    return (
        <View style={styles.container}>
            <MainContent />

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    input: {
        height: 50,
    },
    button: {
        width: '50%',
        maxWidth: 400,
        backgroundColor: '#1F486B',
        borderWidth: 1,
        borderColor: '#9DFE01',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        marginTop: 14,
    },
    buttonContent: {
        paddingVertical: 3,
        paddingHorizontal: 16,
    },
    buttonLabel: {
        color: '#9DFE01',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default RMAPolicy;