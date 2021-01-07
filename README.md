## Добавление плагина

1. Установить плагин
```bash
npm i -S capacitor-gpay-plugin
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
const baseRequest = {
  apiVersion: 2,
  apiVersionMinor: 0
};

const tokenizationSpecification = {
    type: 'PAYMENT_GATEWAY',
    parameters: {
        gateway: 'example',
        gatewayMerchantId: 'exampleGatewayMerchantId',
    }
};

const baseCardPaymentMethod = {
    type: 'CARD',
    parameters: {
        allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
        allowedCardNetworks: ["AMEX", "DISCOVER", "INTERAC", "JCB", "MASTERCARD", "VISA"],
    }
};

const cardPaymentMethod = {
    tokenizationSpecification,
    ...baseCardPaymentMethod,
};

/* Создание объекта типа PaymentsClient, test - означает, что environment будет установлен в TEST */
await GPayNative.createClient({ test: true });

/* Получение информации о готовности к платежу */
const isReadyToPayRequest = {
    ...baseRequest,
    allowedPaymentMethods: [baseCardPaymentMethod],
};
const { isReady } = await GPayNative.isReadyToPay({ request: isReadyToPayRequest });

/* Проведение оплаты */
const paymentDataRequest = {
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

// Мытод веренет пустой объект, информацию о платеже необходимо перехватывать в событии success
await GPayNative.loadPaymentData({ request: paymentDataRequest });
```

После проведения оплаты, результат отслеживать в событиях:

```ts
GPayNative.addListener('success', paymentData => {
    const token = paymentData.paymentMethodData.tokenizationData.token;

    // Далее токен необходимо передать на ваш сервер для завершения платежа
    // axios.post(...
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