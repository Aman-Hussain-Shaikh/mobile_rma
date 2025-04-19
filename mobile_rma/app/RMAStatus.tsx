import { Text, View, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Keyboard } from "react-native";
import Avatar from "../assets/images/HomeScreen/Avatar.svg";
import Hamburger from "../assets/images/HomeScreen/HameBurger_3Line.svg";
import NewRequest from "../assets/images/HomeScreen/NewRequest.svg";
import RequestCheck from "../assets/images/HomeScreen/RequestCheck.svg";
import WarrantyCheck from "../assets/images/HomeScreen/WarrantyCheck.svg";
// BG WHITE Assests
import RMAPolicy from "../assets/images/HomeScreen/RMAPolicy.svg";
import ContactUs from "../assets/images/HomeScreen/ContactUs.svg";
import FeedBack from "../assets/images/HomeScreen/FeedBack.svg";
import SendIcon from "../assets/images/HomeScreen/Send_Round_Arrow.svg";

// Below Email Subscribe Cards Icons
import Contact_Us from "../assets/images/HomeScreen/Contact_Us.svg";
import EmailUs from "../assets/images/HomeScreen/Email_Us.svg";
import LiveChat from "../assets/images/HomeScreen/LiveChat.svg";

// Socail Media Icons
import Facebook from "../assets/images/HomeScreen/FaceBook.svg";
import Youtube from "../assets/images/HomeScreen/Youtube.svg";
import Instagram from "../assets/images/HomeScreen/Instagram.svg";
import X from "../assets/images/HomeScreen/X.svg";

import Sidebar from "@/components/Sidebar";
import LeftArrow from '../assets/images/BackButtonLeftArrow.svg';
import React, { useEffect, useRef, useState } from "react";
import { MaterialIcons } from '@expo/vector-icons';

import { Checkbox, Button } from "react-native-paper";
import { Link } from "expo-router";
import { withSidebar } from '@/components/Sidebar';
import { useDispatch } from 'react-redux';
import { router } from 'expo-router';
import { LogBox } from 'react-native';
import { useSelector } from 'react-redux';
import BottomSheet from "@/components/BottomSheet";
import { userRequest } from "@/utils/requestMethods";
import { useQuery } from "react-query";


interface RootState {
    user: {
        firstname: string;

    };
}

