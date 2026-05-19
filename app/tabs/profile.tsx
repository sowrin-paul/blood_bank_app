import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert, TextInput, Image, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const USER_STORAGE_KEY = 'auth_user';
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_URL ??
    (Platform.OS === 'android' ? 'http://192.168.0.102:8000/api' : 'http://127.0.0.1:8000/api');

const buildErrorMessage = (data: unknown): string => {
    if (!data || typeof data !== 'object') {
        return 'Update failed.';
    }

    const record = data as Record<string, unknown>;
    if (typeof record.detail === 'string') {
        return record.detail;
    }

    const errorEntries = Object.entries(record)
        .map(([field, value]) => {
            if (Array.isArray(value)) {
                return `${field}: ${value.join(' ')}`;
            }
            if (typeof value === 'string') {
                return `${field}: ${value}`;
            }
            return null;
        })
        .filter(Boolean);

    return errorEntries.length > 0 ? errorEntries.join('\n') : 'Update failed.';
};

type StoredUser = {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string | null;
    role: string | null;
    profile_photo_url?: string | null;
    id_document?: string | null;
};

export default function ProfileScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<StoredUser | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [draftEmail, setDraftEmail] = useState('');
    const [draftPhone, setDraftPhone] = useState('');
    const [draftPhotoUrl, setDraftPhotoUrl] = useState('');
    const [draftIdDocument, setDraftIdDocument] = useState('');
    const [draftIdDocumentName, setDraftIdDocumentName] = useState('');

    const hydrateDrafts = (currentUser: StoredUser | null) => {
        setDraftEmail(currentUser?.email ?? '');
        setDraftPhone(currentUser?.phone_number ?? '');
        setDraftPhotoUrl(currentUser?.profile_photo_url ?? '');
        setDraftIdDocument(currentUser?.id_document ?? '');
        setDraftIdDocumentName(currentUser?.id_document ?? '');
    };

    useEffect(() => {
        const loadUser = async () => {
            try {
                const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
                if (!raw) {
                    setUser(null);
                    return;
                }
                const parsedUser = JSON.parse(raw) as StoredUser;
                setUser(parsedUser);
                hydrateDrafts(parsedUser);
            } catch (error) {
                console.warn('Failed to load user profile', error);
                setUser(null);
                hydrateDrafts(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const handleStartEdit = () => {
        hydrateDrafts(user);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        hydrateDrafts(user);
        setIsEditing(false);
    };

    const handlePickPhoto = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'Please allow photo access to upload a profile picture.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets?.[0]?.uri) {
                setDraftPhotoUrl(result.assets[0].uri);
            }
        } catch (error) {
            console.warn('Failed to pick profile photo', error);
            Alert.alert('Photo update failed', 'Please try again.');
        }
    };

    const handlePickIdDocument = async () => {
        if (user?.id_document) {
            return;
        }

        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                return;
            }

            const asset = result.assets?.[0];
            if (!asset) {
                Alert.alert('Upload failed', 'Please try selecting the PDF again.');
                return;
            }

            if (!asset.mimeType?.includes('pdf') && !asset.name?.toLowerCase().endsWith('.pdf')) {
                Alert.alert('Invalid document', 'ID documentation must be a PDF file.');
                return;
            }

            setDraftIdDocument(asset.uri);
            setDraftIdDocumentName(asset.name ?? 'id-document.pdf');
        } catch (error) {
            console.warn('Failed to pick ID document', error);
            Alert.alert('Upload failed', 'Please try again.');
        }
    };

    const refreshAccessToken = async () => {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
            return null;
        }

        const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            await AsyncStorage.multiRemove([USER_STORAGE_KEY, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
            return null;
        }

        const data = await response.json();
        if (typeof data?.access !== 'string') {
            return null;
        }

        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, data.access);
        return data.access;
    };

    const buildAuthHeaders = (token: string | null, headersInit?: HeadersInit, isJson = false) => {
        const headers = new Headers(headersInit);
        if (isJson) {
            headers.set('Content-Type', 'application/json');
        } else {
            headers.delete('Content-Type');
        }
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        } else {
            headers.delete('Authorization');
        }
        return headers;
    };

    const fetchWithAuth = async (endpoint: string, options: RequestInit = {}, isJson = false) => {
        const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        const firstResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: buildAuthHeaders(token, options.headers, isJson),
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
            headers: buildAuthHeaders(nextToken, options.headers, isJson),
        });
    };

    const handleSaveProfile = async () => {
        if (!user) {
            Alert.alert('Update unavailable', 'Please sign in to edit your profile.');
            return;
        }

        const trimmedEmail = draftEmail.trim();
        if (!trimmedEmail) {
            Alert.alert('Email required', 'Please enter a valid email address.');
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
            Alert.alert('Invalid email', 'Please enter a valid email address.');
            return;
        }

        const trimmedPhone = draftPhone.trim();
        const trimmedPhotoUrl = draftPhotoUrl.trim();
        const trimmedIdDocument = draftIdDocument.trim();
        const trimmedIdDocumentName = draftIdDocumentName.trim();

        if (!user.id_document && trimmedIdDocumentName && !/\.pdf$/i.test(trimmedIdDocumentName)) {
            Alert.alert('Invalid document', 'ID documentation must be a PDF file.');
            return;
        }

        try {
            setIsSaving(true);
            const formData = new FormData();
            formData.append('email', trimmedEmail);

            if (trimmedPhone) {
                formData.append('phone_number', trimmedPhone);
            }

            if (trimmedPhotoUrl) {
                if (!trimmedPhotoUrl.startsWith('file:') && !trimmedPhotoUrl.startsWith('content:')) {
                    Alert.alert('Invalid photo', 'Please attach a photo file from your device.');
                    return;
                }
                const photoName = trimmedPhotoUrl.split('/').pop() || 'profile-photo.jpg';
                formData.append('profile_photo', {
                    uri: trimmedPhotoUrl,
                    name: photoName,
                    type: 'image/jpeg',
                } as unknown as Blob);
            }

            if (!user.id_document && trimmedIdDocument) {
                const docName = trimmedIdDocumentName || trimmedIdDocument.split('/').pop() || 'id-document.pdf';
                formData.append('id_document', {
                    uri: trimmedIdDocument,
                    name: docName,
                    type: 'application/pdf',
                } as unknown as Blob);
            }

            const response = await fetchWithAuth('/profile/', {
                method: 'PATCH',
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) {
                Alert.alert('Update failed', buildErrorMessage(data));
                return;
            }

            const updatedUser: StoredUser = {
                ...user,
                email: data?.email ?? user.email,
                phone_number: data?.phone_number ?? user.phone_number,
                profile_photo_url: data?.profile_photo_url ?? user.profile_photo_url,
                id_document: data?.id_document_name ?? user.id_document,
                role: data?.role ?? user.role,
                first_name: data?.first_name ?? user.first_name,
                last_name: data?.last_name ?? user.last_name,
            };

            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
            setUser(updatedUser);
            setIsEditing(false);
        } catch (error) {
            console.warn('Failed to save user profile', error);
            Alert.alert('Update failed', 'Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await AsyncStorage.multiRemove([USER_STORAGE_KEY, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
            router.replace('/auth?tab=login');
        } catch (error) {
            console.warn('Failed to sign out', error);
            Alert.alert('Sign out failed', 'Please try again.');
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="small" color="#dc2626" />
                <Text className="text-gray-400 text-sm mt-3">Loading profile...</Text>
            </View>
        );
    }

    const displayName = user ? `${user.first_name} ${user.last_name}`.trim() : 'Guest';
    const displayRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown';
    const displayIdDocument = user?.id_document
        ? user.id_document.split('/').pop() ?? user.id_document
        : 'Not provided';
    const profilePhotoUri = (isEditing ? draftPhotoUrl : user?.profile_photo_url ?? '').trim();
    const hasProfilePhoto = Boolean(profilePhotoUri);

    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 48, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
        >
            <View className="bg-white rounded-3xl p-6 shadow-sm">
                <View className="items-center">
                    <View className="w-20 h-20 rounded-full bg-red-100 items-center justify-center overflow-hidden">
                        {hasProfilePhoto ? (
                            <Image
                                source={{ uri: profilePhotoUri }}
                                className="w-20 h-20"
                                resizeMode="cover"
                            />
                        ) : (
                            <Text className="text-3xl">🩸</Text>
                        )}
                    </View>
                    <Text className="text-lg font-bold text-gray-900 mt-4" numberOfLines={1}>
                        {displayName || 'User'}
                    </Text>
                    <Text className="text-sm text-gray-500" numberOfLines={1}>
                        {user?.email ?? 'No email'}
                    </Text>
                </View>

                <View className="mt-6 gap-3">
                    <View className="flex-row justify-between">
                        <Text className="text-sm text-gray-500">Role</Text>
                        <Text className="text-sm font-semibold text-gray-900">{displayRole}</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-sm text-gray-500">Phone</Text>
                        <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                            {user?.phone_number ?? 'Not added'}
                        </Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-sm text-gray-500">Member ID</Text>
                        <Text className="text-sm font-semibold text-gray-900">
                            {user?.id ?? '--'}
                        </Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-sm text-gray-500">ID document</Text>
                        <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                            {displayIdDocument}
                        </Text>
                    </View>
                </View>

                {isEditing ? (
                <View className="mt-6 gap-4">
                    <View className="gap-2">
                        <Text className="text-xs font-semibold text-gray-700 ml-1">Profile photo</Text>
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={handlePickPhoto}
                                className="flex-1 rounded-2xl border-2 border-gray-200 px-4 py-3 items-center bg-white"
                            >
                                <Text className="text-sm font-semibold text-gray-700" numberOfLines={1}>Choose photo</Text>
                            </TouchableOpacity>
                            {draftPhotoUrl ? (
                                <TouchableOpacity
                                    onPress={() => setDraftPhotoUrl('')}
                                    className="rounded-2xl border-2 border-gray-200 px-4 py-3 items-center bg-white"
                                >
                                    <Text className="text-sm font-semibold text-gray-500">Remove</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                        <TextInput
                            value={draftPhotoUrl}
                            onChangeText={setDraftPhotoUrl}
                            placeholder="Or paste photo URL"
                            placeholderTextColor="#d1d5db"
                            autoCapitalize="none"
                            className="bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 font-medium"
                        />
                    </View>
                    <View className="gap-2">
                        <Text className="text-xs font-semibold text-gray-700 ml-1">Email address</Text>
                        <TextInput
                            value={draftEmail}
                            onChangeText={setDraftEmail}
                            placeholder="you@example.com"
                            placeholderTextColor="#d1d5db"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            className="bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 font-medium"
                        />
                    </View>
                    <View className="gap-2">
                        <Text className="text-xs font-semibold text-gray-700 ml-1">Phone number</Text>
                            <TextInput
                                value={draftPhone}
                                onChangeText={setDraftPhone}
                                placeholder="+880 1X XX XXX XXX"
                                placeholderTextColor="#d1d5db"
                                keyboardType="phone-pad"
                                className="bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 font-medium"
                            />
                        </View>
                        <View className="gap-2">
                            <Text className="text-xs font-semibold text-gray-700 ml-1">ID document (PDF only)</Text>
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={handlePickIdDocument}
                                    disabled={Boolean(user?.id_document)}
                                    className={`flex-1 rounded-2xl border-2 px-4 py-3 items-center ${user?.id_document ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}
                                >
                                    <Text className={`text-sm font-semibold ${user?.id_document ? 'text-gray-400' : 'text-gray-700'}`}>
                                        {user?.id_document ? 'Document locked' : 'Attach PDF'}
                                    </Text>
                                </TouchableOpacity>
                                {!user?.id_document && draftIdDocument ? (
                                    <TouchableOpacity
                                        onPress={() => setDraftIdDocument('')}
                                        className="rounded-2xl border-2 border-gray-200 px-4 py-3 items-center bg-white"
                                    >
                                        <Text className="text-sm font-semibold text-gray-500">Remove</Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                            <View className="rounded-2xl bg-gray-50 px-4 py-3">
                                <Text className="text-xs text-gray-500" numberOfLines={1}>
                                    {draftIdDocumentName
                                        ? `Selected: ${draftIdDocumentName}`
                                        : 'No document attached yet.'}
                                </Text>
                            </View>
                            <Text className="text-xs text-gray-500">
                                {user?.id_document
                                    ? 'ID documentation is locked after verification.'
                                    : 'Attach a PDF file only. Other formats are not allowed.'}
                            </Text>
                        </View>
                        <View className="gap-2">
                            <Text className="text-xs font-semibold text-gray-700 ml-1">Full name</Text>
                            <TextInput
                                value={displayName || 'User'}
                                editable={false}
                                className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-500 font-medium"
                            />
                        </View>
                        <View className="gap-2">
                            <Text className="text-xs font-semibold text-gray-700 ml-1">ID document</Text>
                            <TextInput
                                value={displayIdDocument}
                                editable={false}
                                className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-500 font-medium"
                            />
                        </View>
                        <View className="rounded-2xl bg-gray-50 px-4 py-3 gap-2">
                            <View className="flex-row justify-between">
                                <Text className="text-xs text-gray-500">Full name</Text>
                                <Text className="text-xs font-semibold text-gray-700" numberOfLines={1}>
                                    {displayName || 'User'}
                                </Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-xs text-gray-500">Member ID</Text>
                                <Text className="text-xs font-semibold text-gray-700">{user?.id ?? '--'}</Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-xs text-gray-500">ID document</Text>
                                <Text className="text-xs font-semibold text-gray-700" numberOfLines={1}>
                                    {displayIdDocument}
                                </Text>
                            </View>
                            <Text className="text-xs text-gray-500">
                                Name and ID documentation are locked for verification and cannot be edited here.
                            </Text>
                        </View>
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={handleSaveProfile}
                                disabled={isSaving}
                                className={`flex-1 rounded-2xl py-3 items-center ${isSaving ? 'bg-red-300' : 'bg-red-600'}`}
                            >
                                <Text className="text-white font-semibold">{isSaving ? 'Saving...' : 'Save changes'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleCancelEdit}
                                disabled={isSaving}
                                className="flex-1 rounded-2xl py-3 items-center bg-gray-100"
                            >
                                <Text className="text-gray-700 font-semibold">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={handleStartEdit}
                        disabled={!user}
                        className={`mt-6 rounded-2xl py-3 items-center ${user ? 'bg-gray-100' : 'bg-gray-200'}`}
                    >
                        <Text className="text-gray-700 font-semibold">Edit profile</Text>
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity
                onPress={handleSignOut}
                className="mt-8 bg-red-600 rounded-2xl py-4 items-center"
            >
                <Text className="text-white font-semibold">Sign Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}