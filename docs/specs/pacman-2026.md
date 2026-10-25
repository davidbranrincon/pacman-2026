# 📄 Especificación Técnica: Pac-Man 2026 (Google Cloud Edition)

**Objetivo:** Crear una webapp moderna de Pac-Man combinando la jugabilidad arcade clásica con agentes inteligentes y despliegue en Google Cloud.

## 🎯 1. Alcance Core
* **Frontend:** HTML5 Canvas y TypeScript para el renderizado del laberinto clásico.
* **Backend y Base de Datos:** Firebase Realtime Database / Firestore para puntuaciones altas (*Leaderboards*) protegidas por reglas de seguridad.
* **Inteligencia Artificial:** Agentes de baja latencia mediante la API de Gemini para la táctica dinámica de los fantasmas (con un estricto *Autonomy Ceiling*).

## 🔒 2. Seguridad Defensiva (VibeOps & OWASP)
* **Cero Secretos Hardcoded:** Uso de variables de entorno y Cloud Functions para proteger credenciales de API.
* **Validación de Frontera:** Sanitización de peticiones para evitar IDOR en el almacenamiento de puntajes.