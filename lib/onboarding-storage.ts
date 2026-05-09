import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'bloodbridge_onboarding_done';

export async function getOnboardingDone(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ONBOARDING_KEY);
  return value === 'true';
}

export async function setOnboardingDone(value: boolean): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, value ? 'true' : 'false');
}
