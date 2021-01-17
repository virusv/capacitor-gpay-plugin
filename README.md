# Capacitor плагин для реализации нативной оплаты через Google Pay

Поддерживаются платформы: **Android**, **Web**

Работу плагина можно посмотреть в [демо-приложении](https://github.com/virusv/capacitor-google-pay-app-demo)

Оформление кнопки оплаты обязательно должно соответствовать [правилам использования бренда](https://developers.google.com/pay/api/web/guides/brand-guidelines#mark).

## Добавление плагина

1. Установить плагин
```bash
npm i capacitor-gpay-plugin
```

2. Добавить инициализацию плагина в `<project>/android/app/src/main/java/<...>/MainActivity.java`
```java
// ...
import pro.sharks.capacitor.gpay.GPayNative;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      
        // Инициализация плагина
        add(GPayNative.class);
    }});
  }
}
```

3. В файл манифеста `<project>/android/app/src/main/AndroidManifest.xml` добавить мета параметр:
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    ...>

    <application
        android:allowBackup="true"
        ...>

        <!-- Необходимо включить данный флаг, для использования PaymentsClient. -->
        <meta-data
            android:name="com.google.android.gms.wallet.api.enabled"
            android:value="true" />
```

## Инициализация и оплата
Все передаваемые данные описаны на странице:
[Google Pay (web tutorial)](https://developers.google.com/pay/api/web/guides/tutorial).

```ts
import 'capacitor-gpay-plugin' // for web support
import { GPayNativePlugin } from 'capacitor-gpay-plugin'

const GPayNative = Plugins.GPayNative as GPayNativePlugin;
```

```ts
import {
    BaseRequestData,
    PaymentDataRequest,
    PaymentMethod,
    TokenizationSpecificationPaymentGateway,
    PaymentMethodCard,
    AuthMethod,
    CardNetwork,
    PaymentData,
} from 'capacitor-gpay-plugin'

const baseRequest: BaseRequestData = {
  apiVersion: 2,
  apiVersionMinor: 0
};

const tokenizationSpecification: TokenizationSpecificationPaymentGateway = {
    type: 'PAYMENT_GATEWAY',
    parameters: {
        gateway: 'example',
        gatewayMerchantId: 'exampleGatewayMerchantId',
    }
};

const baseCardPaymentMethod: PaymentMethodCard = {
    type: 'CARD',
    parameters: {
        allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"] as AuthMethod[],
        allowedCardNetworks: ["AMEX", "DISCOVER", "INTERAC", "JCB", "MASTERCARD", "VISA"] as CardNetwork[],
    }
};

const cardPaymentMethod: PaymentMethod = {
    tokenizationSpecification,
    ...baseCardPaymentMethod,
};

/**
 * Создание объекта типа PaymentsClient, test - означает, что environment будет установлен в TEST
 * В случае WEB: будет загружен скрипт Google Pay Web Api
 */
await GPayNative.createClient({ test: true });

/* Получение информации о готовности к платежу */
const isReadyToPayRequest = {
    ...baseRequest,
    allowedPaymentMethods: [baseCardPaymentMethod],
};
const { isReady } = await GPayNative.isReadyToPay(isReadyToPayRequest);

/* Проведение оплаты */
const paymentDataRequest: PaymentDataRequest = {
    ...baseRequest,
    allowedPaymentMethods: [cardPaymentMethod],
    transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: "12.34", // Итоговая стоимость
        currencyCode: 'USD',
        countryCode: 'US',
        checkoutOption: 'COMPLETE_IMMEDIATE_PURCHASE',
    },
    merchantInfo: {
        merchantName: 'Example Merchant',
        // merchantId: 'TEST',
    },
};

try {
    const paymentData = await GPayNative.loadPaymentData(paymentDataRequest);
    const token = paymentData.paymentMethodData.tokenizationData.token;

    // Отправка токена в процессинговый центр через ваш бэкенд...
} catch (e) {
    if (e.message === 'canceled') {
        // Пользователь закрыл окно оплаты
    } else {
        // Возникла ошибка e.message
    }
}
```

## События

```ts
GPayNative.addListener('success', (paymentData: PaymentData) => {
    const token = paymentData.paymentMethodData.tokenizationData.token;

    // ...
});

GPayNative.addListener('canceled', () => {
    // Пользователь закрыл окно оплаты
});

GPayNative.addListener('error', err => {
    // Если err.code === -1, то это значит что при проведении оплаты был
    // получен успешный ответ, но paymentData не удалось преобразовать

    console.error(err.message);
});
```