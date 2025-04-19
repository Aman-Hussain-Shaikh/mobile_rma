import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Define the interface for a service center
interface ServiceCenter {
    id: string;
    name: string;
    address: string;
    pincode: string;
    contact: string;
}

// Sample service centers data
const serviceCenters: ServiceCenter[] = [
    {
      id: "supreme_technocom_1",
      name: "SUPREME TECHNOCOM PVT. LTD.",
      address: "P.No 262-BASEMENT ,YADAV MARG,GATE NO 3,SECTOR 9 OPP,AKSHARDHAM TEMPLE CHITRAKOOT,VAISHALI NAGAR, JAIPUR",
      pincode: "302021",
      contact: "6376228164"
    },
    {
      id: "supreme_technocom_2",
      name: "SUPREME TECHNOCOM PVT. LTD.",
      address: "P.NO 858,BEHIND ARORA HONDA MOTORS ,BOMBAY MOTOR CIRCLE ,CHOPASNI ROAD , JODHPUR",
      pincode: "342001",
      contact: "9251634347"
    },
    {
      id: "supreme_technocom_3",
      name: "SUPREME TECHNOCOM PVT. LTD.",
      address: "SK HOUSE,OPP. DRIVE IN ROAD , AHMEDABAD GUJARAT ",
      pincode: "380052",
      contact: "9251634316"
    },
    {
      id: "swasthika_infotech",
      name: "SWASTHIKA INFOTECH",
      address: "GANDHI CHOWK , SAWA KI GALI , NAGAUR , RAJASTHAN ",
      pincode: "341001",
      contact: "9950592391"
    },
    {
      id: "sri_balaji_computer",
      name: "SRI BALAJI COMPUTER ",
      address: "ALI STATIONARY ,RUPAM MARCKET , VIVEKANAND CIRCLE -PALI , RAJASTHAN ",
      pincode: "306104",
      contact: "8875061100, 7737887770"
    },
    {
      id: "shanti_computers",
      name: "SHANTI COMPUTERS ",
      address: "OPP.GANGAPARSAD PETROL PUMP , URJA BHAWAN , MERTA CITY ,RAJASTHAN  ",
      pincode: "341510",
      contact: "9518984781"
    },
    {
      id: "ss_enterprises",
      name: "S.S ENTERPRISES ",
      address: "1ST FLOOR ABOVE NEW JODHPUR CAR DÉCOR , NEAR PANCHAYAT SAMITI SAM , POLICE LINE ROAD , JAISALMER  ",
      pincode: "345001",
      contact: "9982218368"
    },
    {
      id: "marc_infotech",
      name: "MARC INFOTECH  ",
      address: "GF-17,SAMANVAY SILICON , OPP, KALYAN HOTEL , SAYAJIGUNJ,VADODARA,  ",
      pincode: "390020",
      contact: "6354732231"
    },
    {
      id: "spell_infotech",
      name: "SPELL INFOTECH",
      address: "NEAR KARADIYA RAJPUT WADI, 150 FT. RING ROAD , MAVDI CHOKDI,RAJKOT-3",
      pincode: "360003",
      contact: "9978994050, 9978507394"
    },
    {
      id: "pawan_computers",
      name: "PAWAN COMPUTERS",
      address: "SHOP NO.64 , 1ST , MOTOR HOUSE , BEHIND PREM MANDIR CINEMA , TONK BUS STAND",
      pincode: "322001",
      contact: "8239655177"
    },
    {
      id: "new_silicon_computer",
      name: "NEW SILICON COMPUTER",
      address: "BAPU KATLA,RENWAL , RAJASTHAN ",
      pincode: "303603",
      contact: "9929689022"
    },
  
  ];

interface ServiceCenterDropdownProps {
    onSelect: (center: ServiceCenter) => void;
}

const ServiceCenterDropdown: React.FC<ServiceCenterDropdownProps> = ({ onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState<ServiceCenter | null>(null);

    const handleSelect = (center: ServiceCenter) => {
        setSelectedCenter(center);
        setIsOpen(false);
        onSelect(center);
    };

    // Component to render individual service center details
    const ServiceCenterItem = ({ center }: { center: ServiceCenter }) => (
        <TouchableOpacity
            className="border-b border-[#9DFE01]/30 py-3"
            onPress={() => handleSelect(center)}
        >
            <View className="space-y-2">
                <Text className="text-base font-semibold text-[#9DFE01]">
                    {center.name}
                </Text>
                
                <View className="flex-row space-x-2">
                    <Feather name="map-pin" size={16} color="#9DFE01" className="mt-1" />
                    <Text className="flex-1 text-sm text-[#9DFE01] leading-5">
                        {center.address}
                        {'\n'}PIN: {center.pincode}
                    </Text>
                </View>
                
                <View className="flex-row items-center space-x-2">
                    <Feather name="phone" size={16} color="#9DFE01" />
                    <Text className="text-sm text-[#9DFE01]">{center.contact}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="w-full p-4 bg-[#1F486B] rounded-3xl">
            <Text className="text-lg font-semibold mb-4 text-[#9DFE01]">
                Select Your Preferred Service Center*
            </Text>
            
            <TouchableOpacity
                className="flex-row justify-between items-center p-4 border border-[#9DFE01] rounded-xl"
                onPress={() => setIsOpen(true)}
            >
                <Text className="text-base text-[#9DFE01]">
                    {selectedCenter ? selectedCenter.name : 'Select Service Center'}
                </Text>
                <Feather name="chevron-down" size={24} color="#9DFE01" />
            </TouchableOpacity>

            <Modal
                visible={isOpen}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsOpen(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-[#1F486B] rounded-t-3xl max-h-[80%]">
                        <View className="flex-row justify-between items-center p-4 border-b border-[#9DFE01]">
                            <Text className="text-lg font-semibold text-[#9DFE01]">
                                Select Service Center
                            </Text>
                            <TouchableOpacity 
                                className="p-2"
                                onPress={() => setIsOpen(false)}
                            >
                                <Feather name="x" size={24} color="#9DFE01" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView className="p-4 mb-4">
                            {serviceCenters.map((center) => (
                                <ServiceCenterItem key={center.id} center={center} />
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {selectedCenter && (
                <View className="mt-4 p-4 border border-[#9DFE01] rounded-xl space-y-2">
                    <Text className="text-base font-semibold text-[#9DFE01] mb-2">
                        Selected Service Center:
                    </Text>
                    <View className="flex-row space-x-2">
                        <Feather name="map-pin" size={16} color="#9DFE01" className="mt-1" />
                        <Text className="flex-1 text-sm text-[#9DFE01] leading-5">
                            {selectedCenter.address}
                            {'\n'}PIN: {selectedCenter.pincode}
                        </Text>
                    </View>
                    <View className="flex-row items-center space-x-2">
                        <Feather name="phone" size={16} color="#9DFE01" />
                        <Text className="text-sm text-[#9DFE01]">
                            {selectedCenter.contact}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
};

export default ServiceCenterDropdown;