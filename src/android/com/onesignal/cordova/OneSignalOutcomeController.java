package com.onesignal.cordova;

import android.util.Log;

import com.onesignal.OneSignal;

import org.apache.cordova.CallbackContext;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class OneSignalOutcomeController {

  public static boolean addUniqueOutcome(JSONArray data) {
    try {
      final String name = data.getString(0);
      OneSignal.getSession().addUniqueOutcome(name);
      return true;
    } catch (JSONException e) {
      e.printStackTrace();
      return false;
    }
  }

  public static boolean addOutcome(JSONArray data) {
    try {
      final String name = data.getString(0);
      OneSignal.getSession().addOutcome(name);
      return true;
    } catch (JSONException e) {
      e.printStackTrace();
      return false;
    }
  }

  public static boolean addOutcomeWithValue(JSONArray data) {
    try {
      final String name = data.getString(0);
      final float value = Double.valueOf(data.optDouble(1)).floatValue();
      OneSignal.getSession().addOutcomeWithValue(name, value);
      return true;
    } catch (JSONException e) {
      e.printStackTrace();
      return false;
    }
  }
}
