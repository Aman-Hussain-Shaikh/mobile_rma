import React, { useState } from 'react';
import { Text, View, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { RadioButton } from 'react-native-paper';
import Avatar from '../assets/images/HomeScreen/Avatar.svg';
import Hamburger from '../assets/images/HomeScreen/HameBurger_3Line.svg';
import LeftArrow from '../assets/images/BackButtonLeftArrow.svg';
import PhoneIcon from '../assets/images/phone_icon.svg';
import MailIcon from '../assets/images/mail_icon.svg';
import LocationIcon from '../assets/images/location_icon.svg';
import Sidebar from '@/components/Sidebar';
import { useSelector } from 'react-redux';
import { Link } from 'expo-router';

const INQUIRY_TYPES = ['Sales', 'Service', 'Others'];

interface RootState {
    user: {
        firstname: string;

    };
}

const Contact = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [inquiryType, setInquiryType] = useState('Sales');
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        contact: '',
        message: ''
    });

    const handleSubmit = () => {
        // Implement your form submission logic here
        console.log('Form submitted:', { ...formData, inquiry_type: inquiryType });
    };

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
        <View className="bg-[#1F486B] flex flex-1 flex-col relative mb-2">
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
            <View className="mt-20 flex-1 bg-white rounded-t-[2rem] ">
                <View className="flex flex-row items-center ml-6 mt-2">
                    <Link href='/(auth)/home'>
                    <LeftArrow width={30} height={30} className="border border-gray-300" />
                    </Link>
                    <Text className="text-xl ml-2 font-medium text-[#1F486B]">Contact Us</Text>
                </View>

                <View className="flex flex-row items-center justify-center w-12/12 mt-6">
                    <View className="flex-grow border-t border-[#1F486B]"></View>
                </View>

                <ScrollView className="flex-1 px-4">
                    {/* Contact Information Section */}
                    <View className="bg-[#1F486B] p-4 rounded-xl mt-4">
                        <Text className="text-[#9DFE01] text-xl mb-4">Contact Information</Text>

                        <View className="flex flex-row items-center mb-3">
                            <PhoneIcon width={20} height={20} />
                            <Text className="text-[#9DFE01] ml-2">+91 7319345359</Text>
                        </View>

                        <View className="flex flex-row items-center mb-3">
                            <MailIcon width={20} height={20} />
                            <Text className="text-[#9DFE01] ml-2">example@gmail.com</Text>
                        </View>

                        <View className="flex flex-row items-start mb-3">
                            <LocationIcon width={20} height={20} style={{ marginTop: 4 }} />
                            <Text className="text-[#9DFE01] ml-2 flex-1">
                                P.no - 262 Basement, Sector -9, Opp Akshardham Temple Chitrkoot,
                                Vaishali Nagar, Jaipur, Rajasthan - 302021
                            </Text>
                        </View>
                    </View>

                    {/* Form Section */}
                    <View className="bg-[#1F486B] p-4 rounded-xl mt-4">
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>First Name<Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter First Name"
                                placeholderTextColor="#9DFE0180"
                                value={formData.firstname}
                                onChangeText={(text) => setFormData({ ...formData, firstname: text })}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Last Name<Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Last Name"
                                placeholderTextColor="#9DFE0180"
                                value={formData.lastname}
                                onChangeText={(text) => setFormData({ ...formData, lastname: text })}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email<Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Email"
                                placeholderTextColor="#9DFE0180"
                                keyboardType="email-address"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Contact Number<Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Contact Number"
                                placeholderTextColor="#9DFE0180"
                                keyboardType="phone-pad"
                                value={formData.contact}
                                onChangeText={(text) => setFormData({ ...formData, contact: text })}
                            />
                        </View>

                        <View style={styles.radioContainer}>
                            <Text style={styles.label}>Inquiry Type<Text style={styles.required}>*</Text></Text>
                            <View style={styles.radioGroup}>
                                {INQUIRY_TYPES.map((type) => (
                                    <View key={type} style={styles.radioButton}>
                                        <RadioButton
                                            value={type}
                                            status={inquiryType === type ? 'checked' : 'unchecked'}
                                            onPress={() => setInquiryType(type)}
                                            color="#9DFE01"
                                            uncheckedColor="#FFFFFF"
                                        />
                                        <Text style={styles.radioLabel}>{type}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Message<Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Enter Your Message"
                                placeholderTextColor="#9DFE0180"
                                multiline
                                numberOfLines={4}
                                value={formData.message}
                                onChangeText={(text) => setFormData({ ...formData, message: text })}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.submitButtonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
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
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        color: '#9DFE01',
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '500',
    },
    required: {
        color: 'red',
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#9DFE01',
        paddingVertical: 8,
        fontSize: 16,
        color: '#9DFE01',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    radioContainer: {
        marginBottom: 20,
    },
    radioGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        gap: 20,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: '40%',
    },
    radioLabel: {
        color: '#9DFE01',
        marginLeft: 8,
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#1F486B',
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignSelf: 'center',
        marginTop: 20,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#9DFE01',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    submitButtonText: {
        color: '#9DFE01',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default Contact;