const RMAStatus = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [rmaNumber, setRmaNumber] = useState('');
    const [searchTriggered, setSearchTriggered] = useState(false);
    const [isSearching, setIsSearching] = useState(false);


    const inputRef = useRef<TextInput>(null);
    const isEditingRef = useRef(false);

    const token = useSelector((state: any) => state.user.accessToken);
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

    const getRMAStatusMethod = () => {
        if (!searchTriggered || !rmaNumber) return null;
        setIsSearching(true);
        return userRequest({
            url: `/request/get-requests/${rmaNumber}/`,
            method: "get",
            headers: { Authorization: `Bearer ${token}` }
        });
    };

    useEffect(() => {
        if (inputRef.current) {
            setTimeout(() => {
                if (inputRef.current) { // Add a null check here
                    inputRef.current.focus();
                }
            }, 100);
        }
    }, []);

    // Add the useQuery hook
    const { data: rmaResult, isLoading } = useQuery(
        ["check-rma-status", rmaNumber],
        getRMAStatusMethod,
        {
            enabled: searchTriggered,
            onSuccess: (res) => {
                setIsBottomSheetOpen(true);
                setSearchTriggered(false);
                setIsSearching(false);
            },
            onError: (error) => {
                console.log(error);
                setSearchTriggered(false);
                setIsSearching(false);
                // Add error handling here
            }
        }
    );


    const handleSearchPress = () => {
        if (rmaNumber.trim()) {
            setSearchTriggered(true);
            Keyboard.dismiss();
        }
    };


    const RMADetailsContent = () => {
        // Helper function for date formatting
        const formatDate = (dateString: string): string => {
            const date = new Date(dateString);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

        if (isLoading) {
            return (
                <View className="p-4 items-center justify-center">
                    <ActivityIndicator size="large" color="#9DFE01" />
                    <Text className="text-[#9DFE01] mt-2">Loading RMA details...</Text>
                </View>
            );
        }

        return (
            <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
                <Text className="text-[#9DFE01] text-2xl mb-6">RMA Details</Text>
                <View className="border-b border-[#9DFE01] mb-10" />

                <View className="mb-8">
                    <Text className="text-[#9DFE01] text-lg mb-2">RMA Application Number</Text>
                    <Text className="text-white text-base">
                        {rmaResult?.data?.rmainfo[0]?.id || 'N/A'}
                    </Text>
                    <View className="border-b border-[#9DFE01] mt-3" />
                </View>

                <View className="mb-8">
                    <Text className="text-[#9DFE01] text-lg mb-2">Date Of Submission</Text>
                    <Text className="text-white text-base">
                        {rmaResult?.data?.rmainfo[0]?.createdAt
                            ? formatDate(rmaResult.data.rmainfo[0].createdAt)
                            : 'N/A'}
                    </Text>
                    <View className="border-b border-[#9DFE01] mt-3" />
                </View>

                <View className="mb-8">
                    <Text className="text-[#9DFE01] text-lg mb-2">Status</Text>
                    <Text className="text-white text-base">
                        {rmaResult?.data?.rmainfo[0]?.status || 'N/A'}
                    </Text>
                    <View className="border-b border-[#9DFE01] mt-3" />
                </View>

                {rmaResult?.data?.rmainfo[0]?.fault_desc && (
                    <View className="mb-8">
                        <Text className="text-[#9DFE01] text-lg mb-2">Fault Description</Text>
                        <Text className="text-white text-base">
                            {rmaResult.data.rmainfo[0].fault_desc}
                        </Text>
                        <View className="border-b border-[#9DFE01] mt-3" />
                    </View>
                )}

                <View className="">
                    <Text className="text-[#9DFE01] text-sm mb-2">
                        • It Takes Around 24 Hrs For RMA Status To Update
                    </Text>
                    <Text className="text-[#9DFE01] text-sm">
                        • Note! Finding Difficulty With RMA Status ? Contact Us
                    </Text>
                </View>

                <TouchableOpacity
                    className="bg-[#1F486B] border border-[#9DFE01] rounded-lg py-3 px-6 mt-4  items-center"
                    onPress={() => setIsBottomSheetOpen(false)}
                >
                    <Text className="text-[#9DFE01] font-bold text-lg">Close</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    };



    return (
        <View style={styles.container}>
                    <View className="bg-[#1F486B] flex flex-1 flex-col ">
            <View className="h-11  ">
                <View className="flex flex-1 flex-row  justify-between  ">

                    <View className="flex flex-row ml-3 mt-4 ">
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

                    {/* Hamburger Menu Button */}
                    <TouchableOpacity
                        onPress={() => setIsSidebarOpen(true)}
                        className="mr-5 mt-6 p-2" // Added padding for better touch target
                        activeOpacity={0.7} // Added feedback for touch
                    >
                        <Hamburger width={27} height={27} className="border border-gray-300" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* BG White Below */}
            <View className="mt-20 h-screen flex flex-col bg-white rounded-t-[2rem] border">

                <View className="flex flex-row items-center ml-6 mt-2">
                    <Link href='/(auth)/home'>
                        <LeftArrow width={30} height={30} className="border border-gray-300" />
                    </Link>
                    <Text className="text-xl ml-2 font-medium text-[#1F486B]">RMA Status Check</Text>
                </View>

                <View className="flex flex-row items-center justify-center w-12/12 mt-6">
                    <View className="flex-grow border-t border-[#1F486B]"></View>
                </View>

                <Text className="text-xl text-[#1F486B] mx-5 font-semibold mt-3">To Check Your RMA Status, Please Enter RMA Application Number Below.</Text>

                <View className="flex items-center justify-center mx-4 mt-3">
                <TextInput
                            ref={inputRef}
                            placeholder="Enter RMA Application Number"
                            placeholderTextColor="rgba(157, 254, 1, 0.6)"
                            value={rmaNumber}
                            onChangeText={setRmaNumber}
                            className="border bg-[#1F486B] text-[#9DFE01] text-lg w-full border-[#1F486B] rounded-xl p-3 mt-2"
                            style={{ height: 50 }}
                            keyboardType="numeric"
                            autoCorrect={false}
                            spellCheck={false}
                            blurOnSubmit={false}
                        />
                    <View className="flex flex-row justify-center items-center w-full">
                        <Button
                            mode="contained"
                            onPress={handleSearchPress}
                            contentStyle={styles.buttonContent}
                            labelStyle={styles.buttonLabel}
                            style={styles.button}
                            disabled={isSearching}
                        >
                            <View className="flex-row items-center">
                                {isSearching ? (
                                    <>
                                        <MaterialIcons name="search" size={20} color="#9DFE01" />
                                        <ActivityIndicator size="small" color="#9DFE01" style={{ marginLeft: 8 }} />
                                    </>
                                ) : (
                                    <>
                                        <MaterialIcons name="search" size={20} color="#9DFE01" />
                                        <Text style={styles.buttonLabel}> Search</Text>
                                    </>
                                )}
                            </View>
                        </Button>
                    </View>
                </View>

                {/* Follow Us Section */}
                <View style={styles.followUsContainer}>
                    <View className="flex flex-row items-center m-auto mx-10 justify-center w-10/12 mt-4 ">
                        <View className="flex-grow border-t-2  border-[#1F486B]"></View>
                        <Text className="mx-4 text-[#1F486B] text-lg">Follow Us</Text>
                        <View className="flex-grow border-t-2  border-[#1F486B]"></View>
                    </View>

                    <View className="h-10 flex-1 mt-1 flex flex-row justify-center ">
                        <View className="mx-2">
                            <Facebook width={26} height={26} className="border  " />
                        </View>
                        <View className="mx-2">
                            <Youtube width={26} height={26} className="border  " />
                        </View>
                        <View className="mx-2">
                            <Instagram width={26} height={26} className="border  " />
                        </View>
                        <View className="mx-2">
                            <X width={26} height={26} className="border  " />
                        </View>
                    </View>
                </View>
            </View>



        </View>

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <BottomSheet
                isOpen={isBottomSheetOpen}
                onClose={() => setIsBottomSheetOpen(false)}
            >
                <RMADetailsContent />
            </BottomSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative', // This ensures proper stacking of sidebar over content
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonLabel: {
        color: '#9DFE01',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    followUsContainer: {
        position: 'absolute',
        bottom: 120, // Adjust this value to control the distance from the bottom
        left: 0,
        right: 0,
        alignItems: 'center',
    },
});

export default RMAStatus;