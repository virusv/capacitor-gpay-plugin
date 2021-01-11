import Foundation
import Capacitor

@objc(GPayNative)
public class GPayNative: CAPPlugin {
    @objc func createClient(_ call: CAPPluginCall) {
        call.success()
    }

    @objc func isReadyToPay(_ call: CAPPluginCall) {
        call.success([
            "isReady": false
        ])
    }

    @objc func loadPaymentData(_ call: CAPPluginCall) {
        call.success()
    }
}
