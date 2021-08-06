package com.onesignal.cordova;

import com.onesignal.OneSignal;
import com.onesignal.OneSignal.EmailUpdateError;
import com.onesignal.OneSignal.EmailUpdateHandler;

import org.apache.cordova.CallbackContext;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class OneSignalSMSController {
    public static boolean setSMSNumber(CallbackContext callbackContext, JSONArray data) {
        final CallbackContext jsSetSMSNumberContext = callbackContext;
        try {
            OneSignal.setSMSNumber(data.getString(0), data.getString(1), new OneSignal.OSSMSUpdateHandler() {
                @Override
                public void onSuccess(JSONObject result) {
                    CallbackHelper.callbackSuccess(jsSetSMSNumberContext, result);
                }
          
                @Override
                public void onFailure(OneSignal.OSSMSUpdateError error) {
                    try {
                        JSONObject errorObject = new JSONObject("{'error' : '" + error.getMessage() + "'}");
                        CallbackHelper.callbackError(jsSetSMSNumberContext, errorObject);
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

    public static boolean setUnauthenticatedEmail(CallbackContext callbackContext, JSONArray data) {
        final CallbackContext jsSetSMSNumberContext = callbackContext;
        try {
            OneSignal.setSMSNumber(data.getString(0), null, new OneSignal.OSSMSUpdateHandler() {
                @Override
                public void onSuccess(JSONObject result) {
                    CallbackHelper.callbackSuccess(jsSetSMSNumberContext, result);
                }
          
                @Override
                public void onFailure(OneSignal.OSSMSUpdateError error) {
                    try {
                        JSONObject errorObject = new JSONObject("{'error' : '" + error.getMessage() + "'}");
                        CallbackHelper.callbackError(jsSetSMSNumberContext, errorObject);
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

    public static boolean logoutSMSNumber(CallbackContext callbackContext) {
        final CallbackContext jsSetSMSNumberContext = callbackContext;
        OneSignal.logoutSMSNumber(new OneSignal.OSSMSUpdateHandler() {
            @Override
            public void onSuccess(JSONObject result) {
                CallbackHelper.callbackSuccess(jsSetSMSNumberContext, result);
            }
      
            @Override
            public void onFailure(OneSignal.OSSMSUpdateError error) {
                try {
                    JSONObject errorObject = new JSONObject("{'error' : '" + error.getMessage() + "'}");
                    CallbackHelper.callbackError(jsSetSMSNumberContext, errorObject);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        });

        return true;
    }
}
