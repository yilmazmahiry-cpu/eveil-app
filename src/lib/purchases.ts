import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

export const PREMIUM_ENTITLEMENT = 'premium';

const API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS;
const API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;

let configured = false;

export function configurePurchases() {
  if (configured || Platform.OS === 'web') return;
  const apiKey = Platform.OS === 'ios' ? API_KEY_IOS : API_KEY_ANDROID;
  if (!apiKey) {
    console.warn('Clé RevenueCat manquante — voir .env.example.');
    return;
  }
  Purchases.configure({ apiKey });
  configured = true;
}

export async function loginPurchases(userId: string): Promise<CustomerInfo | null> {
  if (!configured) return null;
  const { customerInfo } = await Purchases.logIn(userId);
  return customerInfo;
}

export async function logoutPurchases(): Promise<void> {
  if (!configured) return;
  await Purchases.logOut();
}

export function isPremiumFromInfo(info: CustomerInfo | null): boolean {
  if (!info) return false;
  return typeof info.entitlements.active[PREMIUM_ENTITLEMENT] !== 'undefined';
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!configured) return null;
  return Purchases.getCustomerInfo();
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  if (!configured) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo | null> {
  if (!configured) return null;
  return Purchases.restorePurchases();
}

export function onCustomerInfoUpdate(callback: (info: CustomerInfo) => void): () => void {
  if (!configured) return () => {};
  Purchases.addCustomerInfoUpdateListener(callback);
  return () => Purchases.removeCustomerInfoUpdateListener(callback);
}
