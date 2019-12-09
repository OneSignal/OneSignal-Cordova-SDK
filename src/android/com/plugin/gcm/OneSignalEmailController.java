package com.plugin.gcm;

import org.apache.cordova.CallbackContext;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.onesignal.OneSignal;
import com.onesignal.OneSignal.EmailUpdateHandler;
import com.onesignal.OneSignal.EmailUpdateError;


public class OneSignalEmailController {
  public static boolean setEmail(CallbackContext callbackContext, JSONArray data) {
    final CallbackContext jsSetEmailContext = callbackContext;
    try {
      OneSignal.setEmail(data.getString(0), data.getString(1), new EmailUpdateHandler() {
        @Override
        public void onSuccess() {
          CallbackHelper.callbackSuccess(jsSetEmailContext, null);
        }

        @Override
        public void onFailure(EmailUpdateError error) {
          try {
            JSONObject errorObject = new JSONObject("{'error' : '" + error.getMessage() + "'}");
            CallbackHelper.callbackError(jsSetEmailContext, errorObject);
          } catch (JSONException e) {
            e.printStackTrace();
          }
        }
      });

      return true;
    } catch(Throwable t) {
      t.printStackTrace();
      return false;
    }
  }

  public static boolean setUnauthenticatedEmail(CallbackContext callbackContext, JSONArray data) {
    final CallbackContext jsSetEmailContext = callbackContext;
    try {
      OneSignal.setEmail(data.getString(0), null, new EmailUpdateHandler() {
        @Override
        public void onSuccess() {
          CallbackHelper.callbackSuccess(jsSetEmailContext, null);
        }

        @Override
        public void onFailure(EmailUpdateError error) {
          try {
            JSONObject errorObject = new JSONObject("{'error' : '" + error.getMessage() + "'}");
            CallbackHelper.callbackError(jsSetEmailContext, errorObject);
          } catch (JSONException e) {
            e.printStackTrace();
          }
        }
      });

      return true;
    } catch (Throwable t) {
      t.printStackTrace();
      return false;
    }
  }

  public static boolean logoutEmail(CallbackContext callbackContext) {
    final CallbackContext jsSetEmailContext = callbackContext;
    OneSignal.logoutEmail(new EmailUpdateHandler() {
      @Override
      public void onSuccess() {
        CallbackHelper.callbackSuccess(jsSetEmailContext, null);
      }

      @Override
      public void onFailure(EmailUpdateError error) {
        try {
          JSONObject errorObject = new JSONObject("{'error' : '" + error.getMessage() + "'}");
          CallbackHelper.callbackError(jsSetEmailContext, errorObject);
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }
    });

    return true;
  }

  public static void syncHashedEmail(JSONArray data) {
    try {
      OneSignal.syncHashedEmail(data.getString(0));
    } catch(Throwable t) {
      t.printStackTrace();
    }
  }
}
