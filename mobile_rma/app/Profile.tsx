import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSelector } from "react-redux";
import { useQuery } from "react-query";
import { userRequest } from "@/utils/requestMethods";
import Avatar from "../assets/images/HomeScreen/Avatar.svg";
import Hamburger from "../assets/images/HomeScreen/HameBurger_3Line.svg";
import LeftArrow from '../assets/images/BackButtonLeftArrow.svg';
import Sidebar from '@/components/Sidebar';
import { Link } from 'expo-router';

// Define interfaces for our data structures
interface Address {
    reqid: string;
    cp_name?: string;
    cp_number?: string;
    cp_email?: string;
    street: string;
    city: string;
    postal_code: string;
    state: string;
    country: string;
}

interface User {
    firstname: string;
    lastname?: string;
    email: string;
    telephone: string;
    userType: string;
    isverified: boolean;
}

// Define possible response formats
interface StandardResponse {
    user: User;
    addresses: Address[];
}

interface LegacyArrayResponse {
    [0]: User;
}

interface LegacyObjectResponse {
    [key: string]: User;
}

// Union type for all possible response formats
type ResponseData = StandardResponse | LegacyArrayResponse | LegacyObjectResponse;

interface UserResponse {
    data: ResponseData;
}

// Define interface for Redux state
interface RootState {
    user: {
        userId: string;
        accessToken: string;
        firstname: string;
    };
}

// Define props interface for InfoField component
interface InfoFieldProps {
    label: string;
    value: string | undefined;
}

// This component displays a single information field
const InfoField: React.FC<InfoFieldProps> = ({ label, value }) => (
    <View className="mb-4">
        <Text className="text-[#9DFE01] text-base font-medium mb-1">{label}</Text>
        <Text className="text-white">{value || 'N/A'}</Text>
    </View>
);

const Profile: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const userId = useSelector((state: RootState) => state.user.userId);
    const token = useSelector((state: RootState) => state.user.accessToken);

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

    // Helper functions to determine response type and extract data
    const isStandardResponse = (data: ResponseData): data is StandardResponse => {
        return 'user' in data && 'addresses' in data;
    };

    const isLegacyArrayResponse = (data: ResponseData): data is LegacyArrayResponse => {
        return Array.isArray(Object.values(data));
    };

    // Extract user and addresses from response data
    const extractUserData = (responseData: ResponseData): { user: User; addresses: Address[] } => {
        if (isStandardResponse(responseData)) {
            return {
                user: responseData.user,
                addresses: responseData.addresses
            };
        }

        if (isLegacyArrayResponse(responseData)) {
            return {
                user: responseData[0],
                addresses: []
            };
        }

        // Must be LegacyObjectResponse
        return {
            user: Object.values(responseData)[0],
            addresses: []
        };
    };

    // Fetch user data using react-query
    const { data: userData, isLoading, error } = useQuery<UserResponse>(
        "get-user-info",
        () =>
            userRequest({
                url: `/user/get-user/${userId}/`,
                method: "get",
                headers: { Authorization: `Bearer ${token}` },
            }),
        {
            enabled: !!userId,
        }
    );

    const MainContent = React.memo(() => {
        if (isLoading) {
            return (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#9DFE01" />
                </View>
            );
        }

        if (error) {
            return (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-red-500">Error loading profile data</Text>
                </View>
            );
        }

        if (!userData?.data) {
            return (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-[#9DFE01]">No profile data available</Text>
                </View>
            );
        }

        // Extract user data and addresses using our helper function
        const { user, addresses } = extractUserData(userData.data);
        return (
            <View className="bg-[#1F486B] flex flex-1 flex-col relative">
                {/* Header section */}
                <View className="h-11">
                    <View className="flex flex-1 flex-row justify-between">
                        <View className="flex flex-row ml-3 mt-4">
                            <View className="flex mt-2">
                                <Avatar width={37} height={37} className="border border-gray-300" />
                            </View>
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
                <View className="mt-20 flex-1 bg-white rounded-t-[2rem] border">
                    <View className="flex flex-row items-center ml-6 mt-2">
                         <Link href='/(auth)/home'>
                        <LeftArrow width={30} height={30} className="border border-gray-300" />
                        </Link>
                        <Text className="text-xl ml-2 font-medium text-[#1F486B]">Profile</Text>
                    </View>

                    <View className="flex flex-row items-center justify-center w-12/12 mt-6">
                        <View className="flex-grow border-t border-[#1F486B]"></View>
                    </View>

                    <ScrollView className="flex-1 px-4">
                        {/* Personal Information Section */}
                        <View className="bg-[#1F486B] rounded-xl mt-4 p-4 border border-[#9DFE01]">
                            <Text className="text-[#9DFE01] text-xl font-semibold mb-4">
                                Personal Information
                            </Text>
                            <View className="border-t border-[#9DFE01] pt-4">
                                <InfoField
                                    label="Full Name"
                                    value={`${user.firstname} ${user.lastname || ''}`}
                                />
                                <InfoField
                                    label="Email"
                                    value={user.email}
                                />
                                <InfoField
                                    label="Telephone"
                                    value={user.telephone}
                                />
                                <InfoField
                                    label="User Type"
                                    value={user.userType}
                                />
                                <InfoField
                                    label="Verification Status"
                                    value={user.isverified ? 'Verified' : 'Not Verified'}
                                />
                            </View>
                        </View>

                        {/* Addresses Section */}
                        {addresses?.length > 0 && (
                            <View className="bg-[#1F486B] rounded-xl mt-4 p-4 mb-6 border border-[#9DFE01]">
                                <Text className="text-[#9DFE01] text-xl font-semibold mb-4">
                                    Addresses
                                </Text>
                                {addresses.map((address: Address, index: number) => (
                                    <View
                                        key={address.reqid}
                                        className={`border-t border-[#9DFE01] pt-4 ${index === 0 ? 'border-t-0 pt-0' : ''
                                            }`}
                                    >
                                        {address.cp_name && (
                                            <InfoField label="Contact Person" value={address.cp_name} />
                                        )}
                                        {address.cp_number && (
                                            <InfoField label="Contact Number" value={address.cp_number} />
                                        )}
                                        {address.cp_email && (
                                            <InfoField label="Contact Email" value={address.cp_email} />
                                        )}
                                        <InfoField label="Street Address" value={address.street} />
                                        <InfoField label="City" value={address.city} />
                                        <InfoField label="Postal Code" value={address.postal_code} />
                                        <InfoField label="State" value={address.state} />
                                        <InfoField label="Country" value={address.country} />
                                    </View>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        );
    });

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

export default Profile;