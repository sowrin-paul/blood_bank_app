import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    FlatList,
    StatusBar,
    ViewToken,
} from 'react-native';
import { useRef, useState, useCallback, useEffect } from 'react';
import type { ComponentProps } from 'react';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
type FontAwesome5Name = ComponentProps<typeof FontAwesome5>['name'];

const SLIDES = [
    {
        id: '0',
        chip: 'Welcome',
        icon: 'tint' as FontAwesome5Name,
        title: 'Save lives with\nevery drop',
        desc: 'LifeFlow connects blood donors with patients and hospitals in real time — when every second counts.',
        bg: '#A32D2D',
    },
    {
        id: '1',
        chip: 'Find donors',
        icon: 'map-marker-alt' as FontAwesome5Name,
        title: 'Nearby donors,\nfound instantly',
        desc: 'Search by blood group and location. View live availability and contact donors directly from the app.',
        bg: '#0F4C4C',
    },
    {
        id: '2',
        chip: 'Emergency alerts',
        icon: 'bell' as FontAwesome5Name,
        title: 'Never miss an\nemergency request',
        desc: 'Get instant push notifications for urgent blood requests near you. Respond fast, save a life.',
        bg: '#166534',
    },
];

export default function GetStartedScreen() {
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const onViewableItemsChanged = useCallback(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0) {
                setActiveIndex(viewableItems[0].index ?? 0);
            }
        },
        []
    );

    const goTo = (index: number) => {
        flatListRef.current?.scrollToIndex({ index, animated: true });
        setActiveIndex(index);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const nextIndex = (activeIndex + 1) % SLIDES.length;
            goTo(nextIndex);
        }, 3000);

        return () => clearInterval(interval);
    }, [activeIndex]);

    const handleLogin = () => router.push('/auth?tab=login');
    const handleSignup = () => router.push('/auth?tab=signup');

    const currentBg = SLIDES[activeIndex].bg;

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="light-content" backgroundColor={currentBg} />

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={SLIDES}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                renderItem={({ item }) => (
                    <View style={{ width }} className="flex-1">
                        {/* Colored hero area */}
                        <View
                            style={{ backgroundColor: item.bg }}
                            className="flex-1 items-center justify-center px-8 pb-10 relative overflow-hidden"
                        >
                            {/* Decorative blobs */}
                            <View
                                style={{
                                    position: 'absolute',
                                    width: 200,
                                    height: 200,
                                    borderRadius: 100,
                                    backgroundColor: 'rgba(255,255,255,0.07)',
                                    top: -60,
                                    right: -60,
                                }}
                            />
                            <View
                                style={{
                                    position: 'absolute',
                                    width: 120,
                                    height: 120,
                                    borderRadius: 60,
                                    backgroundColor: 'rgba(255,255,255,0.07)',
                                    bottom: 60,
                                    left: -30,
                                }}
                            />

                            {/* Icon ring */}
                            <View
                                style={{
                                    width: 180,
                                    height: 180,
                                    borderRadius: 90,
                                    borderWidth: 2,
                                    borderColor: 'rgba(255,255,255,0.18)',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 36,
                                }}
                            >
                                <View
                                    style={{
                                        width: 130,
                                        height: 130,
                                        borderRadius: 65,
                                        borderWidth: 2,
                                        borderColor: 'rgba(255,255,255,0.25)',
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <FontAwesome5 name={item.icon} size={52} color="#fff" solid />
                                </View>
                            </View>

                            {/* Chip */}
                            <View
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.18)',
                                    borderWidth: 0.5,
                                    borderColor: 'rgba(255,255,255,0.3)',
                                    borderRadius: 20,
                                    paddingHorizontal: 14,
                                    paddingVertical: 4,
                                    marginBottom: 14,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 11,
                                        color: 'rgba(255,255,255,0.9)',
                                        letterSpacing: 0.5,
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    {item.chip}
                                </Text>
                            </View>

                            {/* Title */}
                            <Text
                                style={{
                                    fontSize: 28,
                                    fontWeight: '500',
                                    color: '#fff',
                                    textAlign: 'center',
                                    lineHeight: 36,
                                    marginBottom: 14,
                                }}
                            >
                                {item.title}
                            </Text>

                            {/* Description */}
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: 'rgba(255,255,255,0.72)',
                                    textAlign: 'center',
                                    lineHeight: 22,
                                }}
                            >
                                {item.desc}
                            </Text>
                        </View>
                    </View>
                )}
            />

            {/* Bottom area */}
            <View className="bg-white px-6 pt-5 pb-8">
                {/* Dots */}
                <View className="flex-row justify-center gap-1.5 mb-5">
                    {SLIDES.map((_, i) => (
                        <View
                            key={i}
                            style={{
                                height: 6,
                                width: activeIndex === i ? 22 : 6,
                                borderRadius: 3,
                                backgroundColor: activeIndex === i ? '#A32D2D' : '#D1D5DB',
                            }}
                        />
                    ))}
                </View>

                {/* Buttons */}
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        onPress={handleLogin}
                        className="flex-1 border border-gray-300 rounded-2xl py-3.5 items-center justify-center"
                    >
                        <Text className="text-gray-700 font-semibold text-base">Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSignup}
                        style={{ backgroundColor: '#e7000b' }}
                        className="flex-1 rounded-2xl py-3.5 items-center justify-center"
                    >
                        <Text className="text-white font-semibold text-base">Signup</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
