import { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    Platform,
    Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_URL ??
    (Platform.OS === 'android' ? 'http://192.168.0.102:8000/api' : 'http://127.0.0.1:8000/api');

const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

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

type FieldErrors = Partial<Record<'bloodGroup' | 'units' | 'patientName' | 'contactPhone' | 'location' | 'neededBy', string>>;

export default function RequestReceiverScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const [myRequests, setMyRequests] = useState<BloodRequest[]>([]);

    // Form fields (receiver)
    const [bloodGroup, setBloodGroup] = useState<string>('');
    const [units, setUnits] = useState('1');
    const [patientName, setPatientName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');
    const [neededBy, setNeededBy] = useState('');
    const [neededByDate, setNeededByDate] = useState<Date | null>(null);

    const formattedNeededBy = neededByDate
        ? neededByDate.toISOString().slice(0, 10)
        : neededBy;

    useEffect(() => {
        const loadRequests = async () => {
            try {
                const response = await fetchWithAuth('/requests/blood-requests/');
                const data = await response.json();
                setMyRequests(Array.isArray(data) ? data : []);
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

    const validateForm = () => {
        const nextErrors: FieldErrors = {};

        if (!bloodGroup) {
            nextErrors.bloodGroup = 'Please select a blood group.';
        }
        if (!units.trim()) {
            nextErrors.units = 'Units is required.';
        } else if (!Number.isFinite(Number(units)) || Number(units) <= 0) {
            nextErrors.units = 'Units must be a positive number.';
        }
        if (!patientName.trim()) {
            nextErrors.patientName = 'Patient name is required.';
        }
        if (!contactPhone.trim()) {
            nextErrors.contactPhone = 'Contact phone is required.';
        }
        if (!location.trim()) {
            nextErrors.location = 'Location is required.';
        }
        if (neededBy.trim() && !/\d{4}-\d{2}-\d{2}/.test(neededBy.trim())) {
            nextErrors.neededBy = 'Use YYYY-MM-DD format.';
        }

        setFieldErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async () => {
        setSubmitError('');
        setSuccessMessage('');
        if (!validateForm()) {
            return;
        }

        const parsedUnits = Number(units);
        const payload = {
            blood_group: bloodGroup,
            units: parsedUnits,
            patient_name: patientName.trim(),
            contact_phone: contactPhone.trim(),
            location: location.trim(),
            notes: notes.trim(),
            needed_by: formattedNeededBy || null,
        };

        try {
            setIsSubmitting(true);
            const response = await fetchWithAuth('/requests/blood-requests/', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) {
                const message = data?.detail ?? 'Could not submit request.';
                setSubmitError(message);
                return;
            }
            Alert.alert('Success', 'Request submitted successfully!', [
                {
                    text: 'OK',
                    onPress: async () => {
                        setBloodGroup('');
                        setUnits('1');
                        setPatientName('');
                        setContactPhone('');
                        setLocation('');
                        setNotes('');
                        setNeededBy('');
                        setNeededByDate(null);
                        const refreshed = await fetchWithAuth('/requests/blood-requests/');
                        const refreshedData = await refreshed.json();
                        setMyRequests(Array.isArray(refreshedData) ? refreshedData : []);
                    },
                },
            ]);
        } catch (error) {
            console.warn('Failed to submit request', error);
            setSubmitError('Could not submit the request.');
        } finally {
            setIsSubmitting(false);
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
                    <Text className="text-2xl font-bold text-gray-900">Request Blood</Text>
                    <Text className="text-sm text-gray-500 mt-1">Receiver tools</Text>
                </View>

                <View className="px-6 mt-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">Create a request</Text>

                    {submitError ? (
                        <Text className="text-xs text-red-600 mb-3">{submitError}</Text>
                    ) : null}
                    {successMessage ? (
                        <Text className="text-xs text-green-600 mb-3">{successMessage}</Text>
                    ) : null}

                    <Text className="text-xs font-semibold text-gray-600 mb-2">Blood group</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {BLOOD_GROUPS.map((group) => (
                            <TouchableOpacity
                                key={group}
                                onPress={() => {
                                    setBloodGroup(group);
                                    setFieldErrors((prev) => ({ ...prev, bloodGroup: undefined }));
                                }}
                                className={`px-4 py-2 rounded-full border ${
                                    bloodGroup === group ? 'bg-red-50 border-red-500' : 'bg-white border-gray-200'
                                }`}
                            >
                                <Text
                                    className={`text-xs font-semibold ${
                                        bloodGroup === group ? 'text-red-600' : 'text-gray-600'
                                    }`}
                                >
                                    {group}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {fieldErrors.bloodGroup ? (
                        <Text className="text-xs text-red-600 mt-2">{fieldErrors.bloodGroup}</Text>
                    ) : null}

                    <View className="mt-4 gap-3">
                        <View>
                            <Text className="text-xs font-semibold text-gray-600 mb-2">Units needed</Text>
                            <TextInput
                                value={units}
                                onChangeText={(value) => {
                                    setUnits(value);
                                    setFieldErrors((prev) => ({ ...prev, units: undefined }));
                                }}
                                keyboardType="number-pad"
                                className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm"
                            />
                            {fieldErrors.units ? (
                                <Text className="text-xs text-red-600 mt-1">{fieldErrors.units}</Text>
                            ) : null}
                        </View>
                        <View>
                            <Text className="text-xs font-semibold text-gray-600 mb-2">Patient name</Text>
                            <TextInput
                                value={patientName}
                                onChangeText={(value) => {
                                    setPatientName(value);
                                    setFieldErrors((prev) => ({ ...prev, patientName: undefined }));
                                }}
                                className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm"
                            />
                            {fieldErrors.patientName ? (
                                <Text className="text-xs text-red-600 mt-1">{fieldErrors.patientName}</Text>
                            ) : null}
                        </View>
                        <View>
                            <Text className="text-xs font-semibold text-gray-600 mb-2">Contact phone</Text>
                            <TextInput
                                value={contactPhone}
                                onChangeText={(value) => {
                                    setContactPhone(value);
                                    setFieldErrors((prev) => ({ ...prev, contactPhone: undefined }));
                                }}
                                keyboardType="phone-pad"
                                className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm"
                            />
                            {fieldErrors.contactPhone ? (
                                <Text className="text-xs text-red-600 mt-1">{fieldErrors.contactPhone}</Text>
                            ) : null}
                        </View>
                        <View>
                            <Text className="text-xs font-semibold text-gray-600 mb-2">Location</Text>
                            <TextInput
                                value={location}
                                onChangeText={(value) => {
                                    setLocation(value);
                                    setFieldErrors((prev) => ({ ...prev, location: undefined }));
                                }}
                                className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm"
                            />
                            {fieldErrors.location ? (
                                <Text className="text-xs text-red-600 mt-1">{fieldErrors.location}</Text>
                            ) : null}
                        </View>
                        <View>
                            <Text className="text-xs font-semibold text-gray-600 mb-2">Needed by</Text>
                            <TouchableOpacity
                                onPress={() => setIsPickerVisible(true)}
                                className="bg-white border border-gray-200 rounded-2xl px-4 py-3"
                            >
                                <Text className="text-sm text-gray-700">
                                    {formattedNeededBy || 'Select a date'}
                                </Text>
                            </TouchableOpacity>
                            {isPickerVisible && (
                                <DateTimePicker
                                    value={neededByDate ?? new Date()}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(_, date) => {
                                        setIsPickerVisible(Platform.OS === 'ios');
                                        if (date) {
                                            setNeededByDate(date);
                                            setNeededBy('');
                                            setFieldErrors((prev) => ({ ...prev, neededBy: undefined }));
                                        }
                                    }}
                                />
                            )}
                            {fieldErrors.neededBy ? (
                                <Text className="text-xs text-red-600 mt-1">{fieldErrors.neededBy}</Text>
                            ) : null}
                        </View>
                        <View>
                            <Text className="text-xs font-semibold text-gray-600 mb-2">Notes</Text>
                            <TextInput
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm min-h-[90px]"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        className={`mt-5 rounded-2xl py-4 items-center ${
                            isSubmitting ? 'bg-red-300' : 'bg-red-600'
                        }`}
                    >
                        <Text className="text-white font-semibold">
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </Text>
                    </TouchableOpacity>

                    <Text className="text-lg font-semibold text-gray-900 mt-8 mb-3">My requests</Text>
                    {myRequests.length === 0 ? (
                        <Text className="text-sm text-gray-500">No requests yet.</Text>
                    ) : (
                        <View className="gap-3">
                            {myRequests.map((req) => (
                                <View key={req.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-sm font-semibold text-gray-900">
                                            {req.blood_group} · {req.units} unit(s)
                                        </Text>
                                        <Text className="text-xs text-gray-500">{req.status}</Text>
                                    </View>
                                    <Text className="text-xs text-gray-500 mt-1">{req.location}</Text>
                                    {req.needed_by && (
                                        <Text className="text-xs text-gray-400 mt-1">
                                            Needed by {req.needed_by}
                                        </Text>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
