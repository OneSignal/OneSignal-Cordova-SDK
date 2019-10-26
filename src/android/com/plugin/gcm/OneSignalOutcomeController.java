package com.plugin.gcm;

import com.onesignal.OneSignal;
import com.onesignal.OutcomeEvent;
import com.onesignal.OneSignal.OutcomeCallback;

import org.apache.cordova.CallbackContext;

import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class OneSignalOutcomeController {
  private static CallbackContext inAppMessageClickedCallbackContext;

  // This is to prevent an issue where if two Javascript calls are made to OneSignal expecting a callback then only one would fire.
  private static void callbackSuccess(CallbackContext callbackContext, JSONObject jsonObject) {
    if (jsonObject == null) // in case there are no data
      jsonObject = new JSONObject();

    PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, jsonObject);
    pluginResult.setKeepCallback(true);
    callbackContext.sendPluginResult(pluginResult);
  }

  public static boolean sendUniqueOutcome(CallbackContext callbackContext, JSONArray data) {
    try {
      final CallbackContext jsSendUniqueOutcomeCallback = callbackContext;
      String name = data.getString(0);
      OneSignal.sendUniqueOutcome(name, new OutcomeCallback(){
        @Override
        public void onSuccess(OutcomeEvent event) {
          callbackSuccess(jsSendUniqueOutcomeCallback, event.toJSONObject());
        }
      });
      return true;
    } catch (JSONException e) {
      e.printStackTrace();
      return false;
    }
  }

  public static boolean sendOutcome(CallbackContext callbackContext, JSONArray data) {
    try {
      final CallbackContext jsSendOutcomeCallback = callbackContext;
      String name = data.getString(0);
      OneSignal.sendOutcome(name, new OutcomeCallback(){
        @Override
        public void onSuccess(OutcomeEvent event) {
          callbackSuccess(jsSendOutcomeCallback, event.toJSONObject());
        }
      });
      return true;
    } catch (JSONException e) {
      e.printStackTrace();
      return false;
    }
  }

  public static boolean sendOutcomeWithValue(CallbackContext callbackContext, JSONArray data) {
    try {
      final CallbackContext jsSendOutcomeWithValueCallback = callbackContext;
      String name = data.getString(0);
      Float value = Double.valueOf(data.optDouble(1)).floatValue();
      OneSignal.sendOutcomeWithValue(name, value, new OutcomeCallback(){
        @Override
        public void onSuccess(OutcomeEvent event) {
          callbackSuccess(jsSendOutcomeWithValueCallback, event.toJSONObject());
        }
      });
      return true;
    } catch (JSONException e) {
      e.printStackTrace();
      return false;
    }
  }
}