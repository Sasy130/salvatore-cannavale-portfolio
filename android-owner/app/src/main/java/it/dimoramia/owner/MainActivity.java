package it.dimoramia.owner;

import android.Manifest;
import android.animation.*;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.GradientDrawable;
import android.graphics.drawable.LayerDrawable;
import android.graphics.drawable.RippleDrawable;
import android.net.Uri;
import android.os.*;
import android.provider.CalendarContract;
import android.provider.Settings;
import android.text.*;
import android.text.method.PasswordTransformationMethod;
import android.view.*;
import android.view.animation.DecelerateInterpolator;
import android.widget.*;
import com.google.firebase.messaging.FirebaseMessaging;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.*;
import org.json.*;

public class MainActivity extends Activity {
  private final int GREEN = Color.rgb(41, 74, 56),
      INK = Color.rgb(35, 57, 44),
      MUTED = Color.rgb(98, 114, 96),
      BG = Color.rgb(246, 245, 239),
      LINE = Color.rgb(219, 227, 214);
  private final ExecutorService executor = Executors.newSingleThreadExecutor();
  private final Handler handler = new Handler(Looper.getMainLooper());
  private Api api;
  private BiometricCoordinator bio;
  private boolean passwordEntry = false, lockScreenVisible = false;
  private TextView lockStatus;
  private SyncIndicator syncIndicator, lockProgress;
  private final int DEEP = Color.rgb(22, 55, 40),
      IVORY = Color.rgb(246, 241, 226),
      GOLD = Color.rgb(220, 188, 138);
  private LinearLayout root, body, top, nav;
  private TextView sync, title;
  private ScrollView contentScroll;
  private String renderedTab = "", renderedDate = "", bookingFilter = "all";
  private boolean animateNextRender = false;
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
    v.setBackground(
        new RippleDrawable(
            ColorStateList.valueOf(
                primary ? Color.argb(45, 255, 255, 255) : Color.argb(30, 41, 74, 56)),
            shape(primary ? GREEN : Color.WHITE, 12),
            shape(Color.WHITE, 12)));
    if (ValueAnimator.areAnimatorsEnabled()) {
      StateListAnimator feedback = new StateListAnimator();
      AnimatorSet press = new AnimatorSet();
      press.playTogether(
          ObjectAnimator.ofFloat(v, "scaleX", .985f), ObjectAnimator.ofFloat(v, "scaleY", .985f));
      press.setDuration(90);
      AnimatorSet release = new AnimatorSet();
      release.playTogether(
          ObjectAnimator.ofFloat(v, "scaleX", 1f), ObjectAnimator.ofFloat(v, "scaleY", 1f));
      release.setDuration(130);
      feedback.addState(new int[] {android.R.attr.state_pressed}, press);
      feedback.addState(new int[] {}, release);
      v.setStateListAnimator(feedback);
    }
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
    final long requestGeneration = bio.generation();
    executor.execute(
        () -> {
          try {
            JSONObject result = work.run();
            runOnUiThread(
                () -> {
                  if (isFinishing()
                      || isDestroyed()
                      || requestGeneration != bio.generation()
                      || bio.locked()) return;
                  try {
                    done.accept(result);
                  } catch (Exception e) {
                    notice("Impossibile leggere il risultato. Aggiorna e riprova.");
                  }
                });
          } catch (Exception e) {
            runOnUiThread(
                () -> {
                  if (isFinishing()
                      || isDestroyed()
                      || requestGeneration != bio.generation()
                      || bio.locked()) return;
                  loading = false;
                  if (syncIndicator != null) syncIndicator.setBusy(false);
                  connectingNotifications = false;
                  if (activeDialog != null) enableActions(activeDialog.getWindow().getDecorView());
                  if (e instanceof Api.Failure && ((Api.Failure) e).status == 401) {
                    data = null;
                    bio.unauthorized();
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
    bio =
        new BiometricCoordinator(
            this,
            api,
            executor,
            new BiometricCoordinator.Listener() {
              public void unlocked(JSONObject value) {
                acceptAuthenticated(value);
              }

              public void locked(String reason) {
                showLocked(reason);
              }

              public void password(String reason) {
                data = null;
                login(reason);
              }

              public void changed() {
                updatePrivacy();
                if (bio.enabled() && !bio.locked() && data != null && !editorOpen) render();
              }

              public void message(String text) {
                if (bio.locked() && lockStatus != null) {
                  lockStatus.setText(text);
                  if (lockProgress != null) {
                    lockProgress.setVisibility(View.VISIBLE);
                    lockProgress.setBusy(true);
                  }
                } else notice(text);
              }
            });
    updatePrivacy();
    if (saved != null) {
      tab = saved.getString("tab", "overview");
      month = YearMonth.parse(saved.getString("month", month.toString()));
    }
    if (getIntent().hasExtra("view")) tab = getIntent().getStringExtra("view");
    if (bio.locked()) showLocked("");
    else if (new SessionStore(this).get().isEmpty()) login("");
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
    shouldSyncPush = true;
    if (bio != null) bio.resumed();
    if (bio != null && bio.locked()) {
      if (!passwordEntry && !lockScreenVisible) showLocked("");
      return;
    }
    handler.postDelayed(poll, 30000);
    if (data != null && !editorOpen) refresh(false);
    else if (bio != null && bio.enabled() && !passwordEntry && !lockScreenVisible) {
      loading = false;
      frame();
      refresh(true);
    }
  }

  @Override
  protected void onPause() {
    super.onPause();
    handler.removeCallbacks(poll);
  }

  @Override
  protected void onStop() {
    super.onStop();
    if (bio != null) {
      bio.stopped();
      connectingNotifications = false;
      loading = false;
      if (bio.enabled()) {
        data = null;
        passwordEntry = false;
        lockScreenVisible = false;
        if (activeDialog != null) activeDialog.dismiss();
      }
    }
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
    if (bio != null) bio.resumed();
    if (intent.hasExtra("view")) tab = intent.getStringExtra("view");
    if (bio != null && bio.locked()) {
      if (!passwordEntry) showLocked("");
      return;
    }
    if (data != null) {
      render();
      refresh(false);
    }
  }

  private void inset(View v) {
    inset(v, false);
  }

  private void inset(View v, boolean darkHeader) {
    int flags = getWindow().getDecorView().getSystemUiVisibility();
    getWindow()
        .getDecorView()
        .setSystemUiVisibility(
            darkHeader
                ? flags & ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
                : flags | View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
    getWindow().setStatusBarColor(darkHeader ? DEEP : BG);
    v.setOnApplyWindowInsetsListener(
        (view, insets) -> {
          int top, bottom;
          if (Build.VERSION.SDK_INT >= 30) {
            android.graphics.Insets i = insets.getInsets(WindowInsets.Type.systemBars());
            top = i.top;
            bottom = i.bottom;
          } else {
            top = insets.getSystemWindowInsetTop();
            bottom = insets.getSystemWindowInsetBottom();
          }
          view.setPadding(0, top, 0, bottom);
          if (darkHeader) {
            LayerDrawable surface =
                new LayerDrawable(new Drawable[] {new ColorDrawable(BG), new ColorDrawable(DEEP)});
            surface.setLayerHeight(1, top);
            surface.setLayerGravity(1, Gravity.TOP);
            view.setBackground(surface);
          } else view.setBackgroundColor(BG);
          return insets;
        });
    v.requestApplyInsets();
  }

  private void updatePrivacy() {
    if (bio != null && bio.enabled()) getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
    else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
  }

  private void acceptAuthenticated(JSONObject value) {
    passwordEntry = false;
    lockScreenVisible = false;
    lockStatus = null;
    loading = false;
    data = value;
    stale = false;
    lastSync = System.currentTimeMillis();
    updatePrivacy();
    render();
    openNotificationBooking();
    loadPush();
  }

  private void showLocked(String reason) {
    data = null;
    editorOpen = false;
    if (activeDialog != null) activeDialog.dismiss();
    passwordEntry = false;
    lockScreenVisible = true;
    syncIndicator = null;
    root = column();
    root.setBackgroundColor(BG);
    setContentView(root);
    inset(root);
    updatePrivacy();
    ScrollView scroll = new ScrollView(this);
    LinearLayout box = column();
    box.setPadding(dp(28), dp(52), dp(28), dp(32));
    scroll.addView(box);
    root.addView(scroll, new LinearLayout.LayoutParams(-1, -1));
    ImageView mark = new ImageView(this);
    mark.setImageResource(R.drawable.app_icon);
    mark.setContentDescription("Logo DIMORA MIA");
    box.addView(mark, new LinearLayout.LayoutParams(dp(90), dp(90)));
    space(box, 28);
    box.addView(text("DIMORA MIA / ACCESSO PROTETTO", 11, GREEN, true));
    space(box, 18);
    box.addView(text("La tua dimora.\nSolo per te.", 35, INK, true));
    space(box, 16);
    box.addView(
        text(
            "Sblocca la gestione con l’impronta registrata su questo telefono.", 16, MUTED, false));
    space(box, 26);
    lockStatus = text(reason, 14, MUTED, false);
    box.addView(lockStatus);
    space(box, 12);
    lockProgress = new SyncIndicator(this);
    lockProgress.setBackground(shape(GREEN, 14));
    lockProgress.setVisibility(View.GONE);
    box.addView(lockProgress, new LinearLayout.LayoutParams(dp(48), dp(48)));
    space(box, 16);
    TextView unlock = button("Entra con l’impronta", true, () -> bio.unlock());
    unlock.setEnabled(bio.available());
    box.addView(unlock);
    space(box, 12);
    box.addView(button("Usa la password", false, () -> login("")));
    space(box, 24);
    box.addView(
        text(
            "L’impronta resta su Android. Per verificare l’accesso e aggiornare le prenotazioni"
                + " serve internet.",
            12,
            MUTED,
            false));
  }

  private void frame() {
    root = column();
    root.setBackgroundColor(BG);
    setContentView(root);
    inset(root, true);
    top = row();
    top.setBackgroundColor(DEEP);
    top.setPadding(dp(20), dp(13), dp(16), dp(13));
    ImageView mark = new ImageView(this);
    mark.setImageResource(R.drawable.app_icon);
    mark.setContentDescription("Logo DIMORA MIA");
    mark.setScaleType(ImageView.ScaleType.FIT_CENTER);
    mark.setClipToOutline(true);
    mark.setBackground(shape(GREEN, 12));
    top.addView(mark, new LinearLayout.LayoutParams(dp(46), dp(46)));
    LinearLayout brand = column();
    brand.setPadding(dp(12), 0, 0, 0);
    brand.addView(text("DIMORA MIA", 13, IVORY, true));
    sync = text("GESTIONE PRIVATA", 10, Color.rgb(196, 207, 188), false);
    brand.addView(sync);
    top.addView(brand, new LinearLayout.LayoutParams(0, -2, 1));
    syncIndicator = new SyncIndicator(this);
    syncIndicator.setBackground(
        new RippleDrawable(
            ColorStateList.valueOf(Color.argb(35, 255, 255, 255)),
            shape(Color.argb(15, 255, 255, 255), 14),
            shape(Color.WHITE, 14)));
    syncIndicator.setOnClickListener(v -> refresh(true));
    syncIndicator.setBusy(loading);
    top.addView(syncIndicator, new LinearLayout.LayoutParams(dp(48), dp(48)));
    root.addView(top);
    ScrollView scroll = new ScrollView(this);
    contentScroll = scroll;
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
      boolean selected = tab.equals(id);
      LinearLayout item = column();
      item.setGravity(Gravity.CENTER);
      item.setPadding(dp(2), dp(8), dp(2), dp(8));
      item.setMinimumHeight(dp(62));
      item.setContentDescription(names[i]);
      item.setSelected(selected);
      item.setFocusable(true);
      item.setClickable(true);
      item.setBackground(
          new RippleDrawable(
              ColorStateList.valueOf(Color.argb(30, 41, 74, 56)),
              shape(selected ? Color.rgb(233, 239, 226) : Color.WHITE, 14),
              shape(Color.WHITE, 14)));
      item.setAccessibilityDelegate(
          new View.AccessibilityDelegate() {
            @Override
            public void onInitializeAccessibilityNodeInfo(
                View host, android.view.accessibility.AccessibilityNodeInfo info) {
              super.onInitializeAccessibilityNodeInfo(host, info);
              info.setClassName(Button.class.getName());
            }
          });
      item.addView(
          new NavIcon(this, id, selected ? GREEN : MUTED),
          new LinearLayout.LayoutParams(dp(22), dp(22)));
      space(item, 4);
      TextView caption = text(names[i], 10, selected ? GREEN : MUTED, selected);
      caption.setGravity(Gravity.CENTER);
      caption.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO);
      item.addView(caption, new LinearLayout.LayoutParams(-1, -2));
      item.setOnClickListener(v -> navigate(id));
      caption.setOnClickListener(v -> navigate(id));
      nav.addView(item, new LinearLayout.LayoutParams(0, -2, 1));
    }
    root.addView(nav);
    title = text("", 27, INK, true);
    title.setPadding(0, dp(8), 0, dp(18));
    body.addView(title);
  }

  private void login(String error) {
    data = null;
    passwordEntry = true;
    lockScreenVisible = false;
    lockStatus = null;
    syncIndicator = null;
    updatePrivacy();
    root = column();
    root.setBackgroundColor(BG);
    setContentView(root);
    inset(root);
    ScrollView sc = new ScrollView(this);
    LinearLayout box = column();
    box.setPadding(dp(28), dp(60), dp(28), dp(40));
    sc.addView(box);
    root.addView(sc, new LinearLayout.LayoutParams(-1, -1));
    ImageView entryLogo = new ImageView(this);
    entryLogo.setImageResource(R.drawable.app_icon);
    entryLogo.setScaleType(ImageView.ScaleType.FIT_CENTER);
    entryLogo.setContentDescription("Logo DIMORA MIA");
    entryLogo.setBackground(shape(GREEN, 18));
    entryLogo.setClipToOutline(true);
    box.addView(entryLogo, new LinearLayout.LayoutParams(dp(76), dp(76)));
    space(box, 22);
    box.addView(text("DIMORA MIA / GESTIONE PRIVATA", 12, GREEN, true));
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
          final long ticket = bio.generation();
          executor.execute(
              () -> {
                try {
                  api.call("admin/login", obj("password", value));
                  JSONObject result = api.call("admin/console", null);
                  runOnUiThread(
                      () -> {
                        password.setText("");
                        completePasswordLogin(result, ticket);
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
    if (bio.enabled()) {
      space(box, 12);
      box.addView(
          button(
              "Entra con l’impronta",
              false,
              () -> {
                showLocked("");
                bio.unlock();
              }));
    }
    space(box, 20);
    box.addView(
        text(
            "Accesso protetto · archivio condiviso con il sito\n"
                + "Nessuna password viene conservata nell’app.",
            12,
            MUTED,
            false));
  }

  private void completePasswordLogin(JSONObject result, long ticket) {
    if (isFinishing() || isDestroyed()) return;
    if (ticket != bio.generation()) {
      if (bio.enabled()) showLocked("");
      return;
    }
    bio.passwordAccepted(result);
  }

  private void openNotificationBooking() {
    String id = getIntent().getStringExtra("bookingId");
    if (id != null && !id.matches("[a-zA-Z0-9-]{1,80}")) {
      getIntent().removeExtra("bookingId");
      return;
    }
    if (id == null || editorOpen) return;
    getIntent().removeExtra("bookingId");
    for (JSONObject b : bookings())
      if (b.optString("id").equals(id)) {
        detail(b);
        break;
      }
  }

  private boolean shouldRebuild(JSONObject result) {
    return data == null
        || stale
        || !today().toString().equals(renderedDate)
        || !data.toString().equals(result.toString());
  }

  private void refresh(boolean visible) {
    if (loading || (bio != null && bio.locked())) return;
    loading = true;
    final long refreshGeneration = bio.generation();
    if (syncIndicator != null) syncIndicator.setBusy(true);
    if (visible && sync != null) sync.setText("AGGIORNAMENTO…");
    executor.execute(
        () -> {
          try {
            JSONObject result = api.call("admin/console", null);
            runOnUiThread(
                () -> {
                  if (isFinishing()
                      || isDestroyed()
                      || refreshGeneration != bio.generation()
                      || bio.locked()) return;
                  loading = false;
                  if (syncIndicator != null) syncIndicator.setBusy(false);
                  boolean changed = shouldRebuild(result);
                  data = result;
                  stale = false;
                  lastSync = System.currentTimeMillis();
                  if (changed && !editorOpen && !typing()) render();
                  else if (sync != null)
                    sync.setText(
                        "AGGIORNATO ALLE "
                            + java.time.Instant.ofEpochMilli(lastSync)
                                .atZone(ZoneId.systemDefault())
                                .format(DateTimeFormatter.ofPattern("HH:mm")));
                  openNotificationBooking();
                  if (tab.equals("settings") || pushConfig == null) loadPush();
                });
          } catch (Exception e) {
            runOnUiThread(
                () -> {
                  if (isFinishing()
                      || isDestroyed()
                      || refreshGeneration != bio.generation()
                      || bio.locked()) return;
                  loading = false;
                  if (syncIndicator != null) syncIndicator.setBusy(false);
                  stale = true;
                  if (e instanceof Api.Failure && ((Api.Failure) e).status == 401) {
                    data = null;
                    bio.unauthorized();
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
    return NativeRules.active(b.optString("status"));
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
    if (data == null || (bio != null && bio.locked())) return;
    int previousScroll = contentScroll == null ? 0 : contentScroll.getScrollY();
    boolean sameTab = tab.equals(renderedTab);
    frame();
    sync.setText(
        stale
            ? "NON AGGIORNATO · TOCCA ↻"
            : "AGGIORNATO ALLE "
                + java.time.Instant.ofEpochMilli(lastSync)
                    .atZone(ZoneId.systemDefault())
                    .format(DateTimeFormatter.ofPattern("HH:mm")));
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
    contentScroll.post(() -> contentScroll.scrollTo(0, sameTab ? previousScroll : 0));
    if (animateNextRender && ValueAnimator.areAnimatorsEnabled()) {
      body.setAlpha(.55f);
      body.setTranslationY(dp(8));
      body.animate()
          .alpha(1f)
          .translationY(0)
          .setDuration(190)
          .setInterpolator(new DecelerateInterpolator())
          .start();
    }
    animateNextRender = false;
    renderedTab = tab;
    renderedDate = today().toString();
  }

  private void navigate(String next) {
    if (tab.equals(next)) return;
    tab = next;
    rangeStart = rangeEnd = null;
    animateNextRender = true;
    render();
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
    List<JSONObject> arrivals = new ArrayList<>(), departures = new ArrayList<>();
    long due = 0;
    int in = 0;
    for (JSONObject b : bookings())
      if (active(b) && !block(b)) {
        due += balance(b);
        if (b.optString("status").equals("confirmed")
            && b.optString("checkin").compareTo(t) <= 0
            && b.optString("checkout").compareTo(t) > 0) in++;
        if (b.optString("status").equals("confirmed") && b.optString("checkin").equals(t))
          arrivals.add(b);
        if (b.optString("status").equals("confirmed") && b.optString("checkout").equals(t))
          departures.add(b);
      }
    LinearLayout metrics = card("");
    metrics.setBackground(shape(DEEP, 22));
    metrics.addView(text("LA CASA, OGGI", 10, GOLD, true));
    space(metrics, 12);
    metrics.addView(text(in + " soggiorni in corso", 27, IVORY, true));
    metrics.addView(
        text(
            arrivals.size() + " arrivi oggi  ·  " + departures.size() + " partenze",
            14,
            Color.rgb(195, 207, 188),
            false));
    space(metrics, 10);
    metrics.addView(text(money(due) + " da registrare", 20, GOLD, true));
    LinearLayout priorities = card("Da seguire oggi");
    if (arrivals.isEmpty() && departures.isEmpty())
      priorities.addView(text("Nessun arrivo o partenza oggi.", 14, MUTED, false));
    for (JSONObject b : arrivals) bookingRow(priorities, b, "ARRIVO OGGI");
    for (JSONObject b : departures) bookingRow(priorities, b, "PARTENZA OGGI");
    LinearLayout agenda = card("I prossimi 7 giorni");
    List<StayEvent> events = agendaEvents();
    for (int i = 0; i < Math.min(4, events.size()); i++) {
      StayEvent event = events.get(i);
      bookingRow(
          agenda,
          event.booking,
          (event.departure ? "PARTENZA · " : "ARRIVO · ") + date(event.date));
    }
    if (events.isEmpty())
      agenda.addView(
          text("Nessun movimento previsto nei prossimi sette giorni.", 14, MUTED, false));
    else {
      space(agenda, 12);
      agenda.addView(button("Apri agenda completa →", false, this::agendaPanel));
    }
  }

  private static final class StayEvent {
    final JSONObject booking;
    final String date;
    final boolean departure;

    StayEvent(JSONObject b, String d, boolean out) {
      booking = b;
      date = d;
      departure = out;
    }
  }

  private List<StayEvent> agendaEvents() {
    List<StayEvent> events = new ArrayList<>();
    String t = today().toString();
    for (JSONObject b : bookings())
      if (b.optString("status").equals("confirmed") && !block(b)) {
        if (NativeRules.withinWeek(b.optString("checkin"), t))
          events.add(new StayEvent(b, b.optString("checkin"), false));
        if (NativeRules.withinWeek(b.optString("checkout"), t))
          events.add(new StayEvent(b, b.optString("checkout"), true));
      }
    events.sort(
        Comparator.comparing((StayEvent e) -> e.date).thenComparingInt(e -> e.departure ? 0 : 1));
    return events;
  }

  private void agendaPanel() {
    LinearLayout box = column();
    String last = "";
    for (StayEvent event : agendaEvents()) {
      if (!last.equals(event.date)) {
        space(box, 12);
        box.addView(
            text(
                LocalDate.parse(event.date)
                    .format(DateTimeFormatter.ofPattern("EEEE d MMMM", Locale.ITALIAN)),
                15,
                GREEN,
                true));
        last = event.date;
      }
      bookingRow(box, event.booking, event.departure ? "PARTENZA" : "ARRIVO");
    }
    form("Agenda dei prossimi 7 giorni", box);
  }

  private void bookingRow(LinearLayout parent, JSONObject b, String tag) {
    LinearLayout c = column();
    c.setPadding(0, dp(14), 0, dp(14));
    if (!tag.isEmpty()) {
      c.addView(text(tag, 10, GREEN, true));
      space(c, 7);
    }
    LinearLayout line = row();
    TextView name = text(b.optString("name", "Soggiorno"), 17, INK, true);
    line.addView(name, new LinearLayout.LayoutParams(0, -2, 1));
    String status = b.optString("status"), label = NativeRules.statusLabel(status);
    boolean warning = status.contains("payment") || status.contains("refund");
    if (status.startsWith("cancelled") && paid(b) > 0) {
      label = "Rimborso da valutare";
      warning = true;
    }
    int chipColor =
        warning
            ? Color.rgb(248, 236, 215)
            : block(b)
                ? Color.rgb(239, 232, 220)
                : active(b) ? Color.rgb(232, 239, 224) : Color.rgb(239, 238, 233);
    TextView badge = text(label, 10, warning ? Color.rgb(123, 82, 32) : GREEN, true);
    badge.setPadding(dp(9), dp(5), dp(9), dp(5));
    badge.setMaxWidth(dp(130));
    badge.setBackground(shape(chipColor, 8));
    LinearLayout.LayoutParams bp = new LinearLayout.LayoutParams(-2, -2);
    bp.leftMargin = dp(9);
    line.addView(badge, bp);
    c.addView(line);
    space(c, 7);
    c.addView(
        text(date(b.optString("checkin")) + " → " + date(b.optString("checkout")), 14, INK, false));
    space(c, 5);
    LinearLayout footer = row();
    boolean largeText = getResources().getConfiguration().fontScale > 1.3f;
    if (largeText) footer.setOrientation(LinearLayout.VERTICAL);
    footer.addView(
        text(
            block(b)
                ? "Periodo non disponibile"
                : b.optInt("guests") + " ospiti · " + sourceLabel(b.optString("source")),
            11,
            MUTED,
            false),
        largeText
            ? new LinearLayout.LayoutParams(-1, -2)
            : new LinearLayout.LayoutParams(0, -2, 1));
    if (!block(b) && active(b)) {
      long remaining = balance(b);
      footer.addView(
          text(
              remaining > 0 ? money(remaining) + " residuo" : "Saldo chiuso",
              remaining > 0 ? 14 : 11,
              GREEN,
              true));
    }
    c.addView(footer);
    c.setBackground(
        new RippleDrawable(
            ColorStateList.valueOf(Color.argb(25, 41, 74, 56)), null, shape(Color.WHITE, 12)));
    c.setClickable(true);
    c.setFocusable(true);
    c.setOnClickListener(
        v -> {
          if (activeDialog != null) activeDialog.dismiss();
          detail(b);
        });
    parent.addView(c);
    View divider = new View(this);
    divider.setBackgroundColor(LINE);
    parent.addView(divider, new LinearLayout.LayoutParams(-1, dp(1)));
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
    space(body, 8);
    body.addView(
        button(
            "Torna a oggi",
            false,
            () -> {
              month = YearMonth.from(today());
              rangeStart = rangeEnd = null;
              animateNextRender = true;
              render();
            }));
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
    HorizontalScrollView filters = new HorizontalScrollView(this);
    filters.setHorizontalScrollBarEnabled(false);
    LinearLayout chips = row();
    String[] labels = {"Tutti", "Prossimi", "In casa", "Saldi aperti", "Blocchi", "Storico"},
        values = {"all", "upcoming", "inhouse", "dues", "blocks", "history"};
    TextView[] chipViews = new TextView[labels.length];
    for (int i = 0; i < labels.length; i++) {
      final String key = values[i];
      TextView chip = button(labels[i], bookingFilter.equals(key), () -> {});
      chip.setTextSize(12);
      chip.setTag(key);
      chip.setSelected(bookingFilter.equals(key));
      chipViews[i] = chip;
      LinearLayout.LayoutParams cp = new LinearLayout.LayoutParams(-2, dp(44));
      cp.rightMargin = dp(8);
      chips.addView(chip, cp);
    }
    filters.addView(chips);
    body.addView(filters);
    space(body, 14);
    LinearLayout list = card("");
    Runnable fill =
        () -> {
          list.removeAllViews();
          String needle = search.getText().toString().trim().toLowerCase(Locale.ITALIAN);
          int count = 0;
          List<JSONObject> ordered = bookings();
          String now = today().toString();
          ordered.sort(
              (a, b) -> {
                boolean nearA = active(a) && a.optString("checkout").compareTo(now) > 0,
                    nearB = active(b) && b.optString("checkout").compareTo(now) > 0;
                if (nearA != nearB) return nearA ? -1 : 1;
                return nearA
                    ? a.optString("checkin").compareTo(b.optString("checkin"))
                    : b.optString("checkin").compareTo(a.optString("checkin"));
              });
          for (JSONObject b : ordered)
            if (NativeRules.matches(
                    bookingFilter,
                    b.optString("status"),
                    block(b),
                    b.optString("checkin"),
                    b.optString("checkout"),
                    now,
                    balance(b))
                && (b.optString("name")
                        + " "
                        + b.optString("email")
                        + " "
                        + b.optString("phone")
                        + " "
                        + b.optString("id"))
                    .toLowerCase(Locale.ITALIAN)
                    .contains(needle)) {
              bookingRow(list, b, "");
              if (++count == 100) {
                list.addView(
                    text(
                        "Mostrati i primi 100 risultati. Usa ricerca e filtri per trovare un"
                            + " soggiorno.",
                        12,
                        MUTED,
                        false));
                break;
              }
            }
          if (count == 0)
            list.addView(text("Nessun soggiorno con questi filtri.", 15, MUTED, false));
        };
    for (TextView chip : chipViews)
      chip.setOnClickListener(
          v -> {
            bookingFilter = chip.getTag().toString();
            for (TextView other : chipViews) {
              boolean selected = bookingFilter.equals(other.getTag());
              other.setSelected(selected);
              other.setTextColor(selected ? Color.WHITE : GREEN);
              other.setBackground(
                  new RippleDrawable(
                      ColorStateList.valueOf(Color.argb(30, 41, 74, 56)),
                      shape(selected ? GREEN : Color.WHITE, 12),
                      shape(Color.WHITE, 12)));
            }
            fill.run();
          });
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
    LinearLayout security = card("Accesso e privacy");
    security.addView(
        text(
            bio.enabled() ? "Impronta attiva su questo telefono" : "Accedi con l’impronta",
            17,
            INK,
            true));
    space(security, 10);
    security.addView(
        text(
            "La biometria forte di Android protegge una credenziale cifrata. La password resta"
                + " sempre disponibile. Puoi rientrare entro 10 minuti senza risbloccare; dopo la"
                + " chiusura completa dell’app è richiesto un nuovo accesso.",
            13,
            MUTED,
            false));
    space(security, 16);
    TextView bioAction =
        button(
            bio.enabled() ? "Disattiva accesso con impronta" : "Attiva accesso con impronta",
            !bio.enabled(),
            () -> {
              if (bio.enabled())
                new AlertDialog.Builder(this)
                    .setTitle("Disattivare l’impronta?")
                    .setMessage(
                        "L’accesso protetto di questo telefono verrà revocato. Poi accederai con la"
                            + " password.")
                    .setNegativeButton("Mantieni", null)
                    .setPositiveButton("Disattiva", (d, w) -> bio.disable())
                    .show();
              else bio.enable();
            });
    bioAction.setEnabled(!stale && (bio.enabled() || bio.available()));
    security.addView(bioAction);
    if (!bio.enabled() && !bio.available()) {
      space(security, 10);
      security.addView(
          text(
              "Registra un’impronta in Android per attivare questa funzione. È richiesto Android 9"
                  + " o successivo.",
              12,
              MUTED,
              false));
    }
    if (bio.enabled()) {
      space(security, 12);
      security.addView(button("Blocca adesso", false, () -> bio.lockNow()));
    }
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
    LinearLayout info = card("DIMORA MIA · 1.3.0");
    info.addView(
        text(
            "Una sola casa, un calendario condiviso con il sito. Fuso orario Europe/Rome · 4"
                + " ospiti.",
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
                                  getSharedPreferences("native", 0).getString("deviceId", ""),
                                  "nativeAuthId",
                                  bio.id());
                          request(
                              () -> api.call("admin/logout", input),
                              r -> {
                                getSharedPreferences("native", 0).edit().remove("deviceId").apply();
                                bio.clearLocal();
                                updatePrivacy();
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
    if (ValueAnimator.areAnimatorsEnabled())
      dialog.getWindow().setWindowAnimations(R.style.DimoraDialogMotion);
    dialog.getWindow().setBackgroundDrawable(shape(Color.WHITE, 22));
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
            "Riferimento " + b.optString("id") + "\nCanale: " + sourceLabel(b.optString("source")),
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
    if (!block(b) && active(b)) {
      space(box, 12);
      box.addView(button("Aggiungi al calendario del telefono", false, () -> calendarReminder(b)));
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

  private String sourceLabel(String value) {
    switch (value) {
      case "direct":
        return "Sito diretto";
      case "booking":
        return "Booking.com · inserimento manuale";
      case "airbnb":
        return "Airbnb · inserimento manuale";
      default:
        return "Telefono / messaggio";
    }
  }

  private void calendarReminder(JSONObject b) {
    try {
      Intent event =
          new Intent(Intent.ACTION_INSERT)
              .setData(CalendarContract.Events.CONTENT_URI)
              .putExtra(CalendarContract.Events.TITLE, "DIMORA MIA · " + b.optString("name"))
              .putExtra(CalendarContract.EXTRA_EVENT_ALL_DAY, true)
              .putExtra(
                  CalendarContract.EXTRA_EVENT_BEGIN_TIME,
                  LocalDate.parse(b.optString("checkin"))
                      .atStartOfDay(ZoneOffset.UTC)
                      .toInstant()
                      .toEpochMilli())
              .putExtra(
                  CalendarContract.EXTRA_EVENT_END_TIME,
                  LocalDate.parse(b.optString("checkout"))
                      .atStartOfDay(ZoneOffset.UTC)
                      .toInstant()
                      .toEpochMilli())
              .putExtra(
                  CalendarContract.Events.DESCRIPTION,
                  "Soggiorno dal "
                      + b.optString("checkin")
                      + " al "
                      + b.optString("checkout")
                      + " (giorno di uscita). Le modifiche successive nell’app non aggiornano"
                      + " automaticamente questo promemoria.");
      startActivity(event);
    } catch (Exception e) {
      notice("Nessuna app calendario disponibile su questo telefono.");
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

  private boolean shouldSyncPush = true;

  private void loadPush() {
    final long ticket = bio.generation();
    executor.execute(
        () -> {
          try {
            JSONObject config = api.call("admin/native/push", null);
            runOnUiThread(
                () -> {
                  if (isFinishing() || isDestroyed() || ticket != bio.generation() || bio.locked())
                    return;
                  boolean changed =
                      pushConfig == null
                          || pushConfig.optBoolean("configured") != config.optBoolean("configured");
                  pushConfig = config;
                  if (shouldSyncPush
                      && config.optBoolean("configured")
                      && notificationPermission()
                      && channelEnabled()
                      && (getSharedPreferences("native", 0).getBoolean("pushWanted", false)
                          || !getSharedPreferences("native", 0)
                              .getString("deviceId", "")
                              .isEmpty())) {
                    shouldSyncPush = false;
                    activateNotifications(false);
                  }
                  if (changed && tab.equals("settings") && data != null && !editorOpen && !typing())
                    render();
                });
          } catch (Exception ignored) {
          }
        });
  }

  private boolean channelEnabled() {
    NotificationChannel channel =
        getSystemService(NotificationManager.class).getNotificationChannel("prenotazioni");
    return channel == null || channel.getImportance() != NotificationManager.IMPORTANCE_NONE;
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
    if (!channelEnabled())
      return "Il canale Prenotazioni è disattivato nelle impostazioni Android.";
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
          String linkedId = getSharedPreferences("native", 0).getString("deviceId", "");
          if (!linkedId.isEmpty()) {
            space(box, 12);
            box.addView(
                button(
                    "Disattiva avvisi su questo telefono",
                    false,
                    () -> {
                      new AlertDialog.Builder(this)
                          .setTitle("Disattivare gli avvisi?")
                          .setMessage(
                              "Le prenotazioni restano nel calendario. Questo telefono non riceverà"
                                  + " nuovi invii finché non lo ricolleghi.")
                          .setNegativeButton("Mantieni", null)
                          .setPositiveButton(
                              "Disattiva",
                              (d, w) ->
                                  request(
                                      () ->
                                          api.call(
                                              "admin/native/push/disable", obj("id", linkedId)),
                                      result -> {
                                        shouldSyncPush = false;
                                        getSharedPreferences("native", 0)
                                            .edit()
                                            .putBoolean("pushWanted", false)
                                            .remove("deviceId")
                                            .remove("fcmToken")
                                            .apply();
                                        if (!com.google.firebase.FirebaseApp.getApps(this)
                                            .isEmpty()) {
                                          FirebaseMessaging.getInstance().setAutoInitEnabled(false);
                                          FirebaseMessaging.getInstance().deleteToken();
                                        }
                                        dialog.dismiss();
                                        loadPush();
                                        notice("Avvisi disattivati su questo telefono.");
                                      }))
                          .show();
                    }));
            JSONArray deliveries = config.optJSONArray("deliveries");
            if (deliveries != null) {
              int count = 0;
              for (int i = 0; i < deliveries.length() && count < 4; i++) {
                JSONObject entry = deliveries.optJSONObject(i);
                if (entry == null || !linkedId.equals(entry.optString("device_id"))) continue;
                if (count++ == 0) {
                  space(box, 20);
                  box.addView(text("Ultimi invii a questo telefono", 14, INK, true));
                }
                String status = entry.optString("status");
                String label =
                    status.equals("accepted")
                        ? "Accettato da Firebase"
                        : status.equals("queued") || status.equals("sending")
                            ? "Invio in attesa"
                            : status.equals("superseded")
                                ? "Invio annullato"
                                : status.equals("expired")
                                    ? "Invio scaduto"
                                    : "Invio da verificare";
                space(box, 8);
                box.addView(
                    text(
                        (entry.optString("kind").equals("test") ? "Prova" : "Prenotazione")
                            + " · "
                            + label,
                        12,
                        MUTED,
                        false));
              }
              if (count > 0) {
                space(box, 8);
                box.addView(
                    text(
                        "Accettato indica la presa in carico del servizio. La ricezione si verifica"
                            + " sul telefono.",
                        12,
                        MUTED,
                        false));
              }
            }
          }
          space(box, 10);
          box.addView(
              button(
                  "Impostazioni notifiche Android",
                  false,
                  () ->
                      startActivity(
                          new Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS)
                              .putExtra(Settings.EXTRA_APP_PACKAGE, getPackageName())
                              .putExtra(Settings.EXTRA_CHANNEL_ID, "prenotazioni"))));
        });
  }

  private void activateNotifications() {
    activateNotifications(true);
  }

  private void activateNotifications(boolean explicit) {
    if (!explicit && !notificationPermission()) return;
    if (Build.VERSION.SDK_INT >= 33 && !notificationPermission()) {
      requestPermissions(new String[] {Manifest.permission.POST_NOTIFICATIONS}, 44);
      return;
    }
    if (!getSystemService(NotificationManager.class).areNotificationsEnabled()
        || !channelEnabled()) {
      notice("Abilita le notifiche nelle impostazioni Android dell’app.");
      return;
    }
    if (connectingNotifications) {
      notice("Collegamento notifiche già in corso. Attendi l’esito.");
      return;
    }
    connectingNotifications = true;
    shouldSyncPush = false;
    final long ticket = bio.generation();
    if (explicit) getSharedPreferences("native", 0).edit().putBoolean("pushWanted", true).apply();
    if (explicit)
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
                  if (ticket != bio.generation() || bio.locked()) return;
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
                    if (isFinishing()
                        || isDestroyed()
                        || ticket != bio.generation()
                        || bio.locked()) return;
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
                                    Build.MANUFACTURER + " " + Build.MODEL,
                                    "replaceId",
                                    getSharedPreferences("native", 0).getString("deviceId", ""))),
                        result -> {
                          connectingNotifications = false;
                          getSharedPreferences("native", 0)
                              .edit()
                              .putString("deviceId", result.getString("id"))
                              .apply();
                          loadPush();
                          if (explicit)
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
