import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import type { ComponentProps } from 'react';
import "@/global.css";
import { FontAwesome5 } from "@expo/vector-icons";

type FontAwesome5Name = ComponentProps<typeof FontAwesome5>['name'];

const BLOOD_STATS = [
    { group: 'O−', units: 12, status: 'Critical', statusColor: 'bg-red-600', statusText: 'text-white', iconBg: 'bg-red-100', dot: 'bg-red-500' },
    { group: 'A+', units: 84, status: 'Good', statusColor: 'bg-green-600', statusText: 'text-white', iconBg: 'bg-green-100', dot: 'bg-green-500' },
    { group: 'B−', units: 27, status: 'Low', statusColor: 'bg-amber-600', statusText: 'text-white', iconBg: 'bg-amber-100', dot: 'bg-amber-500' },
    { group: 'AB+', units: 61, status: 'Good', statusColor: 'bg-green-600', statusText: 'text-white', iconBg: 'bg-green-100', dot: 'bg-green-500' },
];

const BLOOD_PILLS = [
    { group: 'O+', level: 'low' },
    { group: 'A−', level: 'ok' },
    { group: 'B+', level: 'med' },
    { group: 'AB−', level: 'ok' },
    { group: 'O−', level: 'low' },
];

const NOTIFICATIONS = [
    {
        icon: 'bell' as FontAwesome5Name,
        iconBg: 'bg-red-100',
        title: 'Emergency request nearby',
        desc: 'O− blood needed at Dhaka Medical College Hospital · 1.2 km away',
        time: '2 min ago',
        unread: true,
    },
    {
        icon: 'check-circle' as FontAwesome5Name,
        iconBg: 'bg-green-100',
        title: 'Donation confirmed',
        desc: 'Your last donation at Square Hospital has been recorded successfully.',
        time: 'Yesterday, 4:30 PM',
        unread: true,
    },
    {
        icon: 'clock' as FontAwesome5Name,
        iconBg: 'bg-amber-100',
        title: 'Donation reminder',
        desc: 'You are now eligible to donate again. Consider helping someone today!',
        time: '2 days ago',
        unread: false,
    },
];

const HISTORY = [
    { hospital: 'Square Hospital', date: 'March 12, 2025', group: 'A+', units: 1 },
    { hospital: 'Dhaka Medical College', date: 'Oct 5, 2024', group: 'A+', units: 1 },
    { hospital: 'Ibn Sina Hospital', date: 'Apr 20, 2024', group: 'A+', units: 2 },
];

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
    return (
        <View className="flex-row items-center justify-between mb-4 px-1">
            <Text className="text-lg font-bold text-gray-900">{title}</Text>
            <TouchableOpacity onPress={onSeeAll}>
                <Text className="text-sm font-semibold text-red-600">See all →</Text>
            </TouchableOpacity>
        </View>
    );
}

