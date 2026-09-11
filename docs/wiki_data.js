/**
 * PROYECTO DAVID — LLM-WIKI DATASET
 * Autogenerado a partir de /wiki/ y catalog.json
 */
const LLM_WIKI_DATA = {
  "version": "1.0.0",
  "project": "Proyecto David",
  "categories": [
    "Filosofía",
    "Arquitectura",
    "AI & Agentes",
    "Decisiones (ADRs)"
  ],
  "articles": {
    "18-years-lessons": {
      "id": "18-years-lessons",
      "title": "18 Años en Producción: Lecciones de Trinchera",
      "slug": "18_years_lessons",
      "category": "Filosofía",
      "path": "wiki/philosophy/18_years_lessons.md",
      "description": "Por qué el software debe ser un organismo vivo y no un monumento de piedra. Principios anti-fragilidad.",
      "tags": [
        "filosofia",
        "produccion",
        "rutero",
        "resiliencia",
        "lecciones"
      ],
      "last_updated": "2026-09-11",
      "reading_time_min": 3,
      "links": [
        "microkernel-core",
        "anti-overengineering",
        "ADR-001"
      ],
      "body": "# 🛡️ 18 Años en Producción: Lecciones de Trinchera\n\n> *\"El software no debe diseñarse como un monumento de piedra, sino como un organismo vivo.\"*\n\nEn 2008 comenzó el desarrollo de una herramienta comercial y de pedidos (*Rutero*). Contra todo pronóstico del ciclo vital habitual del software empresarial, **continúa hoy en producción diaria real**, procesando pedidos, facturación y cobros para decenas de rutas comerciales.\n\n## 1. El Mito del Requisito Anticipado\n\nLos grandes proyectos de software rara vez fracasan por falta de tecnología; fracasan porque intentan adivinar el futuro:\n- Diseñar hoy lo que el cliente *podría* necesitar dentro de 5 años conduce a abstracciones prematuras y código muerto.\n- El software debe nacer con los cimientos justos para el presente y las juntas de dilatación necesarias para crecer mañana.\n- **Proyecto David** adopta esta premisa: no categorizamos el sistema como \"solo preventa\" o \"solo ERP\". Es un **Microkernel** que alumbra plugins conforme el negocio los pide.\n\n## 2. La Hostilidad del Mundo Real\n\nEn un laboratorio de pruebas, la red es Gigabit y el usuario tiene tiempo ilimitado. En una furgoneta de reparto a las 7:00 AM:\n- La cobertura móvil desaparece en sótanos, polígonos industriales y carreteras de montaña.\n- El operador tiene prisa y las manos ocupadas.\n- **Regla de Oro:** Tratamos la conexión a internet como un accidente feliz. La aplicación debe ser **Offline-First** por diseño, respondiendo en 0 ms desde memoria/caché local y sincronizando en segundo plano cuando la red regrese.\n\n## 3. La Regla de los Tres Toques\n\nCualquier acción comercial recurrente (tomar nota de 3 cajas de un producto habitual, consultar deuda pendiente, imprimir albarán) debe resolverse en **máximo 3 toques en pantalla**. Si una interfaz exige navegar 5 submenús, el software será abandonado por los usuarios en favor del lápiz y el papel.\n\n## 4. Anti-Overengineering (Anti-Burocracia de Código)\n\nA lo largo de 18 años, el software que sobrevive es el que se puede leer y corregir en 10 minutos durante una emergencia:\n- Rechazamos el dogmatismo académico de mapear 4 capas de objetos idénticos (`Dto`, `Entity`, `DomainModel`, `UiState`).\n- Un único modelo inmutable y fuertemente tipado en Dart 3 es suficiente para la base de datos, las reglas de negocio y los widgets.\n\n---\n\n### Conceptos Relacionados\n- [[wiki/architecture/microkernel_core]]: Cómo el Microkernel materializa esta filosofía modular.\n- [[wiki/architecture/anti_overengineering]]: Reglas pragmáticas de arquitectura de código.\n- [[wiki/decisions/ADR-001-microkernel-over-clean-monolith]]: Comparativa arquitectónica.\n"
    },
    "microkernel-core": {
      "id": "microkernel-core",
      "title": "Microkernel: El Núcleo DavidContext",
      "slug": "microkernel_core",
      "category": "Arquitectura",
      "path": "wiki/architecture/microkernel_core.md",
      "description": "Especificación técnica del contenedor orquestador, bus de servicios y ciclo de vida de Proyecto David.",
      "tags": [
        "microkernel",
        "david-context",
        "lifecycle",
        "dependency-injection",
        "dart"
      ],
      "last_updated": "2026-09-11",
      "reading_time_min": 4,
      "links": [
        "everything-is-a-plugin",
        "anti-overengineering",
        "model-context-protocol"
      ],
      "body": "# 🧩 Microkernel: El Núcleo `DavidContext`\n\nInspirado en marcos agénticos como **DeepSeek Harness** y el patrón **Cordis**, el núcleo de David es intencionadamente diminuto. No conoce la lógica de pedidos, clientes ni rutas; su única función es coordinar el ciclo de vida y la inyección de servicios entre plugins.\n\n## 1. El Contenedor de Inyección (`DavidContext`)\n\nEl objeto `DavidContext` actúa como el bus central de dependencias desacopladas:\n\n- **`ctx.provide<T>(T service)`**: Un plugin registra una implementación concreta bajo un contrato abstracto.\n- **`ctx.inject<T>()`**: Otro plugin recupera el servicio registrado sin acoplarse a la implementación subyacente.\n- **`ctx.has<T>()`**: Comprueba si un servicio opcional está disponible en el entorno de ejecución actual.\n\n```dart\n// Ejemplo: FirestorePlugin provee el contrato de base de datos\nctx.provide<DatabaseService>(FirestoreDatabaseService());\n\n// Ejemplo: OrdersPlugin inyecta el contrato sin saber si es Firestore o SQLite\nfinal db = ctx.inject<DatabaseService>();\n```\n\n## 2. El Ciclo de Vida de Tres Fases\n\nTodo plugin atraviesa tres fases estrictamente secuenciadas por el `PluginRegistry`:\n\n1. **`onLoad(DavidContext ctx)` (Registro de Servicios):**\n   - El plugin registra sus servicios esenciales en el contexto (`ctx.provide`).\n   - Ningún plugin debe intentar consumir servicios de terceros en esta fase, ya que aún pueden no estar registrados.\n\n2. **`onReady(DavidContext ctx)` (Enlace y Rutas UI):**\n   - Todos los plugins han completado su `onLoad`.\n   - Es seguro llamar a `ctx.inject<T>()` para enlazar dependencias, suscribirse a streams de eventos y registrar rutas de navegación en el App Shell.\n\n3. **`onDestroy(DavidContext ctx)` (Drenaje y Limpieza):**\n   - Se invoca al detener la aplicación o desactivar un módulo en caliente.\n   - Debe cancelar streams reactivos, vaciar buffers de sincronización a disco y liberar recursos nativos (sockets Bluetooth, listeners GPS).\n\n## 3. Beneficios frente a Monolitos\n\n| Característica | Monolito Tradicional | Microkernel David |\n| :--- | :--- | :--- |\n| **Acoplamiento** | Alto (Imports directos entre módulos) | Cero (Inyección por contratos abstractos) |\n| **Modularidad** | Falsa (Módulos pegados en compilación) | Real (Plugins activables/desactivables) |\n| **Evolución** | Costosa; tocar pedidos puede romper almacén | Aislada; cada plugin es autocontenido |\n| **Capa IA** | Difícil de abstraer | Nativa (cada plugin expone `mcpTools`) |\n\n---\n\n### Conceptos Relacionados\n- [[wiki/architecture/everything_is_a_plugin]]: Taxonomía completa de plugins.\n- [[wiki/architecture/anti_overengineering]]: Cómo evitar mappers en los contratos.\n- [[wiki/ai/model_context_protocol]]: Exposición de herramientas agénticas desde cada plugin.\n"
    },
    "everything-is-a-plugin": {
      "id": "everything-is-a-plugin",
      "title": "Taxonomía: Everything is a Plugin",
      "slug": "everything_is_a_plugin",
      "category": "Arquitectura",
      "path": "wiki/architecture/everything_is_a_plugin.md",
      "description": "Clasificación de plugins en Proyecto David: Core, Negocio, Hardware e IA.",
      "tags": [
        "plugins",
        "taxonomia",
        "core",
        "business",
        "hardware",
        "ai"
      ],
      "last_updated": "2026-09-11",
      "reading_time_min": 3,
      "links": [
        "microkernel-core",
        "model-context-protocol",
        "ADR-001"
      ],
      "body": "# 🔌 Taxonomía: Everything is a Plugin\n\nEn Proyecto David, ninguna funcionalidad de negocio o infraestructura forma parte del núcleo ejecutable. Todo es un complemento que implementa la interfaz `DavidPlugin`.\n\n```dart\nabstract class DavidPlugin {\n  String get id;\n  String get name;\n  List<Type> get dependencies => [];\n\n  Future<void> onLoad(DavidContext ctx) async {}\n  Future<void> onReady(DavidContext ctx) async {}\n  Future<void> onDestroy(DavidContext ctx) async {}\n\n  List<RouteBase> get routes => [];\n  List<McpToolDefinition> get mcpTools => [];\n}\n```\n\n## 1. Categorías de Plugins\n\n### A. Plugins Core (Infraestructura de Sistema)\nProporcionan los cimientos tecnológicos del ecosistema:\n- **`FirestorePlugin` (`lib/plugins/core/database/`):** Implementa `DatabaseService` con soporte de caché persistente offline.\n- **`FirebaseAuthPlugin` (`lib/plugins/core/auth/`):** Implementa `AuthService`, gestión de sesiones, roles y tokens de seguridad.\n- **`ThemePlugin` (`lib/plugins/core/theme/`):** Control del sistema de diseño (Mármol, Grafito y Bronce).\n\n### B. Plugins de Negocio (Feature-First)\nImplementan casos de uso reales del comercio y la distribución:\n- **`OrdersPlugin` (`lib/plugins/business/orders/`):** Toma rápida de pedidos, preventa en ruta, cálculo de tarifas e IVA.\n- **`RoutesPlugin` (`lib/plugins/business/routes/`):** Organización de itinerarios para comerciales y repartidores, optimización de paradas.\n- **`CatalogPlugin` (`lib/plugins/business/catalog/`):** Artículos, familias, stock virtual y tarifas especiales por cliente.\n\n### C. Plugins de Hardware & Periféricos\nAíslan la comunicación con dispositivos físicos de movilidad:\n- **`EscPosPrinterPlugin` (`lib/plugins/hardware/printer/`):** Control de impresoras térmicas portátiles por Bluetooth/USB para expedición de albaranes.\n- **`BarcodeScannerPlugin` (`lib/plugins/hardware/scanner/`):** Lectores láser 1D/2D o cámaras integradas para picking y recepción.\n\n### D. Plugins de Inteligencia Agéntica (AI)\nConectan el ecosistema con agentes autónomos y LLMs:\n- **`McpAgentHarnessPlugin` (`lib/plugins/ai/`):** Agrega las herramientas (`mcpTools`) expuestas por todos los plugins de negocio y levanta el servidor Model Context Protocol.\n- **`LlmWikiPlugin` (`lib/plugins/ai/llm_wiki/`):** Servicio reactivo de base de conocimiento viva para humanos y agentes.\n\n---\n\n### Conceptos Relacionados\n- [[wiki/architecture/microkernel_core]]: El orquestador que gestiona estos complementos.\n- [[wiki/ai/model_context_protocol]]: Cómo los plugins exponen herramientas a la IA.\n- [[wiki/decisions/ADR-001-microkernel-over-clean-monolith]]: Rationale de diseño modular.\n"
    },
    "anti-overengineering": {
      "id": "anti-overengineering",
      "title": "Anti-Overengineering: Cero Infierno de Mappers",
      "slug": "anti_overengineering",
      "category": "Arquitectura",
      "path": "wiki/architecture/anti_overengineering.md",
      "description": "Por qué prohibimos la sobreingeniería dogmática de capas redundantes en favor de un modelo inmutable único.",
      "tags": [
        "anti-overengineering",
        "dart3",
        "freezed",
        "riverpod",
        "firestore",
        "pragmatismo"
      ],
      "last_updated": "2026-09-11",
      "reading_time_min": 4,
      "links": [
        "18-years-lessons",
        "microkernel-core",
        "ADR-002"
      ],
      "body": "# 🚫 Anti-Overengineering: Cero Infierno de Mappers\n\nUna de las patologías más destructivas del desarrollo corporativo contemporáneo es el **dogmatismo de las arquitecturas multicapa** (Clean Architecture mal entendida, DDD de libro):\n\n```\nAPI JSON ➔ DTO ➔ Mapper ➔ Domain Entity ➔ Mapper ➔ Presentation Model ➔ UI State\n```\n\nEn proyectos reales de comercio, esta cadena produce:\n- Cientos de archivos de mapeo manual (`orderDto.toDomain()`, `order.toUiModel()`) donde los campos son idénticos.\n- Una fragilidad extrema: añadir un campo `descuentoEspecial` requiere modificar entre 5 y 8 archivos.\n- Destrucción de la reactividad: `Stream<QuerySnapshot>` se corta para transformar objetos en colecciones estáticas.\n\n## 1. El Enfoque David: Un Solo Modelo Inmutable de Verdad\n\nEn Proyecto David, cada entidad de negocio (ej. `Order`, `Customer`, `Article`) cuenta con **una única definición inmutable en Dart 3**:\n\n```dart\n@freezed\nclass Order with _$Order {\n  const factory Order({\n    required String id,\n    required String customerId,\n    required String customerName,\n    required List<OrderItem> items,\n    required double totalAmount,\n    required OrderStatus status,\n    required DateTime createdAt,\n  }) = _Order;\n\n  factory Order.fromJson(Map<String, dynamic> json) => _$OrderFromJson(json);\n}\n```\n\nEste único modelo satisface todas las necesidades:\n1. **Persistencia Tipada:** Se conecta directamente con Firestore mediante `.withConverter<Order>()`.\n2. **Validación de Negocio:** Incorpora getters y métodos de consistencia funcional.\n3. **Presentación en UI:** Riverpod y los Widgets Flutter consumen directamente la entidad.\n\n## 2. El Repositorio como Única Frontera Reactiva\n\nEl Repositorio no esconde la reactividad de Firebase; la potencia:\n- Expone `Stream<List<Order>>` o `Stream<Order>`.\n- Permite que la caché offline nativa de Firestore fluya directamente al árbol de widgets mediante `ref.watch()`.\n- Cero código pegamento innecesario.\n\n## 3. Manejo Funcional de Errores\n\nProhibido el lanzamiento indiscriminado de excepciones no tipadas (`throw Exception()`). Empleamos tipos explícitos de fallo o uniones etiquetadas:\n\n```dart\ntypedef OrderResult = Result<Order, OrderFailure>;\n```\n\nEsto garantiza que el compilador de Dart 3 verifique en tiempo de desarrollo que todos los estados de error (ej. `StockInsuficiente`, `ClienteBloqueadoPorRiesgo`) han sido gestionados por la UI.\n\n---\n\n### Conceptos Relacionados\n- [[wiki/philosophy/18_years_lessons]]: La experiencia de 18 años contra el código burocrático.\n- [[wiki/architecture/microkernel_core]]: Inyección de repositorios directos en DavidContext.\n- [[wiki/decisions/ADR-002-flutter-firebase-offline-first]]: Firestore y el modelo reactivo.\n"
    },
    "model-context-protocol": {
      "id": "model-context-protocol",
      "title": "Model Context Protocol (MCP) en David",
      "slug": "model_context_protocol",
      "category": "AI & Agentes",
      "path": "wiki/ai/model_context_protocol.md",
      "description": "Estándar abierto para conectar agentes inteligentes (Claude, Gemini, DeepSeek, Ollama) con la operativa de negocio.",
      "tags": [
        "mcp",
        "model-context-protocol",
        "agentes",
        "tools",
        "deepseek-harness",
        "ollama"
      ],
      "last_updated": "2026-09-11",
      "reading_time_min": 4,
      "links": [
        "everything-is-a-plugin",
        "llm-wiki-architecture",
        "ADR-001"
      ],
      "body": "# 🤖 Model Context Protocol (MCP) en David\n\n**Proyecto David** no integra chatbots comerciales aislados. Adopta el **Model Context Protocol (MCP)**, el estándar universal impulsado por la industria para comunicar modelos fundacionales con sistemas de software en producción.\n\n## 1. Cada Plugin Expone Tools y Resources\n\nBajo el contrato `DavidPlugin`, cada módulo declara formalmente sus capacidades mediante `List<McpToolDefinition> get mcpTools`:\n\n```dart\nclass McpToolDefinition {\n  final String name;\n  final String description;\n  final Map<String, dynamic> inputSchema;\n  final Future<McpToolResult> Function(Map<String, dynamic> args) handler;\n\n  const McpToolDefinition({\n    required this.name,\n    required this.description,\n    required this.inputSchema,\n    required this.handler,\n  });\n}\n```\n\n### Ejemplos de Herramientas Expuestas:\n- **`OrdersPlugin`**:\n  - `consultar_pedidos(cliente_id, fecha)`\n  - `crear_pedido_borrador(cliente_id, lineas)`\n  - `emitir_albaran(pedido_id)`\n- **`RoutesPlugin`**:\n  - `obtener_ruta_del_dia(fecha)`\n  - `registrar_entrega(cliente_id, firma)`\n- **`LlmWikiPlugin`**:\n  - `wiki_search(query)`\n  - `wiki_read_page(page_id)`\n\n## 2. El Agnosticismo Total de IA\n\nDavid no está atado a ninguna API privativa ni a OpenAI, Anthropic o Google. Mediante el servidor MCP:\n1. **Modelos en la Nube:** Puede conectarse con Claude 3.5/3.7, Gemini 1.5/2.0 o DeepSeek V3/R1.\n2. **Modelos Locales Privados (Soberanía de Datos):** Puede enlazarse con instancias locales de **Ollama** (Llama 3, Qwen 2.5, DeepSeek R1 Distill) corriendo en el servidor del comercio o en la propia tablet del repartidor, sin enviar ningún dato de clientes a la nube pública.\n\n## 3. Casos de Uso en Producción Real\n\n- **Voz y Operativa en Ruta:** El comercial registra pedidos dictando por voz en lenguaje natural mientras conduce o examina un lineal de productos.\n- **Auditoría Nocturna Autónoma:** Un agente agendado cruza albaranes emitidos contra cobros registrados en caja y alertas bancarias a las 21:00, generando un informe de conciliación sin intervención humana.\n- **Predicción Inteligente de Carga:** El modelo predice la mercancía exacta a cargar en cada furgoneta basándose en historial, estacionalidad y festividades locales.\n\n---\n\n### Conceptos Relacionados\n- [[wiki/architecture/everything_is_a_plugin]]: Los plugins como proveedores de tools MCP.\n- [[wiki/ai/llm_wiki_architecture]]: Cómo los agentes leen y escriben en la base de conocimiento viva.\n- [[wiki/decisions/ADR-001-microkernel-over-clean-monolith]]: Desacoplamiento agéntico.\n"
    },
    "llm-wiki-architecture": {
      "id": "llm-wiki-architecture",
      "title": "Arquitectura LLM-Wiki en Todos los Niveles",
      "slug": "llm_wiki_architecture",
      "category": "AI & Agentes",
      "path": "wiki/ai/llm_wiki_architecture.md",
      "description": "Especificación técnica del sistema de conocimiento vivo bidireccional entre agentes y humanos en Proyecto David.",
      "tags": [
        "llm-wiki",
        "knowledge-base",
        "agentes",
        "grafo",
        "mcp",
        "documentacion"
      ],
      "last_updated": "2026-09-11",
      "reading_time_min": 4,
      "links": [
        "model-context-protocol",
        "microkernel-core",
        "18-years-lessons"
      ],
      "body": "# 🧠 Arquitectura LLM-Wiki en Todos los Niveles\n\nEn los sistemas tradicionales, la documentación es un archivo estático que los desarrolladores olvidan actualizar. En cambio, **LLM-Wiki** convierte el conocimiento del proyecto y del negocio en un **grafo vivo**, editable e indexable tanto por humanos como por agentes de inteligencia artificial.\n\nProyecto David adopta LLM-Wiki en **cuatro niveles progresivos**:\n\n```\n                               ┌────────────────────────────────────────┐\n                               │   NIVEL 4: WEB EXPLORER (docs/)        │\n                               │   - Buscador reactivo en tiempo real   │\n                               │   - Visualizador Markdown interactivo  │\n                               └───────────────────┬────────────────────┘\n                                                   │ Consulta visual\n                               ┌───────────────────▼────────────────────┐\n                               │   NIVEL 1: REPOSITORIO VIVO (wiki/)    │\n                               │   - Páginas atómicas Markdown          │\n                               │   - Metadatos Frontmatter YAML         │\n                               │   - Catálogo formal (catalog.json)     │\n                               └───────────────────┬────────────────────┘\n                                                   │ Ingesta / Indexación\n                               ┌───────────────────▼────────────────────┐\n                               │   NIVEL 2: MICROKERNEL & PLUGINS       │\n                               │   - LlmWikiPlugin en DavidContext      │\n                               │   - KnowledgeService (provide/inject)  │\n                               └───────────────────┬────────────────────┘\n                                                   │ Protocolo universal\n                               ┌───────────────────▼────────────────────┐\n                               │   NIVEL 3: AGENTES & MCP TOOLS         │\n                               │   - wiki_search(query)                 │\n                               │   - wiki_read_page(id)                 │\n                               │   - wiki_update_entry(id, content)     │\n                               └────────────────────────────────────────┘\n```\n\n## Nivel 1: Base de Conocimiento del Repositorio (`wiki/`)\n- Almacenamiento en archivos Markdown planos con frontmatter estructurado.\n- Enlaces de doble vía (`[[wikilink]]`) que construyen una red conceptual.\n- Archivo índice `catalog.json` que permite búsquedas de complejidad \\(O(1)\\) por ID o etiquetas.\n\n## Nivel 2: Microkernel & Bus de Servicios (`LlmWikiPlugin`)\n- Un plugin de infraestructura y AI que expone `WikiKnowledgeService`.\n- Permite a plugins de negocio (ej. `OrdersPlugin`, `RoutesPlugin`) consultar reglas comerciales, notas históricas de clientes o incidentes de reparto directamente desde el código Flutter.\n\n## Nivel 3: Herramientas Agénticas con MCP\n- Herramientas formalizadas para que cualquier LLM (DeepSeek, Claude, Gemini, Ollama) pueda consultar la wiki como memoria de trabajo a largo plazo.\n- Capacidad de síntesis autónoma: al finalizar una ruta o una auditoría, el agente puede generar un resumen estructurado y anexarlo a la wiki.\n\n## Nivel 4: Explorador Interactivo en la Web (`docs/`)\n- Una interfaz visual accesible para desarrolladores, colaboradores y operadores comerciales.\n- Búsqueda reactiva instantánea por texto y etiquetas.\n- Renderizado fiel de la estética clásica y arquitectónica de David (*Mármol, Grafito y Bronce*).\n\n---\n\n### Conceptos Relacionados\n- [[wiki/ai/model_context_protocol]]: Protocolo de comunicación con los agentes.\n- [[wiki/architecture/microkernel_core]]: Inyección del servicio en el núcleo.\n- [[wiki/philosophy/18_years_lessons]]: Conocimiento empírico codificado en la wiki.\n"
    },
    "ADR-001": {
      "id": "ADR-001",
      "title": "ADR-001: Microkernel frente a Monolito Clean/DDD",
      "slug": "ADR-001-microkernel-over-clean-monolith",
      "category": "Decisiones (ADRs)",
      "path": "wiki/decisions/ADR-001-microkernel-over-clean-monolith.md",
      "description": "Decisión de adoptar el microkernel 'Everything is a Plugin' en lugar de estructuras monolíticas multicapa tradicionales.",
      "tags": [
        "adr",
        "arquitectura",
        "microkernel",
        "clean-architecture",
        "desacoplamiento"
      ],
      "last_updated": "2026-09-11",
      "reading_time_min": 3,
      "links": [
        "microkernel-core",
        "everything-is-a-plugin"
      ],
      "body": "# 🏛️ ADR-001: Arquitectura Microkernel frente a Monolito Clean/DDD\n\n## Estado\n**Aceptado** (2026-09-11)\n\n## Contexto\nEn los proyectos de gestión comercial y distribución de gran escala, la evolución del software durante años suele degenerar en dos trampas habituales:\n1. **Monolito de espagueti:** Código acoplado donde modificar la lógica de pedidos rompe facturación o clientes.\n2. **Clean Architecture dogmática:** Proyectos con 6 capas de abstracción donde el 70% del tiempo de desarrollo se gasta escribiendo mappers y adaptadores redundantes, destruyendo la agilidad y la reactividad.\n\n## Decisión\nAdoptamos una **Arquitectura Microkernel (\"Everything is a Plugin\")**, inspirada en los frameworks agénticos más modernos (**DeepSeek Harness** y **Cordis**):\n1. El núcleo (`DavidContext`) sólo gestiona el registro de dependencias (`ctx.provide` / `ctx.inject`) y el ciclo de vida de los plugins.\n2. Cada capacidad (base de datos, autenticación, pedidos, rutas, impresión térmica, servidor MCP) es un plugin aislado (`DavidPlugin`).\n3. La comunicación entre módulos se realiza exclusivamente mediante contratos abstractos inyectados en el contexto.\n\n## Consecuencias\n\n### Positivas\n- **Modularidad Radical:** Un cliente que no utilice furgonetas de reparto simplemente no carga `RoutesPlugin` ni `EscPosPrinterPlugin`.\n- **Evolución Aislada:** Modificar un plugin no tiene efectos secundarios sobre los demás.\n- **Preparado para IA:** Cada plugin expone formalmente sus herramientas MCP (`mcpTools`) sin necesidad de reescribir la lógica de presentación.\n\n### Negativas / Mitigaciones\n- Requiere disciplina para no importar clases concretas entre carpetas de plugins (se mitiga mediante linting y contratos de interfaz en `DavidContext`).\n"
    },
    "ADR-002": {
      "id": "ADR-002",
      "title": "ADR-002: Flutter y Firebase con Offline-First",
      "slug": "ADR-002-flutter-firebase-offline-first",
      "category": "Decisiones (ADRs)",
      "path": "wiki/decisions/ADR-002-flutter-firebase-offline-first.md",
      "description": "Decisión tecnológica de frontend unificado con Flutter y backend reactivo sin servidores con Firestore Offline-First.",
      "tags": [
        "adr",
        "flutter",
        "firebase",
        "firestore",
        "offline-first",
        "riverpod"
      ],
      "last_updated": "2026-09-11",
      "reading_time_min": 3,
      "links": [
        "anti-overengineering",
        "18-years-lessons"
      ],
      "body": "# 📱 ADR-002: Flutter y Firebase con Estrategia Offline-First\n\n## Estado\n**Aceptado** (2026-09-11)\n\n## Contexto\nEl software comercial y de movilidad (preventa, autoventa, almacén) opera en condiciones hostiles: sótanos de tiendas sin señal, trayectos de carretera sin cobertura y paradas de reparto donde el operador no puede esperar 3 segundos a una petición HTTP.\n\nAsimismo, mantener infraestructura propia de backend (servidores VPS, bases de datos SQL relacionales, balanceadores, APIs REST) consume la mayor parte del presupuesto y tiempo de mantenimiento del equipo de ingeniería.\n\n## Decisión\n1. **Frontend con Flutter:** Una única base de código nativa de alto rendimiento visual (60/120 fps) compilable para Android, iOS, escritorio y web.\n2. **Backend con Cloud Firestore:** Empleo de Firestore como base de datos NoSQL reactiva, delegando la gestión de escalabilidad, réplicas y autenticación en la nube.\n3. **Persistencia Offline Nativa:** Se habilita obligatoriamente `cacheSettings: const PersistentCacheSettings()` en Firestore. La aplicación lee y escribe inmediatamente en la base de datos local y sincroniza en segundo plano cuando la conectividad lo permite.\n4. **Tipado Estricto con `withConverter`:** Prohibido el acceso no tipado a `Map<String, dynamic>` en capas superiores; cada colección se vincula con un modelo Dart 3 inmutable.\n\n## Consecuencias\n\n### Positivas\n- **Latencia Cero (0 ms):** El operador interactúa de inmediato con la UI; nunca aparece un spinner bloqueante esperando a la red.\n- **Zero DevOps:** Sin servidores que monitorizar ni parches de kernel a medianoche.\n- **Reactividad Real:** Los cambios en Firestore se reflejan en tiempo real en los widgets mediante streams de Riverpod.\n\n### Negativas / Mitigaciones\n- Posibles conflictos de concurrencia en escrituras simultáneas desconectadas (se mitiga mediante modelos de datos aditivos y marcas de tiempo lógicas o transacciones atómicas).\n"
    }
  }
};
