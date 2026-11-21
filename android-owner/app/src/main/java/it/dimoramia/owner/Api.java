package it.dimoramia.owner;

import android.content.Context;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;

final class Api {
  static final String ORIGIN = "https://www.salvatorecannavale.it";
  private final SessionStore session;

  Api(Context c) {
    session = new SessionStore(c);
  }

  static class Failure extends Exception {
    final int status;

    Failure(int s, String message) {
      super(message);
      status = s;
    }
  }

  JSONObject call(String path, JSONObject body) throws Exception {
    if (!path.matches("[a-zA-Z0-9/_?=&%.-]+")) throw new Failure(400, "Percorso non valido.");
    HttpURLConnection c =
        (HttpURLConnection) new URL(ORIGIN + "/api/casa-mia/" + path).openConnection();
    c.setConnectTimeout(12000);
    c.setReadTimeout(20000);
    c.setInstanceFollowRedirects(false);
    c.setRequestProperty("Accept", "application/json");
    c.setRequestProperty("Cache-Control", "no-store");
    String token = session.get();
    if (!token.isEmpty()) c.setRequestProperty("Cookie", token);
    c.setRequestProperty("Origin", ORIGIN);
    c.setRequestMethod(body == null ? "GET" : "POST");
    try {
      if (body != null) {
        c.setDoOutput(true);
        c.setRequestProperty("Content-Type", "application/json");
        try (OutputStream out = c.getOutputStream()) {
          out.write(body.toString().getBytes(StandardCharsets.UTF_8));
        }
      }
      int status = c.getResponseCode();
      StringBuilder text = new StringBuilder();
      InputStream stream = status >= 400 ? c.getErrorStream() : c.getInputStream();
      if (stream != null)
        try (Reader r = new InputStreamReader(stream, StandardCharsets.UTF_8)) {
          char[] b = new char[4096];
          int n;
          while ((n = r.read(b)) != -1) {
            text.append(b, 0, n);
            if (text.length() > 5000000) throw new Failure(502, "Risposta troppo grande.");
          }
        }
      JSONObject result;
      try {
        result = new JSONObject(text.toString());
      } catch (Exception e) {
        throw new Failure(status, "Il servizio non risponde. Riprova tra poco.");
      }
      if (status < 200 || status >= 300)
        throw new Failure(status, result.optString("error", "Operazione non riuscita."));
      String setCookie = c.getHeaderField("Set-Cookie");
      if (setCookie != null && setCookie.startsWith("casa_mia_owner=")) {
        String cookie = setCookie.split(";", 2)[0];
        if (cookie.equals("casa_mia_owner=")) session.clear();
        else session.save(cookie);
      }
      return result;
    } finally {
      c.disconnect();
    }
  }
}
