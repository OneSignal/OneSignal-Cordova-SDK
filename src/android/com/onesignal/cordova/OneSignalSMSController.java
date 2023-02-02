package com.onesignal.cordova;

import com.onesignal.OneSignal;
// import com.onesignal.OneSignal.EmailUpdateError;
// import com.onesignal.OneSignal.EmailUpdateHandler;

import org.apache.cordova.CallbackContext;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class OneSignalSMSController {
    public static boolean addSmsNumber(JSONArray data) {
        try {
            OneSignal.getUser().addSmsSubscription(data.getString(0));
            return true;
        } catch (Throwable t) {
            t.printStackTrace();
            return false;
        }
    }

    public static boolean removeSmsNumber(JSONArray data) {
        try {
            OneSignal.getUser().removeSmsSubscription(data.getString(0));
            return true;
        } catch (Throwable t) {
            t.printStackTrace();
            return false;
        }
    }
}
