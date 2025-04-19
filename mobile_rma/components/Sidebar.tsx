import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  Easing,
  interpolate
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Link, router } from 'expo-router';
import Avatar from "../assets/images/HomeScreen/Avatar.svg";

import Home from '../assets/images/Sidebar/HomeScreen.svg'
import ServiceRequest from '../assets/images/Sidebar/ServiceRequest.svg'
import RMAStatus from '../assets/images/Sidebar/RMAStatus.svg'
import WarrantyStatus from '../assets/images/Sidebar/WarrantyStatus.svg'
import WarrantyCheck from '../assets/images/Sidebar/WarrantyStatus.svg'
import WarrantyPolicy from '../assets/images/Sidebar/WarrantyPolicy.svg'
import RMAPolicy from '../assets/images/Sidebar/RMAPolicy.svg'
import ContactUs from '../assets/images/Sidebar/ContactUs.svg'
import Feedback from '../assets/images/Sidebar/Feedback.svg'
import Logout from '../assets/images/Sidebar/LogOut.svg'
import { logOut } from '../redux/userRedux';
import { useDispatch, useSelector } from 'react-redux';

// Define TypeScript interfaces
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// First, let's define the exact routes you're using
type AppRoute = 
  | '/(auth)/home'
  | '/ServiceRequest'
  | '/RMAStatus'
  | '/Warrantycheck'
  | '/WarrantyPolicy'
  | '/RMAPolicy'
  | '/Contact'
  | '/Feedback'
  | '/logout'
  | '/Profile';

interface RootState {
  user: {
    firstname: string;
    
  };
}


interface MenuItem {
  label: string;
  route: AppRoute;
  icon: React.ReactNode;
}

const { width } = Dimensions.get('window');

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  // Animated values for sidebar and blur
  const translateX = useSharedValue(width);
  const blurIntensity = useSharedValue(0);

  const dispatch = useDispatch();


  const firstname = useSelector((state:RootState) => state?.user?.firstname)

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

  // Animation configuration
  const animationConfig = {
    duration: 300,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  };

  // Menu items configuration with icons
  const menuItems: MenuItem[] = [
    {
      label: 'Home',
      route: '/(auth)/home',
      icon: <Home width={24} height={24} fill="#9DFE01" />
    },
    {
      label: 'Service Request',
      route: '/ServiceRequest',
      icon: <ServiceRequest width={24} height={24} fill="#9DFE01" />
    },
    {
      label: 'RMA Status',
      route: '/RMAStatus',
      icon: <RMAStatus width={24} height={24} fill="#9DFE01" />
    },
    {
      label: 'Warranty Check',
      route: '/Warrantycheck',
      icon: <WarrantyCheck width={24} height={24} fill="#9DFE01" />
    },
    {
      label: 'Warranty Policy',
      route: '/WarrantyPolicy',
      icon: <WarrantyPolicy width={24} height={24} fill="#9DFE01" />
    },
    {
      label: 'RMA Policy',
      route: '/RMAPolicy',
      icon: <RMAPolicy width={24} height={24} fill="#9DFE01" />
    },
    {
      label: 'Contact Us',
      route: '/Contact',
      icon: <ContactUs width={24} height={24} fill="#9DFE01" />
    },
    {
      label: 'Feedback',
      route: '/Feedback',
      icon: <Feedback width={24} height={24} fill="#9DFE01" />
    },
  ];

  // Update animations when isOpen changes
  useEffect(() => {
    translateX.value = withTiming(
      isOpen ? 0 : width,
      animationConfig
    );
    blurIntensity.value = withTiming(
      isOpen ? 1 : 0,
      animationConfig
    );
  }, [isOpen]);

  // Animated styles for sidebar
  const sidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Animated styles for blur overlay
  const blurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(blurIntensity.value, [0, 1], [0, 1]),
  }));

  const handleLogout = () => {
    // First, close the sidebar
    onClose();
    
    // Dispatch logout action to clear user state
    dispatch(logOut());
    
    // Navigate to SignIn screen
    router.replace('/SignIn');
  };

  // Navigation handler
  const handleNavigation = (route: AppRoute): void => {
    onClose();
    if (route === '/logout') {
      handleLogout();
    } else {
      router.push(route as any);
    }
  };
  return (
    <>
      {/* Blur Overlay */}
      {isOpen && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        >
          <Animated.View style={[styles.overlay, blurStyle]}>
            <BlurView intensity={50} style={StyleSheet.absoluteFill} />
          </Animated.View>
        </Pressable>
      )}

      {/* Sidebar Content */}
      <Animated.View style={[styles.sidebar, sidebarStyle]}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Coreprix RMA Portal</Text>
        </View>

        <View className="flex justify-center items-center">
          <Link href="/Profile">
            <View className="flex">
              <Avatar width={37} height={37} className="border border-gray-300" />
            </View>
          </Link>
          <View className="flex justify-center items-center">
            <Text className="text-[#9DFE01] text-lg font-roboto">{getGreeting()}</Text>
            <Text className="text-[#9DFE01] text-2xl font-roboto -mt-2">{firstname}</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleNavigation(item.route)}
              style={styles.menuItem}
            >
              {item.icon}
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => handleNavigation('/logout')}
        >
          <Logout width={24} height={24} fill="#1F486B" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

// Updated styles to accommodate icons
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: width * 0.8,
    height: '95%',
    marginTop: 25,
    borderRadius: 25,
    backgroundColor: '#1F486B',
    padding: 20,
    paddingTop: 50,
  },
  header: {
    marginBottom: 32,
  },
  headerText: {
    color: '#9DFE01',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: "center"
  },
  menuContainer: {
    flex: 1,
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(157, 254, 1, 0.1)',
  },
  menuText: {
    color: '#9DFE01',
    fontSize: 18,
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: '#9DFE01',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#1F486B',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  logoutIcon: {
    marginRight: 4,
  },
});

export const withSidebar = (WrappedComponent: React.ComponentType): React.FC => {
  return () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
      <View style={{ flex: 1 }}>
        <WrappedComponent />
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </View>
    );
  };
};

export default Sidebar;