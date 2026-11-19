import webpush from "web-push";
import { randomBytes } from "node:crypto";
import { writeFile, realpath } from "node:fs/promises";
import { resolve, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";
const target = process.argv[2];
if (!target)
  throw Error(
    "Indica un file privato fuori dal repository: node scripts/casa-mia/push-keys.mjs /percorso/privato/casa-mia-push.env",
  );
const root = await realpath(fileURLToPath(new URL("../../", import.meta.url)));
const destination = resolve(
  await realpath(dirname(resolve(target))),
  resolve(target).split(sep).at(-1),
);
if (destination.startsWith(root + sep))
  throw Error(
    "Per proteggere la chiave privata scegli un file fuori dal repository.",
  );
const { publicKey, privateKey } = webpush.generateVAPIDKeys();
await writeFile(
  destination,
  `CASA_MIA_PUSH_PUBLIC_KEY=${publicKey}\nCASA_MIA_PUSH_PRIVATE_KEY=${privateKey}\nCASA_MIA_PUSH_SUBJECT=mailto:DA-CONFIGURARE\nCASA_MIA_PUSH_JOB_SECRET=${randomBytes(32).toString("base64url")}\n`,
  { mode: 0o600, flag: "wx" },
);
console.log(
  "Chiavi scritte nel file privato indicato. Nessuna chiave mostrata in console. Imposta il contatto e configura i segreti sul server.",
);
