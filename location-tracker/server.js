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
app.use(express.static(path.join(__dirname, "public")));

function readLocations() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); }
  catch { return []; }
}

function saveLocations(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.post("/api/location", (req, res) => {
  const { latitude, longitude, accuracy, battery, platform, browser } = req.body;

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return res.status(400).json({ success: false, message: "Koordinat tidak valid" });
  }

  const locations = readLocations();
  const record = {
    id: Date.now(),
    latitude,
    longitude,
    accuracy: accuracy ?? null,
    battery: battery ?? null,
    platform: platform ?? "Unknown",
    browser: browser ?? "Unknown",
    timestamp: new Date().toISOString()
  };

  locations.push(record);
  saveLocations(locations);
  res.json({ success: true, record });
});

app.get("/api/locations", (req, res) => res.json(readLocations()));

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});