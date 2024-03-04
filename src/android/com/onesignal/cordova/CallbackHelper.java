package com.onesignal.cordova;

import org.apache.cordova.CallbackContext;
import org.json.JSONObject;
import org.apache.cordova.PluginResult;

public class CallbackHelper {

    // This is to prevent an issue where if two Javascript calls are made to OneSignal expecting a callback then only one would fire.
    public static void callbackSuccess(CallbackContext callbackContext, JSONObject jsonObject) {
        if (jsonObject == null) // in case there are no data
            jsonObject = new JSONObject();

        PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, jsonObject);
        pluginResult.setKeepCallback(true);
        callbackContext.sendPluginResult(pluginResult);
    }

    public static void callbackSuccessInt(CallbackContext callbackContext, int param) {
        PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, param);
        pluginResult.setKeepCallback(true);
        callbackContext.sendPluginResult(pluginResult);
    }

    public static void callbackSuccessBoolean(CallbackContext callbackContext, boolean param) {
        PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, param);
        pluginResult.setKeepCallback(true);
        callbackContext.sendPluginResult(pluginResult);
    }

    public static void callbackSuccessString(CallbackContext callbackContext, String param) {
        PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, param);
        pluginResult.setKeepCallback(true);
        callbackContext.sendPluginResult(pluginResult);
    }

    public static void callbackError(CallbackContext callbackContext, JSONObject jsonObject) {
        if (jsonObject == null) // in case there are no data
            jsonObject = new JSONObject();

        PluginResult pluginResult = new PluginResult(PluginResult.Status.ERROR, jsonObject);
        pluginResult.setKeepCallback(true);
        callbackContext.sendPluginResult(pluginResult);
    }

    public static void callbackError(CallbackContext callbackContext, String str) {
        PluginResult pluginResult = new PluginResult(PluginResult.Status.ERROR, str);
        pluginResult.setKeepCallback(true);
        callbackContext.sendPluginResult(pluginResult);
    }

}
