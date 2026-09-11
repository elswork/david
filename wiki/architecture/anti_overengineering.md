---
id: anti-overengineering
title: "Anti-Overengineering: Cero Infierno de Mappers"
description: "Por qué prohibimos la sobreingeniería dogmática de capas redundantes en favor de un modelo inmutable único."
category: "Arquitectura"
tags: ["anti-overengineering", "dart3", "freezed", "riverpod", "firestore", "pragmatismo"]
last_updated: "2026-09-11"
version: "1.0.0"
---

# 🚫 Anti-Overengineering: Cero Infierno de Mappers

Una de las patologías más destructivas del desarrollo corporativo contemporáneo es el **dogmatismo de las arquitecturas multicapa** (Clean Architecture mal entendida, DDD de libro):

```
API JSON ➔ DTO ➔ Mapper ➔ Domain Entity ➔ Mapper ➔ Presentation Model ➔ UI State
```

En proyectos reales de comercio, esta cadena produce:
- Cientos de archivos de mapeo manual (`orderDto.toDomain()`, `order.toUiModel()`) donde los campos son idénticos.
- Una fragilidad extrema: añadir un campo `descuentoEspecial` requiere modificar entre 5 y 8 archivos.
- Destrucción de la reactividad: `Stream<QuerySnapshot>` se corta para transformar objetos en colecciones estáticas.

## 1. El Enfoque David: Un Solo Modelo Inmutable de Verdad

En Proyecto David, cada entidad de negocio (ej. `Order`, `Customer`, `Article`) cuenta con **una única definición inmutable en Dart 3**:

```dart
@freezed
class Order with _$Order {
  const factory Order({
    required String id,
    required String customerId,
    required String customerName,
    required List<OrderItem> items,
    required double totalAmount,
    required OrderStatus status,
    required DateTime createdAt,
  }) = _Order;

  factory Order.fromJson(Map<String, dynamic> json) => _$OrderFromJson(json);
}
```

Este único modelo satisface todas las necesidades:
1. **Persistencia Tipada:** Se conecta directamente con Firestore mediante `.withConverter<Order>()`.
2. **Validación de Negocio:** Incorpora getters y métodos de consistencia funcional.
3. **Presentación en UI:** Riverpod y los Widgets Flutter consumen directamente la entidad.

## 2. El Repositorio como Única Frontera Reactiva

El Repositorio no esconde la reactividad de Firebase; la potencia:
- Expone `Stream<List<Order>>` o `Stream<Order>`.
- Permite que la caché offline nativa de Firestore fluya directamente al árbol de widgets mediante `ref.watch()`.
- Cero código pegamento innecesario.

## 3. Manejo Funcional de Errores

Prohibido el lanzamiento indiscriminado de excepciones no tipadas (`throw Exception()`). Empleamos tipos explícitos de fallo o uniones etiquetadas:

```dart
typedef OrderResult = Result<Order, OrderFailure>;
```

Esto garantiza que el compilador de Dart 3 verifique en tiempo de desarrollo que todos los estados de error (ej. `StockInsuficiente`, `ClienteBloqueadoPorRiesgo`) han sido gestionados por la UI.

---

### Conceptos Relacionados
- [[wiki/philosophy/18_years_lessons]]: La experiencia de 18 años contra el código burocrático.
- [[wiki/architecture/microkernel_core]]: Inyección de repositorios directos en DavidContext.
- [[wiki/decisions/ADR-002-flutter-firebase-offline-first]]: Firestore y el modelo reactivo.
