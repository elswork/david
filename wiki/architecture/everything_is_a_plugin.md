---
id: everything-is-a-plugin
title: "Taxonomía: Everything is a Plugin"
description: "Clasificación de plugins en Proyecto David: Core, Negocio, Hardware e IA."
category: "Arquitectura"
tags: ["plugins", "taxonomia", "core", "business", "hardware", "ai"]
last_updated: "2026-09-11"
version: "1.0.0"
---

# 🔌 Taxonomía: Everything is a Plugin

En Proyecto David, ninguna funcionalidad de negocio o infraestructura forma parte del núcleo ejecutable. Todo es un complemento que implementa la interfaz `DavidPlugin`.

```dart
abstract class DavidPlugin {
  String get id;
  String get name;
  List<Type> get dependencies => [];

  Future<void> onLoad(DavidContext ctx) async {}
  Future<void> onReady(DavidContext ctx) async {}
  Future<void> onDestroy(DavidContext ctx) async {}

  List<RouteBase> get routes => [];
  List<McpToolDefinition> get mcpTools => [];
}
```

## 1. Categorías de Plugins

### A. Plugins Core (Infraestructura de Sistema)
Proporcionan los cimientos tecnológicos del ecosistema:
- **`FirestorePlugin` (`lib/plugins/core/database/`):** Implementa `DatabaseService` con soporte de caché persistente offline.
- **`FirebaseAuthPlugin` (`lib/plugins/core/auth/`):** Implementa `AuthService`, gestión de sesiones, roles y tokens de seguridad.
- **`ThemePlugin` (`lib/plugins/core/theme/`):** Control del sistema de diseño (Mármol, Grafito y Bronce).

### B. Plugins de Negocio (Feature-First)
Implementan casos de uso reales del comercio y la distribución:
- **`OrdersPlugin` (`lib/plugins/business/orders/`):** Toma rápida de pedidos, preventa en ruta, cálculo de tarifas e IVA.
- **`RoutesPlugin` (`lib/plugins/business/routes/`):** Organización de itinerarios para comerciales y repartidores, optimización de paradas.
- **`CatalogPlugin` (`lib/plugins/business/catalog/`):** Artículos, familias, stock virtual y tarifas especiales por cliente.

### C. Plugins de Hardware & Periféricos
Aíslan la comunicación con dispositivos físicos de movilidad:
- **`EscPosPrinterPlugin` (`lib/plugins/hardware/printer/`):** Control de impresoras térmicas portátiles por Bluetooth/USB para expedición de albaranes.
- **`BarcodeScannerPlugin` (`lib/plugins/hardware/scanner/`):** Lectores láser 1D/2D o cámaras integradas para picking y recepción.

### D. Plugins de Inteligencia Agéntica (AI)
Conectan el ecosistema con agentes autónomos y LLMs:
- **`McpAgentHarnessPlugin` (`lib/plugins/ai/`):** Agrega las herramientas (`mcpTools`) expuestas por todos los plugins de negocio y levanta el servidor Model Context Protocol.
- **`LlmWikiPlugin` (`lib/plugins/ai/llm_wiki/`):** Servicio reactivo de base de conocimiento viva para humanos y agentes.

---

### Conceptos Relacionados
- [[wiki/architecture/microkernel_core]]: El orquestador que gestiona estos complementos.
- [[wiki/ai/model_context_protocol]]: Cómo los plugins exponen herramientas a la IA.
- [[wiki/decisions/ADR-001-microkernel-over-clean-monolith]]: Rationale de diseño modular.
