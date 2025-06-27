import { Text, View, TextInput, StyleSheet, Animated, TouchableOpacity, Modal, ScrollView, Platform, Vibration, KeyboardAvoidingView, TouchableWithoutFeedback } from "react-native";
import Avatar from "../assets/images/HomeScreen/Avatar.svg";
import Hamburger from "../assets/images/HomeScreen/HameBurger_3Line.svg";
import Calendar from '../assets/images/ServiceRequest/Calendar.svg';
// import AddIcon from '../assets/images/ServiceRequest/AddSignICon.svg';
import LeftArrow from '../assets/images/BackButtonLeftArrow.svg';
import Sidebar from "@/components/Sidebar";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Button } from "react-native-paper";
import DatePicker from 'react-native-ui-datepicker';
// import Barcode from '../assets/images/ServiceRequest/BarcodeScan.svg';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { userRequest } from '@/utils/requestMethods';
import ServiceCenterDropdown from "@/components/ServiceCenterDropdown";
import * as Clipboard from 'expo-clipboard';
import CopyIcon from '../assets/images/copy_icon.svg';
import SuccessIcon from '../assets/images/success.svg';
import { Link } from "expo-router";
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';

// import type { CameraType } from 'expo-camera';
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

    // console.log('Current User ID:', userId, 'Type:', typeof userId);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
    const [showBarcodeModal, setShowBarcodeModal] = useState(false);
    const [torch, setTorch] = useState(false); // For flashlight
    const animatedValue = useRef(new Animated.Value(0)).current;

    const [proofOfSaleImage, setProofOfSaleImage] = useState<string | null>(null);
    const [proofOfFaultImage, setProofOfFaultImage] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);



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

    useEffect(() => {
        if (userId) {
            setFormData(prev => ({
                ...prev,
                userId: userId
            }));
        }
    }, [userId]);

    console.log("CONSOLE LOG : USER ID : ", userId)

    const [formData, setFormData] = useState<FormData>(initialFormData);

    const [serialNoValidation, setSerialNoValidation] = useState({
        isValidating: false,
        isValid: false,
        error: null as string | null,
        productData: null as any | null
    });

    const fetchProductBySerialNo = async (serialNo: string) => {
        if (!serialNo || serialNo.trim() === '') {
            setSerialNoValidation({
                isValidating: false,
                isValid: false,
                error: null,
                productData: null
            });
            return;
        }

        setSerialNoValidation(prev => ({
            ...prev,
            isValidating: true,
            isValid: false,
            error: null
        }));

        try {
            const response = await userRequest({
                url: `/product/get-product-by-sl/${serialNo}`,
                method: "get",
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("Service Request Response: ", response);

            // Fixed: Check the correct path - response.data.data is the array
            if (response?.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
                setSerialNoValidation({
                    isValidating: false,
                    isValid: true,
                    error: null,
                    productData: response.data.data[0] // Access the first item in the array
                });
            } else {
                setSerialNoValidation({
                    isValidating: false,
                    isValid: false,
                    error: "Serial Number not found",
                    productData: null
                });
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            setSerialNoValidation({
                isValidating: false,
                isValid: false,
                error: "Error validating serial number",
                productData: null
            });
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProductBySerialNo(formData.serial_no);
        }, 500); // 500ms delay

        return () => clearTimeout(timeoutId);
    }, [formData.serial_no]);


    const updateFormField = (field: keyof FormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Add these functions to handle image picking
    const pickProofOfSaleImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Toast.show({
                    type: 'error',
                    text1: 'Permission required',
                    text2: 'We need access to your photos to upload proof',
                });
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8, // Reduced quality to make upload faster
                allowsMultipleSelection: false,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedImage = result.assets[0];
                console.log('Selected image:', {
                    uri: selectedImage.uri,
                    type: selectedImage.type,
                    fileSize: selectedImage.fileSize,
                    width: selectedImage.width,
                    height: selectedImage.height
                });

                setProofOfSaleImage(selectedImage.uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to select image'
            });
        }
    };

    const pickProofOfFaultImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Toast.show({
                    type: 'error',
                    text1: 'Permission required',
                    text2: 'We need access to your photos to upload proof',
                });
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8, // Reduced quality to make upload faster
                allowsMultipleSelection: false,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedImage = result.assets[0];
                console.log('Selected image:', {
                    uri: selectedImage.uri,
                    type: selectedImage.type,
                    fileSize: selectedImage.fileSize,
                    width: selectedImage.width,
                    height: selectedImage.height
                });

                setProofOfFaultImage(selectedImage.uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to select image'
            });
        }
    };

    const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
        const cleanedData = data.trim();

        if (!cleanedData) {
            Toast.show({
                type: 'error',
                text1: 'Empty Barcode',
                text2: 'No barcode detected'
            });
            return;
        }

        setScannedBarcode(cleanedData);
        setShowBarcodeModal(true);
        setIsCameraOpen(false);
        Vibration.vibrate(200);

        // Log for debugging
        console.log(`Scanned ${type} barcode: ${cleanedData}`);
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

    const CameraPermissionView = () => (
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
        if (!userId || isNaN(Number(userId))) {
            Toast.show({
                type: 'error',
                text1: 'Authentication Error',
                text2: 'Invalid user session. Please log in again.'
            });
            return;
        }

        // Validate required fields and images
        if (!proofOfSaleImage) {
            Toast.show({
                type: 'error',
                text1: 'Proof Required',
                text2: 'Please upload Proof of Sale Date'
            });
            return;
        }

        if (!proofOfFaultImage) {
            Toast.show({
                type: 'error',
                text1: 'Proof Required',
                text2: 'Please upload Proof of Fault Description'
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
            // Create proper FormData for React Native
            const formDataToSend = new FormData();

            // Helper function to get file extension and mime type
            const getFileInfo = (uri: string) => {
                const filename = uri.split('/').pop() || `file_${Date.now()}`;
                const match = /\.(\w+)$/.exec(filename);
                const extension = match ? match[1].toLowerCase() : 'jpg';

                // Map common extensions to MIME types
                const mimeTypes: { [key: string]: string } = {
                    'jpg': 'image/jpeg',
                    'jpeg': 'image/jpeg',
                    'png': 'image/png',
                    'gif': 'image/gif',
                    'bmp': 'image/bmp',
                    'webp': 'image/webp'
                };

                return {
                    name: filename,
                    type: mimeTypes[extension] || 'image/jpeg'
                };
            };

            // Append all text fields
            formDataToSend.append('userId', userId.toString());
            formDataToSend.append('serial_no', formData.serial_no);
            formDataToSend.append('tag_no', formData.tag_no || '');
            formDataToSend.append('dpp_no', formData.dpp_no || '');
            formDataToSend.append('sale_date', formatDateForAPI(formData.sale_date) || '');
            formDataToSend.append('fault_desc', formData.fault_desc);
            formDataToSend.append('status', 'pending');
            formDataToSend.append('cp_name', formData.cp_name);
            formDataToSend.append('cp_number', formData.cp_number);
            formDataToSend.append('cp_email', formData.cp_email);
            formDataToSend.append('street', formData.street);
            formDataToSend.append('city', formData.city);
            formDataToSend.append('state', formData.state);
            formDataToSend.append('postal_code', formData.postal_code);
            formDataToSend.append('country', formData.country);

            // Service center fields
            formDataToSend.append('name', formData.name);
            formDataToSend.append('address', formData.address);
            formDataToSend.append('pincode', formData.pincode);
            formDataToSend.append('contact', formData.contact);

            // FIXED: Proper file handling for React Native
            if (proofOfSaleImage) {
                const fileInfo = getFileInfo(proofOfSaleImage);

                // Correct way to append files in React Native
                formDataToSend.append('proof_of_sale_date', {
                    uri: proofOfSaleImage,
                    type: fileInfo.type,
                    name: fileInfo.name,
                } as any);
            }

            if (proofOfFaultImage) {
                const fileInfo = getFileInfo(proofOfFaultImage);

                // Correct way to append files in React Native
                formDataToSend.append('attachment', {
                    uri: proofOfFaultImage,
                    type: fileInfo.type,
                    name: fileInfo.name,
                } as any);
            }

            // Enhanced logging for debugging
            console.log('=== FORM DATA DEBUG ===');
            console.log('- userId:', userId.toString());
            console.log('- serial_no:', formData.serial_no);
            console.log('- proofOfSaleImage URI:', proofOfSaleImage);
            console.log('- proofOfFaultImage URI:', proofOfFaultImage);
            console.log('- FormData keys:', Object.keys(formDataToSend));

            // Alternative: Use fetch directly instead of userRequest for better control
            const response = await fetch(`https://rma-backend-98151578937.asia-south1.run.app/request/post-request`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                    // Note: Don't set Content-Type manually, let fetch handle it
                },
                body: formDataToSend,
            });

            const responseData = await response.json();

            if (response.ok && responseData?.rmainfo?.barcode_number) {
                setRmaId(responseData.rmainfo.barcode_number);
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'RMA request submitted successfully!'
                });
                setStep(3);
            } else {
                throw new Error(responseData?.message || 'Submission failed');
            }

        } catch (error: any) {
            console.error('=== SUBMISSION ERROR ===');
            console.error('Error details:', error);
            console.error('Error response:', error.response?.data);

            const errorMessage = error.response?.data?.errors?.map((err: any) => err.message).join(', ') ||
                error.response?.data?.message ||
                error.message ||
                'Failed to submit RMA request';

            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let animation;

        if (isCameraOpen) {
            // Reset animation value when camera opens
            animatedValue.setValue(0);

            animation = Animated.loop(
                Animated.sequence([
                    Animated.timing(animatedValue, {
                        toValue: 200,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animatedValue, {
                        toValue: 0,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ])
            );
            animation.start();
        }

        return () => {
            if (animation) {
                animation.stop();
            }
        };
    }, [isCameraOpen]); // Add isCameraOpen as dependency

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
                        placeholderTextColor="rgba(157, 254, 1, 0.6)"
                        className="border bg-[#1F486B] text-[#9DFE01] text-lg border-[#1F486B] rounded-xl p-3 mt-2"
                        style={styles.input}
                    />
                    <TouchableOpacity
                        className="absolute right-0 mt-0 p-1"
                        onPress={() => setIsCameraOpen(true)}
                        style={styles.barcodeButton}
                    >
                        <MaterialIcons name="qr-code-scanner" size={24} color="#9DFE01" />
                    </TouchableOpacity>
                    ``
                    {/* Validation status indicator */}
                    {serialNoValidation.isValidating && (
                        <ActivityIndicator
                            size="small"
                            color="#9DFE01"
                            style={styles.validationIndicator}
                        />
                    )}
                </View>

                {/* Validation message */}
                {formData.serial_no && !serialNoValidation.isValidating && (
                    <View style={styles.validationMessage}>
                        {serialNoValidation.isValid && serialNoValidation.productData ? (
                            <View style={styles.validMessage}>
                                <Text style={styles.validText}>✅ Serial Number Valid</Text>
                                {/* <Text style={styles.productInfo}>
                                    Model No: {serialNoValidation.productData?.model_no}
                                </Text> */}
                                {serialNoValidation.productData?.date_of_billing && (
                                    <Text style={styles.productInfo}>
                                        Date of Billing: {serialNoValidation.productData?.date_of_billing}
                                    </Text>
                                )}
                            </View>
                        ) : serialNoValidation.error ? (
                            <Text style={styles.errorText}>❌ {serialNoValidation.error}</Text>
                        ) : null}
                    </View>
                )}

                <Modal
                    visible={isCameraOpen}
                    transparent={true}
                    animationType="slide"
                    statusBarTranslucent={true}
                >
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.cameraContainer}>
                                {permission?.granted ? (
                                    <CameraView
                                        style={styles.camera}
                                        barcodeScannerSettings={{
                                            barcodeTypes: [
                                                "code128",   // For alphanumeric (most common)
                                                "ean13",     // For product barcodes
                                                "code39",    // For alphanumeric
                                                "upc_a",     // For 12-digit UPC
                                                "qr",        // For QR codes
                                                "codabar",   // For numeric with start/stop chars
                                                "itf14"      // For shipping labels
                                            ],
                                        }}
                                        onBarcodeScanned={scannedBarcode ? undefined : handleBarcodeScanned}
                                        enableTorch={torch}
                                    >
                                        <View style={styles.scannerOverlay}>
                                            <View style={styles.scannerFrame}>
                                                <Animated.View style={[styles.scanLine, { transform: [{ translateY: animatedValue }] }]} />
                                            </View>


                                            <Text style={styles.scanInstructionText}>
                                                Scan 12-digit barcode
                                            </Text>
                                        </View>
                                    </CameraView>
                                ) : (
                                    <CameraPermissionView />
                                )}
                            </View>

                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setIsCameraOpen(false)}
                            >
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showBarcodeModal}
                    onRequestClose={() => setShowBarcodeModal(false)}
                    statusBarTranslucent={true}
                >
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => setShowBarcodeModal(false)}>
                            <View style={styles.modalBackground} />
                        </TouchableWithoutFeedback>

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
                                        <Text style={[styles.modalButtonText, { color: '#1F486B' }]}>
                                            OK
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>


                <Text className="text-base ml-2 font-normal text-[#1F486B]">Product :  {serialNoValidation.productData?.model_no}</Text>



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
                                    className="right-0"
                                // style={styles.closeButton}
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
                        value={proofOfSaleImage ? 'Image selected' : ''}
                        editable={false}
                    />
                    <TouchableOpacity
                        className="absolute right-1 rounded-xl mt-3 bg-[#9DFE01] w-24 flex items-center justify-center h-12"
                        onPress={pickProofOfSaleImage}
                    >
                        <Text className="text-[#1F486B] text-lg font-medium">Browse</Text>
                    </TouchableOpacity>
                </View>

                {proofOfSaleImage && (
                    <TouchableOpacity onPress={() => setPreviewImage(proofOfSaleImage)}>
                        <Image
                            source={{ uri: proofOfSaleImage }}
                            style={imagePreviewStyles.imagePreview}
                        />
                    </TouchableOpacity>
                )}

                <View className="mb-2 w-full relative">
                    <TextInput
                        placeholder="Enter Fault Description*"
                        value={formData.fault_desc}
                        onChangeText={(value) => updateFormField('fault_desc', value)}
                        placeholderTextColor="rgba(157, 254, 1, 0.6)"
                        className="border bg-[#1F486B] text-[#9DFE01] text-lg border-[#1F486B] rounded-xl p-3 mt-2"
                        style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
                        multiline={true}
                        numberOfLines={3}
                    />
                </View>



                {/* Proof Of Fault Description Field */}
                <View className="mb-2 w-full relative">
                    <TextInput
                        placeholder="Proof Of Fault Description*"
                        placeholderTextColor="rgba(157, 254, 1, 0.6)"
                        className="border bg-[#1F486B] text-[#9DFE01] text-lg border-[#1F486B] rounded-xl px-3 py-2.5 mt-2"
                        style={styles.input}
                        value={proofOfFaultImage ? 'Image selected' : ''}
                        editable={false}
                    />
                    <TouchableOpacity
                        className="absolute right-1 rounded-xl mt-3 bg-[#9DFE01] w-24 flex items-center justify-center h-12"
                        onPress={pickProofOfFaultImage}
                    >
                        <Text className="text-[#1F486B] text-lg font-medium">Browse</Text>
                    </TouchableOpacity>
                </View>

                {proofOfFaultImage && (
                    <TouchableOpacity onPress={() => setPreviewImage(proofOfFaultImage)}>
                        <Image
                            source={{ uri: proofOfFaultImage }}
                            style={imagePreviewStyles.imagePreview}
                        />
                    </TouchableOpacity>
                )}

                <Modal
                    visible={!!previewImage}
                    transparent={true}
                    onRequestClose={() => setPreviewImage(null)}
                >
                    <View style={imagePreviewStyles.previewModalContainer}>
                        <Image
                            source={{ uri: previewImage || '' }}
                            style={imagePreviewStyles.previewImage}
                        />
                        <TouchableOpacity
                            style={imagePreviewStyles.closePreviewButton}
                            onPress={() => setPreviewImage(null)}
                        >
                            <Text style={{ color: '#9DFE01', fontSize: 20 }}>✕</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>

                {/* <View className="mb-2 w-full relative">
                    <TextInput
                        placeholder="Address"
                        placeholderTextColor="rgba(157, 254, 1, 0.6)"
                        className="border bg-[#1F486B] text-[#9DFE01] text-lg border-[#1F486B] rounded-xl p-3 mt-2"
                        style={styles.input}
                    />
                    <View className="absolute right-2 mt-5 bg-[#9DFE01] rounded-full p-1">
                        <AddIcon width={22} height={22} />
                    </View>
                </View> */}

                <View className="flex flex-row justify-between mb-5 items-center w-full">
                    <Button
                        mode="contained"
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.buttonLabel}
                        style={[
                            styles.button,
                            (!serialNoValidation.isValid || serialNoValidation.isValidating || !formData.serial_no.trim()) &&
                            styles.disabledButton
                        ]}
                        onPress={() => setStep(2)}
                        disabled={!serialNoValidation.isValid || serialNoValidation.isValidating || !formData.serial_no.trim()}
                    >
                        {serialNoValidation.isValidating ? (
                            <ActivityIndicator color="#9DFE01" />
                        ) : (
                            'Proceed'
                        )}
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

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackground: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    scannerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scannerFrame: {
        width: 220,
        height: 220,
        borderWidth: 2,
        borderColor: '#9DFE01',
        backgroundColor: 'transparent',
    },
    barcodeButton: {
        position: 'absolute',
        right: 10,
        top: 15,
        backgroundColor: 'rgba(157, 254, 1, 0.2)',
        borderRadius: 8,
        padding: 5,
    },
    scanLine: {
        height: 2,
        width: '100%',
        backgroundColor: '#9DFE01',
    },
    flashButton: {
        position: 'absolute',
        right: 16,
        top: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 20,
        padding: 8,
    },
    cameraPermissionContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        width: '100%',
        height: '100%',
    },
    message: {
        fontSize: 16,
        color: '#1F486B',
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    permissionButton: {
        backgroundColor: '#1F486B',
        borderColor: '#9DFE01',
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 8,
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
        bottom: 16,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 100,
        paddingHorizontal: 14,
        paddingVertical: 10,
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
    validationIndicator: {
        position: 'absolute',
        right: 50,
        top: 15,
    },
    validationMessage: {
        marginTop: 5,
        marginLeft: 10,
    },
    validMessage: {
        flexDirection: 'column',
    },
    validText: {
        color: '#4CAF50',
        fontSize: 14,
    },
    productInfo: {
        color: '#9DFE01',
        fontSize: 14,
        marginTop: 2,
    },

    disabledButton: {
        backgroundColor: '#6c757d',
        borderColor: '#6c757d',
    },
});

const imagePreviewStyles = StyleSheet.create({
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginTop: 8,
    },
    previewModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.9)',
    },
    previewImage: {
        width: '90%',
        height: '80%',
        resizeMode: 'contain',
    },
    closePreviewButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: '#1F486B',
        borderRadius: 20,
        padding: 10,
    },
    message: {
        fontSize: 16,
        color: '#1F486B',
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
});

export default ServiceRequest;