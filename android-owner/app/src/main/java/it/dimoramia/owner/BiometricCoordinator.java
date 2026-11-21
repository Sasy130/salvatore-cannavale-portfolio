package it.dimoramia.owner;

import android.app.Activity;
import android.os.*;
import java.util.concurrent.ExecutorService;
import org.json.JSONObject;

final class BiometricCoordinator {
  interface Listener {
    void unlocked(JSONObject data);

    void locked(String reason);

    void password(String reason);

    void changed();

    void message(String text);
  }

  private final Activity activity;
  private final Api api;
  private final ExecutorService executor;
  private final Listener listener;
  private final BiometricVault vault;
  private boolean locked, busy;
  private long generation;
  private CancellationSignal signal;

  BiometricCoordinator(Activity activity, Api api, ExecutorService executor, Listener listener) {
    this.activity = activity;
    this.api = api;
    this.executor = executor;
    this.listener = listener;
    vault = new BiometricVault(activity);
    locked = vault.enabled();
  }

  boolean enabled() {
    return vault.enabled();
  }

  boolean locked() {
    return locked;
  }

  String id() {
    return vault.id();
  }

  long generation() {
    return generation;
  }

  boolean available() {
    return BiometricVault.available(activity);
  }

  private boolean alive(long ticket) {
    return ticket == generation && !activity.isFinishing() && !activity.isDestroyed();
  }

  private JSONObject body(String key, String value) {
    JSONObject result = new JSONObject();
    try {
      result.put(key, value);
    } catch (Exception ignored) {
    }
    return result;
  }

  private void later(Runnable work) {
    activity.runOnUiThread(
        () -> {
          if (!activity.isFinishing() && !activity.isDestroyed()) work.run();
        });
  }

  private void revoke(String id) {
    Runnable cleanup =
        () -> {
          try {
            api.call("admin/native/auth/revoke", body("id", id));
          } catch (Exception ignored) {
          }
        };
    try {
      executor.execute(cleanup);
    } catch (java.util.concurrent.RejectedExecutionException e) {
      new Thread(cleanup, "dimora-biometric-cleanup").start();
    }
  }

  void stopped() {
    generation++;
    busy = false;
    if (signal != null) {
      signal.cancel();
      signal = null;
    }
    if (vault.enabled()) locked = true;
  }

  void passwordAccepted(JSONObject data) {
    busy = false;
    locked = false;
    listener.unlocked(data);
  }

  void unauthorized() {
    new SessionStore(activity).clear();
    if (vault.enabled()) {
      locked = true;
      listener.locked("La sessione è scaduta. Sblocca con l’impronta o usa la password.");
    } else listener.password("Sessione scaduta. Accedi di nuovo.");
  }

  void clearLocal() {
    generation++;
    if (signal != null) signal.cancel();
    signal = null;
    vault.clear();
    busy = false;
    locked = false;
  }

  void enable() {
    if (busy) return;
    if (vault.enabled()) {
      listener.message("L’accesso con impronta è già attivo su questo telefono.");
      return;
    }
    if (!available()) {
      listener.message(
          "Registra un’impronta nelle impostazioni Android. Questa funzione richiede Android 9 o"
              + " successivo e una biometria forte.");
      return;
    }
    busy = true;
    final long ticket = generation;
    executor.execute(
        () -> {
          try {
            JSONObject request = body("label", Build.MANUFACTURER + " " + Build.MODEL);
            request.put("replaceId", vault.id());
            JSONObject enrollment = api.call("admin/native/auth/enroll", request);
            String id = enrollment.getString("id"), credential = enrollment.getString("credential");
            later(
                () -> {
                  if (!alive(ticket)) {
                    busy = false;
                    revoke(id);
                    return;
                  }
                  try {
                    signal =
                        BiometricVault.prompt(
                            activity,
                            vault.encryption(),
                            "Attiva accesso con impronta",
                            "Annulla",
                            cipher -> {
                              signal = null;
                              busy = false;
                              if (!alive(ticket)) {
                                revoke(id);
                                return;
                              }
                              try {
                                vault.store(id, credential, cipher);
                                listener.changed();
                                listener.message(
                                    "Impronta attivata. Al prossimo ingresso potrai sbloccare la"
                                        + " gestione senza riscrivere la password.");
                              } catch (Exception e) {
                                vault.clear();
                                revoke(id);
                                listener.message(
                                    "Non è stato possibile proteggere l’accesso. La password rimane"
                                        + " disponibile.");
                              }
                            },
                            () -> {
                              signal = null;
                              busy = false;
                              revoke(id);
                            },
                            error -> {
                              signal = null;
                              busy = false;
                              revoke(id);
                              if (alive(ticket)) listener.message(error);
                            });
                  } catch (Exception e) {
                    busy = false;
                    revoke(id);
                    listener.message(
                        "Impossibile attivare l’impronta. Controlla la biometria del telefono e"
                            + " riprova.");
                  }
                });
          } catch (Exception e) {
            later(
                () -> {
                  busy = false;
                  if (!alive(ticket)) return;
                  if (e instanceof Api.Failure && ((Api.Failure) e).status == 401) unauthorized();
                  else
                    listener.message(
                        e.getMessage() == null
                            ? "Attivazione non riuscita. Riprova."
                            : e.getMessage());
                });
          }
        });
  }

