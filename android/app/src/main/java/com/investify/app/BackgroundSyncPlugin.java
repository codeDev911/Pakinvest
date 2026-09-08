package com.investify.app;

import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "BackgroundSync")
public class BackgroundSyncPlugin extends Plugin {

    @PluginMethod
    public void configure(PluginCall call) {
        String serverUrl = call.getString("serverUrl", "");
        String token = call.getString("token", "");
        String userId = call.getString("userId", "");
        String lastSeenId = call.getString("lastSeenId", "");
        int intervalSeconds = call.getInt("intervalSeconds", 60);

        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences(CrmNotificationSyncReceiver.PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        if (serverUrl != null && !serverUrl.isEmpty()) {
            editor.putString(CrmNotificationSyncReceiver.KEY_SERVER_URL, serverUrl);
        }
        if (token != null && !token.isEmpty()) {
            editor.putString(CrmNotificationSyncReceiver.KEY_AUTH_TOKEN, token);
        }
        if (userId != null && !userId.isEmpty()) {
            editor.putString(CrmNotificationSyncReceiver.KEY_USER_ID, userId);
        }
        if (lastSeenId != null && !lastSeenId.isEmpty()) {
            editor.putString(CrmNotificationSyncReceiver.KEY_LAST_SEEN_ID, lastSeenId);
        }
        editor.putLong(CrmNotificationSyncReceiver.KEY_INTERVAL_MS, (long) intervalSeconds * 1000L);
        editor.apply();

        // Start background scheduling immediately
        CrmNotificationSyncReceiver.scheduleNextSync(context, 5000L);

        call.resolve();
    }

    @PluginMethod
    public void syncNow(PluginCall call) {
        CrmNotificationSyncReceiver.triggerImmediateSync(getContext());
        call.resolve();
    }
}
