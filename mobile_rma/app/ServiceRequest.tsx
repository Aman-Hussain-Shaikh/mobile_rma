import { Text, View, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView ,Platform ,Vibration} from "react-native";
import Avatar from "../assets/images/HomeScreen/Avatar.svg";
import Hamburger from "../assets/images/HomeScreen/HameBurger_3Line.svg";
import Calendar from '../assets/images/ServiceRequest/Calendar.svg';
import AddIcon from '../assets/images/ServiceRequest/AddSignICon.svg';
import LeftArrow from '../assets/images/BackButtonLeftArrow.svg';
import Sidebar from "@/components/Sidebar";
import React, { useState } from "react";
import { Button } from "react-native-paper";
import DatePicker from 'react-native-ui-datepicker';
import Barcode from '../assets/images/ServiceRequest/BarcodeScan.svg';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { userRequest } from '@/utils/requestMethods';
import ServiceCenterDropdown from "@/components/ServiceCenterDropdown";
import * as Clipboard from 'expo-clipboard';
import CopyIcon from '../assets/images/copy_icon.svg';
import SuccessIcon from '../assets/images/success.svg';
import { Link } from "expo-router";
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { CameraType } from 'expo-camera';
import { MaterialIcons } from "@expo/vector-icons";

interface RootState {
    user: {
        firstname: string;
    };
}

const formatDateForDisplay = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const formatDateForAPI = (dateString: string) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
};

interface FormData {
    serial_no: string;
    tag_no: string;
    dpp_no: string;
    sale_date: string;
    fault_desc: string;
    status: string;
    userId: string | number;
    cp_name: string;
    cp_number: string;
    cp_email: string;
    street: string;
    city: string;
    postal_code: string;
    state: string;
    country: string;
    name: string;
    address: string;
    pincode: string;
    contact: string;
}

