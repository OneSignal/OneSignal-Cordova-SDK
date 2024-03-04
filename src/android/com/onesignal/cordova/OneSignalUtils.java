package com.onesignal.cordova;

import org.json.JSONObject;

public class OneSignalUtils {
    /** Helper method to return null if string is empty **/
    public static String getStringOrNull(String str) {
        return str.isEmpty() ? null : str;
    }

    /** Helper method to return JSONObject.NULL if string is empty or nil **/
    public static Object getStringOrJSONObjectNull(String str) {
        if (str != null && !str.isEmpty()) {
            return str;
        } else {
            return JSONObject.NULL;
        }
    }
}
