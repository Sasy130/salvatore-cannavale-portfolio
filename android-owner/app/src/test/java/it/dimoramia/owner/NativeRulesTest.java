package it.dimoramia.owner;

import static org.junit.Assert.*;

import org.junit.Test;

public class NativeRulesTest {
  @Test
  public void amountsKeepCentsWithoutFloatingPointRounding() {
    assertEquals(29950, NativeRules.cents("299,50"));
    assertEquals(100005, NativeRules.cents("1.000,05"));
    assertEquals(5, NativeRules.cents("0.05"));
  }

  @Test
  public void invalidAmountsCannotBeSilentlyRoundedOrNegative() {
    for (String v : new String[] {"1.005", "-2", "NaN", "1e3", "9999999999", ""})
      assertThrows(RuntimeException.class, () -> NativeRules.cents(v));
  }

  @Test
  public void checkOutIsNotAnInHouseDayAndCancelledStaysCannotBeUpcoming() {
    assertTrue(
        NativeRules.matches(
            "inhouse", "confirmed", false, "2026-11-20", "2026-11-22", "2026-11-21", 100));
    assertFalse(
        NativeRules.matches(
            "inhouse", "confirmed", false, "2026-11-20", "2026-11-21", "2026-11-21", 100));
    assertFalse(
        NativeRules.matches(
            "upcoming", "cancelled", false, "2026-11-22", "2026-11-24", "2026-11-21", 100));
    assertFalse(NativeRules.active("payment_review_required"));
    assertEquals("Pagamento da verificare", NativeRules.statusLabel("payment_review_required"));
  }

  @Test
  public void agendaCoversSevenLocalCalendarDaysWithoutIncludingDayEight() {
    assertTrue(NativeRules.withinWeek("2026-03-28", "2026-03-28"));
    assertTrue(NativeRules.withinWeek("2026-04-03", "2026-03-28"));
    assertFalse(NativeRules.withinWeek("2026-04-04", "2026-03-28"));
    assertFalse(NativeRules.withinWeek("2026-03-27", "2026-03-28"));
  }

  @Test
  public void balanceAndBlockFiltersCannotConfuseClosedDatesWithGuestStays() {
    assertTrue(
        NativeRules.matches(
            "blocks", "blocked", true, "2026-11-20", "2026-11-25", "2026-11-21", 0));
    assertFalse(
        NativeRules.matches(
            "dues", "blocked", true, "2026-11-20", "2026-11-25", "2026-11-21", 100));
    assertTrue(
        NativeRules.matches(
            "dues", "confirmed", false, "2026-11-20", "2026-11-25", "2026-11-21", 100));
  }
}
