import { WebPlugin } from '@capacitor/core';
import {
  GPayNativePlugin,
  IsReadyToPayRequest,
  IsReadyToPayResponse,
  PaymentDataRequest,
  PaymentData,
  MerchantInfo,
  PaymentDataCallbacks,
} from './definitions';

//#region Google Pay Web Api
declare namespace google.payments.api {
  type Environment = 'TEST' | 'PRODUCTION';

  interface PaymentOptions {
    environment?: Environment;
    merchantInfo?: MerchantInfo;
    paymentDataCallbacks?: PaymentDataCallbacks;
  }

  interface IsReadyToPayResponseWeb {
    result: boolean;
    paymentMethodPresent?: boolean;
  }

  class PaymentsClient {
    constructor(paymentOptions: PaymentOptions);

    isReadyToPay(request: IsReadyToPayRequest): Promise<IsReadyToPayResponseWeb>;
    loadPaymentData(request: PaymentDataRequest): Promise<PaymentData>;

    // TODO: createButton(options: ButtonOptions): HTMLElement;
  }
}
//#endregion Google Pay Web Api

//#region Web Script loader
/**
 * Загрузит необходимый скрипт для Google Pay
 */
export function googlePayLoader(): Promise<void> {
  return new Promise((resolve, reject) => {
    const src = 'https://pay.google.com/gp/p/js/pay.js';
    const script = document.createElement('script');

    script.setAttribute('src', src);
    script.setAttribute('async', '');
    script.setAttribute('defer', '');

    script.onload = () => resolve();
    script.onerror = reject;

    document.head.appendChild(script);
  });
}

export type PaymentsClient = google.payments.api.PaymentsClient;
export type PaymentsClientClass = typeof google.payments.api.PaymentsClient;

let PaymentsClientRef: PaymentsClientClass|null = null;

/**
 * Вернет класс PaymentsClient для работы с оплатой
 */
export async function getPaymentsClient(): Promise<PaymentsClientClass> {
  if (PaymentsClientRef) return PaymentsClientRef;

  await googlePayLoader();

  if (google?.payments?.api?.PaymentsClient) {
    PaymentsClientRef = google.payments.api.PaymentsClient as PaymentsClientClass;
  } else {
    throw new Error('Не удалось загрузить GooglePay PaymentsClient');
  }

  return PaymentsClientRef;
}
//#endregion Web Script loader

export class GPayNativeWeb extends WebPlugin implements GPayNativePlugin {
  protected paymentsClient: PaymentsClient|null = null;
  
  constructor() {
    super({
      name: 'GPayNative',
      platforms: ['web'],
    });
  }

  async createClient(options: { test: boolean }): Promise<void> {
    const PaymentsClient = await getPaymentsClient();

    this.paymentsClient = new PaymentsClient({
      environment: options.test ? 'TEST' : 'PRODUCTION'
    });
  }

  async isReadyToPay(request: IsReadyToPayRequest): Promise<IsReadyToPayResponse> {
    if (!this.paymentsClient) {
      throw new Error('Не создан объект типа PaymentsClient');
    }

    const { result } = await this.paymentsClient.isReadyToPay(request);
    return { isReady: result };
  }
  
  async loadPaymentData(request: PaymentDataRequest): Promise<PaymentData> {
    if (!this.paymentsClient) {
      throw new Error('Не создан объект типа PaymentsClient');
    }

    try {
      return await this.paymentsClient.loadPaymentData(request);
    } catch (e) {
      // Для обеспечения совместимости с нативной логикой Android
      if (e?.statusCode === 'CANCELED') {
        throw new Error('canceled');
      }

      throw e;
    }
  }
}

const GPayNative = new GPayNativeWeb();

export { GPayNative };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(GPayNative);
