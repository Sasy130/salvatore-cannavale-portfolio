package it.dimoramia.owner;

import android.app.*;
import android.content.*;
import com.google.firebase.*;
import org.json.JSONObject;

public class DimoraApp extends Application {
  final AccessWindow accessWindow = new AccessWindow();

  @Override
  public void onCreate() {
    super.onCreate();
    NotificationChannel channel =
        new NotificationChannel(
            "prenotazioni", "Prenotazioni DIMORA MIA", NotificationManager.IMPORTANCE_HIGH);
    channel.setDescription(
        "Nuove prenotazioni e prove dal server. Nessun dato degli ospiti sullo schermo bloccato.");
    channel.setLockscreenVisibility(Notification.VISIBILITY_PRIVATE);
    getSystemService(NotificationManager.class).createNotificationChannel(channel);
    try {
      String config = getSharedPreferences("native", 0).getString("firebase", "");
      if (!config.isEmpty()) configure(new JSONObject(config));
    } catch (Exception ignored) {
    }
  }

  synchronized boolean configure(JSONObject c) {
    try {
      if (c.optString("applicationId").isEmpty()
          || c.optString("apiKey").isEmpty()
          || c.optString("senderId").isEmpty()
          || c.optString("projectId").isEmpty()) return false;
      if (!FirebaseApp.getApps(this).isEmpty()
          && !FirebaseApp.getInstance()
              .getOptions()
              .getApplicationId()
              .equals(c.getString("applicationId"))) FirebaseApp.getInstance().delete();
      if (FirebaseApp.getApps(this).isEmpty())
        FirebaseApp.initializeApp(
            this,
            new FirebaseOptions.Builder()
                .setApplicationId(c.getString("applicationId"))
                .setApiKey(c.getString("apiKey"))
                .setGcmSenderId(c.getString("senderId"))
                .setProjectId(c.getString("projectId"))
                .build());
      getSharedPreferences("native", 0).edit().putString("firebase", c.toString()).apply();
      return true;
    } catch (Exception e) {
      return false;
    }
  }
}
