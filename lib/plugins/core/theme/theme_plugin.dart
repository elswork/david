import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../kernel/david_context.dart';
import '../../../kernel/david_plugin.dart';

/// Provider reactivo de Riverpod para ThemeService.
final themeServiceProvider = ChangeNotifierProvider<ThemeService>((ref) {
  throw UnimplementedError('themeServiceProvider debe registrarse en ProviderScope');
});

/// Servicio para la gestión dinámica del tema visual en Proyecto David.
class ThemeService extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.system;

  ThemeMode get themeMode => _themeMode;

  void setThemeMode(ThemeMode mode) {
    if (_themeMode != mode) {
      _themeMode = mode;
      notifyListeners();
    }
  }

  void toggleTheme() {
    if (_themeMode == ThemeMode.light) {
      setThemeMode(ThemeMode.dark);
    } else {
      setThemeMode(ThemeMode.light);
    }
  }

  // Paleta de David: Mármol, Grafito y Bronce
  static const Color bronceAccent = Color(0xFFD97706); // Amber 600
  static const Color bronceLight = Color(0xFFF59E0B);
  static const Color bronceDark = Color(0xFFB45309);

  static const Color grafitoBackground = Color(0xFF0F172A); // Slate 900
  static const Color grafitoSurface = Color(0xFF1E293B); // Slate 800
  static const Color grafitoBorder = Color(0xFF334155); // Slate 700

  static const Color marmolBackground = Color(0xFFF8FAFC); // Slate 50
  static const Color marmolSurface = Color(0xFFFFFFFF);
  static const Color marmolBorder = Color(0xFFE2E8F0); // Slate 200

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: bronceAccent,
        brightness: Brightness.light,
        surface: marmolSurface,
        surfaceContainerHighest: marmolBackground,
        primary: bronceDark,
        secondary: const Color(0xFF475569),
      ),
      scaffoldBackgroundColor: marmolBackground,
      appBarTheme: const AppBarTheme(
        backgroundColor: marmolSurface,
        foregroundColor: Color(0xFF0F172A),
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardTheme(
        color: marmolSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: marmolBorder),
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      dividerTheme: const DividerThemeData(color: marmolBorder),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.fromSeed(
        seedColor: bronceAccent,
        brightness: Brightness.dark,
        surface: grafitoSurface,
        surfaceContainerHighest: grafitoBackground,
        primary: bronceAccent,
        secondary: const Color(0xFF94A3B8),
      ),
      scaffoldBackgroundColor: grafitoBackground,
      appBarTheme: const AppBarTheme(
        backgroundColor: grafitoSurface,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardTheme(
        color: grafitoSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: grafitoBorder),
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      dividerTheme: const DividerThemeData(color: grafitoBorder),
    );
  }
}

/// Plugin Core para la gestión de estilos y paleta visual (Mármol, Grafito y Bronce).
class ThemePlugin extends DavidPlugin {
  late final ThemeService _themeService;

  @override
  String get id => 'core.theme';

  @override
  String get name => 'Gestor de Tema Visual';

  @override
  Future<void> onLoad(DavidContext ctx) async {
    _themeService = ThemeService();
    ctx.provide<ThemeService>(_themeService);
  }

  @override
  Future<void> onDestroy(DavidContext ctx) async {
    _themeService.dispose();
  }

  @override
  List<RouteBase> get routes => const <RouteBase>[];
}
