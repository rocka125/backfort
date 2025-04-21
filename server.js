import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = 3000;

const ROUTER_URL = 'http://192.168.100.1';
const ROUTER_USERNAME = 'root';
const ROUTER_PASSWORD = 'admin'; // ⚠️ cambiá por tu contraseña real

app.get('/devices', async (req, res) => {
  let browser;
  try {
    console.log('🚀 Lanzando navegador...');
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    console.log('🌐 Navegando al login del router...');
    await page.goto(ROUTER_URL, { waitUntil: 'networkidle0' });

    console.log('✍️ Ingresando usuario...');
    await page.type('#user_name', ROUTER_USERNAME);
    console.log('✍️ Ingresando contraseña...');
    await page.type('#loginpp', ROUTER_PASSWORD);

    console.log('📩 Enviando formulario...');
    await Promise.all([
      page.click('input[type="submit"]'), // Intentamos hacer clic en el botón de login si existe
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    ]);

    // Verificar si hay un campo de código de validación
    const validationFieldExists = await page.$('#validata_code');
    if (validationFieldExists) {
      console.log('🔐 Código de validación requerido...');
      // Aquí deberías obtener el código de validación desde un método que sea adecuado para tu router.
      const validationCode = '12345'; // Aquí debes introducir el código correcto
      console.log(✍️ Ingresando código de validación: ${validationCode});
      await page.type('#validata_code', validationCode);

      console.log('📩 Enviando código de validación...');
      await Promise.all([
        page.click('input[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      ]);
    }

    console.log('➡️ Navegando a la lista DHCP...');
    await page.goto(${ROUTER_URL}/html/dhcp_user_list_inter.html, { waitUntil: 'domcontentloaded' });

    console.log('🔍 Esperando la tabla de dispositivos...');
    await page.waitForSelector('#user_list');

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

    console.log('✅ Datos extraídos correctamente');
    await browser.close();
    res.json(devices);

  } catch (err) {
    console.error('❌ Error detectado:', err.message);
    if (browser) await browser.close();
    res.status(500).json({ error: 'Error al obtener la lista de dispositivos.' });
  }
});

app.listen(PORT, () => {
  console.log(✅ Servidor escuchando en http://localhost:${PORT});
});