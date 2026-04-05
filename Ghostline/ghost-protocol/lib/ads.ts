import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GHOST_COUNT_KEY = 'ghost_ad_counter';

export const BANNER_ID = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-4145409319469605/9879184626';

export const INTERSTITIAL_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-4145409319469605/9698183814';

const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_ID);

let interstitialLoaded = false;

export function loadInterstitial() {
  interstitial.addAdEventListener(AdEventType.LOADED, () => {
    interstitialLoaded = true;
  });
  interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    interstitialLoaded = false;
    interstitial.load();
  });
  interstitial.load();
}

export async function trackGhostAndMaybeShowAd(): Promise<void> {
  const raw = await AsyncStorage.getItem(GHOST_COUNT_KEY);
  let count = raw ? parseInt(raw, 10) : 0;
  count++;

  if (count >= 5 && interstitialLoaded) {
    interstitial.show();
    count = 0;
  }

  await AsyncStorage.setItem(GHOST_COUNT_KEY, count.toString());
}
