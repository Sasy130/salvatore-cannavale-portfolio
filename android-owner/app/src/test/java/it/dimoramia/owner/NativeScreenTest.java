package it.dimoramia.owner;

import static org.junit.Assert.*;

import android.view.*;
import android.widget.*;
import java.lang.reflect.*;
import org.json.*;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.Robolectric;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.android.controller.ActivityController;
import org.robolectric.annotation.Config;

@RunWith(RobolectricTestRunner.class)
@Config(sdk = 28)
public class NativeScreenTest {
  private TextView find(View view, String text) {
    if (view instanceof TextView && ((TextView) view).getText().toString().equals(text))
      return (TextView) view;
    if (view instanceof ViewGroup) {
      ViewGroup group = (ViewGroup) view;
      for (int i = 0; i < group.getChildCount(); i++) {
        TextView match = find(group.getChildAt(i), text);
        if (match != null) return match;
      }
    }
    return null;
  }

  private void set(Object object, String name, Object value) throws Exception {
    Field field = object.getClass().getDeclaredField(name);
    field.setAccessible(true);
    field.set(object, value);
  }

  @Test
  public void nativeLoginInflatesAndRejectsMissingPasswordWithoutCallingServer() {
    try (ActivityController<MainActivity> controller =
        Robolectric.buildActivity(MainActivity.class).create().start().resume().visible()) {
      MainActivity app = controller.get();
      View root = app.getWindow().getDecorView();
      TextView login = find(root, "Accedi alla gestione →");
      assertNotNull(login);
      assertTrue(login.performClick());
      assertNotNull(find(root, "Inserisci la password proprietario di almeno 12 caratteri."));
    }
  }

  @Test
  public void nativeDashboardAndCalendarRenderSharedInventoryWithoutBrowserViews()
      throws Exception {
    try (ActivityController<MainActivity> controller =
        Robolectric.buildActivity(MainActivity.class).create().start().resume().visible()) {
      MainActivity app = controller.get();
      JSONObject data =
          new JSONObject()
              .put("bookings", new JSONArray())
              .put("payments", new JSONArray())
              .put("settings", new JSONObject());
      set(app, "data", data);
      set(app, "stale", false);
      Method render = MainActivity.class.getDeclaredMethod("render");
      render.setAccessible(true);
      render.invoke(app);
      View root = app.getWindow().getDecorView();
      assertNotNull(find(root, "Oggi, nella tua dimora."));
      assertNotNull(find(root, "0 soggiorni in corso"));
      assertNull(find(root, "Avvisi sul telefono"));
      assertNotNull(find(root, "I prossimi 7 giorni"));
      assertTrue(find(root, "Calendario").performClick());
      assertNotNull(find(app.getWindow().getDecorView(), "Il calendario."));
    }
  }

  @Test
  public void reservationFiltersHideBlocksAndHistoryButKeepSearchResults() throws Exception {
    try (ActivityController<MainActivity> controller =
        Robolectric.buildActivity(MainActivity.class).create().start().resume().visible()) {
      MainActivity app = controller.get();
      String today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Rome")).toString();
      String checkout = java.time.LocalDate.parse(today).plusDays(2).toString();
      JSONArray bookings =
          new JSONArray()
              .put(
                  new JSONObject()
                      .put("id", "guest-1")
                      .put("name", "Ospite attuale")
                      .put("status", "confirmed")
                      .put("payment", "arrival")
                      .put("checkin", today)
                      .put("checkout", checkout)
                      .put("total", 30000)
                      .put("guests", 2))
              .put(
                  new JSONObject()
                      .put("id", "block-1")
                      .put("name", "Chiusura privata")
                      .put("status", "blocked")
                      .put("payment", "block")
                      .put("checkin", today)
                      .put("checkout", checkout));
      set(
          app,
          "data",
          new JSONObject()
              .put("bookings", bookings)
              .put("payments", new JSONArray())
              .put("settings", new JSONObject()));
      set(app, "stale", false);
      set(app, "tab", "reservations");
      Method render = MainActivity.class.getDeclaredMethod("render");
      render.setAccessible(true);
      render.invoke(app);
      View root = app.getWindow().getDecorView();
      assertNotNull(find(root, "Ospite attuale"));
      assertNotNull(find(root, "Chiusura privata"));
      find(root, "In casa").performClick();
      assertNotNull(find(root, "Ospite attuale"));
      assertNull(find(root, "Chiusura privata"));
      find(root, "Blocchi").performClick();
      assertNull(find(root, "Ospite attuale"));
      assertNotNull(find(root, "Chiusura privata"));
    }
  }

