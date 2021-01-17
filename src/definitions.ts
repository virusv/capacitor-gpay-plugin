declare module '@capacitor/core' {
  interface PluginRegistry {
    GPayNative: GPayNativePlugin;
  }
}

export type TokenizationSpecificationProtocol = 'ECv2';
export type AuthMethod = 'PAN_ONLY' | 'CRYPTOGRAM_3DS';
export type CardNetwork = 'AMEX' | 'DISCOVER' | 'INTERAC' | 'JCB' | 'MASTERCARD' | 'VISA';
export type BillingAddressFormat = 'MIN' | 'FULL';
export type PaymentDataCallbacks = 'PAYMENT_AUTHORIZATION' | 'SHIPPING_ADDRESS' | 'SHIPPING_OPTION';
export type TotalPriceStatus = 'NOT_CURRENTLY_KNOWN' | 'ESTIMATED' | 'FINAL';
export type DisplayItemType = 'LINE_ITEM' | 'SUBTOTAL';
export type DisplayItemStatus = 'FINAL' | 'PENDING';
export type TransactionInfoCheckoutOption = 'DEFAULT' | 'COMPLETE_IMMEDIATE_PURCHASE';

export interface BaseRequestData {
  apiVersion: number;
  apiVersionMinor: number;
}

export interface TokenizationSpecificationPaymentGatewayParameters {
  gateway: string;
  gatewayMerchantId: string;
}

export interface TokenizationSpecificationDirectParameters {
  protocolVersion: TokenizationSpecificationProtocol;
  publicKey?: string;
  signature?: string;
  intermediateSigningKey?: {
    signedKey: string;
    signatures: string[];
  };
  signedMessage?: string;
}

export interface TokenizationSpecificationPaymentGateway {
  type: 'PAYMENT_GATEWAY';
  parameters: TokenizationSpecificationPaymentGatewayParameters;
}

export interface TokenizationSpecificationDirect {
  type: 'DIRECT';
  parameters: TokenizationSpecificationDirectParameters;
}

export type TokenizationSpecification = TokenizationSpecificationPaymentGateway | TokenizationSpecificationDirect;

export interface BillingAddressParameters {
  format?: BillingAddressFormat;
  phoneNumberRequired?: boolean;
}

export interface PaymentMethodCardParameters {
  allowedAuthMethods: AuthMethod[];
  allowedCardNetworks: CardNetwork[];
  allowPrepaidCards?: boolean;
  allowCreditCards?: boolean;
  assuranceDetailsRequired?: boolean;
  billingAddressRequired?: boolean;
  billingAddressParameters?: BillingAddressParameters;
}

export interface PaymentMethodPayPalParameters {
  purchase_context: {
    purchase_units: {
      payee: {
        merchant_id: string;
      }
    }[];
  };
}

export interface PaymentMethodCard {
  type: 'CARD';
  parameters: PaymentMethodCardParameters;
  tokenizationSpecification?: TokenizationSpecification;
}

export interface PaymentMethodPayPal {
  type: 'PAYPAL';
  parameters: PaymentMethodPayPalParameters;
  tokenizationSpecification?: TokenizationSpecification;
}

export type PaymentMethod = PaymentMethodCard | PaymentMethodPayPal;

export interface MerchantInfo {
  merchantId: string;
  merchantName?: string;
}

export interface DisplayItem {
  label: string;
  type: DisplayItemType;
  price: string;
  status?: DisplayItemStatus;
}

export interface TransactionInfo {
  currencyCode: string;
  countryCode?: string;
  transactionId?: string;
  totalPriceStatus: TotalPriceStatus;
  totalPrice: 'NOT_CURRENTLY_KNOWN' | string; // regexp: /^[0-9]+(\.[0-9][0-9])?$/
  displayItems?: DisplayItem[];
  totalPriceLabel?: string;
  checkoutOption?: TransactionInfoCheckoutOption;
}

export interface ShippingAddressParameters {
  allowedCountryCodes: string[];
  phoneNumberRequired?: boolean;
}

export interface SelectionOption {
  id: string;
  label: string;
  description?: string;
}

export interface ShippingOptionParameters {
  shippingOptions: SelectionOption;
  defaultSelectedOptionId?: string;
}

export interface AssuranceDetailsSpecifications {
  accountVerified: boolean;
  cardHolderAuthenticated: boolean;
}

export interface Address {
  name: string;
  postalCode: string;
  countryCode: string;
  phoneNumber?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  locality?: string;
  administrativeArea?: string;
  sortingCode?: string;
}

export interface CardInfo {
  cardDetails: string;
  cardNetwork: string;
  assuranceDetails?: AssuranceDetailsSpecifications;
  billingAddress?: Address;
}

export interface PaymentMethodTokenizationData {
  type: 'PAYMENT_GATEWAY' | 'DIRECT' | string;
  token?: string;
}

export interface PaymentMethodData {
  type: 'CARD' | 'DIRECT' | string;
  description: string;
  info: Record<string, any> | CardInfo;
  tokenizationData: PaymentMethodTokenizationData;
}

//--- Requests and Responses --------------------------------------------------
export interface IsReadyToPayRequest extends BaseRequestData {
  allowedPaymentMethods: PaymentMethod[];
  existingPaymentMethodRequired?: boolean;
}

export interface IsReadyToPayResponse {
  isReady: boolean;
}

export interface PaymentDataRequest extends BaseRequestData {
  merchantInfo: MerchantInfo;
  allowedPaymentMethods: PaymentMethod[];
  transactionInfo: TransactionInfo;
  callbackIntents?: PaymentDataCallbacks[]; // TODO: Native support (onPaymentDataChanged, onPaymentAuthorized)
  emailRequired?: boolean;
  shippingAddressRequired?: boolean;
  shippingAddressParameters?: ShippingAddressParameters;
  shippingOptionRequired?: boolean;
  shippingOptionParameters?: ShippingOptionParameters[];
}

export interface PaymentData {
  apiVersion: number;
  apiVersionMinor: number;
  paymentMethodData: PaymentMethodData;
  email?: string;
  shippingAddress?: Address;
}

export interface GPayNativePlugin {
  createClient(options: { test: boolean }): Promise<void>;
  isReadyToPay(request: IsReadyToPayRequest): Promise<IsReadyToPayResponse>;
  loadPaymentData(request: PaymentDataRequest): Promise<PaymentData>;
}
