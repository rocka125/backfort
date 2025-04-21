import express from "express";
import cors from "cors";
import pkg from "node-nmap";

const { NmapScan } = pkg;

// Opcional: especificar manualmente la ubicación de nmap si no está en el PATH
NmapScan.nmapLocation = "nmap";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Backend con Nmap está corriendo.");
});

app.post("/scan", (req, res) => {
  const { ipRange } = req.body;

  if (!ipRange) {
    return res.status(400).json({ error: "Debes enviar un rango o IP" });
  }

  const scan = new NmapScan(ipRange);

  scan.on("complete", data => {
    const devices = data.map((host, index) => ({
      id: index + 1,
      hostname: host.hostname || "unknown",
      mac: host.mac || "N/A",
      ip: host.ip || "N/A",
      status: host.status || "unknown",
      openPorts: host.openPorts || [],
    }));
    res.json(devices);
  });

  scan.on("error", error => {
    console.error("❌ Error al escanear:", error);
    res.status(500).json({ error: "Error al escanear la red" });
  });

  scan.startScan();
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
