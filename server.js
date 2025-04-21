import express from 'express';
import axios from 'axios';
import pkg from 'node-nmap';  // Cambié la importación aquí
import cors from 'cors';

const { NmapScan } = pkg;  // Extraemos NmapScan

const app = express();
const port = 3000;

// Habilitar CORS
app.use(cors());

// Ruta para iniciar el escaneo de la red
app.get('/scan', async (req, res) => {
  try {
    const scan = new NmapScan();
    const network = req.query.network || '192.168.100.0/24'; // IP de la red por defecto
    
    scan.nmap('-sn ' + network, function(err, report) {
      if (err) {
        return res.status(500).json({ error: 'Error al realizar el escaneo de la red.' });
      }
      return res.json({ devices: report });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al realizar la solicitud.' });
  }
});

// Ruta para obtener los dispositivos conectados
app.get('/devices', (req, res) => {
  axios
    .get('http://192.168.100.1/html/dhcp_user_list_inter.html')
    .then(response => {
      // Aquí procesas los datos que recibes
      res.json({ devices: response.data });
    })
    .catch(error => {
      res.status(500).json({ error: 'No se pudieron obtener los dispositivos.' });
    });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