export default function HomeScreen() {
    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="light-content" backgroundColor="#DC2626" />

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {/* Modern Gradient Hero */}
                <View className="bg-red-600 px-6 pt-16 pb-10">
                    {/* Top Row */}
                    <View className="flex-row items-center justify-between mb-6">
                        <View className="gap-1">
                            <Text className="text-white/80 text-sm font-medium">Good morning 👋</Text>
                            <Text className="text-white text-2xl font-bold" numberOfLines={1}>
                               Smriti Paul
                            </Text>
                        </View>
                        <TouchableOpacity className="w-11 h-11 bg-white/20 rounded-2xl items-center justify-center">
                            <FontAwesome5 name="bell" size={18} color="#fff" solid />
                            <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-yellow-300 rounded-full" />
                        </TouchableOpacity>
                    </View>

                    {/* Modern Search Bar */}
                    <TouchableOpacity className="flex-row items-center gap-3 bg-white/15 border border-white/30 rounded-2xl px-4 py-3.5">
                        <FontAwesome5 name="search" size={16} color="rgba(255,255,255,0.8)" solid />
                        <Text className="text-white/70 text-sm flex-1 font-medium">
                            Search blood groups…
                        </Text>
                        {/*<View className="bg-white/20 rounded-lg px-2.5 py-1.5">*/}
                        {/*    <Text className="text-white/90 text-xs font-bold">⚙️</Text>*/}
                        {/*</View>*/}
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View className="flex-1 px-6 pt-8 pb-8 gap-8">

                    {/* Blood Availability */}
                    <View>
                        <SectionHeader title="Blood Availability" />
                        <View className="flex-row flex-wrap gap-3">
                            {BLOOD_STATS.map((item) => (
                                <TouchableOpacity
                                    key={item.group}
                                    className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm"
                                    style={{ width: '48%' }}
                                >
                                    <View className="gap-3">
                                        <View className="flex-row items-center justify-between">
                                            <View className={`w-10 h-10 ${item.iconBg} rounded-xl items-center justify-center`}>
                                                <FontAwesome5 name="tint" size={16} color="rgb(234, 12, 12)" solid />
                                            </View>
                                            <View className={`${item.statusColor} rounded-full px-2.5 py-1`}>
                                                <Text className={`text-xs font-bold ${item.statusText}`}>
                                                    {item.status}
                                                </Text>
                                            </View>
                                        </View>
                                        <View>
                                            <Text className="text-3xl font-bold text-gray-900">
                                                {item.units}
                                            </Text>
                                            <Text className="text-xs text-gray-500 font-medium mt-1">
                                                {item.group} units
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Blood Group Pills */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="mt-5"
                            contentContainerStyle={{ gap: 10, paddingHorizontal: 0 }}
                        >
                            {BLOOD_PILLS.map((pill, i) => (
                                <TouchableOpacity
                                    key={i}
                                    className="flex-row items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 shadow-sm"
                                >
                                    <View
                                        className={`w-2.5 h-2.5 rounded-full ${
                                            pill.level === 'low'
                                                ? 'bg-red-500'
                                                : pill.level === 'ok'
                                                    ? 'bg-green-500'
                                                    : 'bg-amber-500'
                                        }`}
                                    />
                                    <Text className="text-sm font-bold text-gray-700">
                                        {pill.group}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Quick Action Card */}
                    <TouchableOpacity className="bg-red-500 rounded-3xl p-6 shadow-lg">
                        <View className="flex-row items-center justify-between">
                            <View className="gap-1">
                                <Text className="text-white/90 text-sm font-medium">Next donation eligible in</Text>
                                <Text className="text-white text-2xl font-bold">45 days</Text>
                            </View>
                            <FontAwesome5 name="syringe" size={24} color="#fff" solid />
                        </View>
                    </TouchableOpacity>

                    {/* Recent Notifications */}
                    <View>
                        <SectionHeader title="Recent Activity" />
                        <View className="gap-3">
                            {NOTIFICATIONS.map((n, i) => (
                                <TouchableOpacity
                                    key={i}
                                    className="bg-white border border-gray-100 rounded-2xl p-4 flex-row gap-3 items-start shadow-sm"
                                >
                                    <View
                                        className={`w-11 h-11 ${n.iconBg} rounded-2xl items-center justify-center flex-shrink-0`}
                                    >
                                        <FontAwesome5
                                            name={n.icon}
                                            size={16}
                                            color={n.icon === 'bell' ? '#DC2626' : n.icon === 'check-circle' ? '#16A34A' : '#D97706'}
                                            solid
                                        />
                                    </View>
                                    <View className="flex-1 gap-1">
                                        <View className="flex-row items-center justify-between">
                                            <Text className="text-sm font-bold text-gray-900 flex-1">
                                                {n.title}
                                            </Text>
                                            {n.unread && (
                                                <View className="w-2.5 h-2.5 bg-red-600 rounded-full" />
                                            )}
                                        </View>
                                        <Text className="text-xs text-gray-600 leading-4">
                                            {n.desc}
                                        </Text>
                                        <Text className="text-xs text-gray-400 font-medium mt-1">
                                            {n.time}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Donation History */}
                    <View className="mb-4">
                        <SectionHeader title="Donation History" />
                        <View className="gap-3">
                            {HISTORY.map((item, i) => (
                                <TouchableOpacity
                                    key={i}
                                    className="bg-white border border-gray-100 rounded-2xl p-4 flex-row items-center gap-4 shadow-sm"
                                >
                                    <View className="w-12 h-12 bg-red-100 rounded-2xl items-center justify-center flex-shrink-0">
                                        <FontAwesome5 name="tint" size={18} color="rgb(234, 12, 12)" solid />
                                    </View>
                                    <View className="flex-1 gap-1">
                                        <Text className="text-sm font-bold text-gray-900">
                                            {item.hospital}
                                        </Text>
                                        <Text className="text-xs text-gray-500 font-medium">
                                            {item.date} · {item.group}
                                        </Text>
                                    </View>
                                    <View className="bg-red-100 rounded-xl px-3.5 py-2">
                                        <Text className="text-sm font-bold text-red-600">
                                            {item.units}U
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
}
