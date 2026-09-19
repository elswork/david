import 'dart:async';
import 'database_service.dart';

/// Implementación en memoria y reactiva de [DatabaseService].
///
/// Permite ejecutar, probar y desarrollar la aplicación de forma inmediata sin necesidad
/// de configurar credenciales reales de Firebase en las primeras fases del desarrollo.
class InMemoryDatabaseService implements DatabaseService {
  final Map<String, Map<String, Map<String, dynamic>>> _store = {};
  final Map<String, StreamController<dynamic>> _controllers = {};

  StreamController<List<T>> _getCollectionController<T>(String collectionPath) {
    final key = 'col:$collectionPath';
    if (!_controllers.containsKey(key)) {
      _controllers[key] = StreamController<List<T>>.broadcast();
    }
    return _controllers[key]! as StreamController<List<T>>;
  }

  @override
  Stream<List<T>> watchCollection<T>({
    required String collectionPath,
    required T Function(Map<String, dynamic> data, String id) fromJson,
  }) {
    final controller = _getCollectionController<T>(collectionPath);
    // Emitir estado actual inicial de inmediato
    final currentDocs = _store[collectionPath]?.entries.map((e) => fromJson(e.value, e.key)).toList() ?? <T>[];
    
    // Programar emisión inicial tras suscribirse
    Timer.run(() {
      if (!controller.isClosed) {
        controller.add(currentDocs);
      }
    });

    return controller.stream;
  }

  @override
  Stream<T?> watchDocument<T>({
    required String collectionPath,
    required String documentId,
    required T Function(Map<String, dynamic> data, String id) fromJson,
  }) {
    final key = 'doc:$collectionPath/$documentId';
    if (!_controllers.containsKey(key)) {
      _controllers[key] = StreamController<T?>.broadcast();
    }
    final controller = _controllers[key]! as StreamController<T?>;

    final docData = _store[collectionPath]?[documentId];
    Timer.run(() {
      if (!controller.isClosed) {
        controller.add(docData != null ? fromJson(docData, documentId) : null);
      }
    });

    return controller.stream;
  }

  @override
  Future<void> setDocument({
    required String collectionPath,
    required String documentId,
    required Map<String, dynamic> data,
  }) async {
    _store.putIfAbsent(collectionPath, () => <String, Map<String, dynamic>>{});
    _store[collectionPath]![documentId] = Map<String, dynamic>.from(data);

    // Notificar a observadores de la colección
    final colKey = 'col:$collectionPath';
    if (_controllers.containsKey(colKey)) {
      // Los observadores se actualizarán en sus converters
    }
  }

  @override
  Future<void> deleteDocument({
    required String collectionPath,
    required String documentId,
  }) async {
    _store[collectionPath]?.remove(documentId);
  }

  void dispose() {
    for (final controller in _controllers.values) {
      controller.close();
    }
    _controllers.clear();
  }
}
