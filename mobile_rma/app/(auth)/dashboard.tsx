import { View, Text, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { logOut } from '../../redux/userRedux';

export default function Dashboard() {
  // Initialize Redux dispatch
  const dispatch = useDispatch();

  // Handle logout function
  const handleLogout = () => {
    // Dispatch logout action to clear user state
    dispatch(logOut());
    // Navigate to SignIn screen
    router.replace('/SignIn');
  };

  return (
    <View className="flex-1 bg-[#1F486B]">
      {/* Main Content Container */}
      <View className="flex-1 bg-white mt-20 rounded-t-[2rem] px-6">
        {/* Header Section */}
        <View className="mt-8 mb-12">
          <Text className="text-2xl font-bold text-[#1F486B] text-center">
            Admin Dashboard
          </Text>
        </View>

        {/* Message Card */}
        <View className="bg-[#F8FAFC] rounded-2xl p-6 shadow-sm border border-[#1F486B]/10 mt-10">
          {/* Icon Container */}
          <View className="items-center mb-6">
            <MaterialIcons 
              name="dashboard" 
              size={80} 
              color="#1F486B"
            />
          </View>

          {/* Message Content */}
          <Text className="text-[#1F486B] text-lg font-medium text-center mb-3">
            Enhanced Web Experience Available
          </Text>
          
          <Text className="text-[#64748B] text-center leading-6 mb-6">
            For the best administrative experience, we recommend using our web-based 
            dashboard. The web interface provides advanced features, detailed analytics, 
            and a more comprehensive set of management tools.
          </Text>

          {/* Web Access Button */}
          {/* <Link href="https://yourdomain.com/admin" className="mb-4">
            <TouchableOpacity 
              className="bg-[#1F486B] py-3 px-6 rounded-lg items-center w-full"
            >
              <Text className="text-[#9DFE01] font-medium">
                Access Web Dashboard
              </Text>
            </TouchableOpacity>
          </Link> */}

          {/* Logout Button */}
          <TouchableOpacity 
            onPress={handleLogout}
            className="bg-[#1F486B] py-3 px-6 rounded-lg items-center w-full"
          >
            <Text className="text-[#9DFE01] font-medium">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}