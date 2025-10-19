# Manual Book - Marketplace Jejak Rempah Nusantara

## Daftar Isi

1. [Pengenalan Aplikasi](#pengenalan-aplikasi)
2. [Peran Pengguna](#peran-pengguna)
3. [Cara Beralih Antara Peran Pembeli dan Penjual](#cara-beralih-antara-peran-pembeli-dan-penjual)
4. [Alur Pengguna User (Sebagai Pembeli)](#alur-pengguna-user-sebagai-pembeli)
5. [Alur Pengguna User (Sebagai Penjual)](#alur-pengguna-user-sebagai-penjual)
6. [Alur Pengguna Admin](#alur-pengguna-admin)
7. [Fitur-Fitur Utama](#fitur-fitur-utama)
8. [Panduan Screenshot](#panduan-screenshot)

---

## Pengenalan Aplikasi

**Marketplace Jejak Rempah Nusantara** adalah platform e-commerce yang menghubungkan pembeli dan penjual produk rempah-rempah tradisional Indonesia. Aplikasi ini memungkinkan pengguna untuk:

- **Membeli produk** rempah-rempah dari berbagai toko
- **Menjual produk** melalui toko online mereka sendiri
- **Berperan ganda** sebagai pembeli dan penjual dalam satu akun
- **Mengelola transaksi** dengan sistem pembayaran terintegrasi
- **Memonitor statistik** penjualan dan pembelian

### Teknologi yang Digunakan

- **Frontend**: Next.js 14 dengan TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL dengan Drizzle ORM
- **Authentication**: Better Auth
- **Payment**: Midtrans
- **Image Upload**: Cloudinary
- **UI Components**: shadcn/ui

---

## Peran Pengguna

Aplikasi memiliki 2 peran pengguna utama:

### 1. **User (Pengguna)**

Pengguna dapat berperan ganda dalam satu akun:

- **Sebagai Pembeli**: Dapat membeli produk dari berbagai toko
  - Menambahkan produk ke keranjang
  - Melakukan checkout dan pembayaran
  - Melacak status pesanan
- **Sebagai Penjual**: Dapat menjual produk melalui toko online
  - Membuat dan mengelola toko
  - Mengelola produk dan stok
  - Memproses pesanan dari pembeli
  - Melihat statistik penjualan

**Catatan**: Pengguna dapat beralih antara peran pembeli dan penjual kapan saja melalui navigasi menu yang tersedia.

### 2. **Admin (Super Admin)**

- Mengelola seluruh sistem
- Mengatur pengguna dan peran
- Mengkonfigurasi biaya layanan
- Memonitor aktivitas sistem

---

## Cara Beralih Antara Peran Pembeli dan Penjual

Sebagai User, Anda dapat dengan mudah beralih antara peran pembeli dan penjual:

### **Sebagai Pembeli**

- Akses halaman utama untuk melihat produk
- Gunakan menu "Products" untuk menjelajahi produk
- Gunakan keranjang untuk membeli produk
- Akses "Orders" untuk melihat pesanan yang dibeli

### **Sebagai Penjual**

- Akses "Seller Dashboard" untuk mengelola toko
- Gunakan menu "Seller" untuk mengelola produk dan pesanan
- Akses "Create Store" jika belum memiliki toko
- Monitor statistik penjualan di dashboard

### **Navigasi Menu**

- **Header Navigation**: Berisi menu umum (Products, Stores, Cart)
- **User Menu**: Dropdown dengan opsi untuk beralih ke Seller Dashboard
- **Seller Menu**: Menu khusus untuk mengelola toko dan produk

**Screenshot yang diperlukan:**

- Header navigation dengan menu umum
- User menu dropdown dengan opsi Seller Dashboard
- Seller menu navigation
- Peralihan dari pembeli ke penjual

---

## Alur Pengguna User (Sebagai Pembeli)

### 1. **Registrasi dan Login**

**Langkah-langkah:**

1. Buka aplikasi di browser
2. Klik tombol "Login" di header
3. Pilih "Continue with Google"
4. Masuk dengan akun Google
5. Otomatis redirect ke halaman utama

**Screenshot yang diperlukan:**

- Halaman login dengan tombol Google
- Proses login Google
- Halaman utama setelah login

### 2. **Menjelajahi Produk**

**Langkah-langkah:**

1. Di halaman utama, scroll ke bagian "Produk Terbaru"
2. Klik "Lihat Semua" untuk melihat semua produk
3. Gunakan fitur pencarian untuk mencari produk tertentu
4. Gunakan filter harga untuk menyaring produk
5. Sortir produk berdasarkan nama, harga, atau tanggal

**Screenshot yang diperlukan:**

- Halaman utama dengan produk terbaru
- Halaman semua produk dengan filter
- Hasil pencarian produk

### 3. **Menambahkan Produk ke Keranjang**

**Langkah-langkah:**

1. Klik pada produk yang diinginkan
2. Di halaman detail produk, klik tombol "Add to Cart"
3. Produk akan ditambahkan ke keranjang
4. Klik ikon keranjang di header untuk melihat isi keranjang
5. Atur jumlah produk di keranjang jika diperlukan

**Screenshot yang diperlukan:**

- Halaman detail produk
- Tombol "Add to Cart"
- Keranjang dengan produk

### 4. **Checkout dan Pembayaran**

**Langkah-langkah:**

1. Dari keranjang, klik "Checkout"
2. Pilih atau tambahkan alamat pengiriman
3. Pilih metode pembayaran (Pay Now atau Pay Later)
4. Tambahkan catatan pesanan (opsional)
5. Klik "Place Order"
6. Jika Pay Now, akan redirect ke Midtrans untuk pembayaran
7. Jika Pay Later, pesanan akan dibuat dengan status pending

**Screenshot yang diperlukan:**

- Halaman checkout dengan form alamat
- Pilihan metode pembayaran
- Ringkasan pesanan
- Halaman pembayaran Midtrans (Pay Now)
- Konfirmasi pesanan

### 5. **Melacak Pesanan**

**Langkah-langkah:**

1. Klik menu "Orders" di header
2. Lihat daftar semua pesanan
3. Filter pesanan berdasarkan status
4. Klik "View Details" untuk melihat detail pesanan
5. Untuk pesanan pending, klik "Pay Now" untuk melanjutkan pembayaran
6. Untuk pesanan completed, klik "Reorder" untuk memesan ulang

**Screenshot yang diperlukan:**

- Halaman daftar pesanan
- Filter status pesanan
- Detail pesanan
- Tombol pembayaran dan reorder

---

## Alur Pengguna User (Sebagai Penjual)

### 1. **Membuat Toko**

**Langkah-langkah:**

1. Login sebagai pengguna
2. Klik "Become a Seller" atau akses `/seller-new`
3. Isi form pembuatan toko:
   - Nama toko
   - URL toko (slug)
   - Titik simpul terdekat
   - Deskripsi toko
   - Logo toko (opsional)
4. Klik "Buat Toko"
5. Redirect ke dashboard seller

**Screenshot yang diperlukan:**

- Halaman pembuatan toko
- Form isian toko
- Konfirmasi toko berhasil dibuat

### 2. **Dashboard Seller**

**Langkah-langkah:**

1. Setelah membuat toko, akan masuk ke dashboard
2. Lihat statistik toko:
   - Total produk
   - Total orderan
   - Total pendapatan
   - Pesanan terbaru
3. Gunakan aksi cepat untuk navigasi
4. Lihat informasi toko

**Screenshot yang diperlukan:**

- Dashboard seller dengan statistik
- Card statistik (produk, orderan, pendapatan)
- Aksi cepat dan informasi toko

### 3. **Menambahkan Produk**

**Langkah-langkah:**

1. Dari dashboard, klik "Tambah Produk"
2. Isi form produk:
   - Nama produk
   - URL produk (slug)
   - Deskripsi produk
   - Harga produk
   - Stok produk
   - Gambar produk (opsional)
   - Status produk (aktif/tidak aktif)
3. Lihat preview pendapatan setelah biaya layanan
4. Klik "Buat Produk"

**Screenshot yang diperlukan:**

- Halaman tambah produk
- Form isian produk
- Preview pendapatan dengan biaya layanan
- Konfirmasi produk berhasil dibuat

### 4. **Mengelola Produk**

**Langkah-langkah:**

1. Dari dashboard, klik "Manage Produk"
2. Lihat daftar semua produk
3. Edit produk yang ada
4. Ubah status produk (aktif/tidak aktif)
5. Hapus produk jika diperlukan

**Screenshot yang diperlukan:**

- Halaman daftar produk seller
- Form edit produk
- Tombol ubah status produk

### 5. **Mengelola Pesanan**

**Langkah-langkah:**

1. Dari dashboard, klik "Lihat Orderan"
2. Lihat daftar pesanan dari pembeli
3. Filter pesanan berdasarkan status
4. Klik detail pesanan untuk melihat informasi lengkap
5. Update status pesanan sesuai dengan proses pengiriman

**Screenshot yang diperlukan:**

- Halaman daftar pesanan seller
- Detail pesanan dari pembeli
- Form update status pesanan

---

## Alur Pengguna Admin

### 1. **Dashboard Admin**

**Langkah-langkah:**

1. Login dengan akun admin
2. Akses `/admin/dashboard`
3. Lihat statistik sistem:
   - Total users
   - Admin users
   - Regular users
   - Service fee percentage
4. Gunakan quick actions untuk navigasi

**Screenshot yang diperlukan:**

- Dashboard admin dengan statistik
- Card statistik sistem
- Quick actions admin

### 2. **Mengelola Pengguna**

**Langkah-langkah:**

1. Dari dashboard admin, klik "Manage Users"
2. Lihat daftar semua pengguna
3. Filter pengguna berdasarkan peran
4. Ubah peran pengguna (user/admin)
5. Ban/unban pengguna jika diperlukan

**Screenshot yang diperlukan:**

- Halaman daftar pengguna
- Form ubah peran pengguna
- Tombol ban/unban pengguna

### 3. **Mengkonfigurasi Biaya Layanan**

**Langkah-langkah:**

1. Dari dashboard admin, klik "Configure Service Fee"
2. Lihat biaya layanan saat ini
3. Ubah persentase biaya layanan
4. Simpan perubahan
5. Biaya baru akan berlaku untuk transaksi selanjutnya

**Screenshot yang diperlukan:**

- Halaman konfigurasi biaya layanan
- Form ubah persentase biaya
- Konfirmasi perubahan biaya

---

## Fitur-Fitur Utama

### 1. **Sistem Keranjang**

- Menambahkan produk ke keranjang
- Mengatur jumlah produk
- Menghitung total harga
- Menyimpan keranjang antar sesi

### 2. **Sistem Pembayaran**

- Integrasi dengan Midtrans
- Pilihan Pay Now dan Pay Later
- Webhook untuk update status pembayaran
- Tracking transaksi

### 3. **Sistem Alamat**

- Menyimpan multiple alamat
- Set alamat default
- Validasi alamat pengiriman

### 4. **Upload Gambar**

- Upload gambar produk dan logo toko
- Integrasi dengan Cloudinary
- Validasi ukuran dan format file

### 5. **Sistem Notifikasi**

- Toast notifications untuk feedback
- Real-time updates untuk status pesanan

### 6. **Responsive Design**

- Optimized untuk desktop dan mobile
- Adaptive layout untuk berbagai ukuran layar

---

## Panduan Screenshot

Untuk membuat dokumentasi visual yang lengkap, berikut adalah daftar screenshot yang perlu diambil:

### **Halaman Umum**

1. **Landing Page**

   - Hero section dengan logo
   - Produk terbaru
   - Produk terpopuler
   - Toko terbaru
   - About section

2. **Header Navigation**

   - Logo dan menu navigasi
   - Search bar
   - Cart icon dengan badge
   - User menu dropdown
   - Seller menu navigation

3. **Footer**
   - Links dan informasi kontak

### **Navigasi Peran Ganda**

1. **User Menu Dropdown**

   - Profile user
   - Opsi untuk beralih ke Seller Dashboard
   - Logout option

2. **Seller Menu Navigation**

   - Seller dashboard access
   - Product management
   - Order management
   - Store settings

3. **Role Switching**
   - Peralihan dari pembeli ke penjual
   - Peralihan dari penjual ke pembeli
   - Indikator peran aktif

### **Halaman User (Sebagai Pembeli)**

1. **Authentication**

   - Login page dengan Google button
   - Loading state saat login

2. **Product Browsing**

   - Product listing page
   - Search results
   - Filter sidebar
   - Product card component

3. **Product Detail**

   - Product information
   - Add to cart button
   - Product images

4. **Cart & Checkout**

   - Cart page dengan items
   - Checkout form
   - Address selection
   - Payment method selection
   - Order summary

5. **Orders**
   - Orders list page
   - Order status filters
   - Order detail page
   - Payment button
   - Reorder button

### **Halaman User (Sebagai Penjual)**

1. **Store Creation**

   - Store creation form
   - Area selection
   - Image upload

2. **Seller Dashboard**

   - Statistics cards
   - Quick actions
   - Store information
   - Revenue toggle

3. **Product Management**

   - Product list
   - Add product form
   - Edit product form
   - Product status toggle

4. **Order Management**
   - Seller orders list
   - Order detail view
   - Status update form

### **Halaman Admin**

1. **Admin Dashboard**

   - System statistics
   - User management access
   - Service fee configuration

2. **User Management**

   - Users list
   - Role change form
   - Ban/unban actions

3. **Settings**
   - Service fee configuration
   - System settings

### **Komponen UI**

1. **Forms**

   - Input fields
   - Select dropdowns
   - Radio buttons
   - Checkboxes
   - Textarea

2. **Buttons**

   - Primary buttons
   - Secondary buttons
   - Outline buttons
   - Ghost buttons
   - Loading states

3. **Cards**

   - Product cards
   - Order cards
   - Statistics cards

4. **Modals & Dialogs**

   - Address dialog
   - Confirmation dialogs
   - Image upload modal

5. **Notifications**
   - Success toasts
   - Error toasts
   - Info toasts

### **Responsive Views**

1. **Mobile Layout**

   - Mobile navigation
   - Mobile product cards
   - Mobile forms

2. **Tablet Layout**

   - Tablet grid layouts
   - Tablet navigation

3. **Desktop Layout**
   - Desktop grid layouts
   - Desktop navigation
   - Desktop forms

### **Loading States**

1. **Skeleton Loaders**

   - Product card skeletons
   - Form skeletons
   - List skeletons

2. **Spinner Loaders**
   - Button loading states
   - Page loading states

### **Error States**

1. **Error Pages**

   - 404 page
   - Error boundaries
   - Network error states

2. **Form Errors**
   - Validation errors
   - Server errors

---

## Tips untuk Screenshot

1. **Gunakan resolusi tinggi** untuk kualitas gambar yang baik
2. **Ambil screenshot dalam berbagai ukuran layar** (mobile, tablet, desktop)
3. **Sertakan loading states** untuk menunjukkan UX yang baik
4. **Ambil screenshot error states** untuk dokumentasi troubleshooting
5. **Gunakan data real** atau data yang realistis untuk demo
6. **Sertakan tooltips dan hover states** jika ada
7. **Ambil screenshot dalam mode light dan dark** jika aplikasi mendukung dark mode
8. **Sertakan screenshot peralihan peran** untuk menunjukkan fleksibilitas aplikasi
9. **Ambil screenshot dari perspektif yang berbeda** (pembeli vs penjual)
10. **Sertakan indikator peran aktif** dalam setiap screenshot

---

_Manual book ini akan membantu pengguna memahami cara menggunakan aplikasi Marketplace Jejak Rempah Nusantara secara lengkap. Dengan struktur peran ganda yang fleksibel, pengguna dapat dengan mudah beralih antara peran pembeli dan penjual dalam satu akun. Dokumentasi visual dengan screenshot akan membuat panduan ini lebih mudah dipahami dan diikuti._

_Manual book ini akan membantu pengguna memahami cara menggunakan aplikasi Marketplace Jejak Rempah Nusantara secara lengkap. Dokumentasi visual dengan screenshot akan membuat panduan ini lebih mudah dipahami dan diikuti._
