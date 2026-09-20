import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'kernel/david_context.dart';
import 'kernel/plugin_registry.dart';
import 'kernel/app_shell.dart';
import 'plugins/core/theme/theme_plugin.dart';
import 'plugins/core/database/database_plugin.dart';
import 'plugins/business/catalog/catalog_plugin.dart';
import 'plugins/business/catalog/data/catalog_repository.dart';
import 'plugins/business/catalog/presentation/catalog_controller.dart';
import 'plugins/business/catalog/presentation/catalog_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 1. Inicialización del Microkernel David
  final ctx = DavidContext();
  final registry = PluginRegistry();

  // 2. Registro de plugins ("Everything is a Plugin")
  registry.registerAll([
    ThemePlugin(),
    DatabasePlugin(),
    CatalogPlugin(),
  ]);

  // 3. Ejecución del ciclo de vida (Fase 1: onLoad -> Dependencias -> Fase 2: onReady)
  await registry.initialize(ctx);

  final themeService = ctx.inject<ThemeService>();
  final catalogRepo = ctx.inject<CatalogRepository>();

  // 4. Configuración del Enrutador Modular GoRouter alojado en AppShell
  final router = GoRouter(
    initialLocation: '/catalog',
    routes: [
      ShellRoute(
        builder: (context, state, child) {
          return AppShell(
            currentPath: state.uri.toString(),
            child: child,
          );
        },
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const _DashboardOverviewScreen(),
          ),
          ...registry.allRoutes,
        ],
      ),
    ],
  );

  runApp(
    ProviderScope(
      overrides: [
        themeServiceProvider.overrideWith((ref) => themeService),
        catalogRepositoryProvider.overrideWithValue(catalogRepo),
      ],
      child: DavidApp(
        themeService: themeService,
        router: router,
        registry: registry,
      ),
    ),
  );
}

class DavidApp extends StatelessWidget {
  final ThemeService themeService;
  final GoRouter router;
  final PluginRegistry registry;

  const DavidApp({
    super.key,
    required this.themeService,
    required this.router,
    required this.registry,
  });

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: themeService,
      builder: (context, _) {
        return MaterialApp.router(
          title: 'David — Ecosistema de Gestión',
          debugShowCheckedModeBanner: false,
          theme: ThemeService.lightTheme,
          darkTheme: ThemeService.darkTheme,
          themeMode: themeService.themeMode,
          routerConfig: router,
        );
      },
    );
  }
}

/// Pantalla de bienvenida y estado del Microkernel de David
class _DashboardOverviewScreen extends StatelessWidget {
  const _DashboardOverviewScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('David — Visión General'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: ThemeService.bronceAccent.withOpacity(0.12),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.account_tree_outlined,
                  size: 64,
                  color: ThemeService.bronceAccent,
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Ecosistema Modular David',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Microkernel iniciado con éxito. Todo es un plugin.',
                style: TextStyle(fontSize: 16, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: ThemeService.bronceAccent,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
                icon: const Icon(Icons.inventory_2_outlined),
                label: const Text('Abrir Catálogo de Artículos'),
                onPressed: () => context.go('/catalog'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
