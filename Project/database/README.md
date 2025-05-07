# Base de Datos del Chatbot

Este directorio contiene los scripts y configuración de la base de datos para el chatbot.

## Estructura

- `schema.sql`: Define la estructura de la base de datos
- `seed.sql`: Datos iniciales para la base de datos
- `migrations/`: Scripts de migración para actualizar la base de datos

## Configuración

1. Crear una base de datos con el nombre `chatbot_db`
2. Ejecutar el script `schema.sql`
3. Ejecutar el script `seed.sql`

## Migraciones

Para actualizar la base de datos a una nueva versión, ejecutar los scripts de migración en orden cronológico.