package com.plugin.gcm;

import com.onesignal.OneSignal;
import com.onesignal.OutcomeEvent;
import com.onesignal.OneSignal.OutcomeCallback;

import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class OneSignalOutcomeController {

  public static boolean sendUniqueOutcome(CallbackContext callbackContext, JSONArray data) {
    try {
      final CallbackContext jsSendUniqueOutcomeCallback = callbackContext;
      String name = data.getString(0);
      OneSignal.sendUniqueOutcome(name, new OutcomeCallback(){
        @Override
        public void onSuccess(OutcomeEvent outcomeEvent) {
          if (outcomeEvent == null)
            CallbackHelper.callbackSuccess(jsSendUniqueOutcomeCallback, new JSONObject());
          else
            CallbackHelper.callbackSuccess(jsSendUniqueOutcomeCallback, outcomeEvent.toJSONObject());
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
      OneSignal.sendOutcome(name, new OutcomeCallback() {
        @Override
        public void onSuccess(OutcomeEvent outcomeEvent) {
          if (outcomeEvent == null)
            CallbackHelper.callbackSuccess(jsSendOutcomeCallback, new JSONObject());
          else
            CallbackHelper.callbackSuccess(jsSendOutcomeCallback, outcomeEvent.toJSONObject());
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
      float value = Double.valueOf(data.optDouble(1)).floatValue();
      OneSignal.sendOutcomeWithValue(name, value, new OutcomeCallback() {
        @Override
        public void onSuccess(OutcomeEvent outcomeEvent) {
          if (outcomeEvent == null)
            CallbackHelper.callbackSuccess(jsSendOutcomeWithValueCallback, new JSONObject());
          else
            CallbackHelper.callbackSuccess(jsSendOutcomeWithValueCallback, outcomeEvent.toJSONObject());
        }
      });
      return true;
    } catch (JSONException e) {
      e.printStackTrace();
      return false;
    }
  }
}