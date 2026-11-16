# Ciutat Studio

Genera el post (1080×1440) y la historia (1080×1920) de Instagram, con su copy, a partir de los artículos de laciutat.cat.

- `index.html`: la web (lista de últimos artículos, plantillas por cuenta, descarga y copia).
- `api/feed.js`: lee el RSS de laciutat.cat.
- `api/article.js`: lee titular, subtítulo y foto de un artículo.
- `api/image.js`: sirve la foto del artículo desde el mismo dominio.

Se publica en Vercel sin configuración.
