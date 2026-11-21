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
      assertTrue(find(root, "Calendario").performClick());
      assertNotNull(find(app.getWindow().getDecorView(), "Il calendario."));
    }
  }
}
