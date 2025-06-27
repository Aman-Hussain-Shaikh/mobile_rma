import { Text, View, TextInput, StyleSheet, TouchableOpacity, Linking } from "react-native";
import Avatar from "../../assets/images/HomeScreen/Avatar.svg";
import Hamburger from "../../assets/images/HomeScreen/HameBurger_3Line.svg";
import NewRequest from "../../assets/images/HomeScreen/NewRequest.svg";
import RequestCheck from "../../assets/images/HomeScreen/RequestCheck.svg";
import WarrantyCheck from "../../assets/images/HomeScreen/WarrantyCheck.svg";
// BG WHITE Assests
import RMAPolicy from "../../assets/images/HomeScreen/RMAPolicy.svg";
import ContactUs from "../../assets/images/HomeScreen/ContactUs.svg";
import FeedBack from "../../assets/images/HomeScreen/FeedBack.svg";
import SendIcon from "../../assets/images/HomeScreen/Send_Round_Arrow.svg";

// Below Email Subscribe Cards Icons
import Contact_Us from "../../assets/images/HomeScreen/Contact_Us.svg";
import EmailUs from "../../assets/images/HomeScreen/Email_Us.svg";
import LiveChat from "../../assets/images/HomeScreen/LiveChat.svg";

// Socail Media Icons
import Facebook from "../../assets/images/HomeScreen/FaceBook.svg";
import Youtube from "../../assets/images/HomeScreen/Youtube.svg";
import Instagram from "../../assets/images/HomeScreen/Instagram.svg";
import X from "../../assets/images/HomeScreen/X.svg";

import Sidebar from "@/components/Sidebar";
import React, { useEffect, useState } from "react";
import { Checkbox, Button } from "react-native-paper";
import { Link } from "expo-router";
import { withSidebar } from '@/components/Sidebar';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFail } from '../../redux/userRedux';
import { publicRequest } from '../../utils/requestMethods';
import { router } from 'expo-router';
import { LogBox } from 'react-native';
import { useSelector } from 'react-redux';

interface RootState {
    user: {
        firstname: string;
    };
}

