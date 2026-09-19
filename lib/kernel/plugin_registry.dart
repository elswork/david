import 'package:go_router/go_router.dart';
import 'david_context.dart';
import 'david_plugin.dart';
import 'mcp_tool_definition.dart';

/// Orquestador del ciclo de vida y agregador de complementos en Proyecto David.
///
/// Coordina la inicialización secuencial en fases estrictas:
/// 1. `onLoad`: Carga y provisión de servicios en [DavidContext].
/// 2. Verificación de dependencias declaradas.
/// 3. `onReady`: Enlace entre plugins y exposición de UI/MCP.
/// 4. `onDestroy`: Apagado ordenado en orden inverso.
class PluginRegistry {
  final List<DavidPlugin> _plugins = <DavidPlugin>[];
  bool _isInitialized = false;

  /// Lista inmutable de plugins registrados en el orquestador.
  List<DavidPlugin> get plugins => List.unmodifiable(_plugins);

  /// Indica si el registro ha completado con éxito la fase de inicialización.
  bool get isInitialized => _isInitialized;

  /// Registra un plugin en el orquestador.
  ///
  /// Lanza [StateError] si se intenta registrar después de haber inicializado el microkernel.
  void register(DavidPlugin plugin) {
    if (_isInitialized) {
      throw StateError(
        'No se pueden registrar nuevos plugins tras la inicialización del Microkernel. Plugin rechazado: ${plugin.id}',
      );
    }
    if (_plugins.any((p) => p.id == plugin.id)) {
      throw ArgumentError('Ya existe un plugin registrado con el ID "${plugin.id}".');
    }
    _plugins.add(plugin);
  }

  /// Registra una colección de plugins.
  void registerAll(Iterable<DavidPlugin> plugins) {
    for (final plugin in plugins) {
      register(plugin);
    }
  }

  /// Obtiene un plugin registrado por su ID único.
  DavidPlugin? getPlugin(String id) {
    try {
      return _plugins.firstWhere((p) => p.id == id);
    } on StateError {
      return null;
    }
  }

  /// Ejecuta el ciclo de vida de inicialización completo (Fases 1 y 2).
  Future<void> initialize(DavidContext ctx) async {
    if (_isInitialized) return;

    // FASE 1: Registro de servicios (onLoad)
    for (final plugin in _plugins) {
      await plugin.onLoad(ctx);
    }

    // VERIFICACIÓN: Validación estricta de dependencias
    for (final plugin in _plugins) {
      for (final requiredType in plugin.dependencies) {
        if (!ctx.hasType(requiredType)) {
          throw MissingDependencyException(plugin.id, requiredType);
        }
      }
    }

    // FASE 2: Enlace e inicialización cruzada (onReady)
    for (final plugin in _plugins) {
      await plugin.onReady(ctx);
    }

    _isInitialized = true;
  }

  /// Ejecuta el apagado ordenado de los plugins (Fase 3: onDestroy) en orden inverso.
  Future<void> shutdown(DavidContext ctx) async {
    for (final plugin in _plugins.reversed) {
      try {
        await plugin.onDestroy(ctx);
      } catch (e) {
        // Registro de error para evitar que una falla en un plugin bloquee el teardown general
        // ignore: avoid_print
        print('Error durante onDestroy() en el plugin "${plugin.id}": $e');
      }
    }
    _plugins.clear();
    _isInitialized = false;
  }

  /// Retorna la lista consolidada de todas las rutas de navegación registradas por los plugins.
  List<RouteBase> get allRoutes {
    return _plugins.expand((p) => p.routes).toList();
  }

  /// Retorna la lista consolidada de todas las herramientas MCP expuestas por los plugins.
  List<McpToolDefinition> get allMcpTools {
    return _plugins.expand((p) => p.mcpTools).toList();
  }
}

/// Excepción lanzada cuando un plugin requiere un servicio no disponible en [DavidContext].
class MissingDependencyException implements Exception {
  final String pluginId;
  final Type missingServiceType;

  const MissingDependencyException(this.pluginId, this.missingServiceType);

  @override
  String toString() {
    return 'MissingDependencyException: El plugin "$pluginId" requiere el servicio de tipo "$missingServiceType", pero no está registrado en DavidContext.';
  }
}
