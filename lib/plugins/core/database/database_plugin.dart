import '../../../kernel/david_context.dart';
import '../../../kernel/david_plugin.dart';
import 'database_service.dart';
import 'memory_database_service.dart';

/// Plugin Core encargado de proveer el servicio de base de datos a DavidContext.
///
/// En modo desarrollo / standalone utiliza [InMemoryDatabaseService], y puede alternar a
/// [FirestoreDatabaseService] en despliegues con credenciales activas de Firebase.
class DatabasePlugin extends DavidPlugin {
  final DatabaseService? _customService;
  late final DatabaseService _service;

  DatabasePlugin({DatabaseService? customService}) : _customService = customService;

  @override
  String get id => 'core.database';

  @override
  String get name => 'Servicio de Base de Datos y Persistencia';

  @override
  Future<void> onLoad(DavidContext ctx) async {
    _service = _customService ?? InMemoryDatabaseService();
    ctx.provide<DatabaseService>(_service);
  }

  @override
  Future<void> onDestroy(DavidContext ctx) async {
    if (_service is InMemoryDatabaseService) {
      (_service as InMemoryDatabaseService).dispose();
    }
  }
}
