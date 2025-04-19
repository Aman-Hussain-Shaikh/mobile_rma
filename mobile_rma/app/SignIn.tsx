import { Text, View, TextInput, StyleSheet, Pressable } from "react-native";
import Logo from "../assets/images/logo.svg";
import Google from "../assets/images/google-icon.svg";
import React, { useEffect, useState } from "react";
import { Checkbox, Button } from "react-native-paper";
import { MaterialIcons } from '@expo/vector-icons';  // Using Expo's built-in icons
import "../global.css";
import { Link } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFail } from '../redux/userRedux';
import { publicRequest } from '../utils/requestMethods';
import { router } from 'expo-router';
import { LogBox } from 'react-native';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';

export default function SignIn(): React.JSX.Element {
  // State management for form fields and UI
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // const user = useSelector((state) => state?.user);
  const dispatch = useDispatch();

  // Check for saved credentials when component mounts
  useEffect(() => {
    const checkSavedCredentials = async () => {
      try {
        const savedCredentials = await AsyncStorage.getItem('userCredentials');
        if (savedCredentials) {
          const { email: savedEmail, password: savedPassword } = JSON.parse(savedCredentials);
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
          // Auto-login with saved credentials
          handleSignIn(savedEmail, savedPassword);
        }
      } catch (error) {
        console.error('Error loading saved credentials:', error);
      }
    };

    checkSavedCredentials();
  }, []);

  // UI interaction handlers
  const toggleRememberMe = () => setRememberMe(!rememberMe);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Toast message handler for error display
const toastStyles = StyleSheet.create({
  text1Style: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  text2Style: {
    fontSize: 14, // Increased size for text2
    color: 'grey',
    lineHeight: 22, // Adding line height for better readability
  },
});

// Then create our properly typed toast function
const showErrorToast = (message: string) => {
  Toast.show({
    type: 'error',
    text1: 'Login Error',
    text2: message,
    position: 'top',
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 50,
    // Using our defined styles
    text1Style: toastStyles.text1Style,
    text2Style: toastStyles.text2Style,
  });
};
  // Main sign-in handler
  const handleSignIn = async (savedEmail?: string, savedPassword?: string) => {
    const emailToUse = savedEmail || email;
    const passwordToUse = savedPassword || password;

    // console.log("EMAIL : ",emailToUse)

    // Validate input
    if (!emailToUse || !passwordToUse) {
      showErrorToast('Please enter both email and password');
      return;
    }

    setLoading(true);
    dispatch(loginStart());

    try {
      console.log("Calling publicRequest...");
      const response = await publicRequest({
        url: '/auth/login',
        method: 'post',
        data: {
          email: emailToUse,
          password: passwordToUse
        }
      });

      if (response?.data) {
        console.log("Login successful:", response.data);
        // Handle "Remember Me" functionality
        if (rememberMe) {
          await AsyncStorage.setItem('userCredentials', JSON.stringify({
            email: emailToUse,
            password: passwordToUse
          }));
        } else {
          await AsyncStorage.removeItem('userCredentials');
        }

        dispatch(loginSuccess(response.data));
        
        // Route based on user type
        if (response.data?.userType === "Admin") {
          router.replace("./(auth)/dashboard");
        } else {
          router.replace("./(auth)/home");
        }
      }
    } catch (error: any) {
      console.log("ERROR : ", error.message || error.toString());
      let errorMessage = 'An unexpected error occurred';
      
      // Specific error handling
      if (error.response?.status === 401) {
        errorMessage = "Wrong credentials!";
      } else if (error.response?.status === 404) {
        errorMessage = 'Service unavailable';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred';
      }
    
      showErrorToast(errorMessage);
      dispatch(loginFail({ error: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex flex-1 items-center justify-center bg-white">
      <Logo width={150} height={150} className="border border-gray-300" />
      <Text className="text-[#1F486B] text-4xl font-bold font-serif mt-4">
        Sign In
      </Text>

      <View className="w-11/12 mt-8">
        {/* Email Input Field */}
        <View className="mb-5 relative">
          <View className="absolute -top-0.5 left-4 bg-white px-2 z-10">
            <Text className="text-[#1F486B] text-base font-bold">Email Id</Text>
          </View>
          <TextInput
            placeholder="Enter your Email Id"
            className="border border-[#1F486B] rounded-md p-4 mt-2"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input Field with Toggle */}
        <View className="mb-5">
          <View className="absolute -top-0.5 left-4 bg-white px-2 z-10">
            <Text className="text-[#1F486B] text-base font-bold">Password</Text>
          </View>
          <View className="relative">
            <TextInput
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              className="border border-[#1F486B] rounded-md p-4 mt-2 pr-12"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <Pressable 
              onPress={togglePasswordVisibility}
              className="absolute right-4 top-1/2 transform -translate-y-1/2"
            >
              <MaterialIcons 
                name={showPassword ? "visibility-off" : "visibility"}
                size={24}
                color="#1F486B"
              />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Remember Me and Forgot Password Section */}
      <View className="flex flex-row justify-between w-11/12 mt-4">
        <View className="flex flex-row items-center">
          <Checkbox
            status={rememberMe ? "checked" : "unchecked"}
            onPress={toggleRememberMe}
            color="#2196F3"
          />
          <Text className="text-base ml-2">Remember me</Text>
        </View>
        <Link href="/ForgotPassword">
          <Text className="self-center text-[#1F486B]">Forgot Password?</Text>
        </Link>
      </View>

      {/* Sign In Button */}
      <View className="w-11/12 mt-8">
        <Button
          mode="contained"
          onPress={() => handleSignIn()}
          loading={loading}
          disabled={loading}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          style={styles.button}
        >
          CONTINUE
        </Button>
      </View>

      {/* Divider */}
      <View className="flex flex-row items-center justify-center w-8/12 mt-10">
        <View className="flex-grow border-t border-[#1F486B]"></View>
        <Text className="mx-4 text-[#1F486B] text-sm">Or</Text>
        <View className="flex-grow border-t border-[#1F486B]"></View>
      </View>

      {/* Google Sign In */}
      <View className="bg-[#1F486B] border border-[#9DFE01] shadow-lg p-3 rounded-lg my-4">
        <Google width={30} height={30} />
      </View>

      {/* Sign Up Link */}
      <Text className="text-[#1F486B] text-xl mt-4">
        New User?{" "}
        <Link href="/Register">
          <Text className="underline font-bold">SIGN UP HERE</Text>
        </Link>
      </Text>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: 32,
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
  },
  buttonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonLabel: {
    color: '#9DFE01',
    fontSize: 14,
    fontWeight: 'bold',
  }
});