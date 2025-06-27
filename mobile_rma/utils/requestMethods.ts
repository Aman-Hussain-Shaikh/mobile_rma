import axios from "axios";
import { store } from "../redux/store";

// Create an axios instance with the base URL from environment variables
const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

// Add this line temporarily to verify the URL is being read correctly
console.log("API Base URL:", process.env.EXPO_PUBLIC_API_URL);

export const publicRequest = ({ ...options }) => {
  const onSuccess = (response: any) => response;
  const onError = (error: any) => {
    console.log("Error in publicRequest:", error.message || error.toString()); // Log the error for debugging
    throw error; // Throw the error to propagate it
  };
  return client(options).then(onSuccess).catch(onError);
};

export const userRequest = ({ ...options }) => {
  const state = store.getState();
  const token = state.user.accessToken;

  // Set the authorization header with the token
  client.defaults.headers.common.Authorization = `Bearer ${token}`;

  const onSuccess = (response: any) => response;
  const onError = (error: any) => {
    console.log("Error in userRequest:", error.message || error.toString()); // Log the error for debugging
    throw error; // Throw the error to propagate it
  };
  return client(options).then(onSuccess).catch(onError);
};
