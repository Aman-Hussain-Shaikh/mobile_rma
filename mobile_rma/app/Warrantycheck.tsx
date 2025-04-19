import { Vibration, Animated, Text, View, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Modal, Pressable, TouchableWithoutFeedback } from "react-native";
import Avatar from "../assets/images/HomeScreen/Avatar.svg";
import Hamburger from "../assets/images/HomeScreen/HameBurger_3Line.svg";
import LeftArrow from '../assets/images/BackButtonLeftArrow.svg';
import Rectangle from '../assets/images/Warranty/Rectangle.svg';
import Line from '../assets/images/Warranty/Line.svg';
import Flash from '../assets/images/Warranty/Flash.svg';
import InsideBorder from '../assets/images/Warranty/InsideBorder.svg';
import { MaterialIcons } from '@expo/vector-icons';

import Sidebar from "@/components/Sidebar";
import BottomSheet from "@/components/BottomSheet";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "react-native-paper";
import { useSelector } from "react-redux";
import { Link } from "expo-router";
import { userRequest } from "@/utils/requestMethods";
import { useQuery } from "react-query";
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';


interface RootState {
    user: {
        firstname: string;
        accessToken: string;
    };
}

interface ProductData {
    id: number;
    serial_no: string;
    model_no: string;
    billing_date: string;
    createdAt: string;
}

interface WarrantyDetails {
    warrantyStatus: string;
    warrantyLeft: string;
}

