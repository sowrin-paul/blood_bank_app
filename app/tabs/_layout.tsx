import { Tabs, router } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import "@/global.css";
import { FontAwesome5 } from "@expo/vector-icons";

function RequestButton() {
    return (
        <TouchableOpacity
            onPress={() => router.push('/tabs/request')}
            className="items-center -mt-5"
        >
            <View className="w-14 h-14 bg-[#A32D2D] rounded-full items-center justify-center border-4 border-white shadow-md">
                <FontAwesome5 name="heartbeat" size={20} color="#fff" solid />
            </View>
            <Text className="text-[10px] text-[#A32D2D] font-medium mt-1">Request</Text>
        </TouchableOpacity>
    );
}

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    height: 70,
                    paddingBottom: 8,
                    paddingTop: 4,
                    borderTopWidth: 0.5,
                    borderTopColor: '#e5e7eb',
                    backgroundColor: '#ffffff',
                },
                tabBarShowLabel: true,
                tabBarActiveTintColor: '#A32D2D',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '500',
                    marginTop: 2,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ focused }) => (
                        <FontAwesome5 name="home" size={18} color={focused ? '#A32D2D' : '#9CA3AF'} solid />
                    ),
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    tabBarLabel: 'Search',
                    tabBarIcon: ({ focused }) => (
                        <FontAwesome5 name="search" size={18} color={focused ? '#A32D2D' : '#9CA3AF'} solid />
                    ),
                }}
            />
            <Tabs.Screen
                name="request"
                options={{
                    tabBarButton: () => <RequestButton />,
                }}
            />
            <Tabs.Screen
                name="alerts"
                options={{
                    tabBarLabel: 'Alerts',
                    tabBarIcon: ({ focused }) => (
                        <FontAwesome5 name="bell" size={18} color={focused ? '#A32D2D' : '#9CA3AF'} solid />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ focused }) => (
                        <FontAwesome5 name="user" size={18} color={focused ? '#A32D2D' : '#9CA3AF'} solid />
                    ),
                }}
            />
        </Tabs>
    );
}
