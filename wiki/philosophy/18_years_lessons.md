---
id: 18-years-lessons
title: "18 Años en Producción: Lecciones de Trinchera"
description: "Por qué el software debe ser un organismo vivo y no un monumento de piedra. Principios anti-fragilidad."
category: "Filosofía"
tags: ["filosofia", "produccion", "rutero", "resiliencia", "lecciones"]
last_updated: "2026-09-11"
version: "1.0.0"
---

# 🛡️ 18 Años en Producción: Lecciones de Trinchera

> *"El software no debe diseñarse como un monumento de piedra, sino como un organismo vivo."*

En 2008 comenzó el desarrollo de una herramienta comercial y de pedidos (*Rutero*). Contra todo pronóstico del ciclo vital habitual del software empresarial, **continúa hoy en producción diaria real**, procesando pedidos, facturación y cobros para decenas de rutas comerciales.

## 1. El Mito del Requisito Anticipado

Los grandes proyectos de software rara vez fracasan por falta de tecnología; fracasan porque intentan adivinar el futuro:
- Diseñar hoy lo que el cliente *podría* necesitar dentro de 5 años conduce a abstracciones prematuras y código muerto.
- El software debe nacer con los cimientos justos para el presente y las juntas de dilatación necesarias para crecer mañana.
- **Proyecto David** adopta esta premisa: no categorizamos el sistema como "solo preventa" o "solo ERP". Es un **Microkernel** que alumbra plugins conforme el negocio los pide.

## 2. La Hostilidad del Mundo Real

En un laboratorio de pruebas, la red es Gigabit y el usuario tiene tiempo ilimitado. En una furgoneta de reparto a las 7:00 AM:
- La cobertura móvil desaparece en sótanos, polígonos industriales y carreteras de montaña.
- El operador tiene prisa y las manos ocupadas.
- **Regla de Oro:** Tratamos la conexión a internet como un accidente feliz. La aplicación debe ser **Offline-First** por diseño, respondiendo en 0 ms desde memoria/caché local y sincronizando en segundo plano cuando la red regrese.

## 3. La Regla de los Tres Toques

Cualquier acción comercial recurrente (tomar nota de 3 cajas de un producto habitual, consultar deuda pendiente, imprimir albarán) debe resolverse en **máximo 3 toques en pantalla**. Si una interfaz exige navegar 5 submenús, el software será abandonado por los usuarios en favor del lápiz y el papel.

## 4. Anti-Overengineering (Anti-Burocracia de Código)

A lo largo de 18 años, el software que sobrevive es el que se puede leer y corregir en 10 minutos durante una emergencia:
- Rechazamos el dogmatismo académico de mapear 4 capas de objetos idénticos (`Dto`, `Entity`, `DomainModel`, `UiState`).
- Un único modelo inmutable y fuertemente tipado en Dart 3 es suficiente para la base de datos, las reglas de negocio y los widgets.

---

### Conceptos Relacionados
- [[wiki/architecture/microkernel_core]]: Cómo el Microkernel materializa esta filosofía modular.
- [[wiki/architecture/anti_overengineering]]: Reglas pragmáticas de arquitectura de código.
- [[wiki/decisions/ADR-001-microkernel-over-clean-monolith]]: Comparativa arquitectónica.
