---
id: wiki-root
title: "LLM-Wiki // Proyecto David"
description: "Base de conocimiento viva, atómica y estructurada para humanos y agentes de Proyecto David."
category: "Meta"
tags: ["wiki", "arquitectura", "agentes", "mcp", "filosofia"]
last_updated: "2026-09-11"
version: "1.0.0"
---

# 📚 LLM-Wiki — Proyecto David

Bienvenido a la **LLM-Wiki** de **Proyecto David**.

A diferencia de la documentación estática tradicional que envejece y se desactualiza, la **LLM-Wiki** es una **base de conocimiento viva y navegable en grafo**, concebida para ser leída, auditada y enriquecida tanto por **desarrolladores humanos** como por **agentes de Inteligencia Artificial (LLMs)**.

---

## 🧭 Principios Fundamentales de la LLM-Wiki

1. **Atomicidad Conceptual:** Cada artículo cubre un concepto, contrato o decisión arquitectónica delimitada.
2. **Metadatos Estructurados (Frontmatter):** Todo documento incluye cabecera YAML estandarizada con `id`, `title`, `description`, `category`, `tags` y `last_updated`.
3. **Enlaces de Doble Vía (`[[wikilinks]]`):** Los conceptos se entrelazan mediante hipervínculos contextuales para permitir que un agente o desarrollador salte de un principio a su contrato de código o ADR asociado.
4. **Catálogo Unificado (`catalog.json`):** Un índice indexable en JSON consumible por herramientas MCP (`wiki_search`, `wiki_read_page`) y visualizadores web en tiempo real.
5. **Simplicidad Textual:** Markdown puro sin dependencias opacas. Fácil de versionar en Git y procesar con expresiones regulares o AST.

---

## 🗂️ Taxonomía y Estructura

```
wiki/
├── README.md                                 # Este documento (Punto de entrada)
├── catalog.json                              # Manifiesto estructurado para LLMs y Web Explorer
│
├── philosophy/                               # Principios fundacionales y experiencia
│   └── 18_years_lessons.md                   # 18 Años de producción real: software vivo vs monumento
│
├── architecture/                             # Especificación técnica del Microkernel
│   ├── microkernel_core.md                   # DavidContext, ciclo de vida e inyección de servicios
│   ├── everything_is_a_plugin.md             # Taxonomía de complementos (Core, Negocio, Hardware, AI)
│   └── anti_overengineering.md               # Cero infierno de mappers, modelo único en Dart 3
│
├── ai/                                       # Inteligencia agéntica y protocolos
│   ├── model_context_protocol.md             # Integración con MCP (Tools, Resources, Prompts)
│   └── llm_wiki_architecture.md              # La especificación de LLM-Wiki en los 4 niveles
│
└── decisions/                                # Architecture Decision Records (ADRs)
    ├── ADR-001-microkernel-over-clean-monolith.md
    └── ADR-002-flutter-firebase-offline-first.md
```

---

## 🤖 Protocolo para Agentes LLM

Cuando un asistente o agente autónomo (DeepSeek, Claude, Gemini, Ollama o David MCP Copilot) trabaje en el repositorio:

1. **Lectura y Contexto:**
   - Antes de implementar un cambio arquitectónico o nuevo plugin, consulta `catalog.json` para ubicar las directrices relevantes.
   - Lee [[wiki/architecture/microkernel_core]] y [[wiki/architecture/anti_overengineering]] para asegurar que el código respeta los contratos.

2. **Actualización Incremental:**
   - Si introduces un nuevo plugin de negocio o hardware, crea su correspondiente entrada en `wiki/` y actualiza `catalog.json`.
   - Si tomas una decisión de arquitectura estructural, redacta un nuevo ADR en `wiki/decisions/` siguiendo la convención `ADR-XXX-[slug].md`.
   - Mantén la fecha `last_updated` al día.

---

## 🔗 Navegación Rápida

- [[wiki/philosophy/18_years_lessons]]: La filosofía de por qué el software es un organismo vivo.
- [[wiki/architecture/microkernel_core]]: Cómo funciona el bus de servicios `DavidContext`.
- [[wiki/architecture/everything_is_a_plugin]]: Cómo crear e interactuar con plugins.
- [[wiki/architecture/anti_overengineering]]: Reglas anti-mappers y diseño pragmático.
- [[wiki/ai/model_context_protocol]]: Conexión con agentes autónomos mediante MCP.
- [[wiki/ai/llm_wiki_architecture]]: Especificación del sistema de conocimiento vivo.
- [[wiki/decisions/ADR-001-microkernel-over-clean-monolith]]: Decisión Microkernel vs Monolito.
- [[wiki/decisions/ADR-002-flutter-firebase-offline-first]]: Decisión Flutter + Firebase Offline-First.
