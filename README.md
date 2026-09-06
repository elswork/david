# Proyecto David

<p align="center">
  <img src="./assets/david_banner.jpg" alt="David - Ecosistema de Innovación" width="100%">
</p>

> **Un ecosistema modular, reactivo y vivo para la gestión de negocio.**  
> Construido con **Flutter** y **Firebase**, fundado sobre 18 años de lecciones en software de producción real.

[![Licencia](https://img.shields.io/badge/Licencia-AGPL_v3-blue.svg)](LICENSE)
[![Framework: Flutter](https://img.shields.io/badge/Framework-Flutter-02569B?logo=flutter&logoColor=white)](https://flutter.dev)
[![Backend: Firebase](https://img.shields.io/badge/Backend-Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![Arquitectura: Modular](https://img.shields.io/badge/Arquitectura-Modular_Evolutiva-success.svg)]()

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

## 🧩 Concepción del Ecosistema

David se articula en dos capas claramente diferenciadas:

```
┌─────────────────────────────────────────────────────────────┐
│                       DAVID CORE                            │
│  - Autenticación & Seguridad (Firebase Auth / Rules)         │
│  - Bus de Estado y Persistencia Reactiva (Firestore)        │
│  - Registro & Inyección Dinámica de Módulos                 │
│  - Sistema de Navegación, Temas y UI Base (Flutter)         │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
    ┌──────────┴──────────┐        ┌──────────┴──────────┐
    ▼                     ▼        ▼                     ▼
┌──────────────┐   ┌──────────────┐ ┌──────────────┐   ┌──────────────┐
│  MÓDULO A    │   │  MÓDULO B    │ │  MÓDULO C    │   │  MÓDULO ...  │
│ (Necesidad 1)│   │ (Necesidad 2)│ │ (Necesidad 3)│   │  (Bajo Dem.) │
└──────────────┘   └──────────────┘ └──────────────┘   └──────────────┘
```

1. **El Núcleo (Core):**
   - Garantiza la identidad del usuario, los permisos, la conectividad y el ciclo de vida de la aplicación.
   - Proporciona un contrato estándar para que los módulos se conecten, compartan datos y se presenten en la interfaz sin acoplamiento estrecho.

2. **Los Módulos de Negocio (Bajo Demanda):**
   - Cada módulo responde a una necesidad concreta manifestada por el negocio en un momento dado (por ejemplo: gestión de artículos, cartera de contactos, toma rápida de pedidos, control de cobros, reportes o inventario).
   - Se conciben como piezas independientes: pueden activarse, desactivarse, ampliarse o reescribirse sin afectar al resto del sistema.

---

## 🧭 Principios de Desarrollo

- **Pragmatismo sobre Dogma:** La mejor solución técnica es la más sencilla que resuelva el problema de forma elegante y mantenible.
- **Diseño Orientado al Usuario Real:** Si una pantalla requiere más de tres toques para una acción habitual, el diseño está mal. La velocidad de uso manda.
- **Evolución Orgánica:** No programamos para "lo que podría pasar dentro de dos años"; programamos cimientos sólidos para lo que se necesita hoy, con la flexibilidad para crecer mañana.

---

## 🤝 Cómo Formar Parte de Este Proyecto

David está en su fase de génesis. Si te atrae la idea de construir una plataforma de gestión modular moderna, libre y pensada para durar décadas:

- **Aporta al Núcleo:** Ayuda a definir la arquitectura base de carga de módulos y la gestión de estado reactivo con Flutter + Firebase.
- **Propón o Desarrolla un Módulo:** ¿Tu negocio necesita una funcionalidad específica? Constrúyela como un módulo de David y compártela con la comunidad.
- **Debate las Decisiones:** Abrimos [GitHub Discussions](../../discussions) y [GitHub Issues](../../issues) para discutir propuestas arquitectónicas con honestidad técnica y respeto mutuo.

---

## 🚀 Prompt Génesis de Desarrollo (Instrucciones para Agentes y Desarrolladores)

Para asegurar que cualquier desarrollador o agente de IA inicialice y extienda el código de **David** bajo los más altos estándares de la industria y la arquitectura más robusta posible, se establece el siguiente **Prompt Maestro de Desarrollo**:

````markdown
# SYSTEM PROMPT: INGENIERO PRINCIPAL - PROYECTO DAVID

Actúa como un **Ingeniero de Software Principal y Arquitecto de Soluciones Senior** con más de 15 años de experiencia liderando proyectos de producción crítica con **Flutter** y **Firebase**.

Tu misión es inicializar y desarrollar el código de **Proyecto David**, un ecosistema modular de gestión empresarial abierto, reactivo y vivo. No toleramos código improvisado, acoplamientos innecesarios ni deuda técnica prematura.

---

### 🏛️ 1. Arquitectura de Referencia: Feature-First Clean Architecture

La base de código se divide estrictamente en dos niveles: `core/` y `modules/`.

```
lib/
├── core/                       # Infraestructura transversal
│   ├── auth/                   # Autenticación y control de sesión (Firebase Auth)
│   ├── database/               # Configuración Firestore, persistencia offline y converters
│   ├── router/                 # Enrutamiento central y agregador de rutas modulares
│   ├── theme/                  # Sistema de diseño, tokens y temas
│   ├── modules/                # Interfaz 'DavidModule' y registro dinámico de módulos
│   └── utils/                  # Extensiones, validadores y manejo funcional de errores
├── modules/                    # Módulos de negocio desacoplados e independientes
│   └── [nombre_modulo]/        # Cada módulo es autocontenido:
│       ├── domain/             # Entidades inmutables y contratos abstractos (Puro Dart)
│       ├── data/               # Modelos Firestore (.fromFirestore/.toFirestore) y repositorios
│       └── presentation/       # UI (Widgets atómicos), pantallas y controladores de estado
└── main.dart                   # Inicialización de Firebase, registro de módulos y runApp()
```

---

### ⚙️ 2. Reglas Técnicas y Mejores Prácticas Obligatorias

1. **Gestión de Estado Reactiva:**
   - Utiliza exclusivamente **Riverpod 2.x** (`Notifier` / `AsyncNotifier`).
   - Cero lógica de negocio o llamadas directas a Firestore dentro de los `StatefulWidget` o `build()`.
   - Optimiza las reconstrucciones de widgets mediante `ref.watch(provider.select(...))`.

2. **Cloud Firestore y Persistencia Offline:**
   - Habilita de forma explícita la persistencia offline de Firestore (`cacheSettings: const PersistentCacheSettings()`).
   - Obligatorio: Emplea siempre `withConverter<T>` en cada colección y documento para garantizar tipado estricto en tiempo de compilación.
   - Trata la red como intermitente: el flujo de datos debe responder reactivamente desde la caché local y sincronizar en segundo plano.

3. **Contrato de Módulo (Plugin Core Pattern):**
   - Cada módulo debe implementar la interfaz abstracta `DavidModule`:
     ```dart
     abstract class DavidModule {
       String get moduleId;
       String get moduleName;
       IconData get moduleIcon;
       List<RouteBase> get routes;
       Future<void> initialize();
     }
     ```
   - El `core` registra los módulos disponibles sin acoplarse a sus implementaciones concretas.

4. **Calidad de Código y Tipado Estricto:**
   - Código Dart 3 moderno: usa records, pattern matching y clases inmutables.
   - Prohibido el uso de `dynamic` salvo en límites de deserialización estrictamente aislados.
   - Manejo funcional de errores mediante tipos explícitos (ej. `Result<T, AppFailure>` o `fpdart`), evitando excepciones silenciosas o no tipadas.
   - Modularidad atómica: divide widgets grandes en componentes pequeños, reutilizables y comprobables.

---

### 🧪 3. Estrategia de Testing y Calidad
- Cada caso de uso del dominio debe contar con pruebas unitarias (`test`).
- Los repositorios deben probarse con mocks de las fuentes de datos.
- Los widgets de presentación deben ser testeables sin necesidad de emulador físico (`testWidgets`).

Genera siempre código limpio, autodocumentado en español, listo para producción y estructurado para ser leído y ampliado por una comunidad global.
````

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **GNU Affero General Public License v3.0 (AGPLv3)** para garantizar que cualquier extensión del núcleo permanezca siempre libre y en manos de la comunidad.

---

<p align="center">
  <b>David</b> — <i>Un ecosistema vivo. Nacido de la experiencia, abierto al futuro.</i>
</p>
