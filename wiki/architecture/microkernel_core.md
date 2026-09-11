---
id: microkernel-core
title: "Microkernel: El Núcleo DavidContext"
description: "Especificación técnica del contenedor orquestador, bus de servicios y ciclo de vida de Proyecto David."
category: "Arquitectura"
tags: ["microkernel", "david-context", "lifecycle", "dependency-injection", "dart"]
last_updated: "2026-09-11"
version: "1.0.0"
---

# 🧩 Microkernel: El Núcleo `DavidContext`

Inspirado en marcos agénticos como **DeepSeek Harness** y el patrón **Cordis**, el núcleo de David es intencionadamente diminuto. No conoce la lógica de pedidos, clientes ni rutas; su única función es coordinar el ciclo de vida y la inyección de servicios entre plugins.

## 1. El Contenedor de Inyección (`DavidContext`)

El objeto `DavidContext` actúa como el bus central de dependencias desacopladas:

- **`ctx.provide<T>(T service)`**: Un plugin registra una implementación concreta bajo un contrato abstracto.
- **`ctx.inject<T>()`**: Otro plugin recupera el servicio registrado sin acoplarse a la implementación subyacente.
- **`ctx.has<T>()`**: Comprueba si un servicio opcional está disponible en el entorno de ejecución actual.

```dart
// Ejemplo: FirestorePlugin provee el contrato de base de datos
ctx.provide<DatabaseService>(FirestoreDatabaseService());

// Ejemplo: OrdersPlugin inyecta el contrato sin saber si es Firestore o SQLite
final db = ctx.inject<DatabaseService>();
```

## 2. El Ciclo de Vida de Tres Fases

Todo plugin atraviesa tres fases estrictamente secuenciadas por el `PluginRegistry`:

1. **`onLoad(DavidContext ctx)` (Registro de Servicios):**
   - El plugin registra sus servicios esenciales en el contexto (`ctx.provide`).
   - Ningún plugin debe intentar consumir servicios de terceros en esta fase, ya que aún pueden no estar registrados.

2. **`onReady(DavidContext ctx)` (Enlace y Rutas UI):**
   - Todos los plugins han completado su `onLoad`.
   - Es seguro llamar a `ctx.inject<T>()` para enlazar dependencias, suscribirse a streams de eventos y registrar rutas de navegación en el App Shell.

3. **`onDestroy(DavidContext ctx)` (Drenaje y Limpieza):**
   - Se invoca al detener la aplicación o desactivar un módulo en caliente.
   - Debe cancelar streams reactivos, vaciar buffers de sincronización a disco y liberar recursos nativos (sockets Bluetooth, listeners GPS).

## 3. Beneficios frente a Monolitos

| Característica | Monolito Tradicional | Microkernel David |
| :--- | :--- | :--- |
| **Acoplamiento** | Alto (Imports directos entre módulos) | Cero (Inyección por contratos abstractos) |
| **Modularidad** | Falsa (Módulos pegados en compilación) | Real (Plugins activables/desactivables) |
| **Evolución** | Costosa; tocar pedidos puede romper almacén | Aislada; cada plugin es autocontenido |
| **Capa IA** | Difícil de abstraer | Nativa (cada plugin expone `mcpTools`) |

---

### Conceptos Relacionados
- [[wiki/architecture/everything_is_a_plugin]]: Taxonomía completa de plugins.
- [[wiki/architecture/anti_overengineering]]: Cómo evitar mappers en los contratos.
- [[wiki/ai/model_context_protocol]]: Exposición de herramientas agénticas desde cada plugin.
