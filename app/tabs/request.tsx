import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

type Role = 'donor' | 'receiver';

export default function RequestGateScreen() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const routeByRole = async () => {
            try {
                const raw = await AsyncStorage.getItem('auth_user');
                if (!raw) {
                    router.replace('/tabs');
                    return;
                }
                const user = JSON.parse(raw) as { role?: string };
                const normalized = user.role?.toLowerCase() as Role | undefined;
                if (normalized === 'donor') {
                    router.replace('/tabs/donor');
                } else {
                    router.replace('/tabs/receiver');
                }
            } catch (error) {
                console.warn('Failed to route request tab', error);
                router.replace('/tabs');
            } finally {
                setIsLoading(false);
            }
        };

        routeByRole();
    }, []);

    if (!isLoading) {
        return null;
    }

    return (
        <View className="flex-1 items-center justify-center bg-gray-50">
            <ActivityIndicator size="small" color="#dc2626" />
            <Text className="text-gray-500 text-sm mt-3">Loading request tools...</Text>
        </View>
    );
}
