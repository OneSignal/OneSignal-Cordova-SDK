package com.onesignal.cordova;

import com.onesignal.OneSignal;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public class OneSignalInAppMessagingController {

    // This is to prevent an issue where if two Javascript calls are made to OneSignal expecting a callback then only one would fire.
    private static void callbackSuccess(CallbackContext callbackContext, JSONObject jsonObject) {
        if (jsonObject == null) // in case there are no data
            jsonObject = new JSONObject();

        PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, jsonObject);
        pluginResult.setKeepCallback(true);
        callbackContext.sendPluginResult(pluginResult);
    }

    public static boolean addTriggers(JSONArray data) {
        try {
            JSONObject triggersObject = data.getJSONObject(0);
            Map<String, Object> triggers = new HashMap<>();
            Iterator<String> keys = triggersObject.keys();

            while (keys.hasNext()) {
                String key = keys.next();
                triggers.put(key, triggersObject.get(key));
            }

            OneSignal.addTriggers(triggers);
            return true;
        } catch (JSONException e) {
            e.printStackTrace();
            return false;
        }
    }

    public static boolean removeTriggersForKeys(JSONArray data) {
        try {
            JSONArray triggerKeysArray = data.getJSONArray(0);
            List<String> triggerKeys = new ArrayList<>();

            for (int i = 0; i < triggerKeysArray.length(); i++) {
                triggerKeys.add(triggerKeysArray.getString(i));
            }

            OneSignal.removeTriggersForKeys(triggerKeys);
            return true;
        } catch (JSONException e) {
            e.printStackTrace();
            return false;
        }
    }

    public static boolean getTriggerValueForKey(CallbackContext callbackContext, JSONArray data) {
        try {
            Object value = OneSignal.getTriggerValueForKey(data.getString(0));
            if (value == null) {
                callbackSuccess(callbackContext, new JSONObject());
            } else {
                callbackSuccess(callbackContext, new JSONObject(
                        "{value:"
                                + value.toString()
                                + "}"));
            }
            return true;
        } catch (JSONException e) {
            e.printStackTrace();
            return false;
        }
    }

    public static boolean pauseInAppMessages(JSONArray data) {
        try {
            OneSignal.pauseInAppMessages(data.getBoolean(0));
            return true;
        } catch (JSONException e) {
            e.printStackTrace();
            return false;
        }
    }

    public static boolean isInAppMessagingPaused(CallbackContext callbackContext) {
        boolean inAppMessagingPaused = OneSignal.isInAppMessagingPaused();
        CallbackHelper.callbackSuccessBoolean(callbackContext, inAppMessagingPaused);
        return true;
    }

}
