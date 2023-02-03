package com.onesignal.cordova;

import com.onesignal.OneSignal;

import org.apache.cordova.CallbackContext;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class OneSignalSMSController {
    public static boolean addSms(JSONArray data) {
        try {
            OneSignal.getUser().addSms(data.getString(0));
            return true;
        } catch (Throwable t) {
            t.printStackTrace();
            return false;
        }
    }

    public static boolean removeSms(JSONArray data) {
        try {
            OneSignal.getUser().removeSms(data.getString(0));
            return true;
        } catch (Throwable t) {
            t.printStackTrace();
            return false;
        }
    }
}
