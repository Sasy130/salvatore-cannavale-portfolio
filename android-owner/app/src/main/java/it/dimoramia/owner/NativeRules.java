package it.dimoramia.owner;

import java.math.BigDecimal;

final class NativeRules {
  static boolean active(String status) {
    return java.util.Arrays.asList("pending", "confirmed", "blocked", "awaiting_payment")
        .contains(status);
  }

  static String statusLabel(String status) {
    switch (status) {
      case "confirmed":
        return "Confermata";
      case "blocked":
        return "Date bloccate";
      case "awaiting_payment":
        return "Pagamento in attesa";
      case "cancelled":
        return "Annullata";
      case "cancelled_refund_required":
        return "Rimborso da gestire";
      case "expired":
        return "Scaduta";
      case "payment_failed":
        return "Pagamento non riuscito";
      case "payment_review_required":
        return "Pagamento da verificare";
      default:
        return "Registrazione precedente";
    }
  }

  static boolean withinWeek(String value, String today) {
    try {
      java.time.LocalDate date = java.time.LocalDate.parse(value),
          start = java.time.LocalDate.parse(today);
      return !date.isBefore(start) && date.isBefore(start.plusDays(7));
    } catch (Exception e) {
      return false;
    }
  }

  static boolean matches(
      String filter,
      String status,
      boolean block,
      String start,
      String end,
      String today,
      long balance) {
    boolean active = active(status);
    switch (filter) {
      case "upcoming":
        return active && !block && start.compareTo(today) >= 0;
      case "inhouse":
        return status.equals("confirmed")
            && !block
            && start.compareTo(today) <= 0
            && end.compareTo(today) > 0;
      case "dues":
        return active && !block && balance > 0;
      case "blocks":
        return active && block;
      case "history":
        return !active || end.compareTo(today) <= 0;
      default:
        return true;
    }
  }

  static int cents(String value) {
    String s = value.trim().replace(" ", "");
    if (s.contains(",")) s = s.replace(".", "").replace(',', '.');
    if (!s.matches("\\d+(\\.\\d{1,2})?")) throw new IllegalArgumentException("Importo non valido");
    int n = new BigDecimal(s).movePointRight(2).intValueExact();
    if (n > 10000000) throw new IllegalArgumentException("Importo fuori limite");
    return n;
  }
}
