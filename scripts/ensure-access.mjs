// Pasang / perbarui Cloudflare Access di depan panel admin: hanya email di ADMIN_EMAILS yang boleh membuka.
// Login lewat kode sekali pakai (One-time PIN) yang dikirim ke email tersebut. Dijalankan workflow sebelum deploy.
// Butuh token dengan izin "Access: Apps and Policies — Edit" dan Zero Trust sudah aktif (paket Free cukup).
const TOKEN = process.env.CLOUDFLARE_API_TOKEN, ACC = process.env.CLOUDFLARE_ACCOUNT_ID;
const DOMAIN = process.env.ADMIN_DOMAIN || "admin.iranza.com";
const EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
if (!EMAILS.length) { console.log("::error::ADMIN_EMAILS kosong"); process.exit(1); }

const cf = async (method, path, body) => {
  const r = await fetch("https://api.cloudflare.com/client/v4/accounts/" + ACC + path, {
    method, headers: { authorization: "Bearer " + TOKEN, "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.success) throw new Error(method + " " + path + " → " + r.status + " " + JSON.stringify(j.errors || j).slice(0, 400));
  return j.result;
};

const policy = { name: "Hanya pemilik Kakeibo", decision: "allow", include: EMAILS.map((email) => ({ email: { email } })), precedence: 1 };
const app = {
  name: "Kakeibo Admin", domain: DOMAIN, type: "self_hosted", session_duration: "24h",
  app_launcher_visible: false, policies: [policy]
};

try {
  // metode login: kode sekali pakai ke email (One-time PIN). Dibuat kalau belum ada, lalu jadi satu-satunya cara login admin.
  const idps = await cf("GET", "/access/identity_providers?per_page=100");
  let otp = idps.find((x) => x.type === "onetimepin");
  if (!otp) {
    try { otp = await cf("POST", "/access/identity_providers", { name: "Kode email (One-time PIN)", type: "onetimepin", config: {} }); console.log("One-time PIN diaktifkan"); }
    catch (e) {
      console.log("::error::Login One-time PIN belum aktif dan token tidak boleh mengaktifkannya. Aktifkan sekali di dashboard: " +
        "Zero Trust → Integrations/Settings → Identity providers (Authentication → Login methods) → Add new → One-time PIN, lalu jalankan ulang workflow ini.");
      process.exit(1);
    }
  }
  app.allowed_idps = [otp.id];
  app.auto_redirect_to_identity = true; // langsung ke form email, tanpa pilihan "Cloudflare"
  const apps = await cf("GET", "/access/apps?per_page=100");
  const found = apps.find((a) => a.domain === DOMAIN || (a.self_hosted_domains || []).includes(DOMAIN));
  if (found) {
    await cf("PUT", "/access/apps/" + found.id, { ...app, id: found.id });
    console.log("Access diperbarui untuk " + DOMAIN + " → " + EMAILS.join(", "));
  } else {
    await cf("POST", "/access/apps", app);
    console.log("Access dibuat untuk " + DOMAIN + " → " + EMAILS.join(", "));
  }
} catch (e) {
  console.log("::error::Gagal memasang Cloudflare Access: " + e.message);
  console.log("Pastikan Zero Trust sudah aktif (dash → Zero Trust, pilih paket Free) dan token punya izin Access: Apps and Policies — Edit.");
  process.exit(1);
}
