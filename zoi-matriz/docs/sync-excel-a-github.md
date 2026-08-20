# Sincronizar Excel/Google Sheet con GitHub

## Objetivo

Cuando cambie `ZOI_Matriz_Tracking` en Google Drive/Google Sheets, guardar una copia actualizada dentro del repositorio GitHub.

## Ruta recomendada

```text
Google Sheets / Drive
  -> n8n Schedule Trigger
  -> Google Drive export/download como XLSX
  -> GitHub create/update file
```

## Archivo destino sugerido

Dentro del repo:

```text
zoi-matriz/data/ZOI_Matriz_Tracking.xlsx
```

## Por que usar n8n

GitHub Pages no puede leer cambios de Google Drive por si solo. n8n si puede conectarse a Drive, descargar el archivo y actualizar el repositorio con un commit automatico.

## Workflow n8n recomendado

### 1. Schedule Trigger

Frecuencia sugerida:

- Cada 15 minutos, o
- Cada 1 hora si no necesitas tracking inmediato.

### 2. Google Drive

Operacion:

- Descargar/exportar archivo.

Archivo:

- `ZOI_Matriz_Tracking`

Formato:

- `.xlsx`

### 3. GitHub

Operacion:

- Create or update file.

Repositorio:

```text
ZOIDevelop/web
```

Branch:

```text
main
```

Path:

```text
zoi-matriz/data/ZOI_Matriz_Tracking.xlsx
```

Commit message:

```text
Update ZOI Matriz tracking workbook
```

## Alternativa manual

Si cambias el Excel localmente, tambien puedes decirme "sube el Excel" y hago:

```text
git add zoi-matriz/data/ZOI_Matriz_Tracking.xlsx
git commit
git push
```

## Nota importante

No conviene poner datos sensibles en GitHub si el repositorio es publico. Si el tracking va a tener informacion privada, mejor sincronizar solo un resumen o usar un repositorio privado.

