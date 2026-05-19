import { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_URL ??
    (Platform.OS === 'android' ? 'http://192.168.0.102:8000/api' : 'http://127.0.0.1:8000/api');

type BloodRequest = {
    id: number;
    blood_group: string;
    units: number;
    patient_name: string;
    contact_phone: string;
    location: string;
    notes?: string;
    needed_by?: string | null;
    status: string;
    created_at: string;
};

export default function RequestDonorScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [submitError, setSubmitError] = useState('');
    const [openRequests, setOpenRequests] = useState<BloodRequest[]>([]);

    useEffect(() => {
        const loadRequests = async () => {
            try {
                const response = await fetchWithAuth('/requests/open-requests/');
                const data = await response.json();
                setOpenRequests(Array.isArray(data) ? data : []);
            } catch (error) {
                console.warn('Failed to load requests', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadRequests();
    }, []);

    const refreshAccessToken = async () => {
        const refreshToken = await AsyncStorage.getItem('auth_refresh_token');
        if (!refreshToken) {
            return null;
        }

        const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            await AsyncStorage.multiRemove(['auth_access_token', 'auth_refresh_token', 'auth_user']);
            return null;
        }

        const data = await response.json();
        if (typeof data?.access !== 'string') {
            return null;
        }

        await AsyncStorage.setItem('auth_access_token', data.access);
        return data.access;
    };

    const buildAuthHeaders = (token: string | null, headersInit?: HeadersInit) => {
        const headers = new Headers(headersInit);
        headers.set('Content-Type', 'application/json');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        } else {
            headers.delete('Authorization');
        }
        return headers;
    };

    const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
        const token = await AsyncStorage.getItem('auth_access_token');
        const firstResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: buildAuthHeaders(token, options.headers),
        });

        if (firstResponse.status !== 401) {
            return firstResponse;
        }

        const nextToken = await refreshAccessToken();
        if (!nextToken) {
            return firstResponse;
        }

        return fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: buildAuthHeaders(nextToken, options.headers),
        });
    };

    const handleFulfill = async (requestId: number) => {
        try {
            const response = await fetchWithAuth(`/requests/blood-requests/${requestId}/fulfill/`, {
                method: 'POST',
            });
            const data = await response.json();
            if (!response.ok) {
                const message = data?.detail ?? 'Could not mark as fulfilled.';
                setSubmitError(message);
                return;
            }
            const refreshed = await fetchWithAuth('/requests/open-requests/');
            const refreshedData = await refreshed.json();
            setOpenRequests(Array.isArray(refreshedData) ? refreshedData : []);
        } catch (error) {
            console.warn('Failed to fulfill request', error);
            setSubmitError('Could not mark as fulfilled.');
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="small" color="#dc2626" />
                <Text className="text-gray-500 text-sm mt-3">Loading request tools...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
            <ScrollView contentContainerStyle={{ paddingBottom: 32 }} className="flex-1">
                <View className="px-6 pt-10">
                    <Text className="text-2xl font-bold text-gray-900">Donate Blood</Text>
                    <Text className="text-sm text-gray-500 mt-1">Donor tools</Text>
                </View>

                <View className="px-6 mt-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">Open requests</Text>
                    {submitError ? (
                        <Text className="text-xs text-red-600 mb-3">{submitError}</Text>
                    ) : null}
                    {openRequests.length === 0 ? (
                        <Text className="text-sm text-gray-500">No open requests right now.</Text>
                    ) : (
                        <View className="gap-3">
                            {openRequests.map((req) => (
                                <View key={req.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-sm font-semibold text-gray-900">
                                            {req.blood_group} · {req.units} unit(s)
                                        </Text>
                                        <Text className="text-xs text-gray-500">{req.status}</Text>
                                    </View>
                                    <Text className="text-xs text-gray-600 mt-1">
                                        Patient: {req.patient_name}
                                    </Text>
                                    <Text className="text-xs text-gray-600 mt-1">
                                        Contact: {req.contact_phone}
                                    </Text>
                                    <Text className="text-xs text-gray-500 mt-1">{req.location}</Text>
                                    {req.needed_by && (
                                        <Text className="text-xs text-gray-400 mt-1">
                                            Needed by {req.needed_by}
                                        </Text>
                                    )}
                                    <TouchableOpacity
                                        onPress={() => handleFulfill(req.id)}
                                        className="mt-3 bg-emerald-600 rounded-xl py-2 items-center"
                                    >
                                        <Text className="text-white text-xs font-semibold" numberOfLines={1}>Mark as Fulfilled</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
