import React, { useState } from 'react';
import { Text, View, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
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
import * as Yup from 'yup';
import { publicRequest } from '@/utils/requestMethods';

const INQUIRY_TYPES = ['Sales', 'Service', 'Others'] as const;
type InquiryType = typeof INQUIRY_TYPES[number];

interface RootState {
    user: {
        firstname: string;
        email: string;
        accessToken: string;
    };
}

interface ContactFormValues {
    firstname: string;
    lastname: string;
    email: string;
    contact: string;
    inquiry_type: InquiryType;
    message: string;
}

const validationSchema = Yup.object().shape({
    firstname: Yup.string()
        .required('First name is required')
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must be less than 50 characters')
        .matches(/^[a-zA-Z ]*$/, 'First name can only contain letters and spaces'),
    lastname: Yup.string()
        .required('Last name is required')
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must be less than 50 characters')
        .matches(/^[a-zA-Z ]*$/, 'Last name can only contain letters and spaces'),
    email: Yup.string()
        .required('Email is required')
        .email('Invalid email address')
        .max(100, 'Email must be less than 100 characters'),
    contact: Yup.string()
        .required('Contact number is required')
        .matches(/^\d{10}$/, 'Contact number must be 10 digits'),
    inquiry_type: Yup.string()
        .required('Inquiry type is required')
        .oneOf(INQUIRY_TYPES),
    message: Yup.string()
        .required('Message is required')
        .min(10, 'Message must be at least 10 characters')
        .max(1000, 'Message must be less than 1000 characters')
});

const Contact = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<ContactFormValues>>({});
    const [formData, setFormData] = useState<ContactFormValues>({
        firstname: '',
        lastname: '',
        email: '',
        contact: '',
        inquiry_type: 'Sales',
        message: ''
    });

    const user = useSelector((state: RootState) => state.user);

    const handlePhoneClick = () => {
        // Implement phone call functionality
        // Linking.openURL('tel:+917319345359');
    };

    const handleEmailClick = () => {
        // Implement email functionality
        // Linking.openURL('mailto:example@gmail.com');
    };

    const handleAddressClick = () => {
        // Implement map functionality
        const address = "P.no - 262 Basement, Sector -9, Opp Akshardham Temple Chitrkoot, Vaishali Nagar, Jaipur, Rajasthan - 302021";
        // Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
    };

    const handleSubmit = async () => {
        try {
            await validationSchema.validate(formData, { abortEarly: false });
            setErrors({});
            setIsSubmitting(true);

            const response = await publicRequest({
                url: '/user/send-query/',
                method: 'post',
                data: {
                    firstname: formData.firstname,
                    lastname: formData.lastname,
                    email: formData.email,
                    contact: formData.contact,
                    inquiry_type: formData.inquiry_type,
                    message: formData.message
                }
            });

            if (response.status === 200 || response.status === 201) {
                Alert.alert("Success", "Your inquiry has been submitted successfully!");
                // Reset form
                setFormData({
                    firstname: '',
                    lastname: '',
                    email: user.email || '',
                    contact: '',
                    inquiry_type: 'Sales',
                    message: ''
                });
            } else {
                throw new Error(response.data.message || "Failed to submit inquiry");
            }
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const validationErrors: Partial<ContactFormValues> = {};
                error.inner.forEach(err => {
                    if (err.path) {
                        validationErrors[err.path as keyof ContactFormValues] = err.message;
                    }
                });
                setErrors(validationErrors);
            } else {
                console.error("Inquiry submission error:", error);
                Alert.alert("Error", "Failed to submit inquiry. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof ContactFormValues, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const handlePhoneNumberChange = (text: string) => {
        const numericValue = text.replace(/[^0-9]/g, '').slice(0, 10);
        handleInputChange('contact', numericValue);
    };

    const getGreeting = () => {
        const currentHour = new Date().getHours();
        if (currentHour >= 5 && currentHour < 12) return "Good Morning";
        if (currentHour >= 12 && currentHour < 17) return "Good Afternoon";
        if (currentHour >= 17 && currentHour < 21) return "Good Evening";
        return "Good Night";
    };


    return (
        <View style={styles.container}>
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
                                <Text className="text-[#9DFE01] text-2xl font-roboto -mt-2">{user.firstname}</Text>
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

                            <TouchableOpacity onPress={handlePhoneClick} className="flex flex-row items-center mb-3">
                                <PhoneIcon width={20} height={20} />
                                <Text className="text-[#9DFE01] ml-2">+91 7319345359</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleEmailClick} className="flex flex-row items-center mb-3">
                                <MailIcon width={20} height={20} />
                                <Text className="text-[#9DFE01] ml-2">example@gmail.com</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleAddressClick} className="flex flex-row items-start mb-3">
                                <LocationIcon width={20} height={20} style={{ marginTop: 4 }} />
                                <Text className="text-[#9DFE01] ml-2 flex-1">
                                    P.no - 262 Basement, Sector -9, Opp Akshardham Temple Chitrkoot,
                                    Vaishali Nagar, Jaipur, Rajasthan - 302021
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Form Section */}
                        <View className="bg-[#1F486B] p-4 rounded-xl mt-4">
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>First Name<Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={[styles.input, errors.firstname ? styles.inputError : null]}
                                    placeholder="Enter First Name"
                                    placeholderTextColor="#9DFE0180"
                                    value={formData.firstname}
                                    onChangeText={(text) => handleInputChange('firstname', text)}
                                />
                                {errors.firstname && <Text style={styles.errorText}>{errors.firstname}</Text>}
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Last Name<Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={[styles.input, errors.lastname ? styles.inputError : null]}
                                    placeholder="Enter Last Name"
                                    placeholderTextColor="#9DFE0180"
                                    value={formData.lastname}
                                    onChangeText={(text) => handleInputChange('lastname', text)}
                                />
                                {errors.lastname && <Text style={styles.errorText}>{errors.lastname}</Text>}
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Email<Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={[styles.input, errors.email ? styles.inputError : null]}
                                    placeholder="Enter Email"
                                    placeholderTextColor="#9DFE0180"
                                    keyboardType="email-address"
                                    value={formData.email}
                                    onChangeText={(text) => handleInputChange('email', text)}
                                />
                                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Contact Number<Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={[styles.input, errors.contact ? styles.inputError : null]}
                                    placeholder="Enter Contact Number"
                                    placeholderTextColor="#9DFE0180"
                                    keyboardType="phone-pad"
                                    value={formData.contact}
                                    onChangeText={handlePhoneNumberChange}
                                    maxLength={10}
                                />
                                {errors.contact && <Text style={styles.errorText}>{errors.contact}</Text>}
                            </View>

                            <View style={styles.radioContainer}>
                                <Text style={styles.label}>Inquiry Type<Text style={styles.required}>*</Text></Text>
                                <View style={styles.radioGroup}>
                                    {INQUIRY_TYPES.map((type) => (
                                        <View key={type} style={styles.radioButton}>
                                            <RadioButton
                                                value={type}
                                                status={formData.inquiry_type === type ? 'checked' : 'unchecked'}
                                                onPress={() => handleInputChange('inquiry_type', type)}
                                                color="#9DFE01"
                                                uncheckedColor="#FFFFFF"
                                            />
                                            <Text style={styles.radioLabel}>{type}</Text>
                                        </View>
                                    ))}
                                </View>
                                {errors.inquiry_type && <Text style={styles.errorText}>{errors.inquiry_type}</Text>}
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Message<Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={[styles.input, styles.textArea, errors.message ? styles.inputError : null]}
                                    placeholder="Enter Your Message"
                                    placeholderTextColor="#9DFE0180"
                                    multiline
                                    numberOfLines={4}
                                    value={formData.message}
                                    onChangeText={(text) => handleInputChange('message', text)}
                                />
                                {errors.message && <Text style={styles.errorText}>{errors.message}</Text>}
                                <Text style={styles.characterCount}>
                                    {formData.message.length}/1000 characters
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#9DFE01" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Submit</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
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
    inputError: {
        borderBottomColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
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
    characterCount: {
        color: '#9DFE01',
        fontSize: 12,
        textAlign: 'right',
        marginTop: 4,
        opacity: 0.7,
    },
});

export default Contact;