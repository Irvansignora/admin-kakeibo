# Kakeibo Admin — panduan kerja untuk Claude

Panel admin untuk app Kakeibo (repo utama: `Irvansignora/apps-money-management`, lihat `CLAUDE.md` di sana).
**Perbarui file ini di commit yang sama** kalau struktur atau alur deploy berubah.

- `public/index.html` adalah SPA admin satu file. Tab: Statistik, Permintaan, Pengguna, Lowongan, Materi.
  Memanggil API `https://chat.iranza.com/api/admin/*` dengan header `x-admin-key` (disimpan di sessionStorage).
- Dihosting di Worker `kakeibo-admin` (Static Assets) di domain **admin.iranza.com** (`wrangler.jsonc`).
- Dilindungi **Cloudflare Access**: hanya `irvansignora@gmail.com`, login lewat kode email (One-time PIN).
  `scripts/ensure-access.mjs` membuat/memperbarui aplikasi Access saat deploy. Jangan longgarkan aksesnya.
- Push ke `main` → `.github/workflows/deploy.yml` deploy otomatis (secrets repo: `CLOUDFLARE_API_TOKEN`,
  `CLOUDFLARE_ACCOUNT_ID`). GitHub Pages sudah dimatikan; `index.html` di root hanya redirect lama.
- Endpoint admin baru dibuat di backend repo utama (`apps/api/src`), lalu UI-nya di sini.
- Teks admin cukup bahasa Indonesia. Jangan minta token di chat; jangan tulis nama/ID model AI di commit.
