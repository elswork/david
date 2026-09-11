---
id: ADR-002
title: "ADR-002: Flutter y Firebase con Estrategia Offline-First"
description: "Decisión tecnológica de frontend unificado con Flutter y backend reactivo sin servidores con Firestore Offline-First."
category: "Decisiones (ADRs)"
tags: ["adr", "flutter", "firebase", "firestore", "offline-first", "riverpod"]
last_updated: "2026-09-11"
status: "Aceptado"
version: "1.0.0"
---

# 📱 ADR-002: Flutter y Firebase con Estrategia Offline-First

## Estado
**Aceptado** (2026-09-11)

## Contexto
El software comercial y de movilidad (preventa, autoventa, almacén) opera en condiciones hostiles: sótanos de tiendas sin señal, trayectos de carretera sin cobertura y paradas de reparto donde el operador no puede esperar 3 segundos a una petición HTTP.

Asimismo, mantener infraestructura propia de backend (servidores VPS, bases de datos SQL relacionales, balanceadores, APIs REST) consume la mayor parte del presupuesto y tiempo de mantenimiento del equipo de ingeniería.

## Decisión
1. **Frontend con Flutter:** Una única base de código nativa de alto rendimiento visual (60/120 fps) compilable para Android, iOS, escritorio y web.
2. **Backend con Cloud Firestore:** Empleo de Firestore como base de datos NoSQL reactiva, delegando la gestión de escalabilidad, réplicas y autenticación en la nube.
3. **Persistencia Offline Nativa:** Se habilita obligatoriamente `cacheSettings: const PersistentCacheSettings()` en Firestore. La aplicación lee y escribe inmediatamente en la base de datos local y sincroniza en segundo plano cuando la conectividad lo permite.
4. **Tipado Estricto con `withConverter`:** Prohibido el acceso no tipado a `Map<String, dynamic>` en capas superiores; cada colección se vincula con un modelo Dart 3 inmutable.

## Consecuencias

### Positivas
- **Latencia Cero (0 ms):** El operador interactúa de inmediato con la UI; nunca aparece un spinner bloqueante esperando a la red.
- **Zero DevOps:** Sin servidores que monitorizar ni parches de kernel a medianoche.
- **Reactividad Real:** Los cambios en Firestore se reflejan en tiempo real en los widgets mediante streams de Riverpod.

### Negativas / Mitigaciones
- Posibles conflictos de concurrencia en escrituras simultáneas desconectadas (se mitiga mediante modelos de datos aditivos y marcas de tiempo lógicas o transacciones atómicas).
