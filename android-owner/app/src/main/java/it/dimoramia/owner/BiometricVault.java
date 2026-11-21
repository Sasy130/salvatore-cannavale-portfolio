package it.dimoramia.owner;

import android.app.Activity;
import android.content.*;
import android.hardware.biometrics.*;
import android.hardware.fingerprint.FingerprintManager;
import android.os.*;
import android.security.keystore.*;
import android.util.Base64;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.util.concurrent.atomic.AtomicBoolean;
import javax.crypto.*;
import javax.crypto.spec.GCMParameterSpec;

final class BiometricVault {
  private static final String ALIAS = "dimora-biometric-v1";
  private final Context context;

  BiometricVault(Context c) {
    context = c.getApplicationContext();
  }

  private SharedPreferences prefs() {
    return context.getSharedPreferences("biometric", 0);
  }

  boolean enabled() {
    return !prefs().getString("vault", "").isEmpty() && !id().isEmpty();
  }

  String id() {
    return prefs().getString("id", "");
  }

  static boolean available(Context c) {
    try {
      if (Build.VERSION.SDK_INT >= 30) {
        BiometricManager m = c.getSystemService(BiometricManager.class);
        return m != null
            && m.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG)
                == BiometricManager.BIOMETRIC_SUCCESS;
      }
      if (Build.VERSION.SDK_INT >= 28) {
        FingerprintManager m = c.getSystemService(FingerprintManager.class);
        return m != null && m.isHardwareDetected() && m.hasEnrolledFingerprints();
      }
    } catch (Exception ignored) {
    }
    return false;
  }

  Cipher encryption() throws Exception {
    KeyStore store = KeyStore.getInstance("AndroidKeyStore");
    store.load(null);
    if (store.containsAlias(ALIAS)) store.deleteEntry(ALIAS);
    KeyGenParameterSpec.Builder spec =
        new KeyGenParameterSpec.Builder(
                ALIAS, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setUserAuthenticationRequired(true)
            .setInvalidatedByBiometricEnrollment(true);
    if (Build.VERSION.SDK_INT >= 30)
      spec.setUserAuthenticationParameters(0, KeyProperties.AUTH_BIOMETRIC_STRONG);
    else spec.setUserAuthenticationValidityDurationSeconds(-1);
    KeyGenerator generator =
        KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
    generator.init(spec.build());
    SecretKey key = generator.generateKey();
    Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
    cipher.init(Cipher.ENCRYPT_MODE, key);
    return cipher;
  }

  Cipher decryption() throws Exception {
    KeyStore store = KeyStore.getInstance("AndroidKeyStore");
    store.load(null);
    if (!store.containsAlias(ALIAS))
      throw new IllegalStateException("Credenziale biometrica non disponibile");
    String[] parts = prefs().getString("vault", "").split(":", 2);
    if (parts.length != 2)
      throw new IllegalStateException("Credenziale biometrica non disponibile");
    Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
    cipher.init(
        Cipher.DECRYPT_MODE,
        (SecretKey) store.getKey(ALIAS, null),
        new GCMParameterSpec(128, Base64.decode(parts[0], 0)));
    return cipher;
  }

  void store(String id, String credential, Cipher authorized) throws Exception {
    String value =
        Base64.encodeToString(authorized.getIV(), Base64.NO_WRAP)
            + ":"
            + Base64.encodeToString(
                authorized.doFinal(credential.getBytes(StandardCharsets.UTF_8)), Base64.NO_WRAP);
    prefs().edit().putString("id", id).putString("vault", value).apply();
  }

  String unlock(Cipher authorized) throws Exception {
    String[] parts = prefs().getString("vault", "").split(":", 2);
    return new String(authorized.doFinal(Base64.decode(parts[1], 0)), StandardCharsets.UTF_8);
  }

  void clear() {
    prefs().edit().clear().apply();
    try {
      KeyStore store = KeyStore.getInstance("AndroidKeyStore");
      store.load(null);
      if (store.containsAlias(ALIAS)) store.deleteEntry(ALIAS);
    } catch (Exception ignored) {
    }
  }

  interface Success {
    void accept(Cipher cipher);
  }

  static CancellationSignal prompt(
      Activity activity,
      Cipher cipher,
      String title,
      String negative,
      Success success,
      Runnable cancel,
      java.util.function.Consumer<String> error) {
    if (Build.VERSION.SDK_INT < 28) {
      error.accept("L’accesso con impronta richiede Android 9 o successivo.");
      return null;
    }
    AtomicBoolean completed = new AtomicBoolean();
    CancellationSignal signal = new CancellationSignal();
    BiometricPrompt.Builder builder =
        new BiometricPrompt.Builder(activity)
            .setTitle(title)
            .setSubtitle("DIMORA MIA · gestione privata")
            .setNegativeButton(
                negative,
                activity.getMainExecutor(),
                (dialog, which) -> {
                  if (completed.compareAndSet(false, true)) cancel.run();
                });
    if (Build.VERSION.SDK_INT >= 30)
      builder.setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG);
    builder
        .build()
        .authenticate(
            new BiometricPrompt.CryptoObject(cipher),
            signal,
            activity.getMainExecutor(),
            new BiometricPrompt.AuthenticationCallback() {
              @Override
              public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult result) {
                if (!completed.compareAndSet(false, true)) return;
                Cipher authorized =
                    result.getCryptoObject() == null ? null : result.getCryptoObject().getCipher();
                if (authorized == null) error.accept("Sblocco non completato. Usa la password.");
                else success.accept(authorized);
              }

              @Override
              public void onAuthenticationError(int code, CharSequence message) {
                if (completed.compareAndSet(false, true))
                  error.accept(
                      message == null
                          ? "Sblocco non completato. Usa la password."
                          : message.toString());
              }
            });
    return signal;
  }
}
