import 'package:test/test.dart';
import 'package:david/kernel/david_context.dart';
import 'package:david/kernel/plugin_registry.dart';
import 'package:david/plugins/core/database/database_plugin.dart';
import 'package:david/plugins/business/catalog/catalog_plugin.dart';
import 'package:david/plugins/business/catalog/domain/article.dart';
import 'package:david/plugins/business/catalog/data/catalog_repository.dart';

void main() {
  group('CatalogPlugin & CatalogRepository', () {
    late DavidContext ctx;
    late PluginRegistry registry;
    late CatalogPlugin catalogPlugin;

    setUp(() async {
      ctx = DavidContext();
      registry = PluginRegistry();
      catalogPlugin = CatalogPlugin();

      registry.registerAll([
        DatabasePlugin(),
        catalogPlugin,
      ]);

      await registry.initialize(ctx);
    });

    tearDown(() async {
      await registry.shutdown(ctx);
    });

    test('debe inicializarse con datos semilla en CatalogRepository', () async {
      final repo = ctx.inject<CatalogRepository>();
      final articles = await repo.getArticles();

      expect(articles, isNotEmpty);
      expect(articles.any((a) => a.code == 'BEB-01'), isTrue);
    });

    test('debe filtrar artículos por término de búsqueda y categoría', () async {
      final repo = ctx.inject<CatalogRepository>();

      final wines = await repo.getArticles(category: 'Vinos');
      expect(wines.length, equals(1));
      expect(wines.first.category, equals('Vinos'));

      final searchRioja = await repo.getArticles(query: 'Rioja');
      expect(searchRioja.length, equals(1));
      expect(searchRioja.first.name, contains('Rioja'));
    });

    test('debe identificar artículos con bajo stock y agotados correctamente', () async {
      final repo = ctx.inject<CatalogRepository>();

      // Artículo LAC-01 tiene stock 0
      final outOfStockItem = await repo.getArticleByBarcode('8410000000043');
      expect(outOfStockItem, isNotNull);
      expect(outOfStockItem!.isOutOfStock, isTrue);

      // Artículo CON-01 tiene stock 3 con minStock 5
      final lowStockItem = await repo.getArticleByBarcode('8410000000036');
      expect(lowStockItem, isNotNull);
      expect(lowStockItem!.isLowStock, isTrue);
      expect(lowStockItem.isOutOfStock, isFalse);
    });

    test('debe actualizar el stock en tiempo real', () async {
      final repo = ctx.inject<CatalogRepository>();

      await repo.updateStock('art-001', 100);
      final updated = await repo.getArticleById('art-001');

      expect(updated, isNotNull);
      expect(updated!.stock, equals(100));
    });

    test('las herramientas MCP de catálogo deben estar expuestas y funcionar', () async {
      expect(catalogPlugin.mcpTools.length, equals(3));

      final searchTool = catalogPlugin.mcpTools.firstWhere((t) => t.name == 'catalog_search_articles');
      final searchResult = await searchTool.handler({'query': 'Aceite'});
      expect(searchResult['total'], greaterThan(0));

      final checkTool = catalogPlugin.mcpTools.firstWhere((t) => t.name == 'catalog_check_stock');
      final checkResult = await checkTool.handler({'code_or_barcode': 'BEB-01'});
      expect(checkResult['status'], equals('found'));
      expect(checkResult['code'], equals('BEB-01'));

      final updateTool = catalogPlugin.mcpTools.firstWhere((t) => t.name == 'catalog_update_stock');
      final updateResult = await updateTool.handler({'article_id': 'art-002', 'new_stock': 50});
      expect(updateResult['status'], equals('updated'));
      expect(updateResult['new_stock'], equals(50));
    });
  });
}
