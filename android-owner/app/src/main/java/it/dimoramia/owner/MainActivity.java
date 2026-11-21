package it.dimoramia.owner;

import android.Manifest;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.*;
import android.provider.Settings;
import android.text.*;
import android.text.method.PasswordTransformationMethod;
import android.view.*;
import android.widget.*;
import com.google.firebase.messaging.FirebaseMessaging;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.*;
import org.json.*;

public class MainActivity extends Activity {
  private final int GREEN = Color.rgb(43, 76, 57),
      INK = Color.rgb(35, 57, 44),
      MUTED = Color.rgb(98, 114, 96),
      BG = Color.rgb(244, 246, 239),
      LINE = Color.rgb(219, 227, 214);
  private final ExecutorService executor = Executors.newSingleThreadExecutor();
  private final Handler handler = new Handler(Looper.getMainLooper());
  private Api api;
  private LinearLayout root, body, top, nav;
  private TextView sync, title;
  private JSONObject data, pushConfig;
  private String tab = "overview", query = "";
  private boolean stale = true, loading = false, editorOpen = false;
  private YearMonth month = YearMonth.now(ZoneId.of("Europe/Rome"));
  private LocalDate rangeStart, rangeEnd;
  private long lastSync = 0;
  private boolean connectingNotifications = false;
  private AlertDialog activeDialog;
  private final Runnable poll =
      new Runnable() {
        public void run() {
          if (!editorOpen && data != null) refresh(false);
          handler.postDelayed(this, 30000);
        }
      };

  interface Work {
    JSONObject run() throws Exception;
  }

  interface Done {
    void accept(JSONObject value) throws Exception;
  }

  private int dp(float n) {
    return (int) (getResources().getDisplayMetrics().density * n + .5f);
  }

  private LocalDate today() {
    return LocalDate.now(ZoneId.of("Europe/Rome"));
  }

  private String date(String s) {
    try {
      return LocalDate.parse(s).format(DateTimeFormatter.ofPattern("d MMM", Locale.ITALIAN));
    } catch (Exception e) {
      return s;
    }
  }

  static int cents(String value) {
    return NativeRules.cents(value);
  }

  private String money(long c) {
    return java.text.NumberFormat.getCurrencyInstance(Locale.ITALY).format(c / 100.0);
  }

  private JSONObject obj(Object... pairs) {
    JSONObject o = new JSONObject();
    try {
      for (int i = 0; i < pairs.length; i += 2)
        if (pairs[i + 1] != null) o.put(pairs[i].toString(), pairs[i + 1]);
    } catch (Exception ignored) {
    }
    return o;
  }

  private GradientDrawable shape(int color, int radius) {
    GradientDrawable d = new GradientDrawable();
    d.setColor(color);
    d.setCornerRadius(dp(radius));
    d.setStroke(dp(1), color == Color.WHITE ? LINE : color);
    return d;
  }

  private TextView text(String value, int size, int color, boolean bold) {
    TextView v = new TextView(this);
    v.setText(value);
    v.setTextSize(size);
    v.setTextColor(color);
    if (bold) v.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
    v.setLineSpacing(dp(3), 1);
    return v;
  }

  private LinearLayout column() {
    LinearLayout v = new LinearLayout(this);
    v.setOrientation(LinearLayout.VERTICAL);
    return v;
  }

  private LinearLayout row() {
    LinearLayout v = new LinearLayout(this);
    v.setOrientation(LinearLayout.HORIZONTAL);
    v.setGravity(Gravity.CENTER_VERTICAL);
    return v;
  }

  private void space(LinearLayout parent, int size) {
    View v = new View(this);
    parent.addView(v, new LinearLayout.LayoutParams(1, dp(size)));
  }

  private TextView button(String label, boolean primary, Runnable action) {
    TextView v = text(label, 14, primary ? Color.WHITE : GREEN, true);
    v.setGravity(Gravity.CENTER);
    v.setMinHeight(dp(49));
    v.setPadding(dp(12), dp(11), dp(12), dp(11));
    v.setBackground(shape(primary ? GREEN : Color.WHITE, 12));
    v.setClickable(true);
    v.setFocusable(true);
    v.setOnClickListener(w -> action.run());
    return v;
  }

  private void enableActions(View view) {
    if (view instanceof TextView && view.isClickable()) view.setEnabled(true);
    if (view instanceof android.view.ViewGroup) {
      android.view.ViewGroup g = (android.view.ViewGroup) view;
      for (int i = 0; i < g.getChildCount(); i++) enableActions(g.getChildAt(i));
    }
  }

  private boolean typing() {
    return getCurrentFocus() instanceof EditText;
  }

  private void notice(String message) {
    if (!isFinishing())
      new AlertDialog.Builder(this)
          .setTitle("DIMORA MIA")
          .setMessage(message)
          .setPositiveButton("Va bene", null)
          .show();
  }

  private LinearLayout card(String label) {
    LinearLayout c = column();
    c.setPadding(dp(18), dp(17), dp(18), dp(17));
    c.setBackground(shape(Color.WHITE, 18));
    LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(-1, -2);
    p.bottomMargin = dp(14);
    body.addView(c, p);
    if (!label.isEmpty()) {
      c.addView(text(label, 18, INK, true));
      space(c, 13);
    }
    return c;
  }

  private void request(Work work, Done done) {
    executor.execute(
        () -> {
          try {
            JSONObject result = work.run();
            runOnUiThread(
                () -> {
                  if (isFinishing() || isDestroyed()) return;
                  try {
                    done.accept(result);
                  } catch (Exception e) {
                    notice("Impossibile leggere il risultato. Aggiorna e riprova.");
                  }
                });
          } catch (Exception e) {
            runOnUiThread(
                () -> {
                  if (isFinishing() || isDestroyed()) return;
                  loading = false;
                  connectingNotifications = false;
                  if (activeDialog != null) enableActions(activeDialog.getWindow().getDecorView());
                  if (e instanceof Api.Failure && ((Api.Failure) e).status == 401) {
                    new SessionStore(this).clear();
                    data = null;
                    login("Sessione scaduta. Accedi di nuovo.");
                  } else
                    notice(
                        e.getMessage() == null
                            ? "Controlla la connessione e riprova."
                            : e.getMessage());
                });
          }
        });
  }

