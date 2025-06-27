import { Text, View, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Keyboard, FlatList, Modal, KeyboardAvoidingView, TouchableWithoutFeedback, Platform, Vibration, Animated } from "react-native";
import Avatar from "../assets/images/HomeScreen/Avatar.svg";
import Hamburger from "../assets/images/HomeScreen/HameBurger_3Line.svg";
import { BackHandler } from 'react-native';
import * as Print from 'expo-print';
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
import { Barcode } from "@/components/Barcode";

// Socail Media Icons
import Facebook from "../assets/images/HomeScreen/FaceBook.svg";
import Youtube from "../assets/images/HomeScreen/Youtube.svg";
import Instagram from "../assets/images/HomeScreen/Instagram.svg";
import X from "../assets/images/HomeScreen/X.svg";

import Sidebar from "@/components/Sidebar";
import LeftArrow from '../assets/images/BackButtonLeftArrow.svg';
import React, { useEffect, useRef, useState } from "react";
import { MaterialIcons, FontAwesome, Feather } from '@expo/vector-icons';
import RMADetailsContent from "@/components/RMADetailsContent";

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
import * as Clipboard from 'expo-clipboard';
import Toast from "react-native-toast-message";
// Barcode scanner imports
import { CameraView, useCameraPermissions } from 'expo-camera';

interface RootState {
    user: {
        firstname: string;
        userId: string;
    };
}

interface RMARequest {
    id: number;
    serial_no: string;
    barcode_number: string;
    status: string;
    createdAt: string;
    fault_desc: string;
}

