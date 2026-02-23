# Panduan Installasi di Proxmox dengan Auto-Deploy dari GitHub

Panduan ini akan membantu Anda men-deploy aplikasi `school_inventory` ke server Proxmox dan mengaturnya agar otomatis terupdate setiap kali Anda melakukan push ke GitHub.

## 📋 Persiapan (Requirements)

1.  **Server Proxmox** yang sudah berjalan.
2.  **Repository GitHub**: Pastikan kode program Anda sudah ada di GitHub (Private atau Public).
3.  **Koneksi Internet**: Server Proxmox butuh internet untuk install paket.

---

## 🚀 Langkah 1: Buat Container (LXC) di Proxmox

Cara paling efisien (hemat RAM/CPU) di Proxmox adalah menggunakan **LXC Container**, bukan VM penuh.

1.  Masuk ke Proxmox Web UI.
2.  Klik **"Create CT"** (pojok kanan atas).
3.  **General**: Isi Hostname (misal: `school-app`) dan Password.
4.  **Template**: Pilih template **Ubuntu 22.04** or **Debian 12** (Download dulu di menu managed storage -> CT Templates jika belum ada).
5.  **Disks**: 8GB - 16GB sudah cukup.
6.  **CPU/Memory**: 1 Core, 512MB - 1GB RAM cukup untuk Next.js kecil (tambah jika traffic tinggi).
7.  **Network**: Set IP Static (misal: `192.168.1.100/24`) dan Gateway.
8.  **Confirm** & **Start**.

---

## 🛠️ Langkah 2: Setup Environment di Server (Console)

Buka **Console** container tersebut di Proxmox, login sebagai `root`.

### 1. Update & Install Tools Dasar
```bash
apt update && apt upgrade -y
apt install -y git curl unzip
```

### 2. Install Node.js (Versi 20 LTS disarankan)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```
Cek instalasi: `node -v` (harus v20.x.x).

### 3. Install PM2 (Process Manager)
PM2 berguna agar aplikasi tetap jalan walau server restart.
```bash
npm install -g pm2
```

### 4. Install Nginx (Web Server)
Nginx berguna sebagai "pintu depan" (Reverse Proxy) agar aplikasi bisa diakses via port 80 (HTTP) tanpa mengetik port 3000.
```bash
apt install -y nginx
```

---

## 📥 Langkah 3: Deploy Manual Pertama Kali

Kita perlu clone repo manual dulu untuk memastikan semuanya jalan.

### 1. Clone Repository
```bash
# Ganti URL ini dengan URL repo GitHub Anda
git clone https://github.com/username/school_inventory.git /var/www/school_inventory
```
*Catatan: Jika repo Private, Anda perlu setup SSH Key atau Personal Access Token.*

### 2. Install Dependency & Build
```bash
cd /var/www/school_inventory

# Install library
npm install

# Setup Database (Generate Prisma Client)
npx prisma generate
npx prisma db push  # Membuat file database sqlite baru (dev.db)
npx prisma db seed  # Mengisi data awal (admin user, locations, dll)

# Build aplikasi Next.js
npm run build
```

### 3. Jalankan dengan PM2
```bash
pm2 start npm --name "school-inventory" -- start
pm2 save
pm2 startup
# (Copy paste command yang muncul dari pm2 startup jika diminta)
```
Sekarang aplikasi jalan di `http://IP-SERVER:3000`. Coba akses dari browser.

---

## 🌐 Langkah 4: Setup Nginx (Opsional tapi Disarankan)

Agar bisa diakses tanpa port `:3000`.

1.  Buat config baru:
    ```bash
    nano /etc/nginx/sites-available/school_inventory
    ```
2.  Isi dengan konfigurasi ini:
    ```nginx
    server {
        listen 80;
        server_name IP_SERVER_ANDA; # Atau domain jika ada (misal: inventory.sekolah.sch.id)

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
3.  Aktifkan config:
    ```bash
    ln -s /etc/nginx/sites-available/school_inventory /etc/nginx/sites-enabled/
    rm /etc/nginx/sites-enabled/default  # Hapus default nginx
    nginx -t # Cek error
    systemctl restart nginx
    ```
Sekarang akses `http://IP-SERVER_ANDA` (tanpa port) harusnya sudah muncul.

---

## 🔄 Langkah 5: Setup Auto-Update (GitHub Actions)

Agar saat Anda push ke GitHub, server otomatis update. Kita akan pakai **GitHub Self-Hosted Runner**. Ini cara paling mudah karena Runner-nya jalan di server Anda sendiri, jadi tidak perlu setting SSH key yang ribet di GitHub.

### 1. Buat Runner di GitHub
1.  Buka Repo GitHub Anda -> **Settings** -> **Actions** -> **Runners**.
2.  Klik **New self-hosted runner**.
3.  Pilih **Linux**.
4.  Ikuti instruksi "Download" dan "Configure" yang muncul di layar GitHub **DI TERMINAL SERVER ANDA**.
    *   Biasanya buat user baru dulu (karena runner tidak boleh jalan sebagai root).
    ```bash
    adduser runner
    usermod -aG sudo runner
    su - runner
    # ... Lalu jalankan command dari GitHub ...
    ```
5.  Saat diminta setup service, jalankan `./svc.sh install` dan `./svc.sh start` agar runner jalan di background.

### 2. Buat File Workflow di Kode Anda
Di laptop Anda (VS Code), buat file baru: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Proxmox

on:
  push:
    branches: ["main"]  # Atau "master" sesuai branch utama Anda

jobs:
  deploy:
    runs-on: self-hosted  # Ini akan jalan di server Proxmox Anda!
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install Dependencies
        run: npm ci

      - name: Generate Prisma
        run: npx prisma generate

      - name: Build
        run: npm run build

      - name: Restart PM2
        run: |
          pm2 restart school-inventory
```
*Catatan: Pastikan user `runner` punya akses ke `pm2`. Jika error permission, Anda mungkin perlu mengatur permission folder atau menjalankan runner sebagai user yang sama dengan pemilik aplikasi.*

### Alternatif Mudah (Tanpa CI/CD rumit)
Jika Self-Hosted runner terlalu rumit, Anda bisa update manual cukup dengan 3 perintah ini di server terminal:
```bash
cd /var/www/school_inventory
git pull
npm install && npm run build
pm2 restart school-inventory
```
Anda bisa membuat script sederhana `update.sh` untuk menjalankan 3 baris di atas.

## ⚠️ Catatan Penting Data (SQLite)
Aplikasi ini menggunakan **SQLite** (`dev.db`).
*   Database ini berbentuk file di dalam folder aplikasi.
*   **JANGAN** menghapus folder `/var/www/school_inventory` saat update, cukup `git pull`.
*   Jika Anda menggunakan Docker atau cara deploy yang "menghapus container lalu buat baru", data anda akan **HILANG**.
*   Untuk production yang serius, disarankan ganti SQLite ke **PostgreSQL** atau **MySQL** (bisa install di container LXC yang sama atau terpisah).
