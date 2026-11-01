# Kakeibo Admin

Panel admin Kakeibo (statis, satu halaman) di **https://admin.iranza.com** — Cloudflare Workers + **Cloudflare Access**:
hanya email pemilik yang bisa membuka (kode sekali pakai ke email), lalu tetap perlu `ADMIN_KEY` untuk memanggil API.

- Halaman: `public/index.html` (memanggil `https://chat.iranza.com/api/admin/*`)
- Deploy: push ke `main` → `.github/workflows/deploy.yml` (pasang Access lalu `wrangler deploy`)
- Ganti / tambah email admin: ubah `ADMIN_EMAILS` di workflow (pisahkan dengan koma), lalu push.

Secrets repo yang dibutuhkan: `CLOUDFLARE_API_TOKEN` (izin Workers Scripts/Routes Edit, DNS Edit untuk iranza.com,
**Access: Apps and Policies Edit**) dan `CLOUDFLARE_ACCOUNT_ID`.
