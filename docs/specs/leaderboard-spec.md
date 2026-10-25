# Especificación Técnica: Leaderboard Seguro (Pac-Man 2026)

## 1. Objetivo
Habilitar una tabla de clasificación de puntajes altos con persistencia en la nube utilizando Google Cloud / Firebase Firestore, garantizando la separación de capas y evitando la exposición de claves privadas en el cliente web.

## 2. Esquema de Datos (Firestore: `leaderboard`)
- `id` (Auto-ID)
- `playerName` (String, máx 15 caracteres, sanitizado)
- `score` (Number, validado numéricamente > 0 y menor a un umbral lógico)
- `timestamp` (Server Timestamp automático)

## 3. Controles de Seguridad (OWASP & VibeOps)
- **Cero Secretos Hardcoded:** Las credenciales de configuración de Firebase se inyectarán mediante variables de entorno seguras en tiempo de compilación/despliegue.
- **Reglas de Firestore (Security Rules):** 
  - Lectura pública permitida para consultar el top 10.
  - Escritura restringida a validación de tipos de datos y rangos de puntaje válidos para evitar inyecciones o registros falsos.