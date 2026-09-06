# Proyecto David

<p align="center">
  <img src="./assets/david_banner.jpg" alt="David - Ecosistema de Innovación" width="100%">
</p>

> **Un ecosistema modular, reactivo y vivo para la gestión de negocio.**  
> Construido con **Flutter** y **Firebase**, fundado sobre 18 años de lecciones en software de producción real.

[![Licencia](https://img.shields.io/badge/Licencia-AGPL_v3-blue.svg)](LICENSE)
[![Framework: Flutter](https://img.shields.io/badge/Framework-Flutter-02569B?logo=flutter&logoColor=white)](https://flutter.dev)
[![Backend: Firebase](https://img.shields.io/badge/Backend-Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![Arquitectura: Microkernel](https://img.shields.io/badge/Arquitectura-Microkernel_%22Everything_is_a_Plugin%22-success.svg)]()
[![Patrón: Cordis / Harness](https://img.shields.io/badge/Patr%C3%B3n-Cordis_%2F_Harness_Inspired-purple.svg)]()

---

## 💡 La Filosofía: 18 Años de Producción en una Sola Idea

Hace 18 años inicié el desarrollo de una aplicación comercial y de pedidos (*Rutero*). Contra todo pronóstico del ciclo vital habitual del software, **sigue hoy en producción**, funcionando a diario y siendo, sin lugar a dudas, la aplicación más exitosa que he programado.

Casi dos décadas manteniendo software en las trincheras del día a día te enseñan algo que ningún libro de teoría explica:

> **El software no debe diseñarse como un monumento de piedra, sino como un organismo vivo.**

Los grandes proyectos fallan porque intentan predecir desde el día uno todo lo que el negocio necesitará dentro de cinco años. Se encierran en arquitecturas monolíticas, requisitos rígidos y sobreingeniería que terminan colapsando bajo su propio peso.

**David nace con la premisa contraria:**
No es prioritario definir hoy qué hace exactamente cada módulo ni encasillar la herramienta en una categoría fija (preventa, catálogo, facturación o almacén). **Lo verdaderamente importante es el ecosistema completo**: una estructura limpia, flexible y desacoplada capaz de ir alumbrando módulos a medida que las necesidades reales del negocio lo exijan, adaptándose en cada momento sin romper el conjunto.

---

## 🛠️ Las Decisiones Técnicas (Y por qué son las correctas)

Quiero que quien clone este repositorio o decida colaborar entienda perfectamente el porqué de cada elección. No hay modas aquí; hay pragmatismo destilado tras muchos años de experiencia:

### 1. ¿Por qué Flutter?
- **Una sola base de código, sin fisuras:** Tras años lidiando con la fragmentación de plataformas, rehacer interfaces para cada sistema operativo es inviable. Flutter nos da compilación nativa en Android, iOS, escritorio y web desde un único árbol de código.
- **Rendimiento visual a 60/120 fps:** El control directo del lienzo (*canvas*) elimina los cuellos de botella de los puentes webview o híbridos lentos.
- **Modularidad de Widgets y Paquetes:** La arquitectura de Flutter permite empaquetar funcionalidades completas en paquetes o módulos independientes con ciclos de vida propios.

### 2. ¿Por qué Firebase?
- **El coste invisible de la infraestructura:** Mantener servidores propios, balanceadores, APIs REST tradicionales y bases de datos relacionales con procesos de sincronización manual consume el 80% del tiempo de un desarrollador.
- **Persistencia Offline y Reactividad Real:** Con Firestore obtenemos sincronización reactiva en tiempo real y persistencia local sin tener que reinventar el motor de sincronización.
- **Zero DevOps inicial:** Autenticación robusta, almacenamiento seguro y lógica de backend mediante Cloud Functions sin fricción de despliegue ni servidores que rescatar de madrugada. Nos permite poner el 100% del foco en el negocio.

### 3. ¿Por qué Código Abierto (Open Source)?
- El software cerrado muere con su autor o queda atrapado en los límites de su empresa.
- El objetivo de David es **superar el éxito de su predecesor**, y la única vía para lograrlo es el procomún: abrir las puertas para que desarrolladores, integradores y negocios de todo el mundo puedan adoptar el ecosistema, crear módulos adaptados a sus realidades y enriquecer el núcleo común.
- **Queremos que David sea tan bueno que hasta nuestros clientes y nuestros rivales quieran utilizarlo.**

---

## 🧩 Arquitectura Microkernel: "Todo es un Plugin"

Inspirado en el diseño de microkernel de frameworks agénticos de última generación como **DeepSeek Harness** y el sistema **Cordis**, Proyecto David adopta un principio fundamental: **"Everything is a Plugin" (Todo es un Plugin)**.

David no es una aplicación monolítica con pantallas acopladas; es un **Kernel extensible** que orquesta plugins independientes, altamente cohesivos y desacoplados:

```
                              ┌────────────────────────────────────────┐
                              │           DAVID MICROKERNEL            │
                              │             (DavidContext)             │
                              │  - Bus de Servicios (provide/inject)   │
                              │  - Ciclo de Vida (load/ready/destroy)  │
                              │  - Enrutador y Shell UI Unificado      │
                              └───────────────────┬────────────────────┘
                                                  │
         ┌───────────────────────┬────────────────┼───────────────────────┬───────────────────────┐
         ▼                       ▼                ▼                       ▼                       ▼
  ┌──────────────┐        ┌──────────────┐ ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
  │ Core Plugins │        │ Negocio      │ │ Negocio      │        │ Hardware     │        │ AI Copilot   │
  │ - Firebase   │        │ - Pedidos    │ │ - Catálogo   │        │ - Impresoras │        │ - Agent      │
  │ - Auth       │        │ - Rutas      │ │ - Clientes   │        │   ESC/POS    │        │   Harness    │
  │ - Theme      │        │ - Cobros     │ │ - Stock      │        │ - Lectores 2D│        │   (Skills)   │
  └──────────────┘        └──────────────┘ └──────────────┘        └──────────────┘        └──────────────┘
```

### Los 4 Pilares del Modelo Microkernel:
1. **El Núcleo Mínimo (`DavidContext`):** No contiene lógica de negocio ni vistas específicas. Su única misión es gestionar el registro de plugins, resolver dependencias entre ellos mediante inyección (`ctx.provide` / `ctx.inject`) y ofrecer el contenedor de navegación.
2. **Servicios de Infraestructura como Plugins Intercambiables:** La base de datos no está soldada al código. `FirestorePlugin` provee el servicio de almacenamiento con persistencia offline. Si en el futuro un entorno requiere `SqlitePlugin` o `SupabasePlugin`, se reemplaza el complemento sin tocar ni una sola línea de los módulos de negocio.
3. **Módulos de Negocio Autocontenidos:** Cada necesidad (pedidos rápidos, cobros, albaranes, stock en furgoneta) se añade como un plugin independiente. Si un comercio no necesita repartos, simplemente no activa el plugin de rutas.
4. **Capa Agéntica Nativa (AI Agent Harness Ready):** Cada plugin de negocio no solo expone vistas para humanos, sino también **Herramientas y Habilidades (*Skills/Tools*)** tipadas. Esto permite que un agente de IA autónomo (integrado mediante arneses como DeepSeek Harness) pueda interactuar de forma nativa con el estado del negocio: sugerir pedidos, auditar inventario o alertar sobre riesgos en lenguaje natural.

---

## 🧭 Principios de Desarrollo

- **Pragmatismo sobre Dogma:** La mejor solución técnica es la más sencilla que resuelva el problema de forma elegante y mantenible.
- **Diseño Orientado al Usuario Real:** Si una pantalla requiere más de tres toques para una acción habitual, el diseño está mal. La velocidad de uso manda.
- **Evolución Orgánica:** No programamos para "lo que podría pasar dentro de dos años"; programamos cimientos sólidos para lo que se necesita hoy, con la flexibilidad para crecer mañana.

---

## 🤝 Cómo Formar Parte de Este Proyecto

David está en su fase de génesis. Si te atrae la idea de construir una plataforma de gestión modular moderna, libre y pensada para durar décadas:

- **Aporta al Núcleo:** Ayuda a definir el microkernel y la gestión de ciclo de vida con Flutter + Firebase.
- **Desarrolla un Plugin:** ¿Tu negocio necesita una funcionalidad concreta? Constrúyela como un `DavidPlugin` y compártela con la comunidad.
- **Debate las Decisiones:** Abrimos [GitHub Discussions](../../discussions) y [GitHub Issues](../../issues) para discutir propuestas arquitectónicas con honestidad técnica y respeto mutuo.

---

## 🚀 Prompt Génesis de Desarrollo (Instrucciones para Agentes y Desarrolladores)

Para asegurar que cualquier desarrollador o agente de IA inicialice y extienda el código de **David** bajo los más altos estándares de la industria y la arquitectura de microkernel más robusta posible, se establece el siguiente **Prompt Maestro de Desarrollo**:

````markdown
# SYSTEM PROMPT: INGENIERO PRINCIPAL - PROYECTO DAVID

Actúa como un **Ingeniero de Software Principal y Arquitecto de Soluciones Senior** con más de 15 años de experiencia liderando proyectos de producción crítica con **Flutter** y **Firebase**, experto en arquitecturas **Microkernel ("Everything is a Plugin")**.

Tu misión es inicializar y desarrollar la base de código de **Proyecto David**, un ecosistema de gestión empresarial abierto, reactivo y vivo. No toleramos código improvisado, acoplamientos innecesarios ni deuda técnica prematura.

---

### 🏛️ 1. Arquitectura de Referencia: Microkernel ("Everything is a Plugin")

El sistema se estructura en un núcleo orquestador mínimo (`kernel/`) y complementos desacoplados (`plugins/`):

```
lib/
├── kernel/                         # Microkernel (Contexto y Bus de Servicios)
│   ├── david_context.dart          # Contenedor de inyección (provide / inject)
│   ├── david_plugin.dart           # Contrato e interfaz base de todo Plugin
│   ├── plugin_registry.dart        # Gestor del ciclo de vida (load, ready, destroy)
│   └── app_shell.dart              # Shell de navegación agregada y temas
│
├── plugins/                        # Todo en David es un Plugin
│   ├── core/                       # Plugins de Sistema e Infraestructura
│   │   ├── auth/                   # FirebaseAuthPlugin (implementa AuthService)
│   │   └── database/               # FirestorePlugin (implementa DatabaseService con cache offline)
│   │
│   ├── business/                   # Plugins de Negocio (Clean Architecture interna)
│   │   ├── orders/                 # Plugin de toma de pedidos
│   │   │   ├── domain/             # Entidades y contratos abstractos (Puro Dart)
│   │   │   ├── data/               # Modelos Firestore tipados (.withConverter)
│   │   │   └── presentation/       # Vistas Flutter y Notifiers Riverpod
│   │   └── [nuevo_plugin]/         # Nuevos módulos bajo demanda
│   │
│   ├── hardware/                   # Plugins de Periféricos (Impresión ESC/POS, escáneres)
│   └── ai/                         # Plugins de IA (Agente Copiloto / Tools para Agent Harness)
│
└── main.dart                       # Inicialización del Kernel, carga de plugins y runApp()
```

---

### ⚙️ 2. Contrato Obligatorio del Plugin (`DavidPlugin`)

Todo módulo debe implementar el ciclo de vida del microkernel:

```dart
abstract class DavidPlugin {
  String get id;
  String get name;
  List<Type> get dependencies => [];

  /// Fase 1: Registro de servicios en el contexto (ctx.provide<T>())
  Future<void> onLoad(DavidContext ctx) async {}

  /// Fase 2: Servicios de terceros listos; suscripción a eventos y rutas UI
  Future<void> onReady(DavidContext ctx) async {}

  /// Fase 3: Liberación de recursos
  Future<void> onDestroy(DavidContext ctx) async {}

  /// Rutas de navegación expuestas por el plugin al Shell central
  List<RouteBase> get routes => [];

  /// Herramientas/Skills expuestas a agentes de IA (Agent Harness)
  List<AgentTool> get agentTools => [];
}
```

---

### ⚙️ 3. Reglas Técnicas y Mejores Prácticas Obligatorias

1. **Gestión de Estado Reactiva:**
   - Utiliza exclusivamente **Riverpod 2.x** (`Notifier` / `AsyncNotifier`).
   - Cero lógica de negocio o llamadas directas a Firestore dentro de los `StatefulWidget` o `build()`.
   - Optimiza las reconstrucciones de widgets mediante `ref.watch(provider.select(...))`.

2. **Cloud Firestore y Persistencia Offline:**
   - Habilita de forma explícita la persistencia offline de Firestore (`cacheSettings: const PersistentCacheSettings()`).
   - Obligatorio: Emplea siempre `withConverter<T>` en cada colección y documento para garantizar tipado estricto en tiempo de compilación.
   - Trata la red como intermitente: el flujo de datos debe responder reactivamente desde la caché local y sincronizar en segundo plano.

3. **Inyección y Comunicación entre Plugins:**
   - Los plugins se comunican mediante contratos abstractos registrados en el `DavidContext` (`ctx.inject<DatabaseService>()`), nunca mediante importaciones directas de implementaciones concretas.

4. **Calidad de Código y Tipado Estricto:**
   - Código Dart 3 moderno: usa records, pattern matching y clases inmutables.
   - Prohibido el uso de `dynamic` salvo en límites de deserialización estrictamente aislados.
   - Manejo funcional de errores mediante tipos explícitos (ej. `Result<T, AppFailure>` o `fpdart`), evitando excepciones silenciosas o no tipadas.
   - Modularidad atómica: divide widgets grandes en componentes pequeños, reutilizables y comprobables.

---

### 🧪 4. Estrategia de Testing y Calidad
- Cada plugin debe contar con tests unitarios para su capa de dominio y tests de integración con un mock de `DavidContext`.
- Las vistas de presentación deben ser testeables sin necesidad de emulador físico (`testWidgets`).

Genera siempre código limpio, autodocumentado en español, listo para producción y estructurado para ser leído y ampliado por una comunidad global.
````

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **GNU Affero General Public License v3.0 (AGPLv3)** para garantizar que cualquier extensión del núcleo permanezca siempre libre y en manos de la comunidad.

---

<p align="center">
  <b>David</b> — <i>Un ecosistema vivo. Nacido de la experiencia, abierto al futuro.</i>
</p>
