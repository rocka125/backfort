# Usamos una imagen base oficial de Node.js
FROM node:18-alpine

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos de la aplicación al contenedor
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto de los archivos de la aplicación
COPY . .

# Exponemos el puerto en el que el servidor escucha
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
