import 'package:go_router/go_router.dart';
import '../../../kernel/david_context.dart';
import '../../../kernel/david_plugin.dart';
import '../../../kernel/mcp_tool_definition.dart';
import '../../core/database/database_service.dart';
import 'domain/article.dart';
import 'data/catalog_repository.dart';
import 'data/catalog_seed_data.dart';
import 'presentation/catalog_screen.dart';

/// Plugin de Negocio: Catálogo de Artículos y Control de Existencias.
///
/// Expone vistas en Flutter para operadores comerciales y herramientas MCP para agentes autónomos.
class CatalogPlugin extends DavidPlugin {
  late final CatalogRepository _repository;

  @override
  String get id => 'business.catalog';

  @override
  String get name => 'Catálogo de Artículos y Stock';

  @override
  List<Type> get dependencies => const [DatabaseService];

  @override
  Future<void> onLoad(DavidContext ctx) async {
    // Registramos la provisión del contrato CatalogRepository
    // Nota: La instancia concreta se enlaza con el DatabaseService provisto por core.database
  }

  @override
  Future<void> onReady(DavidContext ctx) async {
    final db = ctx.inject<DatabaseService>();
    _repository = DatabaseCatalogRepository(db);
    ctx.provide<CatalogRepository>(_repository);

    // Inicializar con datos semilla si está vacío
    final existing = await _repository.getArticles();
    if (existing.isEmpty) {
      for (final article in sampleCatalogArticles) {
        await _repository.saveArticle(article);
      }
    }
  }

  @override
  List<RouteBase> get routes => [
        GoRoute(
          path: '/catalog',
          name: 'catalog',
          builder: (context, state) => const CatalogScreen(),
        ),
      ];

  @override
  List<McpToolDefinition> get mcpTools => [
        McpToolDefinition(
          name: 'catalog_search_articles',
          description: 'Busca artículos en el catálogo de David por término de búsqueda (nombre, código o código de barras) o categoría.',
          inputSchema: {
            'type': 'object',
            'properties': {
              'query': {
                'type': 'string',
                'description': 'Término de búsqueda opcional (ej. "aceite", "BEB-01", "8410000000012")',
              },
              'category': {
                'type': 'string',
                'description': 'Categoría para filtrar (ej. "Aceites", "Vinos", "Conservas")',
              },
            },
          },
          handler: (args) async {
            final query = args['query'] as String?;
            final category = args['category'] as String?;
            final articles = await _repository.getArticles(category: category, query: query);
            return {
              'total': articles.length,
              'articles': articles.map((a) => a.toJson()).toList(),
            };
          },
        ),
        McpToolDefinition(
          name: 'catalog_check_stock',
          description: 'Consulta el stock físico disponible y precio de un artículo mediante su código o código de barras.',
          inputSchema: {
            'type': 'object',
            'required': ['code_or_barcode'],
            'properties': {
              'code_or_barcode': {
                'type': 'string',
                'description': 'Código del artículo o código de barras escaneado.',
              },
            },
          },
          handler: (args) async {
            final code = args['code_or_barcode'] as String;
            final article = await _repository.getArticleByBarcode(code);
            if (article == null) {
              return {'status': 'not_found', 'message': 'Artículo no encontrado con el código $code'};
            }
            return {
              'status': 'found',
              'id': article.id,
              'name': article.name,
              'code': article.code,
              'stock': article.stock,
              'isLowStock': article.isLowStock,
              'isOutOfStock': article.isOutOfStock,
              'price': article.price,
              'priceWithVat': article.priceWithVat,
            };
          },
        ),
        McpToolDefinition(
          name: 'catalog_update_stock',
          description: 'Actualiza el inventario físico de un artículo en el almacén o furgoneta.',
          inputSchema: {
            'type': 'object',
            'required': ['article_id', 'new_stock'],
            'properties': {
              'article_id': {
                'type': 'string',
                'description': 'Identificador único del artículo (ej. "art-001")',
              },
              'new_stock': {
                'type': 'integer',
                'description': 'Nuevo número de unidades disponibles en stock',
              },
            },
          },
          handler: (args) async {
            final id = args['article_id'] as String;
            final stock = (args['new_stock'] as num).toInt();
            await _repository.updateStock(id, stock);
            return {'status': 'updated', 'article_id': id, 'new_stock': stock};
          },
        ),
      ];
}
