import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/article.dart';
import '../data/catalog_repository.dart';

/// Filtros activos para la vista de catálogo.
class CatalogFilterState {
  final String query;
  final String selectedCategory;
  final bool onlyLowStock;

  const CatalogFilterState({
    this.query = '',
    this.selectedCategory = 'Todos',
    this.onlyLowStock = false,
  });

  CatalogFilterState copyWith({
    String? query,
    String? selectedCategory,
    bool? onlyLowStock,
  }) {
    return CatalogFilterState(
      query: query ?? this.query,
      selectedCategory: selectedCategory ?? this.selectedCategory,
      onlyLowStock: onlyLowStock ?? this.onlyLowStock,
    );
  }
}

/// Provider para el estado de los filtros del catálogo.
final catalogFilterProvider = StateProvider<CatalogFilterState>((ref) {
  return const CatalogFilterState();
});

/// Provider del repositorio inyectado desde el contexto.
final catalogRepositoryProvider = Provider<CatalogRepository>((ref) {
  throw UnimplementedError('catalogRepositoryProvider debe ser sobrescrito en el ProviderScope');
});

/// Provider reactivo de la lista de artículos filtrada en tiempo real.
final catalogArticlesProvider = StreamProvider<List<Article>>((ref) {
  final repository = ref.watch(catalogRepositoryProvider);
  final filter = ref.watch(catalogFilterProvider);

  return repository.watchArticles(
    category: filter.selectedCategory == 'Todos' ? null : filter.selectedCategory,
    query: filter.query.isEmpty ? null : filter.query,
  ).map((articles) {
    if (filter.onlyLowStock) {
      return articles.where((a) => a.isLowStock || a.isOutOfStock).toList();
    }
    return articles;
  });
});

/// Provider de métricas rápidas del catálogo (KPIs de cabecera).
final catalogMetricsProvider = Provider<({int total, int lowStock, int outOfStock, double totalValue})>((ref) {
  final articlesAsync = ref.watch(catalogArticlesProvider);

  return articlesAsync.when(
    data: (articles) {
      final total = articles.length;
      final lowStock = articles.where((a) => a.isLowStock && !a.isOutOfStock).length;
      final outOfStock = articles.where((a) => a.isOutOfStock).length;
      final totalValue = articles.fold<double>(0.0, (acc, a) => acc + (a.price * a.stock));
      return (total: total, lowStock: lowStock, outOfStock: outOfStock, totalValue: totalValue);
    },
    loading: () => (total: 0, lowStock: 0, outOfStock: 0, totalValue: 0.0),
    error: (_, __) => (total: 0, lowStock: 0, outOfStock: 0, totalValue: 0.0),
  );
});