  @Test
  public void disabledAndroidAnimationsKeepNavigationStable() throws Exception {
    Method scale =
        org.robolectric.shadows.ShadowValueAnimator.class.getDeclaredMethod(
            "setDurationScale", float.class);
    scale.setAccessible(true);
    scale.invoke(null, 0f);
    try (ActivityController<MainActivity> controller =
        Robolectric.buildActivity(MainActivity.class).create().start().resume().visible()) {
      MainActivity app = controller.get();
      set(
          app,
          "data",
          new JSONObject()
              .put("bookings", new JSONArray())
              .put("payments", new JSONArray())
              .put("settings", new JSONObject()));
      set(app, "stale", false);
      Method render = MainActivity.class.getDeclaredMethod("render");
      render.setAccessible(true);
      render.invoke(app);
      assertFalse(android.animation.ValueAnimator.areAnimatorsEnabled());
      find(app.getWindow().getDecorView(), "Calendario").performClick();
      Field body = MainActivity.class.getDeclaredField("body");
      body.setAccessible(true);
      View view = (View) body.get(app);
      assertEquals(1f, view.getAlpha(), .001f);
      assertEquals(0f, view.getTranslationY(), .001f);
    } finally {
      scale.invoke(null, 1f);
    }
  }

  @Test
  public void calendarReminderUsesExclusiveUtcEndAcrossDaylightSavingChange() throws Exception {
    try (ActivityController<MainActivity> controller =
        Robolectric.buildActivity(MainActivity.class).create().start().resume().visible()) {
      MainActivity app = controller.get();
      Method reminder = MainActivity.class.getDeclaredMethod("calendarReminder", JSONObject.class);
      reminder.setAccessible(true);
      reminder.invoke(
          app,
          new JSONObject()
              .put("name", "Ospite di prova")
              .put("checkin", "2026-03-28")
              .put("checkout", "2026-03-30"));
      android.content.Intent intent =
          org.robolectric.Shadows.shadowOf(app).getNextStartedActivity();
      assertNotNull(intent);
      assertEquals(android.content.Intent.ACTION_INSERT, intent.getAction());
      assertTrue(
          intent.getBooleanExtra(android.provider.CalendarContract.EXTRA_EVENT_ALL_DAY, false));
      assertEquals(
          2 * 86400000L,
          intent.getLongExtra(android.provider.CalendarContract.EXTRA_EVENT_END_TIME, 0)
              - intent.getLongExtra(android.provider.CalendarContract.EXTRA_EVENT_BEGIN_TIME, 0));
    }
  }

  @Test
  public void unchangedServerDataStillRefreshesTheAgendaWhenRomeDateChanges() throws Exception {
    try (ActivityController<MainActivity> controller =
        Robolectric.buildActivity(MainActivity.class).create().start().resume().visible()) {
      MainActivity app = controller.get();
      JSONObject data =
          new JSONObject()
              .put("bookings", new JSONArray())
              .put("payments", new JSONArray())
              .put("settings", new JSONObject());
      set(app, "data", data);
      set(app, "stale", false);
      Method changed = MainActivity.class.getDeclaredMethod("shouldRebuild", JSONObject.class);
      changed.setAccessible(true);
      java.time.LocalDate today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Rome"));
      set(app, "renderedDate", today.minusDays(1).toString());
      assertEquals(true, changed.invoke(app, data));
      set(app, "renderedDate", today.toString());
      assertEquals(false, changed.invoke(app, data));
    }
  }
}
