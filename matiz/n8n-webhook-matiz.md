# n8n: Matiz completadas

## Objetivo

Recibir desde Matiz cada tarea marcada como completada y guardarla en Google Sheets.

## Arquitectura

```text
Matiz /matiz
  -> n8n Webhook
  -> Google Sheets Append Row
  -> Respond to Webhook
```

## Sheet

Nombre sugerido:

`Matiz Tracking`

Pestana:

`Completadas`

Encabezados:

```text
id | text | quadrant | energy | value | createdAt | completedAt
```

## Workflow n8n

### 1. Webhook

Configuracion:

- HTTP Method: `POST`
- Path: `matiz/completadas`
- Response: usar nodo `Respond to Webhook`

La URL de prueba sirve mientras editas el workflow. La URL definitiva es la `Production URL`, y solo funciona cuando el workflow esta activo.

### 2. Google Sheets

Operacion:

- Append Row

Documento:

- `Matiz Tracking`

Sheet:

- `Completadas`

Mapeo de columnas:

```text
id          = {{$json.body.id}}
text        = {{$json.body.text}}
quadrant    = {{$json.body.quadrant}}
energy      = {{$json.body.energy}}
value       = {{$json.body.value}}
createdAt   = {{$json.body.createdAt}}
completedAt = {{$json.body.completedAt}}
```

### 3. Respond to Webhook

Respuesta:

```json
{
  "ok": true
}
```

## Configuracion en Matiz

1. Abre `/matiz/`.
2. Presiona el boton de configuracion.
3. Pega la `Production URL` del Webhook de n8n.
4. Guarda.
5. Completa una tarea de prueba.

## Fase siguiente

Cuando esto funcione, n8n puede hacer mas cosas:

- Agregar un clasificador automatico con IA.
- Generar resumen diario.
- Detectar tareas repetidas para delegar o automatizar.
- Alimentar un dashboard semanal.