const Warrantycheck = () => {
    // State management
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [serialNumber, setSerialNumber] = useState('');
    const [searchTriggered, setSearchTriggered] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [torch, setTorch] = useState(false);
    const animatedValue = useRef(new Animated.Value(0)).current;

    // New state variables for camera functionality
    const [facing, setFacing] = useState<CameraType>('back');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
    const [permission, requestPermission] = useCameraPermissions();


   
    // Handle barcode scanning
    const handleBarcodeScanned = ({ type, data }) => {
        console.log(`Barcode scan attempt - Type: ${type}, Data: ${data}`);

        // Clean the data (remove whitespace)
        const cleanedData = data.trim();

        // Check if the barcode is a 12-digit number
        const isValid12DigitNumeric = /^\d{12}$/.test(cleanedData);

        if (isValid12DigitNumeric) {
            console.log('Valid 12-digit barcode detected:', cleanedData);
            setScannedBarcode(cleanedData);
            setIsModalVisible(true);

            // Provide feedback with vibration
            if (Platform.OS === 'ios' || Platform.OS === 'android') {
                Vibration.vibrate(200);
            }
        } else {
            // Optional: Provide feedback that an invalid barcode was scanned
            console.log('Invalid barcode format. Expected 12-digit numeric barcode.');
            // You could show a brief toast message here if desired
        }
    };


    // Handle scanning confirmation
    const handleScanConfirm = () => {
        setSerialNumber(scannedBarcode || '');
        setScannedBarcode(null);
        setIsModalVisible(false);
    };

    // Handle scan again
    const handleScanAgain = () => {
        setScannedBarcode(null);
        setIsModalVisible(false);
    };




    // Refs
    const inputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    // Redux selectors
    const firstname = useSelector((state: RootState) => state?.user?.firstname);
    const token = useSelector((state: RootState) => state?.user?.accessToken);

    // Keyboard event listeners
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
                // Scroll to input field when keyboard appears
                if (scrollViewRef.current) {
                    scrollViewRef.current.scrollToEnd({ animated: true });
                }
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        // Initialize input focus
        if (inputRef.current) {
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 100);
        }

        // Cleanup listeners
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    // API integration
    const getWarrantyStatusMethod = () => {
        if (!searchTriggered || !serialNumber) return null;
        setIsSearching(true);
        return userRequest({
            url: `/product/get-product-by-sl/${serialNumber}/`,
            method: "get",
            headers: { Authorization: `Bearer ${token}` }
        });
    };

    const { data: warrantyResult, isLoading } = useQuery(
        ["check-warranty-status", serialNumber],
        getWarrantyStatusMethod,
        {
            enabled: searchTriggered,
            onSuccess: (res) => {
                setIsBottomSheetOpen(true);
                setSearchTriggered(false);
                setIsSearching(false);
            },
            onError: (error) => {
                console.error("API Error:", error);
                setSearchTriggered(false);
                setIsSearching(false);
                // Add error handling here
            }
        }
    );

    // Utility functions
    const getGreeting = () => {
        const currentHour = new Date().getHours();
        if (currentHour >= 5 && currentHour < 12) return "Good Morning";
        if (currentHour >= 12 && currentHour < 17) return "Good Afternoon";
        if (currentHour >= 17 && currentHour < 21) return "Good Evening";
        return "Good Night";
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

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const handleSearchPress = () => {
        if (serialNumber.trim()) {
            setSearchTriggered(true);
            Keyboard.dismiss();
        }
    };

    const calculateWarrantyDetails = (createdDate: string): { status: string; daysLeft: string } => {
        const purchaseDate = new Date(createdDate);
        const currentDate = new Date();
        const warrantyEndDate = new Date(purchaseDate);
        warrantyEndDate.setFullYear(warrantyEndDate.getFullYear() + 2);
        const timeLeft = warrantyEndDate.getTime() - currentDate.getTime();
        const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

        if (daysLeft <= 0) {
            return {
                status: "Out of Warranty",
                daysLeft: "Warranty Expired"
            };
        } else {
            const years = Math.floor(daysLeft / 365);
            const remainingDays = daysLeft % 365;

            let timeLeftString = "";
            if (years > 0) {
                timeLeftString += `${years} year${years > 1 ? 's' : ''} `;
            }
            if (remainingDays > 0 || years === 0) {
                timeLeftString += `${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
            }
            return {
                status: "In Warranty",
                daysLeft: timeLeftString
            };
        }
    };

    // Add this useEffect for the scanner line animation
    useEffect(() => {
        Animated.loop(
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
        ).start();
    }, []);

    // Add this function to toggle the flashlight
    const toggleTorch = () => {
        setTorch(prev => !prev);
    };

    // Warranty details content component for bottom sheet
    const WarrantyDetailsContent = () => {
        if (isLoading) {
            return (
                <View className="p-4 items-center justify-center">
                    <ActivityIndicator size="large" color="#9DFE01" />
                    <Text className="text-[#9DFE01] mt-2">Loading warranty details...</Text>
                </View>
            );
        }

        const warrantyData = warrantyResult?.data?.[0];
        const warrantyInfo = warrantyData ? calculateWarrantyDetails(warrantyData.createdAt) : null;

        return (
            <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
                <Text className="text-[#9DFE01] text-2xl mb-6">Warranty Details</Text>
                <View className="border-b border-[#9DFE01] mb-10" />

                <View className="mb-8">
                    <Text className="text-[#9DFE01] text-lg mb-2">Serial Number</Text>
                    <Text className="text-white text-base">
                        {warrantyData?.serial_no || 'N/A'}
                    </Text>
                    <View className="border-b border-[#9DFE01] mt-3" />
                </View>

                <View className="mb-8">
                    <Text className="text-[#9DFE01] text-lg mb-2">Model Number</Text>
                    <Text className="text-white text-base">
                        {warrantyData?.model_no || 'N/A'}
                    </Text>
                    <View className="border-b border-[#9DFE01] mt-3" />
                </View>

                <View className="mb-8">
                    <Text className="text-[#9DFE01] text-lg mb-2">Status</Text>
                    <Text className="text-white text-base">
                        {warrantyInfo?.status || 'N/A'}
                    </Text>
                    <View className="border-b border-[#9DFE01] mt-3" />
                </View>

                <View className="mb-8">
                    <Text className="text-[#9DFE01] text-lg mb-2">Warranty Period</Text>
                    <Text className="text-white text-base">
                        {warrantyInfo?.daysLeft || 'N/A'}
                    </Text>
                    <View className="border-b border-[#9DFE01] mt-3" />
                </View>

                <View className="">
                    <Text className="text-[#9DFE01] text-sm">
                        • Note! Finding Difficulty With Warranty Status? Contact Us
                    </Text>
                </View>

                <TouchableOpacity
                    className="bg-[#1F486B] border border-[#9DFE01] rounded-lg py-3 px-6 mt-6 items-center"
                    onPress={() => setIsBottomSheetOpen(false)}
                >
                    <Text className="text-[#9DFE01] font-bold text-lg">Close</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
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

                {/* Main content section */}
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="mt-20 h-screen flex flex-col bg-white rounded-t-[2rem] border">
                        <View className="flex flex-row items-center ml-6 mt-2">
                            <Link href='/(auth)/home'>
                                <LeftArrow width={30} height={30} className="border border-gray-300" />
                            </Link>
                            <Text className="text-xl ml-2 font-medium text-[#1F486B]">Warranty Check</Text>
                        </View>

                        {/* Camera Scanner Section */}
                        <View className="flex items-center justify-center mt-6" style={{ height: 290 }}>
                            {!permission?.granted ? (
                                <CameraPermissionView />
                            ) : (
                                <View style={styles.cameraContainer}>
                                    <CameraView
                                        style={styles.camera}
                                        type={facing}
                                        barcodeScannerSettings={{
                                            // Focus on linear barcode formats that typically contain numeric codes
                                            barcodeTypes: ["code128", "ean13", "code39"],
                                        }}
                                        onBarcodeScanned={scannedBarcode ? undefined : handleBarcodeScanned}
                                        torch={torch ? "on" : "off"}
                                    >
                                        <View style={styles.scannerOverlay}>
                                            <View style={styles.scannerFrame}>
                                                {/* Add scanning line animation */}
                                                <Animated.View style={[styles.scanLine, { transform: [{ translateY: animatedValue }] }]} />
                                            </View>

                                            {/* Flash/Torch button */}
                                            {/* <TouchableOpacity
                                                style={styles.flashButton}
                                                onPress={toggleTorch}
                                            >
                                                <MaterialIcons
                                                    name={torch ? "flash-on" : "flash-off"}
                                                    size={24}
                                                    color="#9DFE01"
                                                />
                                            </TouchableOpacity> */}

                                            {/* Instruction text */}
                                            <Text style={styles.scanInstructionText}>
                                                Scan 12-digit barcode
                                            </Text>
                                        </View>
                                    </CameraView>
                                </View>
                            )}

                            <Modal
                                animationType="fade"
                                transparent={true}
                                visible={isModalVisible}
                                onRequestClose={() => setIsModalVisible(false)}
                                statusBarTranslucent={true} // This helps with proper positioning
                            >
                                <View style={styles.modalOverlay}>
                                    <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
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
                                                    onPress={handleScanConfirm}
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
                        </View>

                        {/* Scanner section */}
                        {/* <View className="flex items-center justify-center mt-6">
                            <View className="relative flex items-center justify-center">
                                <Rectangle height={290} width={290} />
                                <View className="absolute">
                                    <InsideBorder height={220} width={220} />
                                </View>
                                <View className="absolute">
                                    <Line height={150} width={210} />
                                </View>
                                <View className="absolute right-0">
                                    <Flash height={35} width={35} />
                                </View>
                            </View>
                            <Text className="text-xs font-medium text-[#1F486B] mt-6">
                                Place A Bar Code Of Serial Number Inside The View Finder Rectangle To Scan It
                            </Text>
                        </View> */}

                        {/* Search section - now positioned to be visible with keyboard */}
                        <View className={`bg-[#1F486B] rounded-t-[1.8rem] ${keyboardVisible ? 'mt-10' : 'absolute bottom-[6.5rem]'} w-full`} style={keyboardVisible ? { paddingBottom: 110 } : { height: 270 }}>
                            <Text className="text-[#9DFE01] text-xl text-center mt-6">
                                Check Warranty With Serial No
                            </Text>

                            <View className="flex flex-row items-center justify-center w-12/12 mt-6">
                                <View className="flex-grow border-t border-[#9DFE01]"></View>
                            </View>

                            <View className="flex items-center justify-center mx-4 mt-3">
                                <TextInput
                                    ref={inputRef}
                                    placeholder="Enter Serial Number"
                                    placeholderTextColor="rgba(31,72,107, 0.6)"
                                    value={serialNumber}
                                    onChangeText={setSerialNumber}
                                    className="border bg-[#9DFE01] text-[rgb(31,72,107)] text-xl placeholder:font-bold w-full border-[#1F486B] rounded-xl p-2 mt-2"
                                    style={styles.input}
                                    keyboardType="numeric"
                                />

                                <View className="flex flex-row justify-center mt-3 items-center w-full">
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
                        </View>
                    </View>
                </ScrollView>
            </View>

            {/* Scanned Barcode Modal */}


            {/* Sidebar and BottomSheet components */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <BottomSheet
                isOpen={isBottomSheetOpen}
                onClose={() => setIsBottomSheetOpen(false)}
            >
                <WarrantyDetailsContent />
            </BottomSheet>
        </KeyboardAvoidingView>
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
    cameraContainer: {
        width: 290,
        height: 290,
        overflow: 'hidden',
        borderRadius: 20,
    },
    camera: {
        flex: 1,
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
    modalOverlay: {
        flex: 1,
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalBackground: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },


    modalContainer: {
        // Remove absolute positioning to allow natural centering
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },

    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        width: 320,
        maxWidth: '90%',
        // Remove any position-related properties
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },

   

    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 12,
    },

    modalButton: {
        flex: 1,
        borderRadius: 10,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },

    buttonScanAgain: {
        backgroundColor: '#1F486B',
    },

    buttonConfirm: {
        backgroundColor: '#9DFE01',
    },

    modalButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
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
        width: 290,
        height: 290,
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
    // If you want to make the modal message more specific:
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F486B',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalBarcode: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F486B',
        marginBottom: 24,
        textAlign: 'center',
        width: '100%',
        letterSpacing: 1, // Spacing between digits for better readability
    },

});
export default Warrantycheck;