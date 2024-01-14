package com.onesignal;

public class OneSignalRemoteNotificationHandlerSetter {
    public static void setRemoteNotificationHandler(OneSignal.OSRemoteNotificationReceivedHandler handler) {
        OneSignal.setRemoteNotificationReceivedHandler(handler);
    }
}