const RMAStatus = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [rmaNumber, setRmaNumber] = useState('');
    const [searchTriggered, setSearchTriggered] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [rmaHistory, setRmaHistory] = useState<RMARequest[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Barcode scanner states
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
    const [showBarcodeModal, setShowBarcodeModal] = useState(false);
    const [torch, setTorch] = useState(false);
    const animatedValue = useRef(new Animated.Value(0)).current;

    // Input validation state
    const [inputError, setInputError] = useState('');

    const inputRef = useRef<TextInput>(null);
    const isEditingRef = useRef(false);

    const token = useSelector((state: any) => state.user.accessToken);
    const firstname = useSelector((state: RootState) => state?.user?.firstname);
    const userId = useSelector((state: RootState) => state?.user?.userId);

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
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 100);
        }
    }, []);

    // Barcode scanner animation
    // Replace the existing animation useEffect with this:
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

    const showToast = (type: 'success' | 'error', title: string, message: string) => {
        Toast.show({
            type,
            text1: title,
            text2: message,
            position: 'top',
            visibilityTime: 4000,
            autoHide: true,
            topOffset: 50,
            text1Style: styles.toastTitle,
            text2Style: styles.toastMessage,
        });
    };

    // Barcode handling functions
    const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
        console.log(`Barcode scan attempt - Type: ${type}, Data: ${data}`);

        const cleanedData = data.trim();

        // Just check if there's any data
        if (cleanedData) {
            console.log('Barcode detected:', cleanedData);
            setScannedBarcode(cleanedData);
            setShowBarcodeModal(true);
            setIsCameraOpen(false);
            setInputError(''); // Clear any previous errors

            if (Platform.OS === 'ios' || Platform.OS === 'android') {
                Vibration.vibrate(200);
            }
        } else {
            console.log('Empty barcode data');
            showToast('error', 'Invalid Barcode', 'Please scan a valid RMA number.');
        }
    };


    const handleBarcodeConfirm = () => {
        if (scannedBarcode) {
            setRmaNumber(scannedBarcode);
            setShowBarcodeModal(false);
            setScannedBarcode(null);
            setInputError(''); // Clear any previous errors
        }
    };

    const handleScanAgain = () => {
        setShowBarcodeModal(false);
        setScannedBarcode(null);
        setIsCameraOpen(true);
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

    const fetchRMAHistory = async () => {
        try {
            setLoadingHistory(true);
            const response = await userRequest({
                url: `/request/get-user-requests/${userId}`,
                method: "get",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response?.data) {
                setRmaHistory(response.data);
            }
        } catch (error) {
            console.error("Error fetching RMA history:", error);
            showToast('error', 'Error', 'Failed to load RMA history');
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (showHistory && userId) {
            fetchRMAHistory();
        }
    }, [showHistory, userId]);

    const { data: rmaResult, isLoading } = useQuery(
        ["check-rma-status", rmaNumber],
        getRMAStatusMethod,
        {
            enabled: searchTriggered,
            onSuccess: (res) => {
                setIsBottomSheetOpen(true);
                setSearchTriggered(false);
                setIsSearching(false);
                setInputError(''); // Clear any previous errors
            },
            onError: (error) => {
                console.log(error);
                setSearchTriggered(false);
                setIsSearching(false);
                showToast('error', 'Error', 'Error Fetching RMA Status');
                setInputError('RMA number not found or invalid');
            }
        }
    );

    useEffect(() => {
        const backAction = () => {
            if (isCameraOpen) {
                setIsCameraOpen(false);
                return true; // Prevent default back action
            }
            return false; // Allow default back action
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [isCameraOpen]);

    // Enhanced search validation
    const handleSearchPress = () => {
        // Clear previous error
        setInputError('');

        // Validate input - now just checking for non-empty input
        if (!rmaNumber || !rmaNumber.trim()) {
            setInputError('Please enter RMA Application Number');
            showToast('error', 'Input Required', 'Please enter RMA Application Number to search');
            return;
        }

        // Proceed with search
        setSearchTriggered(true);
        Keyboard.dismiss();
    };

    // Handle RMA number input change
    const handleRmaNumberChange = (value: string) => {
        setRmaNumber(value);
        if (inputError) {
            setInputError(''); // Clear error when user starts typing
        }
    };

    const copyToClipboard = async (text: string) => {
        await Clipboard.setStringAsync(text);
        showToast('success', 'Copied', 'RMA number copied to clipboard!');
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'accepted': return <FontAwesome name="check-circle" size={20} color="green" />;
            case 'pending': return <FontAwesome name="clock-o" size={20} color="orange" />;
            case 'dispatched': return <MaterialIcons name="local-shipping" size={20} color="blue" />;
            case 'received': return <MaterialIcons name="call-received" size={20} color="blue" />;
            case 'declined': return <FontAwesome name="exclamation-triangle" size={20} color="red" />;
            default: return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-purple-900';
            case 'accepted': return 'bg-green-600';
            case 'declined': return 'bg-red-500';
            case 'dispatched': return 'bg-green-800';
            default: return 'bg-gray-500';
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const filteredHistory = rmaHistory.filter(request =>
        request.barcode_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.serial_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderRMAItem = ({ item }: { item: RMARequest }) => (
        <View className="bg-[#1a3d5d] rounded-lg p-4 border border-[#9DFE01]/30 mb-10">
            {/* RMA Number with Copy Button */}
            <View className="flex flex-row items-center justify-between mb-3">
                <View className="flex flex-row items-center gap-2">
                    <Text className="text-[#9DFE01] font-semibold text-sm">RMA:</Text>
                    <Text className="font-mono text-sm text-white">{item.barcode_number}</Text>
                </View>
                <TouchableOpacity onPress={() => copyToClipboard(item.barcode_number)}>
                    <Feather name="copy" size={16} color="#9DFE01" />
                </TouchableOpacity>
            </View>

            {/* Status */}
            <View className="flex flex-row items-center justify-between mb-3">
                <Text className="text-[#9DFE01] font-semibold text-sm">Status:</Text>
                <View className="flex flex-row items-center gap-2">
                    <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
                        <Text className="text-white text-xs capitalize">{item.status}</Text>
                    </View>
                    {getStatusIcon(item.status)}
                </View>
            </View>

            {/* Serial Number */}
            <View className="flex flex-row items-center justify-between mb-3">
                <Text className="text-[#9DFE01] font-semibold text-sm">Serial:</Text>
                <Text className="font-mono text-sm text-white">{item.serial_no}</Text>
            </View>

            {/* Date */}
            <View className="flex flex-row items-center justify-between mb-3">
                <Text className="text-[#9DFE01] font-semibold text-sm">Date:</Text>
                <Text className="text-sm text-white">
                    {formatDate(item.createdAt)}
                </Text>
            </View>

            {/* Issue Description */}
            <View className="mt-3 pt-3 border-t border-[#9DFE01]/30">
                <Text className="text-[#9DFE01] font-semibold text-sm mb-2">Issue:</Text>
                <Text className="text-white text-sm leading-relaxed break-words">
                    {item.fault_desc}
                </Text>
            </View>

            {item.status === 'accepted' && (
                <TouchableOpacity
                    className="mt-3 bg-[#9DFE01] py-2 px-4 rounded-lg items-center"
                    onPress={() => {
                        setRmaNumber(item.barcode_number);
                        setSearchTriggered(true);
                    }}
                >
                    <Text className="text-[#1F486B] font-bold">View Details</Text>
                </TouchableOpacity>
            )}
        </View>
    );

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

                        <TouchableOpacity
                            onPress={() => setIsSidebarOpen(true)}
                            className="mr-5 mt-6 p-2"
                            activeOpacity={0.7}
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
                        <View className="w-full relative">
                            <TextInput
                                ref={inputRef}
                                placeholder="Enter RMA Application Number"
                                placeholderTextColor="rgba(157, 254, 1, 0.6)"
                                value={rmaNumber}
                                onChangeText={handleRmaNumberChange}
                                className={`border bg-[#1F486B] text-[#9DFE01] text-lg w-full border-[#1F486B] rounded-xl p-3 mt-2 ${inputError ? 'border-red-500' : ''}`}
                                style={{ height: 50 }}
                                keyboardType="numeric"
                                autoCorrect={false}
                                spellCheck={false}
                                blurOnSubmit={false}
                            // Removed maxLength={12}
                            />
                            {/* Barcode Scanner Button */}
                            <TouchableOpacity
                                className="absolute right-3 mt-5"
                                onPress={() => setIsCameraOpen(true)}
                                style={styles.barcodeButton}
                            >
                                <MaterialIcons name="qr-code-scanner" size={24} color="#9DFE01" />
                            </TouchableOpacity>
                        </View>

                        {/* Error message */}
                        {inputError ? (
                            <Text style={styles.errorText}>{inputError}</Text>
                        ) : null}

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

                    {/* Barcode Scanner Modal */}
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
                                                barcodeTypes: ["code128", "ean13", "code39"],
                                            }}
                                            onBarcodeScanned={scannedBarcode ? undefined : handleBarcodeScanned}
                                            enableTorch={torch}
                                        >
                                            <View style={styles.scannerOverlay}>
                                                <View style={styles.scannerFrame}>
                                                    <Animated.View style={[styles.scanLine, { transform: [{ translateY: animatedValue }] }]} />
                                                </View>
                                                <Text style={styles.scanInstructionText}>
                                                    Scan 12-digit RMA barcode
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

                    {/* Barcode Confirmation Modal */}
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
                                    <Text style={styles.modalTitle}>Scanned RMA Number</Text>
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
                                                Use This Number
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    {/* History Toggle Button */}
                    <View className="flex justify-center items-center mt-4 mb-4">
                        <TouchableOpacity
                            onPress={() => setShowHistory(!showHistory)}
                            className="flex flex-row items-center gap-2 bg-[#1F486B] border border-[#9DFE01] rounded-lg px-4 py-2"
                        >
                            <FontAwesome name="history" size={16} color="#9DFE01" />
                            <Text className="text-[#9DFE01]">
                                {showHistory ? 'Hide My RMA History' : 'Show My RMA History'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* RMA History Section */}
                    {showHistory && (
                        <View className="flex-1 px-4 mb-20">
                            <View className="flex flex-row items-center justify-between mb-4">
                                <Text className="text-[#1F486B] text-lg font-semibold">My RMA Requests</Text>
                                <View className="relative flex-1 ml-4">
                                    <TextInput
                                        placeholder="Search RMAs..."
                                        value={searchTerm}
                                        onChangeText={setSearchTerm}
                                        className="bg-[#9DFE01] text-[#1F486B] px-4 py-2 rounded-full border border-[#9DFE01]"
                                        style={{ paddingRight: 40 }}
                                    />
                                    <FontAwesome
                                        name="search"
                                        size={16}
                                        color="#1F486B"
                                        style={{ position: 'absolute', right: 15, top: 12 }}
                                    />
                                </View>
                            </View>

                            {loadingHistory ? (
                                <View className="flex justify-center py-8">
                                    <ActivityIndicator size="large" color="#9DFE01" />
                                </View>
                            ) : (
                                <FlatList
                                    data={filteredHistory}
                                    renderItem={renderRMAItem}
                                    keyExtractor={(item) => item.id.toString()}
                                    ListEmptyComponent={
                                        <View className="py-8 items-center">
                                            <Text className="text-gray-500">
                                                {searchTerm ? 'No matching RMAs found' : 'No RMA history available'}
                                            </Text>
                                        </View>
                                    }
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                />
                            )}
                        </View>
                    )}

                    {/* Follow Us Section */}
                    {!showHistory && (
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
                    )}
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
                <RMADetailsContent
                    rmaResult={rmaResult}
                    isLoading={isLoading || isSearching}
                    onClose={() => setIsBottomSheetOpen(false)}
                />
            </BottomSheet>
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
    toastTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
    },
    toastMessage: {
        fontSize: 14,
        color: 'grey',
        lineHeight: 22,
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
        bottom: 120,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    barcodeButton: {
        position: 'absolute',
        right: 10,
        top: 0,
        backgroundColor: 'rgba(157, 254, 1, 0.2)',
        borderRadius: 8,
        padding: 3,
    },
    errorText: {
        color: 'red',
        marginTop: 5,
        marginLeft: 5,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraContainer: {
        width: '100%',
        height: '100%',
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
    scanLine: {
        height: 2,
        width: '100%',
        backgroundColor: '#9DFE01',
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
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
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
    modalBackground: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
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
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    buttonScanAgain: {
        backgroundColor: '#666',
        marginRight: 10,
    },

    modalButton: {
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        minWidth: 100,
        alignItems: 'center',
    },
    modalBarcode: {
        fontSize: 16,
        marginBottom: 20,
        color: '#1F486B',
    },
    buttonConfirm: {
        backgroundColor: '#1F486B',
        marginLeft: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#1F486B',
    },
    permissionButton: {
        backgroundColor: '#1F486B',
        borderColor: '#9DFE01',
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },

});

export default RMAStatus;