const ServiceRequest: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [dateError, setDateError] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [rmaId, setRmaId] = useState<number | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const token = useSelector((state: any) => state.user.accessToken);
    const userId = useSelector((state: any) => state.user.userId);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
    const [showBarcodeModal, setShowBarcodeModal] = useState(false);
    const [torch, setTorch] = useState(false); // For flashlight
 

    const initialFormData: FormData = {
        serial_no: '',
        tag_no: '',
        dpp_no: '',
        sale_date: '',
        fault_desc: '',
        status: 'pending',
        userId: userId,
        cp_name: '',
        cp_number: '',
        cp_email: '',
        street: '',
        city: '',
        postal_code: '',
        state: '',
        country: '',
        name: '',
        address: '',
        pincode: '',
        contact: '',
    };

    const [formData, setFormData] = useState<FormData>(initialFormData);

    const updateFormField = (field: keyof FormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
        console.log(`Barcode scan attempt - Type: ${type}, Data: ${data}`);
    
        // Clean the data (remove whitespace)
        const cleanedData = data.trim();
    
        // Check if the barcode is a 12-digit number
        const isValid12DigitNumeric = /^\d{12}$/.test(cleanedData);
    
        if (isValid12DigitNumeric) {
            console.log('Valid 12-digit barcode detected:', cleanedData);
            setScannedBarcode(cleanedData);
            setShowBarcodeModal(true);
            setIsCameraOpen(false);
    
            // Provide feedback with vibration
            if (Platform.OS === 'ios' || Platform.OS === 'android') {
                Vibration.vibrate(200);
            }
        } else {
            // Optional: Provide feedback that an invalid barcode was scanned
            console.log('Invalid barcode format. Expected 12-digit numeric barcode.');
            Toast.show({
                type: 'error',
                text1: 'Invalid Barcode',
                text2: 'Please scan a valid 12-digit barcode.',
            });
        }
    };

    const handleBarcodeConfirm = () => {
        if (scannedBarcode) {
            updateFormField('serial_no', scannedBarcode);
            setShowBarcodeModal(false);
            setScannedBarcode(null);
        }
    };

    const handleScanAgain = () => {
        setShowBarcodeModal(false);
        setScannedBarcode(null);
        setIsCameraOpen(true);
    };

    const handleDateSelect = (date: any) => {
        setSelectedDate(new Date(date.date));
        setDatePickerVisible(false);
        setDateError('');
        updateFormField('sale_date', formatDateForDisplay(new Date(date.date)));
    };

    const firstname = useSelector((state: RootState) => state?.user?.firstname);

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

    const handleCopyToClipboard = async () => {
        if (rmaId === null) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No RMA ID available to copy.'
            });
            return;
        }

        try {
            await Clipboard.setStringAsync(rmaId.toString());
            setCopySuccess(true);
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'RMA ID copied to clipboard!'
            });

            setTimeout(() => {
                setCopySuccess(false);
            }, 2000);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to copy to clipboard'
            });
        }
    };

    const handleServiceCenterSelect = (selectedCenter: {
        name: string;
        address: string;
        pincode: string;
        contact: string;
    }) => {
        setFormData(prev => ({
            ...prev,
            name: selectedCenter.name,
            address: selectedCenter.address,
            pincode: selectedCenter.pincode,
            contact: selectedCenter.contact
        }));
    };

    const submitRequest = async () => {
        if (!userId) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'User ID is required. Please ensure you are logged in.'
            });
            return;
        }

        const requiredFields = {
            serial_no: 'Serial Number',
            sale_date: 'Sale Date',
            fault_desc: 'Fault Description',
            street: 'Street Address',
            city: 'City',
            state: 'State',
            postal_code: 'Postal Code',
            country: 'Country',
            name: 'Service Center Name',
            address: 'Service Center Address',
            contact: 'Service Center Contact',
            pincode: 'Service Center Pincode'
        };

        for (const [field, label] of Object.entries(requiredFields)) {
            if (!formData[field as keyof FormData]) {
                Toast.show({
                    type: 'error',
                    text1: 'Required Field Missing',
                    text2: `Please enter ${label}`
                });
                return;
            }
        }

        setLoading(true);
        try {
            const requestData = {
                serial_no: formData.serial_no,
                tag_no: formData.tag_no || '',
                dpp_no: formData.dpp_no || '',
                sale_date: formatDateForAPI(formData.sale_date),
                fault_desc: formData.fault_desc,
                status: 'pending',
                cp_name: formData.cp_name,
                cp_number: formData.cp_number,
                cp_email: formData.cp_email,
                street: formData.street,
                city: formData.city,
                state: formData.state,
                postal_code: formData.postal_code,
                country: formData.country,
                name: formData.name,
                address: formData.address,
                pincode: formData.pincode,
                contact: formData.contact,
                userId: userId
            };

            console.log('Request Data:', requestData);

            const response = await userRequest({
                url: '/request/post-request',
                method: 'post',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: requestData
            });

            if (response?.data?.rmainfo?.id) {
                setRmaId(response.data.rmainfo.id);
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'RMA request submitted successfully!'
                });
                setStep(3);
                return response.data.rmainfo.id;
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.errors?.map((err: any) => err.message).join(', ') ||
                error.response?.data?.message ||
                error.message ||
                'Failed to submit RMA request';

            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage
            });
            console.error('Submission Error:', error.response?.data || error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const newRmaId = await submitRequest();
            if (newRmaId) {
                setStep(3);
            }
        } catch (error) {
            console.error('Submission failed:', error);
        }
    };

    if (!permission?.granted) {
        return (
            <View style={styles.cameraPermissionContainer}>
                <Text style={styles.message}>We need your permission to use the camera</Text>
                <Button
                    mode="contained"
                    onPress={requestPermission}
                    style={styles.permissionButton}
                >
                    Grant Permission
                </Button>
            </View>
        );
    }

    const renderStep1 = () => (
        <ScrollView className="mt-14 h-screen flex flex-col bg-white rounded-t-[2rem] border">
            <View className="flex flex-row items-center ml-6 mt-2">
                <Link href='/(auth)/home'>
                    <LeftArrow width={30} height={30} className="border border-gray-300" />
                </Link>
                <Text className="text-xl ml-2 font-medium text-[#1F486B]">New RMA Request</Text>
            </View>

            <View className="flex flex-row items-center justify-center w-12/12 mt-6">
                <View className="flex-grow border-t border-[#1F486B]"></View>
            </View>

            <View className="w-11/12 mt-2 flex m-auto">
                <View className="mb-5 w-full relative">
                    <TextInput
                        value={formData.serial_no}
                        onChangeText={(value) => updateFormField('serial_no', value)}
                        placeholder="Enter Serial Number"
                        placeholderTextColor="#9DFE01"
                        className="border bg-[#1F486B] text-[#9DFE01] text-lg border-[#1F486B] rounded-xl p-3 mt-2"
                        style={styles.input}
                    />
                    <TouchableOpacity
                        className="absolute right-0 mt-4 p-1"
                        onPress={() => setIsCameraOpen(true)}
                    >
                        <Barcode width={35} height={35} />
                    </TouchableOpacity>

                    
                </View>

                <Modal
    visible={isCameraOpen}
    transparent={true}
    animationType="slide"
>
    <View style={styles.modalContainer}>
        <View style={styles.cameraContainer}>
            {permission?.granted && (
                <CameraView
                    style={styles.camera}
                    barcodeScannerSettings={{
                        barcodeTypes: ["code128", "ean13", "code39"], // Supported barcode types
                    }}
                    onBarcodeScanned={scannedBarcode ? undefined : handleBarcodeScanned}
                    torch={torch ? "on" : "off"} // Flashlight control
                >
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setIsCameraOpen(false)}
                    >
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>

                    {/* Flashlight Button */}
                    {/* <TouchableOpacity
                        style={styles.flashButton}
                        onPress={() => setTorch((prev) => !prev)}
                    >
                        <MaterialIcons
                            name={torch ? "flash-on" : "flash-off"}
                            size={24}
                            color="#9DFE01"
                        />
                    </TouchableOpacity> */}

                    {/* Instruction Text */}
                    <Text style={styles.scanInstructionText}>
                        Scan 12-digit barcode
                    </Text>
                </CameraView>
            )}
        </View>
    </View>
