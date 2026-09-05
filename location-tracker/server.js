const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "locations.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");

app.use(express.json());
// PENTING: Agar Railway dapat membaca Alamat IP asli pengunjung dengan benar
app.set('trust proxy', true);
app.use(express.static(path.join(__dirname, "public")));

function readLocations() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); }
  catch { return []; }
}

function saveLocations(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Endpoint untuk mencatat kunjungan secara otomatis berdasarkan IP & Perangkat
app.post("/api/visit", (req, res) => {
  const { platform, browser } = req.body;
  
  // Mengambil Alamat IP pengunjung dari header proxy Railway atau koneksi langsung
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const locations = readLocations();
  const record = {
    id: Date.now(),
    ip: ip,
    platform: platform ?? "Unknown",
    browser: browser ?? "Unknown",
    timestamp: new Date().toISOString()
  };

  locations.push(record);
  saveLocations(locations);
  res.json({ success: true, record });
});

app.get("/api/locations", (req, res) => res.json(readLocations()));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server berjalan di port ${PORT}`);
});
