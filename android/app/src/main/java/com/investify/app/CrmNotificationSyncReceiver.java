package com.investify.app;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Background BroadcastReceiver that wakes up via AlarmManager to poll the backend
 * for new CRM broadcasts, admin announcements, and account approvals even when the
 * Investify application is closed or in Doze mode.
 */
public class CrmNotificationSyncReceiver extends BroadcastReceiver {
    private static final String TAG = "InvestifySync";

    public static final String PREFS_NAME = "InvestifyBackgroundSync";
    public static final String KEY_SERVER_URL = "server_url";
    public static final String KEY_AUTH_TOKEN = "auth_token";
    public static final String KEY_USER_ID = "user_id";
    public static final String KEY_LAST_SEEN_ID = "last_seen_id";
    public static final String KEY_INTERVAL_MS = "interval_ms";

    public static final String ACTION_SYNC_NOTIFICATIONS = "com.investify.app.ACTION_SYNC_NOTIFICATIONS";
    public static final String CHANNEL_ID = "investify_alerts";
    public static final String CHANNEL_NAME = "Investify Real-Time Alerts";

    private static final ExecutorService executor = Executors.newSingleThreadExecutor();

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "CrmNotificationSyncReceiver triggered with action: " + (intent != null ? intent.getAction() : "null"));

        final Context appContext = context.getApplicationContext();

        // Perform HTTP check in background thread
        executor.execute(() -> {
            try {
                pollAndNotify(appContext);
            } catch (Exception e) {
                Log.e(TAG, "Error during background sync: " + e.getMessage(), e);
            } finally {
                // Re-arm next alarm check
                SharedPreferences prefs = appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                long interval = prefs.getLong(KEY_INTERVAL_MS, 60000L);
                scheduleNextSync(appContext, interval);
            }
        });
    }

    private void pollAndNotify(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String serverUrl = prefs.getString(KEY_SERVER_URL, "");
        if (serverUrl == null || serverUrl.trim().isEmpty()) {
            return;
        }

        String token = prefs.getString(KEY_AUTH_TOKEN, "");
        String userId = prefs.getString(KEY_USER_ID, "");
        String lastSeenId = prefs.getString(KEY_LAST_SEEN_ID, "");

        // Build sync URL
        StringBuilder urlBuilder = new StringBuilder(serverUrl.replaceAll("/+$", ""));
        urlBuilder.append("/api/notifications/sync-background?");
        if (userId != null && !userId.isEmpty()) {
            urlBuilder.append("userId=").append(userId).append("&");
        }
        if (lastSeenId != null && !lastSeenId.isEmpty()) {
            urlBuilder.append("lastId=").append(lastSeenId).append("&");
        }
        if (token != null && !token.isEmpty()) {
            urlBuilder.append("token=").append(token);
        }

        HttpURLConnection conn = null;
        try {
            URL url = new URL(urlBuilder.toString());
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(8000);
            conn.setReadTimeout(8000);
            conn.setRequestProperty("Accept", "application/json");
            if (token != null && !token.isEmpty()) {
                conn.setRequestProperty("Authorization", "Bearer " + token);
            }

            int responseCode = conn.getResponseCode();
            if (responseCode == 200) {
                BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder response = new StringBuilder();
                String inputLine;
                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
                in.close();

                JSONObject data = new JSONObject(response.toString());
                if (data.optBoolean("success", false)) {
                    JSONArray notifications = data.optJSONArray("notifications");
                    String latestId = data.optString("latestId", "");

                    if (notifications != null && notifications.length() > 0) {
                        for (int i = 0; i < notifications.length(); i++) {
                            JSONObject n = notifications.getJSONObject(i);
                            showNotification(context, n);
                        }
                    }

                    if (latestId != null && !latestId.isEmpty()) {
                        prefs.edit().putString(KEY_LAST_SEEN_ID, latestId).apply();
                    }
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to poll notifications from server: " + e.getMessage());
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
    }

    private void showNotification(Context context, JSONObject notif) {
        try {
            String title = notif.optString("title", "Investify Notification");
            String message = notif.optString("message", "You have a new announcement from Investify.");
            String notifId = notif.optString("id", String.valueOf(System.currentTimeMillis()));

            NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (notificationManager == null) return;

            Uri soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);

            // Ensure notification channel exists on Android 8+
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationChannel channel = notificationManager.getNotificationChannel(CHANNEL_ID);
                if (channel == null) {
                    channel = new NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_HIGH);
                    channel.setDescription("Real-time investment profit credits, announcements, and payouts");
                    channel.enableLights(true);
                    channel.setLightColor(Color.GREEN);
                    channel.enableVibration(true);
                    channel.setVibrationPattern(new long[]{0, 250, 150, 250});
                    channel.setLockscreenVisibility(NotificationCompat.VISIBILITY_PUBLIC);

                    AudioAttributes audioAttributes = new AudioAttributes.Builder()
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                            .build();
                    channel.setSound(soundUri, audioAttributes);
                    notificationManager.createNotificationChannel(channel);
                }
            }

            // Launch MainActivity when tapped
            Intent openIntent = new Intent(context, MainActivity.class);
            openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent contentIntent = PendingIntent.getActivity(
                    context,
                    notifId.hashCode(),
                    openIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
            );

            int smallIconRes = context.getResources().getIdentifier("ic_launcher", "drawable", context.getPackageName());
            if (smallIconRes == 0) {
                smallIconRes = context.getResources().getIdentifier("ic_launcher", "mipmap", context.getPackageName());
            }
            if (smallIconRes == 0) {
                smallIconRes = android.R.drawable.ic_dialog_info;
            }

            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(smallIconRes)
                    .setContentTitle(title)
                    .setContentText(message)
                    .setStyle(new NotificationCompat.BigTextStyle().bigText(message))
                    .setPriority(NotificationCompat.PRIORITY_MAX)
                    .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                    .setAutoCancel(true)
                    .setSound(soundUri)
                    .setVibrate(new long[]{0, 250, 150, 250})
                    .setColor(0xFF10B981) // Emerald Green
                    .setContentIntent(contentIntent);

            notificationManager.notify(notifId.hashCode(), builder.build());
            Log.d(TAG, "Dispatched notification to lock screen: " + title);
        } catch (Exception e) {
            Log.e(TAG, "Failed to display notification: " + e.getMessage(), e);
        }
    }

    public static void scheduleNextSync(Context context, long delayMs) {
        try {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (alarmManager == null) return;

            Intent intent = new Intent(context, CrmNotificationSyncReceiver.class);
            intent.setAction(ACTION_SYNC_NOTIFICATIONS);

            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }

            PendingIntent pendingIntent = PendingIntent.getBroadcast(context, 7788, intent, flags);
            long triggerAtMillis = System.currentTimeMillis() + Math.max(10000L, delayMs);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
            } else {
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
            }
            Log.d(TAG, "Scheduled next background sync in " + (delayMs / 1000) + "s");
        } catch (Exception e) {
            Log.e(TAG, "Failed to schedule next sync alarm: " + e.getMessage(), e);
        }
    }

    public static void triggerImmediateSync(Context context) {
        scheduleNextSync(context, 1000L);
    }
}
