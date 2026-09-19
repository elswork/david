import 'package:go_router/go_router.dart';
import 'david_context.dart';
import 'mcp_tool_definition.dart';

/// Contrato base e interfaz obligatoria para cualquier módulo del Proyecto David.
///
/// Siguiendo el principio "Everything is a Plugin", ninguna funcionalidad reside en el núcleo;
/// tanto la infraestructura (Core) como el negocio (Business), periféricos (Hardware) e IA
/// extienden de esta clase.
abstract class DavidPlugin {
  /// Identificador único y en minúsculas del plugin (ej. `core.theme`, `business.catalog`).
  String get id;

  /// Nombre descriptivo y legible para humanos del plugin.
  String get name;

  /// Lista de tipos de servicios requeridos como dependencias previas en [DavidContext].
  List<Type> get dependencies => const <Type>[];

  /// Fase 1 del Ciclo de Vida: Registro de Servicios.
  ///
  /// El plugin debe proveer sus contratos e instancias a [DavidContext] mediante `ctx.provide<T>()`.
  /// No se debe intentar consumir servicios provistos por otros plugins en esta fase.
  Future<void> onLoad(DavidContext ctx) async {}

  /// Fase 2 del Ciclo de Vida: Enlace y Preparación.
  ///
  /// Se ejecuta una vez que todos los plugins han completado su [onLoad].
  /// Es el momento seguro para consumir dependencias (`ctx.inject<T>()`), suscribirse a streams,
  /// o enlazar configuraciones.
  Future<void> onReady(DavidContext ctx) async {}

  /// Fase 3 del Ciclo de Vida: Liberación y Cierre.
  ///
  /// Invocado al cerrar la aplicación o descargar un módulo. Debe cerrar sinks, cancelar streams
  /// y liberar recursos nativos o periféricos.
  Future<void> onDestroy(DavidContext ctx) async {}

  /// Rutas declarativas expuestas por el plugin al App Shell central.
  List<RouteBase> get routes => const <RouteBase>[];

  /// Herramientas MCP expuestas por el plugin para consumo por agentes de IA.
  List<McpToolDefinition> get mcpTools => const <McpToolDefinition>[];
}
