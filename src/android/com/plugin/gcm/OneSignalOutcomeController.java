package com.plugin.gcm;

import android.util.Log;

import com.onesignal.OneSignal;
import com.onesignal.OutcomeEvent;
import com.onesignal.OneSignal.OutcomeCallback;

import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class OneSignalOutcomeController {

  private static final String TAG = "OneSignalOutcome";

  public static boolean sendUniqueOutcome(CallbackContext callbackContext, JSONArray data) {
    try {
      final CallbackContext jsSendUniqueOutcomeCallback = callbackContext;
      final String name = data.getString(0);
      OneSignal.sendUniqueOutcome(name, new OutcomeCallback(){
        @Override
        public void onSuccess(OutcomeEvent outcomeEvent) {
          if (outcomeEvent == null)
            CallbackHelper.callbackSuccess(jsSendUniqueOutcomeCallback, new JSONObject());
          else {
            try {
              CallbackHelper.callbackSuccess(jsSendUniqueOutcomeCallback, outcomeEvent.toJSONObject());
            } catch (JSONException e) {
              Log.e(TAG, "sendUniqueOutcome with name: " + name + ", failed with message: " + e.getMessage());
            }
          }
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
      final String name = data.getString(0);
      OneSignal.sendOutcome(name, new OutcomeCallback() {
        @Override
        public void onSuccess(OutcomeEvent outcomeEvent) {
          if (outcomeEvent == null)
            CallbackHelper.callbackSuccess(jsSendOutcomeCallback, new JSONObject());
          else {
            try {
              CallbackHelper.callbackSuccess(jsSendOutcomeCallback, outcomeEvent.toJSONObject());
            } catch (JSONException e) {
              Log.e(TAG, "sendOutcome with name: " + name + ", failed with message: " + e.getMessage());
            }
          }
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
      final String name = data.getString(0);
      final float value = Double.valueOf(data.optDouble(1)).floatValue();
      OneSignal.sendOutcomeWithValue(name, value, new OutcomeCallback() {
        @Override
        public void onSuccess(OutcomeEvent outcomeEvent) {
          if (outcomeEvent == null)
            CallbackHelper.callbackSuccess(jsSendOutcomeWithValueCallback, new JSONObject());
          else {
            try {
              CallbackHelper.callbackSuccess(jsSendOutcomeWithValueCallback, outcomeEvent.toJSONObject());
            } catch (JSONException e) {
              Log.e(TAG, "sendOutcomeWithValue with name: " + name + " and value: " + value + ", failed with message: " + e.getMessage());
            }
          }
        }
      });
      return true;
    } catch (JSONException e) {
      e.printStackTrace();
      return false;
    }
  }
}