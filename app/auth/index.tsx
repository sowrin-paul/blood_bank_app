import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Image,
    type ImageSourcePropType,
} from 'react-native';
import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {FontAwesome5} from "@expo/vector-icons";

type Tab = 'login' | 'signup';
type Role = 'Donor' | 'Receiver';
type FontAwesome5Name = ComponentProps<typeof FontAwesome5>['name'];

type RoleItem =
    | { label: Role; iconType: 'font'; icon: FontAwesome5Name; color: string }
    | { label: Role; iconType: 'image'; image: ImageSourcePropType };

const ROLES: RoleItem[] = [
    { label: 'Donor', iconType: 'font', icon: 'tint', color: 'rgb(234, 12, 12)' },
    { label: 'Receiver', iconType: 'image', image: require('../../assets/icons/blood-transfusion.png') },
];

export default function AuthScreen() {
    const { tab } = useLocalSearchParams<{ tab?: string | string[] }>();
    const requestedTab = Array.isArray(tab) ? tab[0] : tab;
    const [activeTab, setActiveTab] = useState<Tab>(requestedTab === 'login' ? 'login' : 'signup');
    const [selectedRole, setSelectedRole] = useState<Role>('Donor');

    useEffect(() => {
        if (requestedTab === 'login' || requestedTab === 'signup') {
            setActiveTab(requestedTab);
        }
    }, [requestedTab]);

    // Signup fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Login fields
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const handleAuth = () => {
        // todo: real API call
        router.replace('/tabs');
    };

    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="light-content" backgroundColor="#DC2626" />

            {/* Hero Header */}
            <View className="bg-red-600 px-6 pt-16 pb-16">
                <View className="gap-2">
                    <View className="flex-row items-center gap-3">
                        <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center">
                            <Text className="text-3xl">🩸</Text>
                        </View>
                        <View>
                            <Text className="text-white text-2xl font-bold">BloodBridge</Text>
                            <Text className="text-white/70 text-xs font-medium" numberOfLines={1}>Save Lives, Share Blood</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Floating Card Area */}
            <View className="flex-1 bg-red-50 rounded-t-3xl -mt-8">
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Modern Tab Switcher */}
                    <View className="flex-row bg-gray-100 rounded-2xl p-1.5 mb-8">
                        {(['login', 'signup'] as Tab[]).map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                className="flex-1 py-3 rounded-xl items-center"
                                style={{
                                    backgroundColor: activeTab === tab ? '#ffffff' : 'transparent',
                                    opacity: activeTab === tab ? 1 : 0.6,
                                    elevation: activeTab === tab ? 4 : 0,
                                    shadowColor: '#000',
                                    shadowOpacity: activeTab === tab ? 0.1 : 0,
                                    shadowRadius: activeTab === tab ? 8 : 0,
                                    shadowOffset: { width: 0, height: activeTab === tab ? 2 : 0 },
                                }}
                            >
                                <Text
                                    className="text-sm font-semibold"
                                    numberOfLines={1}
                                    style={{ color: activeTab === tab ? '#dc2626' : '#4b5563' }}
                                >
                                    {tab === 'login' ? 'Login' : 'Signup'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* SIGNUP FORM */}
                    {activeTab === 'signup' && (
                        <View className="gap-5">
                            {/* Role Selector */}
                            <View className="gap-3">
                                <Text className="text-sm font-bold text-gray-900 ml-1">
                                    I&apos;m a...
                                </Text>
                                <View className="flex-row gap-3">
                                    {ROLES.map((role) => (
                                        <TouchableOpacity
                                            key={role.label}
                                            onPress={() => setSelectedRole(role.label)}
                                            className={`flex-1 items-center py-4 rounded-2xl border-2 ${
                                                selectedRole === role.label
                                                    ? 'border-red-500 bg-red-50'
                                                    : 'border-gray-200 bg-white/50'
                                            }`}
                                        >
                                            <View className="mb-1">
                                                {role.iconType === 'font' ? (
                                                    <FontAwesome5 name={role.icon} size={25} color={role.color} solid />
                                                ) : (
                                                    <Image source={role.image} className="w-8 h-8" resizeMode="contain" />
                                                )}
                                            </View>
                                            <Text
                                                className={`text-xs font-semibold ${
                                                    selectedRole === role.label
                                                        ? 'text-red-600'
                                                        : 'text-gray-500'
                                                }`}
                                            >
                                                {role.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Name Row */}
                            <View className="flex-row gap-3">
                                <View className="flex-1 gap-2">
                                    <Text className="text-xs font-semibold text-gray-700 ml-1">
                                        First name
                                    </Text>
                                    <TextInput
                                        value={firstName}
                                        onChangeText={setFirstName}
                                        placeholder="Smriti"
                                        placeholderTextColor="#d1d5db"
                                        className="bg-white border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-900 font-medium"
                                    />
                                </View>
                                <View className="flex-1 gap-2">
                                    <Text className="text-xs font-semibold text-gray-700 ml-1">
                                        Last name
                                    </Text>
                                    <TextInput
                                        value={lastName}
                                        onChangeText={setLastName}
                                        placeholder="Paul"
                                        placeholderTextColor="#d1d5db"
                                        className="bg-white border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-900 font-medium"
                                    />
                                </View>
                            </View>

                            {/* Phone */}
                            <View className="gap-2">
                                <Text className="text-xs font-semibold text-gray-700 ml-1">
                                    Phone number
                                </Text>
                                <TextInput
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="+880 1X XX XXX XXX"
                                    placeholderTextColor="#d1d5db"
                                    keyboardType="phone-pad"
                                    className="bg-white border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-900 font-medium"
                                />
                            </View>

                            {/* Email */}
                            <View className="gap-2">
                                <Text className="text-xs font-semibold text-gray-700 ml-1">
                                    Email address
                                </Text>
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="you@example.com"
                                    placeholderTextColor="#d1d5db"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    className="bg-white border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-900 font-medium"
                                />
                            </View>

                            {/* Password */}
                            <View className="gap-2">
                                <Text className="text-xs font-semibold text-gray-700 ml-1">
                                    Password (min. 8 characters)
                                </Text>
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="••••••••"
                                    placeholderTextColor="#d1d5db"
                                    secureTextEntry
                                    className="bg-white border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-900 font-medium"
                                />
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                onPress={handleAuth}
                                className="bg-red-600 rounded-2xl py-4 items-center mt-2 shadow-lg"
                            >
                                <Text className="text-white font-bold text-base text-center" numberOfLines={1}>
                                    Create Account
                                </Text>
                            </TouchableOpacity>

                            {/* Divider */}
                            <View className="flex-row items-center gap-3 my-2">
                                <View className="flex-1 h-px bg-gray-300" />
                                <Text className="text-xs text-gray-500 font-medium">or</Text>
                                <View className="flex-1 h-px bg-gray-300" />
                            </View>

                            {/* Social Buttons */}
                            <View className="flex-row gap-3">
                                <TouchableOpacity className="flex-1 border-2 border-gray-200 rounded-2xl py-3.5 items-center flex-row justify-center gap-2 bg-white">
                                    <FontAwesome5 name="google" size={16} color="#EA4335" brands />
                                    <Text className="text-sm font-semibold text-gray-700" numberOfLines={1}>Google</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="flex-1 border-2 border-gray-200 rounded-2xl py-3.5 items-center flex-row justify-center gap-2 bg-white">
                                    <FontAwesome5 name="facebook-f" size={16} color="#1877F2" brands />
                                    <Text className="text-sm font-semibold text-gray-700" numberOfLines={1}>Facebook</Text>
                                </TouchableOpacity>
                            </View>

                            <Text className="text-xs text-gray-500 text-center mt-2">
                                By signing up, you agree to our{' '}
                                <Text className="text-red-600 font-semibold">Terms</Text> and{' '}
                                <Text className="text-red-600 font-semibold">Privacy Policy</Text>.
                            </Text>
                        </View>
                    )}

                    {/* LOGIN FORM */}
                    {activeTab === 'login' && (
                        <View className="gap-5">
                            <Text className="text-xl font-bold text-gray-900 mb-2">
                                Welcome back! 👋
                            </Text>

                            {/* Email Input */}
                            <View className="gap-2">
                                <Text className="text-xs font-semibold text-gray-700 ml-1">
                                    Email or phone
                                </Text>
                                <TextInput
                                    value={loginEmail}
                                    onChangeText={setLoginEmail}
                                    placeholder="you@example.com"
                                    placeholderTextColor="#d1d5db"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    className="bg-white border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-900 font-medium"
                                />
                            </View>

                            {/* Password Input */}
                            <View className="gap-2">
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-xs font-semibold text-red-600 ml-1">
                                        Password
                                    </Text>
                                    <TouchableOpacity className="pr-1">
                                        <Text style={{ color: '#dc2626', fontSize: 12, fontWeight: '600' }}>
                                            Forgot <Text style={{ color: '#dc2626' }}>Password?</Text>
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    value={loginPassword}
                                    onChangeText={setLoginPassword}
                                    placeholder="••••••••"
                                    placeholderTextColor="#d1d5db"
                                    secureTextEntry
                                    className="bg-white border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-900 font-medium"
                                />
                            </View>

                            {/* Login Button */}
                            <TouchableOpacity
                                onPress={handleAuth}
                                className="bg-red-600 rounded-2xl py-4 items-center mt-2 shadow-lg"
                            >
                                <Text className="text-white font-bold text-base text-center" numberOfLines={1}>
                                    Sign In
                                </Text>
                            </TouchableOpacity>

                            {/* Divider */}
                            <View className="flex-row items-center gap-3 my-2">
                                <View className="flex-1 h-px bg-gray-300" />
                                <Text className="text-xs text-gray-500 font-medium">or</Text>
                                <View className="flex-1 h-px bg-gray-300" />
                            </View>

                            {/* Social Buttons */}
                            <View className="flex-row gap-3">
                                <TouchableOpacity className="flex-1 border-2 border-gray-200 rounded-2xl py-3.5 items-center flex-row justify-center gap-2 bg-white">
                                    <FontAwesome5 name="google" size={16} color="#EA4335" brands />
                                    <Text className="text-sm font-semibold text-gray-700" numberOfLines={1}>Google</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="flex-1 border-2 border-gray-200 rounded-2xl py-3.5 items-center flex-row justify-center gap-2 bg-white">
                                    <FontAwesome5 name="facebook-f" size={16} color="#1877F2" brands />
                                    <Text className="text-sm font-semibold text-gray-700" numberOfLines={1}>Facebook</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row items-center justify-center gap-1 mt-2">
                                <Text className="text-xs text-gray-500" numberOfLines={1}>Don&apos;t have an account?</Text>
                                <TouchableOpacity onPress={() => setActiveTab('signup')}>
                                    <Text className="text-xs text-red-600 font-semibold" numberOfLines={1}>Signup</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}
