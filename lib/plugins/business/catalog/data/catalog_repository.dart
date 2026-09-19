import 'dart:async';
import '../../../core/database/database_service.dart';
import '../domain/article.dart';

/// Contrato e interfaz del Repositorio de Catálogo.
///
/// Siguiendo los principios de la LLM-Wiki de David, el repositorio es la única frontera reactiva.
abstract class CatalogRepository {
  Stream<List<Article>> watchArticles({String? category, String? query});
  Future<List<Article>> getArticles({String? category, String? query});
  Future<Article?> getArticleById(String id);
  Future<Article?> getArticleByBarcode(String barcode);
  Future<void> saveArticle(Article article);
  Future<void> updateStock(String articleId, int newStock);
  Future<void> deleteArticle(String id);
}

/// Implementación del repositorio de catálogo conectado a [DatabaseService].
class DatabaseCatalogRepository implements CatalogRepository {
  static const String collectionPath = 'articles';
  final DatabaseService _db;

  DatabaseCatalogRepository(this._db);

  @override
  Stream<List<Article>> watchArticles({String? category, String? query}) {
    return _db.watchCollection<Article>(
      collectionPath: collectionPath,
      fromJson: (data, id) => Article.fromJson(data, id),
    ).map((articles) => _filterArticles(articles, category: category, query: query));
  }

  @override
  Future<List<Article>> getArticles({String? category, String? query}) async {
    final list = await watchArticles(category: category, query: query).first;
    return list;
  }

  @override
  Future<Article?> getArticleById(String id) async {
    return _db.watchDocument<Article>(
      collectionPath: collectionPath,
      documentId: id,
      fromJson: (data, docId) => Article.fromJson(data, docId),
    ).first;
  }

  @override
  Future<Article?> getArticleByBarcode(String barcode) async {
    final all = await getArticles();
    try {
      return all.firstWhere((a) => a.barcode == barcode || a.code == barcode);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<void> saveArticle(Article article) async {
    await _db.setDocument(
      collectionPath: collectionPath,
      documentId: article.id,
      data: article.toJson(),
    );
  }

  @override
  Future<void> updateStock(String articleId, int newStock) async {
    final article = await getArticleById(articleId);
    if (article != null) {
      final updated = article.copyWith(
        stock: newStock,
        updatedAt: DateTime.now(),
      );
      await saveArticle(updated);
    }
  }

  @override
  Future<void> deleteArticle(String id) async {
    await _db.deleteDocument(
      collectionPath: collectionPath,
      documentId: id,
    );
  }

  List<Article> _filterArticles(List<Article> list, {String? category, String? query}) {
    var result = list;
    if (category != null && category.isNotEmpty && category != 'Todos') {
      result = result.where((a) => a.category.toLowerCase() == category.toLowerCase()).toList();
    }
    if (query != null && query.trim().isNotEmpty) {
      final q = query.trim().toLowerCase();
      result = result.where((a) =>
        a.name.toLowerCase().contains(q) ||
        a.code.toLowerCase().contains(q) ||
        a.barcode.toLowerCase().contains(q) ||
        a.category.toLowerCase().contains(q)
      ).toList();
    }
    return result;
  }
}
