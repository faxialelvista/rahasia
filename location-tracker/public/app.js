async function getBattery() {
  try {
    if (!navigator.getBattery) return null;
    const battery = await navigator.getBattery();
    return Math.round(battery.level * 100);
  } catch { return null; }
}

function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Edg")) return "Microsoft Edge";
  if (ua.includes("Chrome")) return "Google Chrome";
  if (ua.includes("Firefox")) return "Mozilla Firefox";
  if (ua.includes("Safari")) return "Safari";
  return "Unknown";
}

async function requestLocation() {
  const status = document.getElementById("status");

  if (!navigator.geolocation) {
    status.textContent = "Browser tidak mendukung lokasi.";
    return;
  }

  status.textContent = "Meminta izin lokasi...";

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const data = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        battery: await getBattery(),
        platform: navigator.platform,
        browser: getBrowser()
      };

      try {
        const response = await fetch("/api/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        const result = await response.json();
        status.textContent = result.success
          ? "Lokasi berhasil dikirim."
          : "Gagal mengirim lokasi.";
      } catch {
        status.textContent = "Gagal mengirim data.";
      }
    },
    (error) => {
      if (error.code === 1) status.textContent = "Lokasi tidak diizinkan.";
      else if (error.code === 2) status.textContent = "Lokasi tidak tersedia.";
      else status.textContent = "Gagal mendapatkan lokasi.";
    }
  );
}