  @Override
  public void onCreate(Bundle saved) {
    super.onCreate(saved);
    api = new Api(this);
    if (saved != null) {
      tab = saved.getString("tab", "overview");
      month = YearMonth.parse(saved.getString("month", month.toString()));
    }
    if (getIntent().hasExtra("view")) tab = getIntent().getStringExtra("view");
    if (new SessionStore(this).get().isEmpty()) login("");
    else {
      frame();
      title.setText("La tua dimora, sotto controllo.");
      body.addView(text("Collegamento al calendario…", 16, MUTED, false));
      refresh(true);
    }
  }

  @Override
  protected void onResume() {
    super.onResume();
    handler.removeCallbacks(poll);
    handler.postDelayed(poll, 30000);
    if (data != null && !editorOpen) refresh(false);
  }

  @Override
  protected void onPause() {
    super.onPause();
    handler.removeCallbacks(poll);
  }

  @Override
  protected void onDestroy() {
    super.onDestroy();
    handler.removeCallbacksAndMessages(null);
    executor.shutdown();
  }

  @Override
  protected void onSaveInstanceState(Bundle out) {
    super.onSaveInstanceState(out);
    out.putString("tab", tab);
    out.putString("month", month.toString());
  }

  @Override
  protected void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
    if (intent.hasExtra("view")) tab = intent.getStringExtra("view");
    if (data != null) {
      render();
      refresh(false);
    }
  }

  private void inset(View v) {
    v.setOnApplyWindowInsetsListener(
        (view, insets) -> {
          if (Build.VERSION.SDK_INT >= 30) {
            android.graphics.Insets i = insets.getInsets(WindowInsets.Type.systemBars());
            view.setPadding(0, i.top, 0, i.bottom);
          } else
            view.setPadding(
                0, insets.getSystemWindowInsetTop(), 0, insets.getSystemWindowInsetBottom());
          return insets;
        });
    v.requestApplyInsets();
  }

  private void frame() {
    root = column();
    root.setBackgroundColor(BG);
    setContentView(root);
    inset(root);
    top = row();
    top.setPadding(dp(20), dp(13), dp(16), dp(13));
    TextView mark = text("DM", 19, Color.WHITE, true);
    mark.setGravity(Gravity.CENTER);
    mark.setBackground(shape(GREEN, 12));
    top.addView(mark, new LinearLayout.LayoutParams(dp(43), dp(45)));
    LinearLayout brand = column();
    brand.setPadding(dp(12), 0, 0, 0);
    brand.addView(text("DIMORA MIA", 13, INK, true));
    sync = text("GESTIONE PRIVATA", 10, MUTED, false);
    brand.addView(sync);
    top.addView(brand, new LinearLayout.LayoutParams(0, -2, 1));
    top.addView(
        button("↻", false, () -> refresh(true)), new LinearLayout.LayoutParams(dp(48), dp(48)));
    root.addView(top);
    ScrollView scroll = new ScrollView(this);
    scroll.setFillViewport(true);
    body = column();
    body.setPadding(dp(18), dp(13), dp(18), dp(24));
    scroll.addView(body);
    root.addView(scroll, new LinearLayout.LayoutParams(-1, 0, 1));
    nav = row();
    nav.setPadding(dp(9), dp(8), dp(9), dp(8));
    nav.setBackgroundColor(Color.WHITE);
    String[] names = {"Oggi", "Calendario", "Soggiorni", "Incassi", "Regole"},
        ids = {"overview", "calendar", "reservations", "finance", "settings"};
    for (int i = 0; i < names.length; i++) {
      final String id = ids[i];
      TextView b =
          button(
              names[i],
              tab.equals(id),
              () -> {
                tab = id;
                rangeStart = rangeEnd = null;
                render();
              });
      b.setTextSize(11);
      b.setPadding(dp(2), dp(11), dp(2), dp(11));
      nav.addView(b, new LinearLayout.LayoutParams(0, -2, 1));
    }
    root.addView(nav);
    title = text("", 27, INK, true);
    title.setPadding(0, dp(8), 0, dp(18));
    body.addView(title);
  }

  private void login(String error) {
    root = column();
    root.setBackgroundColor(BG);
    setContentView(root);
    inset(root);
    ScrollView sc = new ScrollView(this);
    LinearLayout box = column();
    box.setPadding(dp(28), dp(60), dp(28), dp(40));
    sc.addView(box);
    root.addView(sc, new LinearLayout.LayoutParams(-1, -1));
    box.addView(text("DIMORA MIA / ANDROID", 12, GREEN, true));
    space(box, 38);
    box.addView(text("La tua casa.\nTutto al suo posto.", 35, INK, true));
    space(box, 14);
    box.addView(text("Uno spazio riservato per ospiti, date e prenotazioni.", 16, MUTED, false));
    space(box, 32);
    box.addView(text("Password proprietario", 13, INK, true));
    EditText password = new EditText(this);
    password.setSingleLine();
    password.setInputType(
        android.text.InputType.TYPE_CLASS_TEXT
            | android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD);
    password.setTransformationMethod(PasswordTransformationMethod.getInstance());
    password.setAutofillHints(View.AUTOFILL_HINT_PASSWORD);
    password.setHint("La password della gestione");
    box.addView(password, new LinearLayout.LayoutParams(-1, dp(56)));
    space(box, 16);
    TextView info = text(error, 13, Color.rgb(151, 58, 38), false);
    box.addView(info);
    TextView go = button("Accedi alla gestione →", true, () -> {});
    box.addView(go);
    go.setOnClickListener(
        v -> {
          String value = password.getText().toString();
          if (value.length() < 12) {
            info.setText("Inserisci la password proprietario di almeno 12 caratteri.");
            return;
          }
          go.setEnabled(false);
          go.setText("Accesso in corso…");
          executor.execute(
              () -> {
                try {
                  api.call("admin/login", obj("password", value));
                  JSONObject result = api.call("admin/console", null);
                  runOnUiThread(
                      () -> {
                        password.setText("");
                        data = result;
                        stale = false;
                        lastSync = System.currentTimeMillis();
                        render();
                        openNotificationBooking();
                        loadPush();
                      });
                } catch (Exception e) {
                  runOnUiThread(
                      () -> {
                        go.setEnabled(true);
                        go.setText("Accedi alla gestione →");
                        info.setText(e.getMessage());
                      });
                }
              });
        });
    space(box, 20);
    box.addView(
        text(
            "Accesso protetto · archivio condiviso con il sito\n"
                + "Nessuna password viene conservata nell’app.",
            12,
            MUTED,
            false));
  }

  private void openNotificationBooking() {
    String id = getIntent().getStringExtra("bookingId");
    if (id == null || editorOpen) return;
    getIntent().removeExtra("bookingId");
    for (JSONObject b : bookings())
      if (b.optString("id").equals(id)) {
        detail(b);
        break;
      }
  }

  private void refresh(boolean visible) {
    if (loading) return;
    loading = true;
    if (visible && sync != null) sync.setText("AGGIORNAMENTO…");
    executor.execute(
        () -> {
          try {
            JSONObject result = api.call("admin/console", null);
            runOnUiThread(
                () -> {
                  if (isFinishing() || isDestroyed()) return;
                  loading = false;
                  data = result;
                  stale = false;
                  lastSync = System.currentTimeMillis();
                  if (!editorOpen && !typing()) render();
                  openNotificationBooking();
                  loadPush();
                });
          } catch (Exception e) {
            runOnUiThread(
                () -> {
                  loading = false;
                  stale = true;
                  if (e instanceof Api.Failure && ((Api.Failure) e).status == 401) {
                    data = null;
                    new SessionStore(this).clear();
                    login("Sessione scaduta. Accedi di nuovo.");
                  } else {
                    if (data != null && !editorOpen) render();
                    if (visible) notice("Calendario non aggiornato. Controlla internet e riprova.");
                  }
                });
          }
        });
  }

  private List<JSONObject> bookings() {
    List<JSONObject> out = new ArrayList<>();
    JSONArray a = data == null ? null : data.optJSONArray("bookings");
    if (a != null) for (int i = 0; i < a.length(); i++) out.add(a.optJSONObject(i));
    out.sort(Comparator.comparing(b -> b.optString("checkin")));
    return out;
  }

  private boolean active(JSONObject b) {
    return !b.optString("status").startsWith("cancelled")
        && !b.optString("status").equals("expired");
  }

  private boolean block(JSONObject b) {
    return b.optString("payment").equals("block") || b.optString("status").equals("blocked");
  }

  private long paid(JSONObject b) {
    long n =
        Arrays.asList("confirmed", "cancelled_refund_required", "payment_review_required")
                    .contains(b.optString("status"))
                && (b.optString("payment").equals("full")
                    || b.optString("payment").equals("deposit"))
            ? b.optLong("due")
            : 0;
    JSONArray p = data.optJSONArray("payments");
    if (p != null)
      for (int i = 0; i < p.length(); i++) {
        JSONObject x = p.optJSONObject(i);
        if (x.optString("booking_id").equals(b.optString("id")))
          n += x.optString("kind").equals("refund") ? -x.optLong("amount") : x.optLong("amount");
      }
    return n;
  }

  private long balance(JSONObject b) {
    return active(b) && !block(b) ? Math.max(0, b.optLong("total") - paid(b)) : 0;
  }

  private void render() {
    if (data == null) return;
    frame();
    sync.setText(
        stale
            ? "NON AGGIORNATO · TOCCA ↻"
            : "AGGIORNATO ALLE "
                + java.time.LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm")));
    if (stale) {
      LinearLayout c = card("");
      c.addView(
          text(
              "Dati non aggiornati. Riconnettiti prima di modificare date o incassi.",
              13,
              Color.rgb(142, 89, 32),
              true));
    }
    switch (tab) {
      case "calendar":
        calendar();
        break;
      case "reservations":
        reservations();
        break;
      case "finance":
        finance();
        break;
      case "settings":
        settings();
        break;
      default:
        overview();
    }
  }

  private void heading(String s) {
    title.setText(s);
  }

  private void actionRow() {
    LinearLayout row = row();
    TextView a = button("＋ Soggiorno", true, () -> edit(false)),
        b = button("Blocca date", false, () -> edit(true));
    a.setEnabled(!stale);
    b.setEnabled(!stale);
    LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, -2, 1);
    p.rightMargin = dp(8);
    row.addView(a, p);
    row.addView(b, new LinearLayout.LayoutParams(0, -2, 1));
    body.addView(row);
    space(body, 18);
  }

  private void overview() {
    heading("Oggi, nella tua dimora.");
    actionRow();
    String t = today().toString();
    List<JSONObject> arrivals = new ArrayList<>(),
        departures = new ArrayList<>(),
        upcoming = new ArrayList<>();
    long due = 0;
    int in = 0;
    for (JSONObject b : bookings())
      if (active(b) && !block(b)) {
        due += balance(b);
        if (b.optString("checkin").compareTo(t) <= 0 && b.optString("checkout").compareTo(t) > 0)
          in++;
        if (b.optString("checkin").equals(t)) arrivals.add(b);
        if (b.optString("checkout").equals(t)) departures.add(b);
        if (b.optString("checkin").compareTo(t) >= 0) upcoming.add(b);
      }
    LinearLayout metrics = card("");
    metrics.addView(text(in + " soggiorni in corso", 22, INK, true));
    metrics.addView(
        text(
            arrivals.size() + " arrivi oggi  ·  " + departures.size() + " partenze",
            14,
            MUTED,
            false));
    space(metrics, 10);
    metrics.addView(text(money(due) + " da registrare", 18, GREEN, true));
    LinearLayout priorities = card("Da seguire oggi");
    if (arrivals.isEmpty() && departures.isEmpty())
      priorities.addView(text("Nessun arrivo o partenza oggi.", 14, MUTED, false));
    for (JSONObject b : arrivals) bookingRow(priorities, b, "ARRIVO OGGI");
    for (JSONObject b : departures) bookingRow(priorities, b, "PARTENZA OGGI");
    LinearLayout notifications = card("Avvisi sul telefono");
    notifications.addView(text(pushDescription(), 14, MUTED, false));
    space(notifications, 12);
    notifications.addView(button("Gestisci notifiche →", false, this::notificationPanel));
    LinearLayout c = card("I prossimi arrivi");
    int shown = 0;
    for (JSONObject b : upcoming) {
      bookingRow(c, b, "");
      if (++shown == 4) break;
    }
    if (shown == 0) c.addView(text("I nuovi soggiorni compariranno qui.", 14, MUTED, false));
  }

  private void bookingRow(LinearLayout parent, JSONObject b, String tag) {
    LinearLayout c = column();
    c.setPadding(0, dp(13), 0, dp(13));
    if (!tag.isEmpty()) c.addView(text(tag, 10, GREEN, true));
    c.addView(text(b.optString("name", "Soggiorno"), 16, INK, true));
    c.addView(
        text(
            date(b.optString("checkin"))
                + " → "
                + date(b.optString("checkout"))
                + "  ·  "
                + (block(b) ? "Date bloccate" : b.optInt("guests") + " ospiti"),
            13,
            MUTED,
            false));
    String state =
        block(b)
            ? "Non disponibile"
            : b.optString("status").startsWith("cancelled")
                ? "Annullata"
                : b.optString("status").equals("awaiting_payment")
                    ? "Pagamento in attesa"
                    : "Confermata";
    c.addView(
        text(state + (block(b) ? "" : "  ·  " + money(balance(b)) + " residuo"), 12, GREEN, true));
    c.setBackgroundResource(android.R.drawable.list_selector_background);
    c.setClickable(true);
    c.setFocusable(true);
    c.setOnClickListener(v -> detail(b));
    parent.addView(c);
    View line = new View(this);
    line.setBackgroundColor(LINE);
    parent.addView(line, new LinearLayout.LayoutParams(-1, dp(1)));
  }

  private void calendar() {
    heading("Il calendario.");
    LinearLayout tools = row();
    tools.addView(
        button(
            "‹",
            false,
            () -> {
              month = month.minusMonths(1);
              render();
            }),
        new LinearLayout.LayoutParams(dp(48), dp(48)));
    TextView label =
        text(month.format(DateTimeFormatter.ofPattern("MMMM yyyy", Locale.ITALIAN)), 17, INK, true);
    label.setGravity(Gravity.CENTER);
    tools.addView(label, new LinearLayout.LayoutParams(0, -2, 1));
    tools.addView(
        button(
            "›",
            false,
            () -> {
              month = month.plusMonths(1);
              render();
            }),
        new LinearLayout.LayoutParams(dp(48), dp(48)));
    body.addView(tools);
    space(body, 14);
    LinearLayout box = card("");
    GridLayout grid = new GridLayout(this);
    grid.setColumnCount(7);
    String[] weekdays = {"L", "M", "M", "G", "V", "S", "D"};
    for (String day : weekdays) {
      TextView v = text(day, 12, MUTED, true);
      v.setGravity(Gravity.CENTER);
      GridLayout.LayoutParams p = new GridLayout.LayoutParams();
      p.width = 0;
      p.height = dp(28);
      p.columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1f);
      grid.addView(v, p);
    }
    int offset = month.atDay(1).getDayOfWeek().getValue() - 1;
    for (int i = 0; i < offset + month.lengthOfMonth(); i++) {
      TextView v = text(i < offset ? "" : String.valueOf(i - offset + 1), 14, INK, true);
      v.setGravity(Gravity.CENTER);
      GridLayout.LayoutParams p = new GridLayout.LayoutParams();
      p.width = 0;
      p.height = dp(44);
      p.setMargins(dp(1), dp(2), dp(1), dp(2));
      p.columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1f);
      if (i >= offset) {
        LocalDate date = month.atDay(i - offset + 1);
        boolean occupied = false, closed = false;
        for (JSONObject b : bookings())
          if (active(b)
              && b.optString("checkin").compareTo(date.toString()) <= 0
              && b.optString("checkout").compareTo(date.toString()) > 0) {
            occupied = true;
            closed |= block(b);
          }
        boolean endpoint = date.equals(rangeStart) || date.equals(rangeEnd),
            inside =
                rangeStart != null
                    && rangeEnd != null
                    && date.isAfter(rangeStart)
                    && date.isBefore(rangeEnd);
        v.setBackground(
            shape(
                endpoint
                    ? GREEN
                    : inside
                        ? Color.rgb(217, 231, 207)
                        : closed
                            ? Color.rgb(238, 226, 210)
                            : occupied ? Color.rgb(224, 230, 241) : BG,
                9));
        if (endpoint) v.setTextColor(Color.WHITE);
        v.setContentDescription(
            date
                + ", "
                + (closed ? "bloccata" : occupied ? "occupata" : "libera")
                + (date.equals(rangeEnd) ? ", fine periodo" : ""));
        v.setOnClickListener(
            w -> {
              if (rangeStart == null || rangeEnd != null || !date.isAfter(rangeStart)) {
                rangeStart = date;
                rangeEnd = null;
              } else rangeEnd = date;
              render();
            });
      }
      grid.addView(v, p);
    }
    box.addView(grid);
    space(box, 14);
    box.addView(
        text("Verde: selezione · Grigio blu: soggiorno · Sabbia: blocco", 11, MUTED, false));
    space(box, 12);
    box.addView(
        text(
            rangeStart == null
                ? "Tocca il giorno iniziale, poi il giorno di uscita."
                : date(rangeStart.toString())
                    + (rangeEnd == null ? " → scegli la fine" : " → " + date(rangeEnd.toString())),
            14,
            GREEN,
            true));
    space(body, 3);
    actionRow();
    LinearLayout list = card("Nel mese");
    int count = 0;
    for (JSONObject b : bookings())
      if (active(b)
          && b.optString("checkin").compareTo(month.plusMonths(1).atDay(1).toString()) < 0
          && b.optString("checkout").compareTo(month.atDay(1).toString()) > 0) {
        bookingRow(list, b, "");
        count++;
      }
    if (count == 0)
      list.addView(text("Nessun soggiorno o blocco in questo mese.", 14, MUTED, false));
  }

  private void reservations() {
    heading("Tutti i soggiorni.");
    actionRow();
    EditText search = new EditText(this);
    search.setSingleLine();
    search.setHint("Cerca ospite, contatto o riferimento");
    search.setText(query);
    body.addView(search, new LinearLayout.LayoutParams(-1, dp(52)));
    space(body, 10);
    LinearLayout list = card("");
    Runnable fill =
        () -> {
          list.removeAllViews();
          String needle = search.getText().toString().trim().toLowerCase(Locale.ITALIAN);
          int count = 0;
          for (JSONObject b : bookings())
            if ((b.optString("name")
                    + " "
                    + b.optString("email")
                    + " "
                    + b.optString("phone")
                    + " "
                    + b.optString("id"))
                .toLowerCase(Locale.ITALIAN)
                .contains(needle)) {
              bookingRow(list, b, "");
              count++;
            }
          if (count == 0) list.addView(text("Nessun risultato.", 15, MUTED, false));
        };
    fill.run();
    search.addTextChangedListener(
        new TextWatcher() {
          public void beforeTextChanged(CharSequence s, int st, int c, int a) {}

          public void onTextChanged(CharSequence s, int st, int before, int count) {
            query = s.toString();
            fill.run();
          }

          public void afterTextChanged(Editable e) {}
        });
  }

  private void finance() {
    heading("Incassi e saldi.");
    long total = 0, received = 0, due = 0;
    for (JSONObject b : bookings())
      if (active(b) && !block(b)) {
        total += b.optLong("total");
        received += paid(b);
        due += balance(b);
      }
    LinearLayout c = card("Il quadro economico");
    c.addView(text(money(total), 28, INK, true));
    c.addView(text("Valore dei soggiorni attivi", 13, MUTED, false));
    space(c, 16);
    c.addView(text(money(received) + " registrati", 19, GREEN, true));
    c.addView(text(money(due) + " residui", 19, INK, true));
    space(c, 12);
    c.addView(
        text(
            "Annota solo denaro già ricevuto. L’app non esegue addebiti o bonifici. Stripe resta in"
                + " modalità test.",
            12,
            MUTED,
            false));
    LinearLayout list = card("Saldi da seguire");
    int n = 0;
    for (JSONObject b : bookings())
      if (balance(b) > 0) {
        bookingRow(list, b, "");
        n++;
      }
    if (n == 0) list.addView(text("Nessun saldo residuo.", 15, MUTED, false));
  }

  private void settings() {
    heading("La tua gestione.");
    LinearLayout p = card("Notifiche Android");
    p.addView(text(pushDescription(), 14, MUTED, false));
    space(p, 12);
    p.addView(button("Apri centro notifiche", true, this::notificationPanel));
    LinearLayout rules = card("Tariffe e regole");
    JSONObject s = data.optJSONObject("settings");
    if (s != null) {
      rules.addView(
          text(
              "Notte base  "
                  + money(s.optLong("baseRate"))
                  + "\nNotte estiva  "
                  + money(s.optLong("summerRate"))
                  + "\nPulizia finale  "
                  + money(s.optLong("cleaning"))
                  + "\nMinimo notti  "
                  + s.optInt("minStay")
                  + " / estate "
                  + s.optInt("summerMinStay"),
              15,
              INK,
              false));
      space(rules, 14);
      TextView edit = button("Modifica le tariffe", false, this::editSettings);
      edit.setEnabled(!stale);
      rules.addView(edit);
    }
    LinearLayout info = card("DIMORA MIA · Android 1.0.0");
    info.addView(
        text(
            "App Android installata tramite APK. Nessun browser necessario per la gestione."
                + " Calendario condiviso in Europe/Rome · capienza 4 ospiti. Per aggiornare dati e"
                + " avvisi serve una connessione internet.",
            13,
            MUTED,
            false));
    space(info, 16);
    info.addView(
        button(
            "Esci dalla gestione",
            false,
            () ->
                new AlertDialog.Builder(this)
                    .setTitle("Uscire dalla gestione?")
                    .setMessage(
                        "L’accesso verrà chiuso e gli avvisi di questo dispositivo saranno"
                            + " disattivati.")
                    .setNegativeButton("Resta", null)
                    .setPositiveButton(
                        "Esci",
                        (d, w) -> {
                          JSONObject input =
                              obj(
                                  "nativeDeviceId",
                                  getSharedPreferences("native", 0).getString("deviceId", ""));
                          request(
                              () -> api.call("admin/logout", input),
                              r -> {
                                getSharedPreferences("native", 0).edit().remove("deviceId").apply();
                                new SessionStore(this).clear();
                                if (!com.google.firebase.FirebaseApp.getApps(this).isEmpty()) {
                                  FirebaseMessaging.getInstance().setAutoInitEnabled(false);
                                  FirebaseMessaging.getInstance().deleteToken();
                                }
                                data = null;
                                login("");
                              });
                        })
                    .show()));
  }

  private EditText field(LinearLayout box, String label, String value, int input) {
    box.addView(text(label, 12, INK, true));
    EditText e = new EditText(this);
    e.setInputType(input);
    e.setText(value);
    e.setTextSize(15);
    box.addView(e, new LinearLayout.LayoutParams(-1, dp(54)));
    space(box, 9);
    return e;
  }

  private void datePicker(EditText e) {
    e.setFocusable(false);
    e.setOnClickListener(
        v -> {
          LocalDate d;
          try {
            d = LocalDate.parse(e.getText().toString());
          } catch (Exception x) {
            d = today();
          }
          new DatePickerDialog(
                  this,
                  (view, y, m, day) -> e.setText(LocalDate.of(y, m + 1, day).toString()),
                  d.getYear(),
                  d.getMonthValue() - 1,
                  d.getDayOfMonth())
              .show();
        });
  }

  private AlertDialog form(String title, LinearLayout box) {
    ScrollView scroll = new ScrollView(this);
    scroll.setPadding(dp(20), dp(6), dp(20), dp(12));
    scroll.addView(box);
    editorOpen = true;
    AlertDialog dialog =
        new AlertDialog.Builder(this)
            .setTitle(title)
            .setView(scroll)
            .setNegativeButton("Chiudi", null)
            .create();
    dialog.setOnDismissListener(
        d -> {
          editorOpen = false;
          if (activeDialog == dialog) activeDialog = null;
        });
    dialog.show();
    activeDialog = dialog;
    return dialog;
  }

  private void edit(boolean blocked) {
    edit(blocked, null);
  }

  private void edit(boolean blocked, JSONObject existing) {
    if (stale) {
      notice("Aggiorna il calendario prima di modificare le date.");
      return;
    }
    LinearLayout box = column();
    EditText
        name =
            field(
                box,
                blocked ? "Motivo del blocco" : "Nome ospite",
                existing != null
                    ? existing.optString("name")
                    : blocked ? "Periodo non disponibile" : "",
                1),
        start =
            field(
                box,
                "Data iniziale",
                existing != null
                    ? existing.optString("checkin")
                    : (rangeStart == null ? today() : rangeStart).toString(),
                1),
        end =
            field(
                box,
                "Data di uscita · giorno libero",
                existing != null
                    ? existing.optString("checkout")
                    : (rangeEnd != null
                            ? rangeEnd
                            : (rangeStart == null ? today() : rangeStart).plusDays(blocked ? 1 : 2))
                        .toString(),
                1);
    datePicker(start);
    datePicker(end);
    EditText
        guests =
            blocked
                ? null
                : field(
                    box,
                    "Ospiti (1–4)",
                    existing != null ? String.valueOf(existing.optInt("guests", 2)) : "2",
                    2),
        email =
            blocked
                ? null
                : field(
                    box,
                    "Email (facoltativa per inserimento manuale)",
                    existing != null ? existing.optString("email") : "",
                    33),
        phone =
            blocked
                ? null
                : field(box, "Telefono", existing != null ? existing.optString("phone") : "", 3),
        amount =
            blocked
                ? null
                : field(
                    box,
                    "Totale concordato (€) · vuoto per tariffa automatica",
                    existing != null
                        ? String.format(Locale.ROOT, "%.2f", existing.optLong("total") / 100.0)
                        : "",
                    8194),
        notes =
            field(
                box, "Note riservate", existing != null ? existing.optString("notes") : "", 131073);
    Spinner channel = new Spinner(this);
    String[] channels =
        existing == null
            ? new String[] {"Telefono / messaggio", "Booking.com · manuale", "Airbnb · manuale"}
            : new String[] {
              "Telefono / messaggio", "Booking.com · manuale", "Airbnb · manuale", "Sito diretto"
            };
    channel.setAdapter(
        new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, channels));
    if (existing != null) {
      channel.setSelection(
          existing.optString("source").equals("direct")
              ? 3
              : existing.optString("source").equals("booking")
                  ? 1
                  : existing.optString("source").equals("airbnb") ? 2 : 0);
    }
    if (!blocked) {
      box.addView(text("Provenienza", 12, INK, true));
      box.addView(channel);
    }
    space(box, 16);
    TextView error = text("", 13, Color.rgb(155, 62, 40), false);
    box.addView(error);
    TextView review = button("Verifica disponibilità →", true, () -> {});
    box.addView(review);
    AlertDialog dialog =
        form(
            existing != null
                ? "Modifica soggiorno"
                : blocked ? "Blocca un periodo" : "Nuovo soggiorno",
            box);
    final String requestId = UUID.randomUUID().toString();
    review.setOnClickListener(
        v -> {
          JSONObject input;
          try {
            input =
                obj(
                    "kind",
                    blocked ? "block" : "booking",
                    "name",
                    name.getText().toString(),
                    "checkin",
                    start.getText().toString(),
                    "checkout",
                    end.getText().toString(),
                    "guests",
                    blocked ? 1 : Integer.parseInt(guests.getText().toString()),
                    "email",
                    blocked ? "" : email.getText().toString(),
                    "phone",
                    blocked ? "" : phone.getText().toString(),
                    "notes",
                    notes.getText().toString(),
                    "source",
                    blocked
                        ? "phone"
                        : new String[] {"phone", "booking", "airbnb", "direct"}
                            [channel.getSelectedItemPosition()],
                    "idempotency",
                    requestId);
            if (existing != null) {
              input.put("bookingId", existing.optString("id"));
              input.put("revision", existing.optInt("revision"));
            }
            if (!blocked && !amount.getText().toString().trim().isEmpty())
              input.put("amount", cents(amount.getText().toString()));
          } catch (Exception ex) {
            error.setText("Controlla ospiti e importi. Usa al massimo due decimali.");
            return;
          }
          review.setEnabled(false);
          executor.execute(
              () -> {
                try {
                  JSONObject preview = api.call("admin/preview", input);
                  runOnUiThread(
                      () -> {
                        review.setEnabled(true);
                        if (!preview.optBoolean("ok")) {
                          error.setText("Le date non sono disponibili. Scegli un altro periodo.");
                          return;
                        }
                        String message =
                            preview.optInt("nights")
                                + " notti\n"
                                + (blocked
                                    ? "Periodo non prenotabile"
                                    : money(preview.optLong("total"))
                                        + " · totale calcolato sul server")
                                + "\nDal "
                                + input.optString("checkin")
                                + " al "
                                + input.optString("checkout")
                                + " escluso.";
                        new AlertDialog.Builder(this)
                            .setTitle("Conferma i dettagli")
                            .setMessage(message)
                            .setNegativeButton("Modifica", null)
                            .setPositiveButton(
                                blocked ? "Blocca date" : "Salva soggiorno",
                                (d, w) -> {
                                  review.setEnabled(false);
                                  request(
                                      () -> api.call("admin/reservations", input),
                                      r -> {
                                        dialog.dismiss();
                                        rangeStart = rangeEnd = null;
                                        refresh(true);
                                      });
                                })
                            .show();
                      });
                } catch (Exception ex) {
                  runOnUiThread(
                      () -> {
                        review.setEnabled(true);
                        error.setText(ex.getMessage());
                      });
                }
              });
        });
  }

  private void detail(JSONObject b) {
    LinearLayout box = column();
    box.addView(
        text(
            date(b.optString("checkin"))
                + " → "
                + date(b.optString("checkout"))
                + " · "
                + b.optInt("guests")
                + " ospiti",
            17,
            INK,
            true));
    space(box, 12);
    box.addView(
        text(
            "Riferimento " + b.optString("id") + "\nCanale: " + b.optString("source"),
            12,
            MUTED,
            false));
    if (!block(b)) {
      space(box, 14);
      box.addView(
          text(
              money(b.optLong("total"))
                  + " totale\n"
                  + money(paid(b))
                  + " registrati\n"
                  + money(balance(b))
                  + " residuo",
              17,
              GREEN,
              true));
    }
    if (!b.optString("notes").isEmpty()) {
      space(box, 14);
      box.addView(text("NOTE RISERVATE", 11, MUTED, true));
      box.addView(text(b.optString("notes"), 14, INK, false));
    }
    if (!b.optString("phone").isEmpty()) {
      space(box, 12);
      box.addView(
          button(
              "Chiama ospite",
              false,
              () -> {
                try {
                  startActivity(
                      new Intent(
                          Intent.ACTION_DIAL,
                          Uri.parse("tel:" + Uri.encode(b.optString("phone")))));
                } catch (Exception e) {
                  notice("Nessuna app telefono disponibile.");
                }
              }));
    }
    if (!b.optString("email").isEmpty()) {
      space(box, 8);
      box.addView(
          button(
              "Scrivi email",
              false,
              () -> {
                try {
                  startActivity(
                      new Intent(
                          Intent.ACTION_SENDTO,
                          Uri.parse("mailto:" + Uri.encode(b.optString("email")))));
                } catch (Exception e) {
                  notice("Configura un’app email per scrivere all’ospite.");
                }
              }));
    }
    AlertDialog dialog = form(b.optString("name"), box);
    if (active(b) && !stale) {
      if (!Arrays.asList("full", "deposit").contains(b.optString("payment"))) {
        space(box, 12);
        box.addView(
            button(
                "Modifica date e dettagli",
                false,
                () -> {
                  dialog.dismiss();
                  edit(block(b), b);
                }));
      }
      if (!block(b)) {
        space(box, 15);
        box.addView(
            button(
                "Registra incasso",
                true,
                () -> {
                  dialog.dismiss();
                  payment(b, false);
                }));
        space(box, 10);
        JSONObject operations;
        try {
          operations = new JSONObject(b.optString("operations", "{}"));
        } catch (Exception e) {
          operations = new JSONObject();
        }
        String[] keys = {"roomReady", "guestArrived", "guestDeparted"},
            labels = {"Casa pronta", "Ospite arrivato", "Ospite partito"};
        for (int i = 0; i < keys.length; i++) {
          final String key = keys[i];
          boolean checked = operations.optBoolean(key);
          TextView action =
              button(
                  (checked ? "✓ " : "○ ") + labels[i],
                  false,
                  () -> {
                    request(
                        () ->
                            api.call(
                                "admin/operations",
                                obj(
                                    "id",
                                    b.optString("id"),
                                    "revision",
                                    b.optInt("revision"),
                                    "field",
                                    key,
                                    "value",
                                    !checked,
                                    "idempotency",
                                    UUID.randomUUID().toString())),
                        r -> {
                          dialog.dismiss();
                          refresh(true);
                        });
                  });
          box.addView(action);
          space(box, 7);
        }
      }
      space(box, 12);
      box.addView(
          button(
              block(b) ? "Riapri queste date" : "Annulla soggiorno",
              false,
              () ->
                  new AlertDialog.Builder(this)
                      .setTitle("Confermare l’annullamento?")
                      .setMessage(
                          "Le date torneranno disponibili. Eventuali rimborsi vanno gestiti"
                              + " separatamente.")
                      .setNegativeButton("Mantieni", null)
                      .setPositiveButton(
                          "Conferma",
                          (d, w) ->
                              request(
                                  () ->
                                      api.call(
                                          "admin/actions",
                                          obj(
                                              "id",
                                              b.optString("id"),
                                              "revision",
                                              b.optInt("revision"),
                                              "action",
                                              "cancel",
                                              "idempotency",
                                              UUID.randomUUID().toString())),
                                  r -> {
                                    dialog.dismiss();
                                    refresh(true);
                                  }))
                      .show()));
    }
    if (paid(b) > 0 && !stale) {
      space(box, 12);
      box.addView(
          button(
              "Annota rimborso già effettuato",
              false,
              () -> {
                dialog.dismiss();
                payment(b, true);
              }));
    }
  }

  private void payment(JSONObject b, boolean refund) {
    LinearLayout box = column();
    box.addView(
        text(
            "Registra esclusivamente un importo già ricevuto o restituito. Nessun movimento"
                + " bancario viene eseguito dall’app.",
            13,
            MUTED,
            false));
    EditText amount = field(box, "Importo (€)", "", 8194),
        note = field(box, "Nota " + (refund ? "obbligatoria" : "facoltativa"), "", 131073);
    Spinner method = new Spinner(this);
    method.setAdapter(
        new ArrayAdapter<>(
            this,
            android.R.layout.simple_spinner_dropdown_item,
            new String[] {"Contanti", "Bonifico", "POS esterno", "Altro"}));
    box.addView(method);
    space(box, 18);
    TextView save = button("Conferma registrazione", true, () -> {});
    box.addView(save);
    AlertDialog dialog = form(refund ? "Annota rimborso" : "Registra incasso", box);
    String idempotency = UUID.randomUUID().toString();
    save.setOnClickListener(
        v -> {
          int c;
          try {
            c = cents(amount.getText().toString());
            if (c <= 0) throw new Exception();
          } catch (Exception e) {
            notice("Inserisci un importo positivo con al massimo due decimali.");
            return;
          }
          save.setEnabled(false);
          request(
              () ->
                  api.call(
                      "admin/payments",
                      obj(
                          "bookingId",
                          b.optString("id"),
                          "kind",
                          refund ? "refund" : "receipt",
                          "amount",
                          c,
                          "method",
                          new String[] {"cash", "bank", "pos", "other"}
                              [method.getSelectedItemPosition()],
                          "note",
                          note.getText().toString(),
                          "idempotency",
                          idempotency)),
              r -> {
                dialog.dismiss();
                refresh(true);
              });
        });
  }

  private void editSettings() {
    JSONObject s = data.optJSONObject("settings");
    if (s == null) return;
    LinearLayout box = column();
    String[]
        keys = {"baseRate", "summerRate", "cleaning", "minStay", "summerMinStay", "depositPercent"},
        labels =
            {
              "Tariffa base (€)",
              "Tariffa estate (€)",
              "Pulizie (€)",
              "Minimo notti",
              "Minimo notti estate",
              "Acconto (%)"
            };
    EditText[] fields = new EditText[keys.length];
    for (int i = 0; i < keys.length; i++)
      fields[i] =
          field(
              box,
              labels[i],
              i < 3
                  ? String.format(Locale.ROOT, "%.2f", s.optLong(keys[i]) / 100.0)
                  : String.valueOf(s.optInt(keys[i])),
              8194);
    space(box, 12);
    box.addView(
        text(
            "Le nuove tariffe valgono per i nuovi preventivi. Le modalità di pagamento già"
                + " configurate restano quelle attuali.",
            12,
            MUTED,
            false));
    space(box, 16);
    TextView save = button("Salva tariffe", true, () -> {});
    box.addView(save);
    AlertDialog dialog = form("Tariffe e soggiorno minimo", box);
    save.setOnClickListener(
        v -> {
          JSONObject input;
          try {
            input = new JSONObject(s.toString());
            for (int i = 0; i < keys.length; i++)
              input.put(
                  keys[i],
                  i < 3
                      ? cents(fields[i].getText().toString())
                      : Integer.parseInt(fields[i].getText().toString()));
          } catch (Exception e) {
            notice("Controlla le tariffe e il numero di notti.");
            return;
          }
          JSONObject payload = input;
          save.setEnabled(false);
          request(
              () -> api.call("admin/settings", payload),
              r -> {
                dialog.dismiss();
                refresh(true);
              });
        });
  }

  private void loadPush() {
    executor.execute(
        () -> {
          try {
            JSONObject config = api.call("admin/native/push", null);
            runOnUiThread(
                () -> {
                  boolean changed =
                      pushConfig == null
                          || pushConfig.optBoolean("configured") != config.optBoolean("configured");
                  pushConfig = config;
                  if (changed && data != null && !editorOpen && !typing()) render();
                });
          } catch (Exception ignored) {
          }
        });
  }

  private boolean notificationPermission() {
    return Build.VERSION.SDK_INT < 33
        || checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
            == PackageManager.PERMISSION_GRANTED;
  }

  private String pushDescription() {
    if (pushConfig == null)
      return "Verifica del servizio notifiche. Apri il centro notifiche per controllare.";
    if (!pushConfig.optBoolean("configured"))
      return "Notifiche native da configurare: manca il collegamento Firebase del proprietario.";
    if (!notificationPermission()
        || !getSystemService(NotificationManager.class).areNotificationsEnabled())
      return "Consenti gli avvisi Android per questo dispositivo.";
    String id = getSharedPreferences("native", 0).getString("deviceId", "");
    JSONArray devices = pushConfig.optJSONArray("devices");
    if (devices != null)
      for (int i = 0; i < devices.length(); i++) {
        JSONObject d = devices.optJSONObject(i);
        if (d.optString("id").equals(id) && d.optBoolean("active"))
          return "Telefono collegato al server. Puoi inviare una prova.";
      }
    return "Completa il collegamento di questo telefono.";
  }

  private void notificationPanel() {
    request(
        () -> api.call("admin/native/push", null),
        config -> {
          pushConfig = config;
          LinearLayout box = column();
          box.addView(text(pushDescription(), 16, INK, true));
          space(box, 14);
          box.addView(
              text(
                  "Gli avvisi usano Android e Firebase, senza permessi di Chrome o Samsung"
                      + " Internet. I messaggi sullo schermo bloccato non contengono dati degli"
                      + " ospiti.",
                  13,
                  MUTED,
                  false));
          space(box, 18);
          AlertDialog dialog = form("Notifiche native Android", box);
          if (config.optBoolean("configured")) {
            box.addView(
                button(
                    "Attiva su questo telefono",
                    true,
                    () -> {
                      dialog.dismiss();
                      activateNotifications();
                    }));
            space(box, 10);
            box.addView(
                button(
                    "Invia prova dal server",
                    false,
                    () -> {
                      String id = getSharedPreferences("native", 0).getString("deviceId", "");
                      if (id.isEmpty()) {
                        notice("Collega prima il telefono.");
                        return;
                      }
                      request(
                          () -> api.call("admin/native/push/test", obj("id", id)),
                          r -> {
                            dialog.dismiss();
                            notice(
                                r.optInt("accepted") > 0
                                    ? "Prova accettata da Firebase. Controlla il pannello notifiche"
                                        + " di Android."
                                    : "Prova in coda. Apri di nuovo il pannello per controllare.");
                          });
                    }));
          } else
            box.addView(
                text(
                    "Il proprietario deve completare Firebase prima di attivare gli avvisi. La"
                        + " gestione delle prenotazioni è già utilizzabile; questa schermata non"
                        + " simula una notifica ricevuta.",
                    13,
                    MUTED,
                    false));
          space(box, 10);
          box.addView(
              button(
                  "Impostazioni notifiche Android",
                  false,
                  () ->
                      startActivity(
                          new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
                              .putExtra(Settings.EXTRA_APP_PACKAGE, getPackageName()))));
        });
  }

  private void activateNotifications() {
    if (Build.VERSION.SDK_INT >= 33 && !notificationPermission()) {
      requestPermissions(new String[] {Manifest.permission.POST_NOTIFICATIONS}, 44);
      return;
    }
    if (!getSystemService(NotificationManager.class).areNotificationsEnabled()) {
      notice("Abilita le notifiche nelle impostazioni Android dell’app.");
      return;
    }
    if (connectingNotifications) {
      notice("Collegamento notifiche già in corso. Attendi l’esito.");
      return;
    }
    connectingNotifications = true;
    Toast.makeText(this, "Collegamento alle notifiche Android…", Toast.LENGTH_LONG).show();
    request(
        () -> api.call("admin/native/push", null),
        config -> {
          pushConfig = config;
          JSONObject client = config.optJSONObject("clientConfig");
          if (!config.optBoolean("configured")
              || client == null
              || !((DimoraApp) getApplication()).configure(client)) {
            connectingNotifications = false;
            notice("Firebase non è ancora configurato sul server.");
            return;
          }
          FirebaseMessaging.getInstance().setAutoInitEnabled(true);
          java.util.concurrent.atomic.AtomicBoolean completed =
              new java.util.concurrent.atomic.AtomicBoolean(false);
          Runnable deadline =
              () -> {
                if (completed.compareAndSet(false, true)) {
                  connectingNotifications = false;
                  notice(
                      "Il servizio Android non ha risposto in tempo. Riprova quando la connessione"
                          + " è disponibile.");
                }
              };
          handler.postDelayed(deadline, 25000);
          FirebaseMessaging.getInstance()
              .getToken()
              .addOnCompleteListener(
                  task -> {
                    if (!completed.compareAndSet(false, true)) return;
                    handler.removeCallbacks(deadline);
                    if (isFinishing() || isDestroyed()) return;
                    if (!task.isSuccessful()) {
                      connectingNotifications = false;
                      notice(
                          "Android non ha completato il collegamento Firebase. Controlla la"
                              + " connessione e che Google Play Services sia aggiornato.");
                      return;
                    }
                    String token = task.getResult();
                    getSharedPreferences("native", 0).edit().putString("fcmToken", token).apply();
                    request(
                        () ->
                            api.call(
                                "admin/native/push/register",
                                obj(
                                    "token",
                                    token,
                                    "label",
                                    Build.MANUFACTURER + " " + Build.MODEL)),
                        result -> {
                          connectingNotifications = false;
                          getSharedPreferences("native", 0)
                              .edit()
                              .putString("deviceId", result.getString("id"))
                              .apply();
                          loadPush();
                          notice("Telefono collegato. Ora invia la prova dal server.");
                        });
                  });
        });
  }

  @Override
  public void onRequestPermissionsResult(int request, String[] permissions, int[] results) {
    super.onRequestPermissionsResult(request, permissions, results);
    if (request == 44) {
      if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED)
        activateNotifications();
      else notice("Consenso non concesso. Puoi abilitarlo dalle impostazioni Android dell’app.");
    }
  }
}
