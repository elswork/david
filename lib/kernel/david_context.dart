/// Contenedor de Inyección de Dependencias y Bus de Servicios del Microkernel de David.
///
/// Permite registrar contratos (`provide<T>`), resolver dependencias desacopladas (`inject<T>`),
/// y comprobar disponibilidad en tiempo de ejecución (`has<T>`).
class DavidContext {
  final Map<Type, Object> _services = <Type, Object>{};

  /// Registra una implementación concreta bajo un contrato abstracto o tipo [T].
  ///
  /// Si ya existía un servicio para [T], este será reemplazado.
  void provide<T extends Object>(T service) {
    _services[T] = service;
  }

  /// Recupera la instancia registrada para el tipo [T].
  ///
  /// Lanza [ServiceNotFoundException] si el servicio no ha sido provisto previamente.
  T inject<T extends Object>() {
    final service = _services[T];
    if (service == null) {
      throw ServiceNotFoundException(T);
    }
    return service as T;
  }

  /// Intenta recuperar el servicio de tipo [T], devolviendo `null` si no existe.
  T? tryInject<T extends Object>() {
    final service = _services[T];
    if (service == null) return null;
    return service as T;
  }

  /// Comprueba si existe un servicio registrado para el tipo genérico [T].
  bool has<T extends Object>() {
    return hasType(T);
  }

  /// Comprueba si existe un servicio registrado para el objeto [Type] en tiempo de ejecución.
  bool hasType(Type type) {
    return _services.containsKey(type);
  }

  /// Elimina el registro del servicio [T] si existiese.
  void remove<T extends Object>() {
    _services.remove(T);
  }

  /// Limpia todos los servicios registrados.
  void clear() {
    _services.clear();
  }
}

/// Excepción lanzada cuando se intenta inyectar un servicio no registrado.
class ServiceNotFoundException implements Exception {
  final Type serviceType;

  const ServiceNotFoundException(this.serviceType);

  @override
  String toString() {
    return 'ServiceNotFoundException: No se ha encontrado ningún servicio de tipo "$serviceType" registrado en DavidContext. '
        'Asegúrate de que el plugin proveedor ha sido cargado durante la fase onLoad().';
  }
}
