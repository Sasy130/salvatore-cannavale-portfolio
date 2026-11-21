package it.dimoramia.owner;

import static org.junit.Assert.*;

import java.util.concurrent.atomic.AtomicLong;
import org.junit.Test;

public class AccessWindowTest {
  @Test
  public void backgroundGraceExpiresAtTenMinutesAndNeverStartsUnlocked() {
    AtomicLong now = new AtomicLong(100);
    AccessWindow window = new AccessWindow(now::get);
    assertFalse(window.resume());
    window.authenticated();
    window.background();
    now.addAndGet(AccessWindow.GRACE_MS - 1);
    assertTrue(window.open());
    now.incrementAndGet();
    assertFalse(window.resume());
    assertFalse(window.open());
  }

  @Test
  public void returningStartsANewGracePeriodOnlyAfterNextExit() {
    AtomicLong now = new AtomicLong(100);
    AccessWindow window = new AccessWindow(now::get);
    window.authenticated();
    window.background();
    now.addAndGet(300000);
    assertTrue(window.resume());
    now.addAndGet(3600000);
    assertTrue(window.open());
    window.background();
    now.addAndGet(599999);
    assertTrue(window.resume());
    window.clear();
    assertFalse(window.open());
    assertFalse(new AccessWindow(now::get).open());
  }

  @Test
  public void repeatedStopCannotExtendTheBackgroundDeadline() {
    AtomicLong now = new AtomicLong(100);
    AccessWindow window = new AccessWindow(now::get);
    window.authenticated();
    window.background();
    now.addAndGet(300000);
    window.background();
    now.addAndGet(300000);
    assertFalse(window.resume());
  }
}
