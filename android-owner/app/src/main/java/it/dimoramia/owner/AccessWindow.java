package it.dimoramia.owner;

import android.os.SystemClock;
import java.util.function.LongSupplier;

/** Process-only access: never persists a biometric bypass across process death. */
final class AccessWindow {
  static final long GRACE_MS = 10 * 60 * 1000L;
  private final LongSupplier clock;
  private boolean authenticated;
  private long backgroundAt = -1;

  AccessWindow() {
    this(SystemClock::elapsedRealtime);
  }

  AccessWindow(LongSupplier clock) {
    this.clock = clock;
  }

  synchronized void authenticated() {
    authenticated = true;
    backgroundAt = -1;
  }

  synchronized void background() {
    if (authenticated && backgroundAt < 0) backgroundAt = clock.getAsLong();
  }

  synchronized boolean open() {
    if (authenticated && backgroundAt >= 0) {
      long elapsed = clock.getAsLong() - backgroundAt;
      if (elapsed < 0 || elapsed >= GRACE_MS) clear();
    }
    return authenticated;
  }

  synchronized boolean resume() {
    boolean allowed = open();
    if (allowed) backgroundAt = -1;
    return allowed;
  }

  synchronized void clear() {
    authenticated = false;
    backgroundAt = -1;
  }
}
