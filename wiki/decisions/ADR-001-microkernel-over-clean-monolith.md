---
id: ADR-001
title: "ADR-001: Arquitectura Microkernel frente a Monolito Clean/DDD Dogmático"
description: "Decisión de adoptar el microkernel 'Everything is a Plugin' en lugar de estructuras monolíticas multicapa tradicionales."
category: "Decisiones (ADRs)"
tags: ["adr", "arquitectura", "microkernel", "clean-architecture", "desacoplamiento"]
last_updated: "2026-09-11"
status: "Aceptado"
version: "1.0.0"
---

# 🏛️ ADR-001: Arquitectura Microkernel frente a Monolito Clean/DDD

## Estado
**Aceptado** (2026-09-11)

## Contexto
En los proyectos de gestión comercial y distribución de gran escala, la evolución del software durante años suele degenerar en dos trampas habituales:
1. **Monolito de espagueti:** Código acoplado donde modificar la lógica de pedidos rompe facturación o clientes.
2. **Clean Architecture dogmática:** Proyectos con 6 capas de abstracción donde el 70% del tiempo de desarrollo se gasta escribiendo mappers y adaptadores redundantes, destruyendo la agilidad y la reactividad.

## Decisión
Adoptamos una **Arquitectura Microkernel ("Everything is a Plugin")**, inspirada en los frameworks agénticos más modernos (**DeepSeek Harness** y **Cordis**):
1. El núcleo (`DavidContext`) sólo gestiona el registro de dependencias (`ctx.provide` / `ctx.inject`) y el ciclo de vida de los plugins.
2. Cada capacidad (base de datos, autenticación, pedidos, rutas, impresión térmica, servidor MCP) es un plugin aislado (`DavidPlugin`).
3. La comunicación entre módulos se realiza exclusivamente mediante contratos abstractos inyectados en el contexto.

## Consecuencias

### Positivas
- **Modularidad Radical:** Un cliente que no utilice furgonetas de reparto simplemente no carga `RoutesPlugin` ni `EscPosPrinterPlugin`.
- **Evolución Aislada:** Modificar un plugin no tiene efectos secundarios sobre los demás.
- **Preparado para IA:** Cada plugin expone formalmente sus herramientas MCP (`mcpTools`) sin necesidad de reescribir la lógica de presentación.

### Negativas / Mitigaciones
- Requiere disciplina para no importar clases concretas entre carpetas de plugins (se mitiga mediante linting y contratos de interfaz en `DavidContext`).
