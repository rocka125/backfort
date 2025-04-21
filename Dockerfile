# Imagen oficial de Puppeteer con Chromium listo para usar
FROM ghcr.io/puppeteer/puppeteer:latest

# Directorio de trabajo
WORKDIR /app

# Copiar archivos al contenedor
COPY . .

# Instalar dependencias
RUN npm install

# Exponer el puerto de la app
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["node", "server.js"]
