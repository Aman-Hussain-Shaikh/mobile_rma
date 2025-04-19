import { Text, View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
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
// import "../global.css";
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
    // console.log("FIRST NAME : ", firstname)

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
        <View className="bg-[#1F486B] flex flex-1 flex-col ">
            <View className="h-44  ">
                <View className="flex flex-1 flex-row  justify-between  ">

                    <View className="flex flex-row ml-3 mt-4   ">
                        <Link href="/Profile">
                            <View className="flex mt-3 pt-2">
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

                <View className="flex flex-row  flex-1 mt-16 justify-evenly">
                    <Link href="/ServiceRequest">
                        <View className="flex flex-col items-center">
                            <View className="bg-[#9DFE01] h-20 w-20 flex items-center justify-center rounded-2xl mb-2 ">
                                <NewRequest width={36} height={36} className="border border-gray-300" />
                            </View>
                            <Text className="text-[#9DFE01] text-base">New Request</Text>
                        </View>
                    </Link>
                    <Link href="/RMAStatus">
                        <View className="flex flex-col items-center">
                            <View className="bg-[#9DFE01] h-20 w-20 flex items-center justify-center rounded-2xl mb-2 ">
                                <RequestCheck width={36} height={36} className="border border-gray-300" />
                            </View>
                            <Text className="text-[#9DFE01] text-base">Request Check</Text>
                        </View>
                    </Link>
                    <Link href="/Warrantycheck">
                        <View className="flex flex-col items-center">
                            <View className="bg-[#9DFE01] h-20 w-20 flex items-center justify-center rounded-2xl mb-2 ">
                                <WarrantyCheck width={36} height={36} className="border border-gray-300" />
                            </View>
                            <Text className="text-[#9DFE01] text-base">Warranty Check</Text>
                        </View>
                    </Link>
                </View>
            </View>

            {/* BG White Below */}

            <View className="mt-24 h-screen flex flex-col bg-white rounded-t-[2.5rem] border">
                <View className="flex flex-row  justify-evenly mt-10 ">
                    <View className="flex flex-col items-center">
                        <Link href="/RMAPolicy">
                            <View className="bg-[#1F486B] h-36 w-28 flex items-center justify-center rounded-2xl mb-2 ">
                                <View className="rounded-full bg-[#9DFE01] p-4">
                                    <RMAPolicy width={36} height={36} className="border border-gray-300" />
                                </View>
                                <Text className="text-[#9DFE01] text-base mt-2">RMA Policy</Text>
                            </View>
                        </Link>
                    </View>
                    <Link href="/Contact">
                        <View className="flex flex-col items-center">
                            <View className="bg-[#1F486B] h-36 w-28 flex items-center justify-center rounded-2xl mb-2 ">
                                <View className="rounded-full bg-[#9DFE01] p-4">
                                    <ContactUs width={36} height={36} className="border border-gray-300" />
                                </View>
                                <Text className="text-[#9DFE01] text-base mt-2">Contact Us</Text>
                            </View>
                        </View>
                    </Link>

                    <Link href="/Feedback">
                        <View className="flex flex-col items-center">
                            <View className="bg-[#1F486B] h-36 w-28 flex items-center justify-center rounded-2xl mb-2 ">
                                <View className="rounded-full bg-[#9DFE01] p-4">
                                    <FeedBack width={36} height={36} className="border border-gray-300" />
                                </View>
                                <Text className="text-[#9DFE01] text-base mt-2">Feedback</Text>
                            </View>
                        </View>
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
                                {/* Label without z-10 */}
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
                            <TouchableOpacity className="p-2">
                                <SendIcon className="w-6 h-6 text-[#9DFE01]" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Below Subscribe Email  */}

                <View className="flex flex-col mt-2 ">
                    <Text className="text-[#1F486B] text-2xl ml-8 font-medium my-2">Connect Us</Text>
                    <View className="flex flex-row  justify-evenly">
                        <View className="flex flex-col items-center">
                            <View className="bg-[rgba(31,72,107,0.4)]  h-28 w-28 flex items-center justify-center rounded-2xl mb-2 ">
                                <View className="">
                                    <Contact_Us width={40} height={40} className="border border-gray-300" />
                                </View>
                                <Text className="text-[#1F486B] text-lg mt-2">Call Us</Text>
                            </View>
                        </View>

                        <View className="flex flex-col items-center">
                            <View className="bg-[rgba(31,72,107,0.4)]  h-28 w-28 flex items-center justify-center rounded-2xl mb-2 ">
                                <View className="">
                                    <EmailUs width={40} height={40} className="border border-gray-300" />
                                </View>
                                <Text className="text-[#1F486B] text-lg mt-2">Email Us</Text>
                            </View>
                        </View>

                        <View className="flex flex-col items-center">
                            <View className="bg-[rgba(31,72,107,0.4)]  h-28 w-28 flex items-center justify-center rounded-2xl mb-2 ">
                                <View className="">
                                    <LiveChat width={40} height={40} className="border border-gray-300" />
                                </View>
                                <Text className="text-[#1F486B] text-lg mt-2">Live Chat</Text>
                            </View>
                        </View>

                    </View>
                </View>

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
    ));

    return (
        <View style={styles.container}>
            {/* Main Content */}
            <MainContent />

            {/* Sidebar */}
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
        position: 'relative', // This ensures proper stacking of sidebar over content
    },
});

// Export the component wrapped with the sidebar HOC
export default Home;