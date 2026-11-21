package it.dimoramia.owner;

import android.content.Context;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import java.security.KeyStore;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

final class SessionStore {
  private final Context context;

  SessionStore(Context c) {
    context = c.getApplicationContext();
  }

  private SecretKey key() throws Exception {
    KeyStore store = KeyStore.getInstance("AndroidKeyStore");
    store.load(null);
    if (!store.containsAlias("dimora-session")) {
      KeyGenerator g = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
      g.init(
          new KeyGenParameterSpec.Builder(
                  "dimora-session", KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
              .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
              .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
              .build());
      g.generateKey();
    }
    return (SecretKey) store.getKey("dimora-session", null);
  }

  void save(String cookie) throws Exception {
    Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
    c.init(Cipher.ENCRYPT_MODE, key());
    String v =
        Base64.encodeToString(c.getIV(), Base64.NO_WRAP)
            + ":"
            + Base64.encodeToString(
                c.doFinal(cookie.getBytes(java.nio.charset.StandardCharsets.UTF_8)),
                Base64.NO_WRAP);
    context.getSharedPreferences("secure", 0).edit().putString("session", v).apply();
  }

  String get() {
    try {
      String value = context.getSharedPreferences("secure", 0).getString("session", "");
      if (value.isEmpty()) return "";
      String[] p = value.split(":", 2);
      Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
      c.init(Cipher.DECRYPT_MODE, key(), new GCMParameterSpec(128, Base64.decode(p[0], 0)));
      return new String(c.doFinal(Base64.decode(p[1], 0)), java.nio.charset.StandardCharsets.UTF_8);
    } catch (Exception e) {
      clear();
      return "";
    }
  }

  void clear() {
    context.getSharedPreferences("secure", 0).edit().clear().apply();
  }
}
