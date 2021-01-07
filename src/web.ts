import { WebPlugin } from '@capacitor/core';
import {
  GPayNativePlugin,
  IsReadyToPayRequest,
  IsReadyToPayResponse,
  PaymentDataRequest
} from './definitions';

export class GPayNativeWeb extends WebPlugin implements GPayNativePlugin {
  constructor() {
    super({
      name: 'GPayNative',
      platforms: ['web'],
    });
  }

  createClient(options: { test: boolean }): Promise<void> {
    console.log(options);
    return Promise.resolve();
  }

  isReadyToPay(options: { request: IsReadyToPayRequest }): Promise<IsReadyToPayResponse> {
    console.log(options);
    return Promise.resolve({ isReady: false });
  }
  
  loadPaymentData(options: { request: PaymentDataRequest }): Promise<void> {
    console.log(options);
    return Promise.resolve();
  }
}

const GPayNative = new GPayNativeWeb();

export { GPayNative };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(GPayNative);
