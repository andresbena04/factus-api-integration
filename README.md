# Integración de API de Facturación Electrónica - Factus

Este proyecto integra la API de facturación electrónica de Factus.  
Fue generado con [Angular CLI](https://github.com/angular/angular-cli) versión 17.2.2.

## Instalación

1. Clona el repositorio:
   ```sh
   git clone https://github.com/andresbena04/factus-api-integration.git
   cd factus-api-integration
   ```
2. Instala las dependencias:
   ```sh
   npm install
   ```
3. Configura las variables de entorno:
   - Crea el archivo `environments/environment.ts` o `environments/environment.prod.ts`.
   - Define las variables de entorno según el ejemplo a continuación.

## Ejemplo de Archivo de Configuración

```ts
// environments/environment.example.ts
export const environment = {
    production: false,
    apiUrl: 'https://api-sandbox.factus.com.co',
    user: 'your-user',
    password: 'your-password',
    clientID: 'your-client-id',
    clientSecret: 'your-client-secret'
};
```

## Ejecución

Para iniciar el proyecto, ejecuta:  
```sh
ng serve
```

## Contribución

Si deseas contribuir, abre un Pull Request con tus cambios.

