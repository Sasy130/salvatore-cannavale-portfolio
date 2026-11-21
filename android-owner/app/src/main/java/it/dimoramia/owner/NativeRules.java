package it.dimoramia.owner;

import java.math.BigDecimal;

final class NativeRules {
  static int cents(String value) {
    String s = value.trim().replace(" ", "");
    if (s.contains(",")) s = s.replace(".", "").replace(',', '.');
    if (!s.matches("\\d+(\\.\\d{1,2})?")) throw new IllegalArgumentException("Importo non valido");
    int n = new BigDecimal(s).movePointRight(2).intValueExact();
    if (n > 10000000) throw new IllegalArgumentException("Importo fuori limite");
    return n;
  }
}
