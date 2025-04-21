import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 3000;

const ROUTER_URL = 'http://192.168.100.1';
const ROUTER_USERNAME = 'root';
const ROUTER_PASSWORD = 'admin';

let browser;
let page;

async function loginToRouter() {
  browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  page = await browser.newPage();

  console.log('🌐 Navegando al login del router...');
  await page.goto(ROUTER_URL, { waitUntil: 'networkidle0' });

  console.log('✍️ Ingresando usuario...');
  await page.type('#user_name', ROUTER_USERNAME);
  console.log('✍️ Ingresando contraseña...');
  await page.type('#loginpp', ROUTER_PASSWORD);

  console.log('📩 Enviando formulario...');
  await Promise.all([
    page.click('input[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
  ]);

  // Si hay código de validación
  const validationFieldExists = await page.$('#validata_code');
  if (validationFieldExists) {
    const validationCode = '12345'; // Cambiar si tu router necesita otro
    console.log(`✍️ Ingresando código de validación: ${validationCode}`);
    await page.type('#validata_code', validationCode);

    console.log('📩 Enviando código de validación...');
    await Promise.all([
      page.click('input[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    ]);
  }
}

async function fetchDevices() {
  if (!browser || !page) await loginToRouter();

  console.log('➡️ Navegando a la lista DHCP...');
  await page.goto(`${ROUTER_URL}/html/dhcp_user_list_inter.html`, { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('#user_list');
  console.log('🔍 Esperando la tabla de dispositivos...');

  const devices = await page.evaluate(() => {
    const rows = document.querySelectorAll('#user_list tr');
    const data = [];

    for (let row of rows) {
      const cols = row.querySelectorAll('td');
      if (cols.length >= 6) {
        data.push({
          id: cols[0]?.innerText.trim(),
          hostname: cols[1]?.innerText.trim(),
          mac: cols[2]?.innerText.trim(),
          ip: cols[3]?.innerText.trim(),
          leasedTime: cols[4]?.innerText.trim(),
          type: cols[5]?.innerText.trim()
        });
      }
    }
    return data;
  });

  return devices;
}

app.get('/devices', async (req, res) => {
  try {
    const devices = await fetchDevices();
    console.log('✅ Datos extraídos correctamente');
    res.json(devices);
  } catch (err) {
    console.error('❌ Error detectado:', err.message);
    if (browser) await browser.close();
    browser = null;
    page = null;
    res.status(500).json({ error: 'Error al obtener la lista de dispositivos.' });
  }
});

app.get('/logout', async (req, res) => {
  try {
    if (page) {
      console.log('🚪 Cerrando sesión en el router...');
      await page.goto(`${ROUTER_URL}/html/logout.html`, { waitUntil: 'networkidle0' });
    }
    if (browser) {
      await browser.close();
      browser = null;
      page = null;
    }
    res.json({ message: 'Sesión cerrada correctamente' });
  } catch (err) {
    console.error('❌ Error al cerrar sesión:', err.message);
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
