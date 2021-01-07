declare module '@capacitor/core' {
  interface PluginRegistry {
    GPayNative: GPayNativePlugin;
  }
}

export interface IsReadyToPayRequest extends Record<string, any> {}
export interface IsReadyToPayResponse {
  isReady: boolean;
}

export interface PaymentDataRequest extends Record<string, any> {}
export interface PaymentData extends Record<string, any> {}

export interface GPayNativePlugin {
  createClient(options: { test: boolean }): Promise<void>;
  isReadyToPay(options: { request: IsReadyToPayRequest }): Promise<IsReadyToPayResponse>;
  loadPaymentData(options: { request: PaymentDataRequest }): Promise<void>;
}
