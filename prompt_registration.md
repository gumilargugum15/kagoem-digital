# TASK: Implementasi Account Registration Kagoem Digital

Saya sedang mengembangkan website **Kagoem Digital**.

Kagoem Digital nantinya akan menjadi platform untuk menjual:

1. SaaS / aplikasi berlangganan
   - Contoh: POS Kasir Rp5.000/bulan
2. Source code
3. Ebook
4. UI Template
5. Produk digital lainnya

Saat ini Kagoem Digital **belum memiliki fitur registrasi dan authentication user**.

Tugas kamu adalah mengimplementasikan **Account & Authentication System** sebagai fondasi utama Kagoem Digital.

---

## PENTING

Sebelum menulis atau mengubah kode:

1. Analisis seluruh struktur project terlebih dahulu.
2. Identifikasi framework frontend dan backend.
3. Identifikasi database.
4. Identifikasi struktur folder.
5. Periksa apakah sudah ada:
   - users table
   - User model
   - authentication
   - login
   - middleware
   - API authentication
   - session/token
   - layout
   - UI component
   - form component
   - validation
6. Gunakan architecture dan coding convention yang sudah digunakan project.
7. Jangan membuat ulang project.
8. Jangan membuat authentication system kedua jika sudah ada sebagian implementation.
9. Jangan menghapus functionality existing.
10. Jangan melakukan perubahan besar pada architecture tanpa alasan yang jelas.

Setelah melakukan analisis, langsung lanjutkan implementasi.

---

# TUJUAN

Implementasikan fitur:

- Registration
- Login
- Logout
- Email Verification
- Resend Verification Email
- Forgot Password
- Reset Password
- User Profile
- Authentication State
- Protected Routes
- Validation
- Error Handling

Fokus utama saat ini adalah **Account System Kagoem Digital**.

Jangan implementasikan fitur payment gateway, subscription, POS provisioning, source code marketplace, ebook marketplace, atau UI template marketplace pada task ini.

---

# KONSEP ACCOUNT

Kagoem Digital harus memiliki satu sistem akun utama.

Contoh:

User mendaftar:

Name:
Andi

Email:
andi@gmail.com

Password:
********

Maka dibuat:

users

id
name
email
password
email_verified_at
status
created_at
updated_at

Akun tersebut nantinya dapat digunakan untuk:

- membeli subscription POS
- membeli source code
- membeli ebook
- membeli UI template
- membeli produk digital lainnya

Jangan membuat account khusus untuk masing-masing produk.

---

# DATABASE USER

Periksa terlebih dahulu apakah tabel `users` sudah ada.

Jika sudah ada:

- gunakan tabel tersebut
- jangan membuat tabel `users` kedua
- jangan menghapus data existing
- jangan mengubah struktur existing tanpa alasan

Jika memang belum ada, buat migration users yang sesuai dengan architecture project.

Minimal data:

- id
- name
- email
- password
- email_verified_at
- status
- created_at
- updated_at

Sesuaikan dengan struktur project yang sudah ada.

---

# REGISTRATION

Buat halaman:

`/register`

Form:

- Nama
- Email
- Password
- Konfirmasi Password

UI harus mengikuti design system dan style yang sudah digunakan Kagoem Digital.

Jangan membuat design system baru jika project sudah memiliki component UI.

Contoh:

```text
Kagoem Digital

Buat Akun

Nama
[________________________]

Email
[________________________]

Password
[________________________]

Konfirmasi Password
[________________________]

[ DAFTAR SEKARANG ]

Sudah punya akun? Login