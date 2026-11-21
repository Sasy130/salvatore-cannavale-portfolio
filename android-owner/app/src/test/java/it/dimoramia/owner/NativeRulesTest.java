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
}