const Home = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const firstname = useSelector((state: RootState) => state?.user?.firstname)

    const getGreeting = () => {
        const currentHour = new Date().getHours();
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


    const handleCallUs = () => {
        Linking.openURL(`tel:+917319345359`);
    };

    const handleEmailUs = () => {
        Linking.openURL(`mailto:example@gmail.com`);
    };

    const MainContent = React.memo(() => (
        <View className="bg-[#1F486B] flex flex-1 flex-col ">
            <View className="h-44  ">
                <View className="flex flex-1 flex-row  justify-between  ">
                    <View className="flex flex-row ml-3 mt-4   ">
                        <Link href="/Profile" asChild>
                            <TouchableOpacity activeOpacity={0.7}>
                                <View className="flex mt-0 pt-2">
                                    <Avatar width={37} height={37} className="border border-gray-300" />
                                </View>
                            </TouchableOpacity>
                        </Link>
                        <View className="flex ml-3">
                            <Text className="text-[#9DFE01] text-lg font-roboto">{getGreeting()}</Text>
                            <Text className="text-[#9DFE01] text-2xl font-roboto -mt-2">{firstname}</Text>
                        </View>
                    </View>

                    {/* Hamburger Menu Button */}
                    <TouchableOpacity
                        onPress={() => setIsSidebarOpen(true)}
                        className="mr-5 mt-6 p-2"
                        activeOpacity={0.7}
                    >
                        <Hamburger width={27} height={27} className="border border-gray-300" />
                    </TouchableOpacity>
                </View>

                <View className="flex flex-row  flex-1 mt-16 justify-evenly">
                    <Link href="/ServiceRequest" asChild>
                        <TouchableOpacity activeOpacity={0.7}>
                            <View className="flex flex-col items-center">
                                <View className="bg-[#9DFE01] h-20 w-20 flex items-center justify-center rounded-2xl mb-2"
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 5,
                                        elevation: 5,
                                        borderWidth: 1,
                                        borderColor: '#1F486B'
                                    }}>
                                    <NewRequest width={36} height={36} className="border border-gray-300" />
                                </View>
                                <Text className="text-[#9DFE01] text-base">New Request</Text>
                            </View>
                        </TouchableOpacity>
                    </Link>
                    <Link href="/RMAStatus" asChild>
                        <TouchableOpacity activeOpacity={0.7}>
                            <View className="flex flex-col items-center">
                                <View className="bg-[#9DFE01] h-20 w-20 flex items-center justify-center rounded-2xl mb-2"
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 5,
                                        elevation: 5,
                                        borderWidth: 1,
                                        borderColor: '#1F486B'
                                    }}>
                                    <RequestCheck width={36} height={36} className="border border-gray-300" />
                                </View>
                                <Text className="text-[#9DFE01] text-base">Request Check</Text>
                            </View>
                        </TouchableOpacity>
                    </Link>
                    <Link href="/Warrantycheck" asChild>
                        <TouchableOpacity activeOpacity={0.7}>
                            <View className="flex flex-col items-center">
                                <View className="bg-[#9DFE01] h-20 w-20 flex items-center justify-center rounded-2xl mb-2"
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 5,
                                        elevation: 5,
                                        borderWidth: 1,
                                        borderColor: '#1F486B'
                                    }}>
                                    <WarrantyCheck width={36} height={36} className="border border-gray-300" />
                                </View>
                                <Text className="text-[#9DFE01] text-base">Warranty Check</Text>
                            </View>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>

            {/* BG White Below */}
            <View className="mt-24 h-screen flex flex-col bg-white rounded-t-[2.5rem] border">
                <View className="flex flex-row  justify-evenly mt-10 ">
                    <Link href="/WarrantyPolicy" asChild>
                        <TouchableOpacity activeOpacity={0.7}>
                            <View className="flex flex-col items-center">
                                <View className="bg-[#1F486B] h-36 w-28 flex items-center justify-center rounded-2xl mb-2"
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 5,
                                        elevation: 5,
                                        borderWidth: 1,
                                        borderColor: '#9DFE01'
                                    }}>
                                    <View className="rounded-full bg-[#9DFE01] p-4">
                                        <RMAPolicy width={36} height={36} className="border border-gray-300" />
                                    </View>
                                    <Text className="text-[#9DFE01] text-base mt-2">Warranty</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Link>
                    <Link href="/Contact" asChild>
                        <TouchableOpacity activeOpacity={0.7}>
                            <View className="flex flex-col items-center">
                                <View className="bg-[#1F486B] h-36 w-28 flex items-center justify-center rounded-2xl mb-2"
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 5,
                                        elevation: 5,
                                        borderWidth: 1,
                                        borderColor: '#9DFE01'
                                    }}>
                                    <View className="rounded-full bg-[#9DFE01] p-4">
                                        <ContactUs width={36} height={36} className="border border-gray-300" />
                                    </View>
                                    <Text className="text-[#9DFE01] text-base mt-2">Contact Us</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Link>
                    <Link href="/Feedback" asChild>
                        <TouchableOpacity activeOpacity={0.7}>
                            <View className="flex flex-col items-center">
                                <View className="bg-[#1F486B] h-36 w-28 flex items-center justify-center rounded-2xl mb-2"
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 5,
                                        elevation: 5,
                                        borderWidth: 1,
                                        borderColor: '#9DFE01'
                                    }}>
                                    <View className="rounded-full bg-[#9DFE01] p-4">
                                        <FeedBack width={36} height={36} className="border border-gray-300" />
                                    </View>
                                    <Text className="text-[#9DFE01] text-base mt-2">Feedback</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Link>
                </View>

                {/* Subscribe */}
                <View className="bg-[#1F486B] rounded-3xl mx-2 py-4 flex flex-col border">
                    <View className="px-4">
                        <Text className="text-xs text-[#9DFE01] mb-6 ">
                            Don't Forget To Subscribe To Our Newsletter And Stay Updated.
                        </Text>
                        <View className="flex flex-row items-center space-x-2">
                            <View className="flex-1 relative">
                                <View className="absolute -top-5 left-2 bg-[#1F486B] px-2">
                                    <Text className="text-[#9DFE01] text-xs font-bold ">Enter Your Email-Id</Text>
                                </View>
                                <View className="border border-[#9DFE01] rounded-2xl">
                                    <TextInput
                                        keyboardType="email-address"
                                        placeholder="core************@g****.c*m"
                                        className="bg-[#1F486B] px-4 py-3 text-[#9DFE01] text-base rounded-2xl"
                                        placeholderTextColor="#9DFE01"
                                    />
                                </View>
                            </View>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                className="p-2"
                            >
                                <SendIcon className="w-6 h-6 text-[#9DFE01]" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Below Subscribe Email  */}
                <View className="flex flex-col mt-2 ">
                    <Text className="text-[#1F486B] text-2xl ml-8 font-medium my-2">Connect Us</Text>
                    <View className="flex flex-row  justify-evenly">
                        <TouchableOpacity activeOpacity={0.7} onPress={handleCallUs}>
                            <View className="flex flex-col items-center">
                                <View className="bg-[rgba(31,72,107,0.4)]  h-28 w-28 flex items-center justify-center rounded-2xl mb-2 ">
                                    <View className="">
                                        <Contact_Us width={40} height={40} className="border border-gray-300" />
                                    </View>
                                    <Text className="text-[#1F486B] text-lg mt-2">Call Us</Text>
                                    {/* <Text className="text-[#1F486B] text-xs">+91 7319345359</Text> */}
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={0.7} onPress={handleEmailUs}>
                            <View className="flex flex-col items-center">
                                <View className="bg-[rgba(31,72,107,0.4)]  h-28 w-28 flex items-center justify-center rounded-2xl mb-2 ">
                                    <View className="">
                                        <EmailUs width={40} height={40} className="border border-gray-300" />
                                    </View>
                                    <Text className="text-[#1F486B] text-lg mt-2">Email Us</Text>
                                    {/* <Text className="text-[#1F486B] text-xs">example@gmail.com</Text> */}
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={0.7}>
                            <View className="flex flex-col items-center">
                                <View className="bg-[rgba(31,72,107,0.4)]  h-28 w-28 flex items-center justify-center rounded-2xl mb-2 ">
                                    <View className="">
                                        <LiveChat width={40} height={40} className="border border-gray-300" />
                                    </View>
                                    <Text className="text-[#1F486B] text-lg mt-2">Live Chat</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="flex flex-row items-center m-auto mx-10 justify-center w-10/12 mt-4 ">
                    <View className="flex-grow border-t-2  border-[#1F486B]"></View>
                    <Text className="mx-4 text-[#1F486B] text-lg">Follow Us</Text>
                    <View className="flex-grow border-t-2  border-[#1F486B]"></View>
                </View>

                <View className="h-10 flex-1 mt-1 flex flex-row justify-center ">
                    <TouchableOpacity activeOpacity={0.7} className="mx-2">
                        <Facebook width={26} height={26} className="border  " />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} className="mx-2">
                        <Youtube width={26} height={26} className="border  " />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} className="mx-2">
                        <Instagram width={26} height={26} className="border  " />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} className="mx-2">
                        <X width={26} height={26} className="border  " />
                    </TouchableOpacity>
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
});

export default Home;