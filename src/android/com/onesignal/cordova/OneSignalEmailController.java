package com.onesignal.cordova;

import com.onesignal.OneSignal;

import org.apache.cordova.CallbackContext;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class OneSignalEmailController {
    public static boolean addEmail(JSONArray data) {
        try {
            OneSignal.getUser().addEmail(data.getString(0));
            return true;
        } catch (Throwable t) {
            t.printStackTrace();
            return false;
        }
    }

    public static boolean removeEmail(JSONArray data) {
        try {
            OneSignal.getUser().removeEmail(data.getString(0));
            return true;
        } catch (Throwable t) {
            t.printStackTrace();
            return false;
        }
    }
}
