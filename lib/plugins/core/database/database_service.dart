/// Contrato abstracto para el servicio de base de datos y persistencia.
///
/// Siguiendo la arquitectura microkernel de David, ningún plugin de negocio se acopla a Firestore
/// directamente; consumen este contrato inyectado en [DavidContext].
abstract class DatabaseService {
  /// Obtiene un stream reactivo de una colección de documentos tipados.
  Stream<List<T>> watchCollection<T>({
    required String collectionPath,
    required T Function(Map<String, dynamic> data, String id) fromJson,
  });

  /// Obtiene un stream reactivo de un documento único tipado.
  Stream<T?> watchDocument<T>({
    required String collectionPath,
    required String documentId,
    required T Function(Map<String, dynamic> data, String id) fromJson,
  });

  /// Guarda o actualiza un documento en la colección.
  Future<void> setDocument({
    required String collectionPath,
    required String documentId,
    required Map<String, dynamic> data,
  });

  /// Elimina un documento de la colección.
  Future<void> deleteDocument({
    required String collectionPath,
    required String documentId,
  });
}
