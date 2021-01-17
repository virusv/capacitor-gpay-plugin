import { WebPlugin } from '@capacitor/core';
import {
  GPayNativePlugin,
  IsReadyToPayRequest,
  IsReadyToPayResponse,
  PaymentDataRequest,
  PaymentData
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

  isReadyToPay(request: IsReadyToPayRequest): Promise<IsReadyToPayResponse> {
    console.log(request);
    return Promise.resolve({ isReady: false });
  }
  
  loadPaymentData(request: PaymentDataRequest): Promise<PaymentData> {
    console.log(request);
    return Promise.resolve({} as PaymentData);
  }
}

const GPayNative = new GPayNativeWeb();

export { GPayNative };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(GPayNative);
