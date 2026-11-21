package it.dimoramia.owner;

import android.Manifest;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.os.Build;
import com.google.firebase.messaging.*;
import java.util.UUID;
import org.json.JSONObject;

public class DimoraMessagingService extends FirebaseMessagingService {
  @Override
  public void onNewToken(String token) {
    getSharedPreferences("native", 0).edit().putString("fcmToken", token).apply();
    if (new SessionStore(this).get().isEmpty()) return;
    new Thread(
            () -> {
              try {
                JSONObject b =
                    new JSONObject()
                        .put("token", token)
                        .put("label", Build.MANUFACTURER + " " + Build.MODEL);
                JSONObject r = new Api(this).call("admin/native/push/register", b);
                getSharedPreferences("native", 0)
                    .edit()
                    .putString("deviceId", r.getString("id"))
                    .apply();
              } catch (Exception ignored) {
              }
            },
            "dimora-token")
        .start();
  }

  @Override
  public void onMessageReceived(RemoteMessage message) {
    if (Build.VERSION.SDK_INT >= 33
        && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
            != PackageManager.PERMISSION_GRANTED) return;
    String kind = message.getData().get("kind"), event = message.getData().get("eventId");
    if (event == null || !event.matches("[a-zA-Z0-9-]{1,80}")) event = UUID.randomUUID().toString();
    Intent intent =
        new Intent(this, MainActivity.class)
            .putExtra("view", "booking".equals(kind) ? "reservations" : "overview")
            .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
    String bookingId = message.getData().get("bookingId");
    if (bookingId != null && bookingId.matches("[a-zA-Z0-9-]{1,80}"))
      intent.putExtra("bookingId", bookingId);
    PendingIntent pending =
        PendingIntent.getActivity(
            this,
            event.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    boolean test = "test".equals(kind);
    Notification n =
        new Notification.Builder(this, "prenotazioni")
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(test ? "DIMORA MIA · prova" : "DIMORA MIA · nuova prenotazione")
            .setContentText(
                test
                    ? "Il collegamento nativo con il server funziona."
                    : "Hai ricevuto una prenotazione. Apri l’app per i dettagli.")
            .setVisibility(Notification.VISIBILITY_PRIVATE)
            .setAutoCancel(true)
            .setContentIntent(pending)
            .setCategory(Notification.CATEGORY_EVENT)
            .build();
    getSystemService(NotificationManager.class).notify(event, 0, n);
  }
}
