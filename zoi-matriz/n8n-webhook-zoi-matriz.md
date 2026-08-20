# n8n: ZOI Matriz completadas

## Objetivo

Recibir desde ZOI Matriz cada tarea marcada como completada y guardarla en Google Sheets.

## Arquitectura

```text
ZOI Matriz /zoi-matriz
  -> n8n Webhook
  -> Google Sheets Append Row
  -> Respond to Webhook
```

## Sheet

Nombre sugerido:

`ZOI Matriz Tracking`

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
- Path: `zoi-matriz/completadas`
- Response: usar nodo `Respond to Webhook`

La URL de prueba sirve mientras editas el workflow. La URL definitiva es la `Production URL`, y solo funciona cuando el workflow esta activo.

### 2. Google Sheets

Operacion:

- Append Row

Documento:

- `ZOI Matriz Tracking`

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

## Configuracion en ZOI Matriz

1. Abre `/zoi-matriz/`.
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

