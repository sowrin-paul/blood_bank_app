import { Tabs, router } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import "@/global.css";
import { FontAwesome5 } from "@expo/vector-icons";
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Role = 'donor' | 'receiver' | null;

function ActionButton({ label, route, icon }: { label: string; route: string; icon: 'heartbeat' | 'hand-holding-heart' }) {
    return (
        <TouchableOpacity
            onPress={() => router.push(route)}
            className="items-center -mt-5"
        >
            <View className="w-14 h-14 bg-[#A32D2D] rounded-full items-center justify-center border-4 border-white shadow-md">
                <FontAwesome5 name={icon} size={20} color="#fff" solid />
            </View>
            <Text className="text-[10px] text-[#A32D2D] font-medium mt-1">{label}</Text>
        </TouchableOpacity>
    );
}

export default function TabsLayout() {
    const [role, setRole] = useState<Role>(null);

    useEffect(() => {
        const loadRole = async () => {
            try {
                const raw = await AsyncStorage.getItem('auth_user');
                if (!raw) {
                    setRole(null);
                    return;
                }
                const user = JSON.parse(raw) as { role?: string };
                const normalized = user.role?.toLowerCase() as Role | undefined;
                setRole(normalized ?? null);
            } catch (error) {
                console.warn('Failed to load user role', error);
                setRole(null);
            }
        };

        loadRole();
    }, []);

    const isDonor = role === 'donor';
    const actionRoute = '/tabs/request';
    const actionLabel = isDonor ? 'Donate' : 'Request';
    const actionIcon = isDonor ? 'hand-holding-heart' : 'heartbeat';

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
                    tabBarButton: () => (
                        <ActionButton label={actionLabel} route={actionRoute} icon={actionIcon} />
                    ),
                }}
            />
            <Tabs.Screen
                name="donor"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="receiver"
                options={{
                    href: null,
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
