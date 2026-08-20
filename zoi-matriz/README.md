# ZOI Matriz App

Mini app HTML para capturar tareas, ubicarlas en la matriz de energia/valor y registrar completadas.

## Uso

1. Abre `index.html` en el navegador.
2. Escribe una tarea.
3. Elige energia y valor.
4. La tarea cae en el cuadrante correspondiente.
5. Marca `Completar` para registrarla como hecha.

## Registro con n8n

ZOI Matriz envia cada tarea completada a un Webhook de n8n. n8n se encarga de guardarla en Google Sheets.

### Payload enviado por ZOI Matriz

```json
{
  "id": "uuid",
  "text": "Texto de la tarea",
  "quadrant": "Produccion",
  "energy": "alta",
  "value": "alto",
  "createdAt": "2026-08-20T12:00:00.000Z",
  "completedAt": "2026-08-20T13:00:00.000Z"
}
```

### Google Sheet

Crea un Google Sheet con una pestana llamada `Completadas`.

Encabezados:

   - `id`
   - `text`
   - `quadrant`
   - `energy`
   - `value`
   - `createdAt`
   - `completedAt`

### Flujo n8n

1. Webhook `POST /zoi-matriz/completadas`.
2. Google Sheets `Append Row`.
3. Respond to Webhook con `{ "ok": true }`.
4. Copia la Production URL del Webhook.
5. En ZOI Matriz, abre configuracion y pega la URL.

Ver guia detallada en `n8n-webhook-zoi-matriz.md`.

## Siguiente fase

- Agente automatico en n8n para clasificar sin elegir energia/valor manualmente.
- Dashboard de tracking por dia, cuadrante y tipo de trabajo.
- Version para GitHub Pages.
