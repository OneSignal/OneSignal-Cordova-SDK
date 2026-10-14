package com.onesignal.cordova;

import com.onesignal.LoginData;
import com.onesignal.OneSignal;
import com.onesignal.OneSignalResult;
import com.onesignal.OneSignalUserProfile;
import com.onesignal.debug.internal.logging.Logging;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import kotlin.Result;
import kotlin.coroutines.Continuation;
import kotlin.coroutines.CoroutineContext;
import kotlin.coroutines.EmptyCoroutineContext;
import kotlin.coroutines.intrinsics.IntrinsicsKt;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class OneSignalLoginController {
    private static final String TAG = "OneSignalLoginController";

    public static boolean loginWithProfile(CallbackContext callbackContext, JSONArray data) {
        final AtomicBoolean sent = new AtomicBoolean(false);
        try {
            String externalId = data.getString(0);
            OneSignalUserProfile profile = toProfile(data.optJSONObject(1));
            String jwt = optString(data, 2);

            Continuation<OneSignalResult<LoginData>> continuation = new Continuation<OneSignalResult<LoginData>>() {
                @Override
                public CoroutineContext getContext() {
                    return EmptyCoroutineContext.INSTANCE;
                }

                @Override
                public void resumeWith(Object result) {
                    if (result instanceof Result.Failure) {
                        sendFailure(callbackContext, sent, ((Result.Failure) result).exception);
                    } else {
                        sendResult(callbackContext, sent, result);
                    }
                }
            };

            // A non-suspending return carries the result directly and resumeWith is never called.
            Object returned = OneSignal.login(externalId, profile, jwt, continuation);
            if (returned != IntrinsicsKt.getCOROUTINE_SUSPENDED()) {
                sendResult(callbackContext, sent, returned);
            }
        } catch (Throwable t) {
            sendFailure(callbackContext, sent, t);
        }
        return true;
    }

    private static OneSignalUserProfile toProfile(JSONObject json) throws JSONException {
        if (json == null) {
            return OneSignalUserProfile.builder().build();
        }
        return OneSignalUserProfile.builder()
                .setEmail(optString(json, "email"))
                .setSms(optString(json, "sms"))
                .setTags(toStringMap(json.optJSONObject("tags")))
                .setAliases(toStringMap(json.optJSONObject("aliases")))
                .build();
    }

    private static Map<String, String> toStringMap(JSONObject json) throws JSONException {
        Map<String, String> map = new HashMap<>();
        if (json == null) {
            return map;
        }
        Iterator<String> keys = json.keys();
        while (keys.hasNext()) {
            String key = keys.next();
            map.put(key, json.get(key).toString());
        }
        return map;
    }

    private static String optString(JSONObject json, String key) {
        return json.isNull(key) ? null : json.optString(key);
    }

    private static String optString(JSONArray array, int index) {
        return array.isNull(index) ? null : array.optString(index);
    }

    private static void sendResult(CallbackContext callbackContext, AtomicBoolean sent, Object result) {
        if (!(result instanceof OneSignalResult)) {
            sendFailure(callbackContext, sent, null);
            return;
        }
        try {
            send(callbackContext, sent, new JSONObject(((OneSignalResult<?>) result).toMap()));
        } catch (Throwable t) {
            sendFailure(callbackContext, sent, t);
        }
    }

    private static void sendFailure(CallbackContext callbackContext, AtomicBoolean sent, Throwable throwable) {
        Logging.error(TAG + " loginWithProfile failed", throwable);
        String message = throwable != null && throwable.getMessage() != null
                ? throwable.getMessage()
                : "loginWithProfile returned an unexpected result";
        try {
            JSONObject error = new JSONObject();
            error.put("code", "UNKNOWN");
            error.put("source", "CLIENT");
            error.put("backendCode", JSONObject.NULL);
            error.put("httpStatus", JSONObject.NULL);
            error.put("message", message);
            error.put("meta", JSONObject.NULL);

            JSONObject envelope = new JSONObject();
            envelope.put("success", false);
            envelope.put("data", JSONObject.NULL);
            envelope.put("error", new JSONArray().put(error));
            send(callbackContext, sent, envelope);
        } catch (JSONException e) {
            if (sent.compareAndSet(false, true)) {
                callbackContext.error(message);
            }
        }
    }

    private static void send(CallbackContext callbackContext, AtomicBoolean sent, JSONObject envelope) {
        if (sent.compareAndSet(false, true)) {
            callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK, envelope));
        }
    }
}
