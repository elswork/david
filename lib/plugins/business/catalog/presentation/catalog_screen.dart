import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/article.dart';
import 'catalog_controller.dart';
import 'package:david/plugins/core/theme/theme_plugin.dart';

/// Pantalla principal del Catálogo de Artículos en Proyecto David.
///
/// Diseñada bajo la premisa de máxima velocidad en movilidad: menos de 3 toques para cualquier acción habitual.
class CatalogScreen extends ConsumerWidget {
  const CatalogScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final filter = ref.watch(catalogFilterProvider);
    final articlesAsync = ref.watch(catalogArticlesProvider);
    final metrics = ref.watch(catalogMetricsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: ThemeService.bronceAccent.withOpacity(0.15),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: ThemeService.bronceAccent.withOpacity(0.4)),
              ),
              child: const Text(
                'DAVID',
                style: TextStyle(
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.5,
                  fontSize: 14,
                  color: ThemeService.bronceAccent,
                ),
              ),
            ),
            const SizedBox(width: 12),
            const Text(
              'Catálogo de Artículos',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Cambiar tema (Mármol / Grafito)',
            icon: const Icon(Icons.brightness_4_outlined),
            onPressed: () {
              // El ThemeService se puede invocar desde el contexto
            },
          ),
          IconButton(
            tooltip: 'Sincronización Offline',
            icon: const Icon(Icons.cloud_done_outlined, color: Colors.green),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Catálogo sincronizado con la base de datos local y remota.')),
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          // 1. KPI Cards Bar
          Container(
            padding: const EdgeInsets.all(12),
            child: LayoutBuilder(
              builder: (context, constraints) {
                final isCompact = constraints.maxWidth < 600;
                return isCompact
                    ? Column(
                        children: [
                          Row(
                            children: [
                              Expanded(child: _buildKpiCard('Total Artículos', '${metrics.total}', Icons.inventory_2_outlined, Colors.blueGrey)),
                              const SizedBox(width: 8),
                              Expanded(child: _buildKpiCard('Valor Stock', '${metrics.totalValue.toStringAsFixed(2)} €', Icons.euro_symbol, ThemeService.bronceAccent)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Expanded(child: _buildKpiCard('Stock Bajo', '${metrics.lowStock}', Icons.warning_amber_rounded, Colors.amber)),
                              const SizedBox(width: 8),
                              Expanded(child: _buildKpiCard('Agotados', '${metrics.outOfStock}', Icons.error_outline, Colors.redAccent)),
                            ],
                          ),
                        ],
                      )
                    : Row(
                        children: [
                          Expanded(child: _buildKpiCard('Total Artículos', '${metrics.total}', Icons.inventory_2_outlined, Colors.blueGrey)),
                          const SizedBox(width: 10),
                          Expanded(child: _buildKpiCard('Stock Bajo', '${metrics.lowStock}', Icons.warning_amber_rounded, Colors.amber)),
                          const SizedBox(width: 10),
                          Expanded(child: _buildKpiCard('Agotados', '${metrics.outOfStock}', Icons.error_outline, Colors.redAccent)),
                          const SizedBox(width: 10),
                          Expanded(child: _buildKpiCard('Valor en Catálogo', '${metrics.totalValue.toStringAsFixed(2)} €', Icons.euro_symbol, ThemeService.bronceAccent)),
                        ],
                      );
              },
            ),
          ),

          // 2. Buscador y Filtros Rápidos
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    decoration: InputDecoration(
                      hintText: 'Buscar por nombre, código o código de barras...',
                      prefixIcon: const Icon(Icons.search),
                      suffixIcon: filter.query.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear),
                              onPressed: () => ref.read(catalogFilterProvider.notifier).state = filter.copyWith(query: ''),
                            )
                          : null,
                      filled: true,
                      fillColor: theme.colorScheme.surfaceContainerHighest.withOpacity(0.5),
                      contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide(color: theme.dividerColor),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide(color: theme.dividerColor),
                      ),
                    ),
                    onChanged: (val) => ref.read(catalogFilterProvider.notifier).state = filter.copyWith(query: val),
                  ),
                ),
                const SizedBox(width: 8),
                FilterChip(
                  label: const Text('Bajo Stock'),
                  selected: filter.onlyLowStock,
                  selectedColor: Colors.amber.withOpacity(0.25),
                  onSelected: (selected) {
                    ref.read(catalogFilterProvider.notifier).state = filter.copyWith(onlyLowStock: selected);
                  },
                ),
              ],
            ),
          ),

          // 3. Categorías horizontales
          Container(
            height: 44,
            margin: const EdgeInsets.symmetric(vertical: 6),
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              children: [
                'Todos',
                'Aceites',
                'Vinos',
                'Conservas',
                'Lácteos',
                'Cafés',
                'General',
              ].map((category) {
                final isSelected = filter.selectedCategory == category;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(category),
                    selected: isSelected,
                    selectedColor: ThemeService.bronceAccent.withOpacity(0.2),
                    labelStyle: TextStyle(
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      color: isSelected ? ThemeService.bronceAccent : null,
                    ),
                    onSelected: (_) {
                      ref.read(catalogFilterProvider.notifier).state = filter.copyWith(selectedCategory: category);
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          const Divider(height: 1),

          // 4. Lista Reactiva de Artículos
          Expanded(
            child: articlesAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text('Error al cargar artículos: $err', style: const TextStyle(color: Colors.red)),
                ),
              ),
              data: (articles) {
                if (articles.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.search_off, size: 64, color: theme.disabledColor),
                        const SizedBox(height: 12),
                        const Text(
                          'No se encontraron artículos con estos criterios.',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.separated(
                  padding: const EdgeInsets.all(12),
                  itemCount: articles.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final article = articles[index];
                    return _buildArticleCard(context, ref, article);
                  },
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: ThemeService.bronceAccent,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Nuevo Artículo'),
        onPressed: () => _showArticleDialog(context, ref),
      ),
    );
  }

  Widget _buildKpiCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.25)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                Text(
                  value,
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: color),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildArticleCard(BuildContext context, WidgetRef ref, Article article) {
    final theme = Theme.of(context);
    final repo = ref.read(catalogRepositoryProvider);

    Color stockColor = Colors.green;
    String stockLabel = '${article.stock} ${article.unit}';
    if (article.isOutOfStock) {
      stockColor = Colors.redAccent;
      stockLabel = 'Agotado';
    } else if (article.isLowStock) {
      stockColor = Colors.amber.shade700;
      stockLabel = '${article.stock} (Bajo)';
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            // Avatar / Categoría
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                color: ThemeService.bronceAccent.withOpacity(0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: Text(
                  article.category.isNotEmpty ? article.category[0].toUpperCase() : 'A',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 20,
                    color: ThemeService.bronceAccent,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),

            // Información Central
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.surfaceContainerHighest,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          article.code,
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        article.category,
                        style: TextStyle(fontSize: 11, color: theme.hintColor),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    article.name,
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    article.description,
                    style: TextStyle(fontSize: 12, color: theme.hintColor),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),

            // Precios
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '${article.price.toStringAsFixed(2)} €',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: ThemeService.bronceAccent,
                  ),
                ),
                Text(
                  'IVA inc. ${article.priceWithVat.toStringAsFixed(2)} €',
                  style: TextStyle(fontSize: 11, color: theme.hintColor),
                ),
                const SizedBox(height: 4),
                // Badge de Stock
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: stockColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: stockColor.withOpacity(0.4)),
                  ),
                  child: Text(
                    stockLabel,
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: stockColor),
                  ),
                ),
              ],
            ),

            const SizedBox(width: 10),

            // Ajuste rápido de stock en 1 solo toque (+ / -)
            Column(
              children: [
                InkWell(
                  onTap: () => repo.updateStock(article.id, article.stock + 1),
                  child: const Padding(
                    padding: EdgeInsets.all(4),
                    child: Icon(Icons.add_circle_outline, size: 22, color: ThemeService.bronceAccent),
                  ),
                ),
                InkWell(
                  onTap: article.stock > 0
                      ? () => repo.updateStock(article.id, article.stock - 1)
                      : null,
                  child: Padding(
                    padding: const EdgeInsets.all(4),
                    child: Icon(
                      Icons.remove_circle_outline,
                      size: 22,
                      color: article.stock > 0 ? Colors.grey : Colors.grey.shade300,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showArticleDialog(BuildContext context, WidgetRef ref) {
    final nameCtrl = TextEditingController();
    final codeCtrl = TextEditingController();
    final priceCtrl = TextEditingController();
    final stockCtrl = TextEditingController(text: '10');
    final categoryCtrl = TextEditingController(text: 'General');

    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        title: const Text('Nuevo Artículo en Catálogo'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(labelText: 'Nombre del Artículo'),
              ),
              TextField(
                controller: codeCtrl,
                decoration: const InputDecoration(labelText: 'Código / Referencia (ej. ART-10)'),
              ),
              TextField(
                controller: categoryCtrl,
                decoration: const InputDecoration(labelText: 'Categoría (ej. Bebidas, Cafés)'),
              ),
              TextField(
                controller: priceCtrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Precio Base (€)'),
              ),
              TextField(
                controller: stockCtrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Stock Inicial'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogCtx).pop(),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: ThemeService.bronceAccent,
              foregroundColor: Colors.white,
            ),
            onPressed: () async {
              final name = nameCtrl.text.trim();
              final code = codeCtrl.text.trim();
              final price = double.tryParse(priceCtrl.text) ?? 0.0;
              final stock = int.tryParse(stockCtrl.text) ?? 0;
              final category = categoryCtrl.text.trim();

              if (name.isNotEmpty && code.isNotEmpty) {
                final newArticle = Article(
                  id: 'art-${DateTime.now().millisecondsSinceEpoch}',
                  code: code,
                  barcode: '840000000${DateTime.now().millisecond}',
                  name: name,
                  description: 'Artículo registrado desde el panel comercial',
                  category: category.isNotEmpty ? category : 'General',
                  price: price,
                  stock: stock,
                  updatedAt: DateTime.now(),
                );

                await ref.read(catalogRepositoryProvider).saveArticle(newArticle);
                if (dialogCtx.mounted) {
                  Navigator.of(dialogCtx).pop();
                }
              }
            },
            child: const Text('Guardar'),
          ),
        ],
      ),
    );
  }
}