</Modal>

<Modal
    visible={showBarcodeModal}
    transparent={true}
    animationType="slide"
>
    <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Scanned Barcode</Text>
            <Text style={styles.modalBarcode}>{scannedBarcode}</Text>

            <View style={styles.modalButtons}>
                <TouchableOpacity
                    style={[styles.modalButton, styles.buttonScanAgain]}
                    onPress={handleScanAgain}
                >
                    <Text style={styles.modalButtonText}>Scan Again</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.modalButton, styles.buttonConfirm]}
                    onPress={handleBarcodeConfirm}
                >
                    <Text style={styles.modalButtonText}>OK</Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>
</Modal>


                <Text className="text-xl ml-2 font-normal text-[#1F486B]">Product :</Text>

                <View className="mb-2 w-full relative">
                    <TextInput
                        placeholder="Enter Tag Number (Optional)"
                        onChangeText={(value) => updateFormField('tag_no', value)}
                        placeholderTextColor="rgba(157, 254, 1, 0.6)"
                        className="border bg-[#1F486B] text-[#9DFE01] text-lg border-[#1F486B] rounded-xl p-3 mt-2"
                        style={styles.input}
                    />
                </View>

                <View className="mb-2 w-full relative">
                    <TextInput
                        placeholder="Enter Your DPP Code (Optional)"
                        placeholderTextColor="rgba(157, 254, 1, 0.6)"
                        onChangeText={(value) => updateFormField('dpp_no', value)}
                        className="border bg-[#1F486B] text-[#9DFE01] text-lg border-[#1F486B] rounded-xl p-3 mt-2"
                        style={styles.input}
                    />
                </View>

                <View className="mb-2 w-12/12 relative ">
                    <TouchableOpacity
                        onPress={() => setDatePickerVisible(true)}
                        className="relative"
                    >
                        <TextInput
                            placeholder="Enter Sale Date* (DD/MM/YYYY)"
                            value={selectedDate ? formatDateForDisplay(selectedDate) : ''}
                            editable={false}
                            placeholderTextColor="rgba(157, 254, 1, 0.6)"
                            className="border bg-[#1F486B] text-[#9DFE01] text-lg border-[#1F486B] rounded-xl p-3 mt-2"
                            style={styles.input}
                        />
                        <View className="absolute right-3 mt-5">
                            <Calendar width={25} height={25} />
                        </View>
                    </TouchableOpacity>
                    {dateError ? (
                        <Text style={styles.errorText}>{dateError}</Text>
                    ) : null}
                </View>

                <Modal
                    visible={isDatePickerVisible}
                    transparent={true}
                    animationType="slide"
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.datePickerContainer}>
                            <View style={styles.datePickerHeader}>
                                <Text style={styles.datePickerTitle}>Select Date</Text>
                                <TouchableOpacity
                                    onPress={() => setDatePickerVisible(false)}
                                    style={styles.closeButton}
                                >
                                    <Text style={styles.closeButtonText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                            <DatePicker
                                mode="single"
                                date={selectedDate || new Date()}
                                onChange={handleDateSelect}
                                locale="en"
                                selectedItemColor="#1F486B"
                                calendarTextStyle={{ color: '#1F486B' }}
                                headerTextStyle={{ color: '#1F486B' }}
                            />
                        </View>
                    </View>
                </Modal>

                <View className="mb-2 w-full relative">
                    <TextInput
                        placeholder="Proof Of Sale Date*"
                        placeholderTextColor="rgba(157, 254, 1, 0.6)"
                        className="border bg-[#1F486B] text-[#9DFE01] text-lg border-[#1F486B] rounded-xl px-3 py-2.5 mt-2"
                        style={styles.input}
                    />
                    <View className="absolute right-1 rounded-xl mt-3 bg-[#9DFE01] w-24 flex items-center justify-center h-12">
                        <Text className="text-[#1F486B] text-lg font-medium">Browse</Text>
                    </View>
                </View>

                <View className="mb-2 w-full relative">
                    <TextInput
                        placeholder="Fault Description*"
                        placeholderTextColor="rgba(157, 254, 1, 0.6)"
                        className="border bg-[#1F486B] text-[#9DFE01] text-lg border-[#1F486B] rounded-xl p-3 mt-2"
                        style={styles.input}
                        onChangeText={(value) => updateFormField('fault_desc', value)}
                        multiline={true}
                        numberOfLines={3}
                    />
                </View>

                <View className="mb-2 w-full relative">
                    <TextInput
                        placeholder="Proof Of Fault Description*"
                        placeholderTextColor="rgba(157, 254, 1, 0.6)"
                        className="border bg-[#1F486B] text-[#9DFE01] text-lg border-[#1F486B] rounded-xl p-3 mt-2"
                        style={styles.input}
                    />
                    <View className="absolute right-1 rounded-xl mt-3 bg-[#9DFE01] w-24 flex items-center justify-center h-12">
                        <Text className="text-[#1F486B] text-lg font-medium">Browse</Text>
                    </View>
                </View>

                <View className="mb-2 w-full relative">
                    <TextInput
                        placeholder="Address"
                        placeholderTextColor="rgba(157, 254, 1, 0.6)"
                        className="border bg-[#1F486B] text-[#9DFE01] text-lg border-[#1F486B] rounded-xl p-3 mt-2"
                        style={styles.input}
                    />
                    <View className="absolute right-2 mt-5 bg-[#9DFE01] rounded-full p-1">
                        <AddIcon width={22} height={22} />
                    </View>
                </View>

                <View className="flex flex-row justify-between mb-5 items-center w-full">
                    <Button
                        mode="contained"
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.buttonLabel}
                        style={styles.button}
                        onPress={() => setStep(2)}
                    >
                        Proceed
                    </Button>
                </View>
            </View>
        </ScrollView>
    );

    const renderStep2 = () => (
        <ScrollView className="mt-14 h-screen flex flex-col bg-white rounded-t-[2rem] border">
            <View className="flex flex-row items-center ml-6 mt-2">
                <TouchableOpacity onPress={() => setStep(1)}>
                    <LeftArrow width={30} height={30} className="border border-gray-300" />
                </TouchableOpacity>
                <Text className="text-xl ml-2 font-medium text-[#1F486B]">Select Service Center & Address</Text>
            </View>

            <View className="w-11/12 mt-2 flex m-auto">
                <ServiceCenterDropdown onSelect={handleServiceCenterSelect} />

                {/* Customer Address Form */}
                <View className="mt-6">
                    <Text className="text-xl text-[#1F486B] mb-4">Address Details*</Text>

                    <TextInput
                        placeholder="Contact Person Name"
                        value={formData.cp_name}
                        onChangeText={(value) => updateFormField('cp_name', value)}
                        placeholderTextColor="rgba(157, 254, 1, 0.6)"
                        className="border bg-[#1F486B] text-[#9DFE01] text-lg border-[#1F486B] rounded-xl p-3 mb-3"
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Contact Person Number"
                        value={formData.cp_number}
                        onChangeText={(value) => updateFormField('cp_number', value)}
                        placeholderTextColor="rgba(157, 254, 1, 0.6)"
                        className="border bg-[#1F486B] text-[#9DFE01] text-lg border-[#1F486B] rounded-xl p-3 mb-3"
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Email"
                        value={formData.cp_email}
                        onChangeText={(value) => updateFormField('cp_email', value)}
                        placeholderTextColor="rgba(157, 254, 1, 0.6)"
                        className="border bg-[#1F486B] text-[#9DFE01] text-lg border-[#1F486B] rounded-xl p-3 mb-3"
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Street"
                        value={formData.street}
                        onChangeText={(value) => updateFormField('street', value)}
                        placeholderTextColor="rgba(157, 254, 1, 0.6)"
                        className="border bg-[#1F486B] text-[#9DFE01] text-lg border-[#1F486B] rounded-xl p-3 mb-3"
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="City"
                        value={formData.city}
                        onChangeText={(value) => updateFormField('city', value)}
                        placeholderTextColor="rgba(157, 254, 1, 0.6)"
                        className="border bg-[#1F486B] text-[#9DFE01] text-lg border-[#1F486B] rounded-xl p-3 mb-3"
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Postal Code"
                        value={formData.postal_code}
                        onChangeText={(value) => updateFormField('postal_code', value)}
                        placeholderTextColor="rgba(157, 254, 1, 0.6)"
                        className="border bg-[#1F486B] text-[#9DFE01] text-lg border-[#1F486B] rounded-xl p-3 mb-3"
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="State"
                        value={formData.state}
                        onChangeText={(value) => updateFormField('state', value)}
                        placeholderTextColor="rgba(157, 254, 1, 0.6)"
                        className="border bg-[#1F486B] text-[#9DFE01] text-lg border-[#1F486B] rounded-xl p-3 mb-3"
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Country"
                        value={formData.country}
                        onChangeText={(value) => updateFormField('country', value)}
                        placeholderTextColor="rgba(157, 254, 1, 0.6)"
                        className="border bg-[#1F486B] text-[#9DFE01] text-lg border-[#1F486B] rounded-xl p-3 mb-3"
                        style={styles.input}
                    />
                </View>

                <View className="flex flex-row justify-between items-center w-full  mb-4">
                    <Button
                        mode="contained"
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.buttonLabel}
                        style={styles.button}
                        onPress={submitRequest}
                        loading={loading}
                        disabled={loading}
                    >
                        SUBMIT
                    </Button>
                </View>
            </View>
        </ScrollView>
    );
    const renderStep3 = () => (
        <ScrollView className="mt-14 h-screen flex flex-col bg-white rounded-t-[2rem] border">
            <View className="flex flex-row items-center ml-6 mt-2">
                <LeftArrow width={30} height={30} className="border border-gray-300" />
                <Text className="text-xl ml-2 font-medium text-[#1F486B]">Success</Text>
            </View>

            <View className="w-11/12 mt-6 flex m-auto">
                <View className="bg-[#1F486B] p-5 rounded-xl flex flex-col items-center">
                    <SuccessIcon width={60} height={60} />
                    <View className="ml-1 mt-10">
                        <Text className="text-[#9DFE01] text-lg">
                            Congratulations! Your RMA Request has been submitted.
                        </Text>
                        <View className="flex flex-row items-center mt-4">
                            <Text className="text-[#9DFE01] text-base">
                                Your RMA application number: {rmaId}
                            </Text>
                            <TouchableOpacity
                                onPress={handleCopyToClipboard}
                                className="ml-2"
                                style={[
                                    styles.copyButton,
                                    copySuccess && styles.copyButtonSuccess
                                ]}
                            >
                                <CopyIcon
                                    width={20}
                                    height={20}
                                    color={copySuccess ? "#9DFE01" : "#FFFFFF"}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View className="bg-[#1F486B] p-6 rounded-xl mt-6">
                    <Text className="text-[#9DFE01] text-lg font-bold mb-4">NOTE!</Text>
                    <Text className="text-[#9DFE01] text-base mb-2">
                        1. Please Note The RMA Application Number For Future Tracking
                    </Text>
                    <Text className="text-[#9DFE01] text-base">
                        2. Use the RMA Status To Check The Status Of Your RMA Application
                    </Text>
                </View>
            </View>
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            <View className="bg-[#1F486B] flex flex-1 flex-col">
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

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </View>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <Toast />
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
    datePickerContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        maxWidth: 400,
    },
    datePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    datePickerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F486B',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 20,
        padding: 10,
    },
    closeButtonText: {
        fontSize: 20,
        color: '#000',
    },
    errorText: {
        color: 'red',
        marginTop: 5,
        marginLeft: 5,
    },
    button: {
        width: '100%',
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
        marginTop: 5,
    },
    buttonContent: {
        paddingVertical: 3,
        paddingHorizontal: 16,
    },
    buttonLabel: {
        color: '#9DFE01',
        fontSize: 14,
        fontWeight: 'bold',
    },
    copyButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    copyButtonSuccess: {
        backgroundColor: 'rgba(157, 254, 1, 0.2)',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    cameraContainer: {
        width: '100%',
        height: '100%',
    },
    camera: {
        flex: 1,
    },
   
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#1F486B',
    },
    modalBarcode: {
        fontSize: 16,
        marginBottom: 20,
        color: '#1F486B',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        minWidth: 100,
        alignItems: 'center',
    },
    buttonScanAgain: {
        backgroundColor: '#666',
        marginRight: 10,
    },
    buttonConfirm: {
        backgroundColor: '#1F486B',
        marginLeft: 10,
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },

    
    flashButton: {
        position: 'absolute',
        right: 16,
        top: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 20,
        padding: 8,
    },
    scanInstructionText: {
        position: 'absolute',
        bottom: 20,
        color: '#9DFE01',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 8,
        borderRadius: 4,
        fontSize: 14,
        fontWeight: 'bold',
    },
   
   
});
export default ServiceRequest;