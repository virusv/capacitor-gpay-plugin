package pro.sharks.capacitor.gpay;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;

import com.getcapacitor.JSExportException;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.wallet.AutoResolveHelper;
import com.google.android.gms.wallet.IsReadyToPayRequest;
import com.google.android.gms.wallet.PaymentData;
import com.google.android.gms.wallet.PaymentDataRequest;
import com.google.android.gms.wallet.PaymentsClient;
import com.google.android.gms.wallet.Wallet;
import com.google.android.gms.wallet.WalletConstants;

import org.json.JSONException;
import org.json.JSONObject;

@NativePlugin(requestCodes = { Constants.GOOGLE_PAY_REQUEST_CODE })
public class GPayNative extends Plugin {
    private PaymentsClient paymentsClient = null;

    @PluginMethod
    public void createClient(PluginCall call) {
        boolean test = call.getBoolean("test");
        int environment = test ? WalletConstants.ENVIRONMENT_TEST : WalletConstants.ENVIRONMENT_PRODUCTION;

        Wallet.WalletOptions walletOptions = new Wallet.WalletOptions
                .Builder()
                .setEnvironment(environment)
                .build();

        paymentsClient = Wallet.getPaymentsClient(this.getActivity(), walletOptions);

        call.success();
    }

    @PluginMethod
    public void isReadyToPay(final PluginCall call) {
        if (paymentsClient == null) {
            call.reject("Не создан объект типа PaymentsClient");
            return;
        }

        JSONObject isReadyToPayJson = call.getData();
        IsReadyToPayRequest request = IsReadyToPayRequest.fromJson(isReadyToPayJson.toString());

        Task<Boolean> task = paymentsClient.isReadyToPay(request);

        task.addOnCompleteListener(
            this.getActivity(),
            new OnCompleteListener<Boolean>() {
                @Override
                public void onComplete(@NonNull Task<Boolean> task) {
                    if (task.isSuccessful()) {
                        final boolean isReady = task.getResult();
                        call.success(new JSObject() {{
                            put("isReady", isReady);
                        }});
                    } else {
                        call.error(task.getException().getLocalizedMessage());
                        Log.w("isReadyToPay failed", task.getException());
                    }
                }
            }
        );
    }

    @PluginMethod
    public void loadPaymentData(final PluginCall call) {
        if (paymentsClient == null) {
            call.reject("Не создан объект типа PaymentsClient");
            return;
        }

        JSONObject paymentDataRequestJson = call.getData();
        PaymentDataRequest request = PaymentDataRequest.fromJson(paymentDataRequestJson.toString());

        saveCall(call); // Между вызовами loadPaymentData и handleOnActivityResult висит окно оплаты и в теории промежуточных вызовов быть не должно
        AutoResolveHelper.resolveTask(paymentsClient.loadPaymentData(request), this.getActivity(), Constants.GOOGLE_PAY_REQUEST_CODE);

        // Не знаю способа как Task<T> превратить в Intent
        // startActivityForResult(call, paymentsClient.loadPaymentData(request), Constants.GOOGLE_PAY_REQUEST_CODE);

        // Все промисы разрешаются в методе handleOnActivityResult
        // call.success();
    }

    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        super.handleOnActivityResult(requestCode, resultCode, data);
        if (requestCode != Constants.GOOGLE_PAY_REQUEST_CODE) return;

        PluginCall call = getSavedCall();

        switch (resultCode) {
            case Activity.RESULT_OK:
                PaymentData paymentData = PaymentData.getFromIntent(data);

                try {
                    JSObject jsPaymentData = JSObject.fromJSONObject(new JSONObject(paymentData.toJson()));
                    call.success(jsPaymentData);
                    notifyListeners("success", jsPaymentData);
                } catch (final JSONException e) {
                    call.error(e.getLocalizedMessage(), e);
                    notifyListeners("error", new JSObject() {{
                        put("code", -1);
                        put("message", e.getLocalizedMessage());
                    }});
                }
                break;

            case Activity.RESULT_CANCELED:
                call.error("canceled");
                notifyListeners("canceled", new JSObject() {{
                    put("code", 0);
                    put("message", "Пользователь закрыл окно оплаты");
                }});
                break;

            case AutoResolveHelper.RESULT_ERROR:
                final Status status = AutoResolveHelper.getStatusFromIntent(data);

                call.error(status.getStatusMessage());
                notifyListeners("error", new JSObject() {{
                    put("code", status.getStatusCode());
                    put("message", status.getStatusMessage());
                }});
                break;

            default:
                call.error("undefined");
        }
    }
}