  void disable() {
    if (busy) return;
    busy = true;
    String id = vault.id();
    executor.execute(
        () -> {
          try {
            api.call("admin/native/auth/revoke", body("id", id));
            later(
                () -> {
                  clearLocal();
                  new SessionStore(activity).clear();
                  listener.changed();
                  listener.password("Impronta disattivata. Accedi con la password.");
                });
          } catch (Exception e) {
            later(
                () -> {
                  busy = false;
                  listener.message(
                      "Impossibile disattivare l’accesso sul server. Controlla la connessione e"
                          + " riprova.");
                });
          }
        });
  }

  void unlock() {
    if (busy) return;
    if (!available()) {
      listener.password("Impronta non disponibile. Accedi con la password proprietario.");
      return;
    }
    busy = true;
    final long ticket = generation;
    try {
      signal =
          BiometricVault.prompt(
              activity,
              vault.decryption(),
              "Entra in DIMORA MIA",
              "Usa password",
              cipher -> {
                signal = null;
                if (!alive(ticket)) {
                  busy = false;
                  return;
                }
                try {
                  String credential = vault.unlock(cipher);
                  listener.message("Accesso protetto in corso…");
                  executor.execute(
                      () -> {
                        try {
                          api.call("auth/native/refresh", body("credential", credential));
                          JSONObject data = api.call("admin/console", null);
                          later(
                              () -> {
                                busy = false;
                                if (alive(ticket)) {
                                  locked = false;
                                  listener.unlocked(data);
                                }
                              });
                        } catch (Exception e) {
                          later(
                              () -> {
                                busy = false;
                                if (!alive(ticket)) return;
                                if (e instanceof Api.Failure && ((Api.Failure) e).status == 401) {
                                  vault.clear();
                                  new SessionStore(activity).clear();
                                  locked = true;
                                  listener.changed();
                                  listener.password(
                                      "Accesso con impronta scaduto o revocato. Accedi con la"
                                          + " password e riattivalo.");
                                } else
                                  listener.locked(
                                      "Connessione non disponibile. Riprova oppure usa la"
                                          + " password.");
                              });
                        }
                      });
                } catch (Exception e) {
                  busy = false;
                  vault.clear();
                  new SessionStore(activity).clear();
                  locked = true;
                  listener.changed();
                  listener.password(
                      "La biometria del telefono è cambiata. Accedi con la password e riattiva"
                          + " l’impronta.");
                }
              },
              () -> {
                signal = null;
                busy = false;
                if (alive(ticket)) listener.password("");
              },
              error -> {
                signal = null;
                busy = false;
                if (alive(ticket)) listener.locked(error);
              });
    } catch (Exception e) {
      busy = false;
      vault.clear();
      new SessionStore(activity).clear();
      locked = true;
      listener.changed();
      listener.password("Impronta da riattivare. Accedi con la password proprietario.");
    }
  }
}
