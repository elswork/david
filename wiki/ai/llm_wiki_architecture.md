---
id: llm-wiki-architecture
title: "Arquitectura LLM-Wiki en Todos los Niveles"
description: "Especificación técnica del sistema de conocimiento vivo bidireccional entre agentes y humanos en Proyecto David."
category: "AI & Agentes"
tags: ["llm-wiki", "knowledge-base", "agentes", "grafo", "mcp", "documentacion"]
last_updated: "2026-09-11"
version: "1.0.0"
---

# 🧠 Arquitectura LLM-Wiki en Todos los Niveles

En los sistemas tradicionales, la documentación es un archivo estático que los desarrolladores olvidan actualizar. En cambio, **LLM-Wiki** convierte el conocimiento del proyecto y del negocio en un **grafo vivo**, editable e indexable tanto por humanos como por agentes de inteligencia artificial.

Proyecto David adopta LLM-Wiki en **cuatro niveles progresivos**:

```
                               ┌────────────────────────────────────────┐
                               │   NIVEL 4: WEB EXPLORER (docs/)        │
                               │   - Buscador reactivo en tiempo real   │
                               │   - Visualizador Markdown interactivo  │
                               └───────────────────┬────────────────────┘
                                                   │ Consulta visual
                               ┌───────────────────▼────────────────────┐
                               │   NIVEL 1: REPOSITORIO VIVO (wiki/)    │
                               │   - Páginas atómicas Markdown          │
                               │   - Metadatos Frontmatter YAML         │
                               │   - Catálogo formal (catalog.json)     │
                               └───────────────────┬────────────────────┘
                                                   │ Ingesta / Indexación
                               ┌───────────────────▼────────────────────┐
                               │   NIVEL 2: MICROKERNEL & PLUGINS       │
                               │   - LlmWikiPlugin en DavidContext      │
                               │   - KnowledgeService (provide/inject)  │
                               └───────────────────┬────────────────────┘
                                                   │ Protocolo universal
                               ┌───────────────────▼────────────────────┐
                               │   NIVEL 3: AGENTES & MCP TOOLS         │
                               │   - wiki_search(query)                 │
                               │   - wiki_read_page(id)                 │
                               │   - wiki_update_entry(id, content)     │
                               └────────────────────────────────────────┘
```

## Nivel 1: Base de Conocimiento del Repositorio (`wiki/`)
- Almacenamiento en archivos Markdown planos con frontmatter estructurado.
- Enlaces de doble vía (`[[wikilink]]`) que construyen una red conceptual.
- Archivo índice `catalog.json` que permite búsquedas de complejidad \(O(1)\) por ID o etiquetas.

## Nivel 2: Microkernel & Bus de Servicios (`LlmWikiPlugin`)
- Un plugin de infraestructura y AI que expone `WikiKnowledgeService`.
- Permite a plugins de negocio (ej. `OrdersPlugin`, `RoutesPlugin`) consultar reglas comerciales, notas históricas de clientes o incidentes de reparto directamente desde el código Flutter.

## Nivel 3: Herramientas Agénticas con MCP
- Herramientas formalizadas para que cualquier LLM (DeepSeek, Claude, Gemini, Ollama) pueda consultar la wiki como memoria de trabajo a largo plazo.
- Capacidad de síntesis autónoma: al finalizar una ruta o una auditoría, el agente puede generar un resumen estructurado y anexarlo a la wiki.

## Nivel 4: Explorador Interactivo en la Web (`docs/`)
- Una interfaz visual accesible para desarrolladores, colaboradores y operadores comerciales.
- Búsqueda reactiva instantánea por texto y etiquetas.
- Renderizado fiel de la estética clásica y arquitectónica de David (*Mármol, Grafito y Bronce*).

---

### Conceptos Relacionados
- [[wiki/ai/model_context_protocol]]: Protocolo de comunicación con los agentes.
- [[wiki/architecture/microkernel_core]]: Inyección del servicio en el núcleo.
- [[wiki/philosophy/18_years_lessons]]: Conocimiento empírico codificado en la wiki.
