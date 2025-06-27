import { Text, View, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import Avatar from "../assets/images/HomeScreen/Avatar.svg";
import Hamburger from "../assets/images/HomeScreen/HameBurger_3Line.svg";
import LeftArrow from '../assets/images/BackButtonLeftArrow.svg';
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { RadioButton } from 'react-native-paper';
import { useSelector } from "react-redux";
import { Link } from "expo-router";
import { userRequest } from "@/utils/requestMethods";

interface RootState {
    user: {
        firstname: string;
        email: string;
        accessToken: string;
    };
}

interface FeedbackFormData {
    name: string;
    email: string;
    contact: string;
    complaintResolved: string;
    complaintRemark: string;
    satisfaction: string;
    recommendation: string;
    recommendationRemark: string;
    additionalComments: string;
}

const Feedback = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState<FeedbackFormData>({
        name: '',
        email: '',
        contact: '',
        complaintResolved: '',
        complaintRemark: '',
        satisfaction: '',
        recommendation: '',
        recommendationRemark: '',
        additionalComments: ''
    });

    const user = useSelector((state: RootState) => state.user);
    const token = user.accessToken;

    const getGreeting = () => {
        const currentHour = new Date().getHours();
        if (currentHour >= 5 && currentHour < 12) return "Good Morning";
        if (currentHour >= 12 && currentHour < 17) return "Good Afternoon";
        if (currentHour >= 17 && currentHour < 21) return "Good Evening";
        return "Good Night";
    };

    const handleInputChange = (field: keyof FeedbackFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        // Basic validation
        if (!formData.name || !formData.email || !formData.contact ||
            !formData.complaintResolved || !formData.complaintRemark ||
            !formData.satisfaction || !formData.recommendation ||
            !formData.recommendationRemark || !formData.additionalComments) {
            Alert.alert("Error", "Please fill all required fields");
            return;
        }

        setIsSubmitting(true);


        try {
            const response = await userRequest({
                url: '/feedback/submit',
                method: 'post',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.contact,
                    complaint_resolved: formData.complaintResolved,
                    remarks1: formData.complaintRemark,
                    satisfaction: formData.satisfaction,
                    recommendation: formData.recommendation,
                    remarks2: formData.recommendationRemark,
                    comments: formData.additionalComments
                }
            });

            console.log("RESPONSE : ", response)

            if (response.status === 200 || response.status === 201) {
                Alert.alert("Success", "Thank you for your feedback!");
                // Reset form
                setFormData({
                    name: '',
                    email: user.email || '',
                    contact: '',
                    complaintResolved: '',
                    complaintRemark: '',
                    satisfaction: '',
                    recommendation: '',
                    recommendationRemark: '',
                    additionalComments: ''
                });
            } else {
                throw new Error(response.data.message || "Failed to submit feedback");
            }
        } catch (error) {
            console.error("Feedback submission error:", error);
            Alert.alert("Error", "Failed to submit feedback. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <View style={styles.container}>
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
                <View className="mt-20 flex-1 bg-white rounded-t-[2rem] border">
                    <View className="flex flex-row items-center ml-6 mt-2">
                        <Link href='/(auth)/home'>
                            <LeftArrow width={30} height={30} className="border border-gray-300" />
                        </Link>
                        <Text className="text-xl ml-2 font-medium text-[#1F486B]">Feedback</Text>
                    </View>

                    <View className="flex flex-row items-center justify-center w-12/12 mt-6">
                        <View className="flex-grow border-t border-[#1F486B]"></View>
                    </View>

                    <ScrollView className="flex-1 px-4">
                        {/* Form Fields */}
                        <View style={styles.formContainer}>
                            {/* Name Input */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Name<Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Your Name"
                                    placeholderTextColor="#1F486B80"
                                    value={formData.name}
                                    onChangeText={(text) => handleInputChange('name', text)}
                                />
                            </View>

                            {/* Email Input */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>E-mail<Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Your Email Id"
                                    placeholderTextColor="#1F486B80"
                                    keyboardType="email-address"
                                    value={formData.email || user.email}
                                    onChangeText={(text) => handleInputChange('email', text)}
                                />
                            </View>

                            {/* Contact Input */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Contact No.<Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Your Contact No."
                                    placeholderTextColor="#1F486B80"
                                    keyboardType="phone-pad"
                                    value={formData.contact}
                                    onChangeText={(text) => handleInputChange('contact', text)}
                                />
                            </View>

                            {/* 1. Complaint Resolution */}
                            <View style={styles.radioContainer}>
                                <Text style={styles.label}>1. Your Complaint resolved up to your satisfaction?<Text style={styles.required}>*</Text></Text>
                                <View style={styles.radioGroup}>
                                    <View style={styles.radioButton}>
                                        <RadioButton
                                            value="yes"
                                            status={formData.complaintResolved === 'yes' ? 'checked' : 'unchecked'}
                                            onPress={() => handleInputChange('complaintResolved', 'yes')}
                                            color="#1F486B"
                                        />
                                        <Text style={styles.radioLabel}>Yes</Text>
                                    </View>
                                    <View style={styles.radioButton}>
                                        <RadioButton
                                            value="no"
                                            status={formData.complaintResolved === 'no' ? 'checked' : 'unchecked'}
                                            onPress={() => handleInputChange('complaintResolved', 'no')}
                                            color="#1F486B"
                                        />
                                        <Text style={styles.radioLabel}>No</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Remarks for Question 1 */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Please mention your Remark<Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Enter Your Remarks"
                                    placeholderTextColor="#1F486B80"
                                    multiline
                                    numberOfLines={3}
                                    value={formData.complaintRemark}
                                    onChangeText={(text) => handleInputChange('complaintRemark', text)}
                                />
                            </View>

                            {/* 2. Satisfaction Level */}
                            <View style={styles.radioContainer}>
                                <Text style={styles.label}>2. Overall, how satisfied are you with our services?<Text style={styles.required}>*</Text></Text>
                                <View style={styles.satisfactionGroup}>
                                    {['Average', 'Good', 'Excellent', 'Not Good'].map((option) => (
                                        <View key={option} style={styles.radioButton}>
                                            <RadioButton
                                                value={option.toLowerCase()}
                                                status={formData.satisfaction === option.toLowerCase() ? 'checked' : 'unchecked'}
                                                onPress={() => handleInputChange('satisfaction', option.toLowerCase())}
                                                color="#1F486B"
                                            />
                                            <Text style={styles.radioLabel}>{option}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* 3. Recommendation */}
                            <View style={styles.radioContainer}>
                                <Text style={styles.label}>3. How likely are you to recommend Coreprix to your friends and colleagues?<Text style={styles.required}>*</Text></Text>
                                <View style={styles.radioGroup}>
                                    {['Always', 'Not Sure', 'Never'].map((option) => (
                                        <View key={option} style={styles.radioButton}>
                                            <RadioButton
                                                value={option.toLowerCase()}
                                                status={formData.recommendation === option.toLowerCase() ? 'checked' : 'unchecked'}
                                                onPress={() => handleInputChange('recommendation', option.toLowerCase())}
                                                color="#1F486B"
                                            />
                                            <Text style={styles.radioLabel}>{option}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Remarks for Question 3 */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Please mention your Remark<Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Enter Your Remarks"
                                    placeholderTextColor="#1F486B80"
                                    multiline
                                    numberOfLines={3}
                                    value={formData.recommendationRemark}
                                    onChangeText={(text) => handleInputChange('recommendationRemark', text)}
                                />
                            </View>

                            {/* 4. Additional Comments */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>4. If you would like to share any additional comments or experiences about our speed of service, Behavior of service centre representative, please write them below.<Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Enter your Comments/Suggestion"
                                    placeholderTextColor="#1F486B80"
                                    multiline
                                    numberOfLines={3}
                                    value={formData.additionalComments}
                                    onChangeText={(text) => handleInputChange('additionalComments', text)}
                                />
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#9DFE01" />
                                ) : (
                                    <Text style={styles.submitButtonText} className="w-full">Submit</Text>
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
    formContainer: {
        padding: 16,
        gap: 20,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        color: '#1F486B',
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '500',
    },
    required: {
        color: 'red',
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#1F486B',
        paddingVertical: 8,
        fontSize: 16,
        color: '#1F486B',
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
    satisfactionGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        gap: 10,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: '40%',
    },
    radioLabel: {
        color: '#1F486B',
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
        marginBottom: 40,
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
        textAlign: 'center'
    },
});

export default Feedback;