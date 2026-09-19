import 'package:test/test.dart';
import 'package:david/kernel/david_context.dart';
import 'package:david/kernel/david_plugin.dart';
import 'package:david/kernel/plugin_registry.dart';
import 'package:david/kernel/mcp_tool_definition.dart';

abstract class MockAuthService {
  String get currentUserId;
}

class FakeAuthService implements MockAuthService {
  @override
  final String currentUserId = 'user_123';
}

abstract class MockDatabaseService {
  Future<void> save(String key, String value);
}

class FakeDatabaseService implements MockDatabaseService {
  final Map<String, String> data = {};
  @override
  Future<void> save(String key, String value) async {
    data[key] = value;
  }
}

class SampleAuthPlugin extends DavidPlugin {
  final List<String> lifecycleLog;
  SampleAuthPlugin(this.lifecycleLog);

  @override
  String get id => 'core.auth';

  @override
  String get name => 'Autenticación Mock';

  @override
  Future<void> onLoad(DavidContext ctx) async {
    lifecycleLog.add('auth.onLoad');
    ctx.provide<MockAuthService>(FakeAuthService());
  }

  @override
  Future<void> onReady(DavidContext ctx) async {
    lifecycleLog.add('auth.onReady');
  }

  @override
  Future<void> onDestroy(DavidContext ctx) async {
    lifecycleLog.add('auth.onDestroy');
  }
}

class SampleBusinessPlugin extends DavidPlugin {
  final List<String> lifecycleLog;
  SampleBusinessPlugin(this.lifecycleLog);

  @override
  String get id => 'business.sample';

  @override
  String get name => 'Negocio Mock';

  @override
  List<Type> get dependencies => const [MockAuthService];

  @override
  List<McpToolDefinition> get mcpTools => [
        McpToolDefinition(
          name: 'sample_tool',
          description: 'Herramienta de prueba',
          inputSchema: const {'type': 'object'},
          handler: (args) async => {'status': 'ok'},
        ),
      ];

  @override
  Future<void> onLoad(DavidContext ctx) async {
    lifecycleLog.add('business.onLoad');
  }

  @override
  Future<void> onReady(DavidContext ctx) async {
    lifecycleLog.add('business.onReady');
    // En onReady ya podemos inyectar dependencias con total seguridad
    final auth = ctx.inject<MockAuthService>();
    lifecycleLog.add('business.ready_user:${auth.currentUserId}');
  }

  @override
  Future<void> onDestroy(DavidContext ctx) async {
    lifecycleLog.add('business.onDestroy');
  }
}

class PluginWithMissingDependency extends DavidPlugin {
  @override
  String get id => 'broken.plugin';

  @override
  String get name => 'Plugin con dependencia rota';

  @override
  List<Type> get dependencies => const [MockDatabaseService];
}

void main() {
  group('DavidContext', () {
    late DavidContext ctx;

    setUp(() {
      ctx = DavidContext();
    });

    test('debe registrar y resolver un servicio tipado', () {
      final auth = FakeAuthService();
      ctx.provide<MockAuthService>(auth);

      expect(ctx.has<MockAuthService>(), isTrue);
      expect(ctx.inject<MockAuthService>(), equals(auth));
      expect(ctx.tryInject<MockAuthService>(), equals(auth));
    });

    test('debe lanzar ServiceNotFoundException si el servicio no está registrado', () {
      expect(
        () => ctx.inject<MockDatabaseService>(),
        throwsA(isA<ServiceNotFoundException>()),
      );
      expect(ctx.tryInject<MockDatabaseService>(), isNull);
    });

    test('remove() y clear() eliminan servicios correctamente', () {
      ctx.provide<MockAuthService>(FakeAuthService());
      expect(ctx.has<MockAuthService>(), isTrue);

      ctx.remove<MockAuthService>();
      expect(ctx.has<MockAuthService>(), isFalse);

      ctx.provide<MockAuthService>(FakeAuthService());
      ctx.clear();
      expect(ctx.has<MockAuthService>(), isFalse);
    });
  });

  group('PluginRegistry', () {
    late DavidContext ctx;
    late PluginRegistry registry;
    late List<String> lifecycleLog;

    setUp(() {
      ctx = DavidContext();
      registry = PluginRegistry();
      lifecycleLog = [];
    });

    test('ejecuta ciclo de vida en secuencia ordenada (onLoad -> onReady)', () async {
      final authPlugin = SampleAuthPlugin(lifecycleLog);
      final businessPlugin = SampleBusinessPlugin(lifecycleLog);

      registry.registerAll([authPlugin, businessPlugin]);
      expect(registry.plugins.length, equals(2));

      await registry.initialize(ctx);

      expect(registry.isInitialized, isTrue);
      expect(lifecycleLog, equals([
        'auth.onLoad',
        'business.onLoad',
        'auth.onReady',
        'business.onReady',
        'business.ready_user:user_123',
      ]));

      // Validar agregación de herramientas MCP
      expect(registry.allMcpTools.length, equals(1));
      expect(registry.allMcpTools.first.name, equals('sample_tool'));

      // Validar shutdown en orden inverso
      await registry.shutdown(ctx);
      expect(lifecycleLog.sublist(5), equals([
        'business.onDestroy',
        'auth.onDestroy',
      ]));
      expect(registry.isInitialized, isFalse);
    });

    test('lanza MissingDependencyException si falta una dependencia declarada', () async {
      registry.register(PluginWithMissingDependency());

      expect(
        () => registry.initialize(ctx),
        throwsA(isA<MissingDependencyException>()),
      );
    });

    test('rechaza registros con ID duplicado', () {
      registry.register(SampleAuthPlugin(lifecycleLog));
      expect(
        () => registry.register(SampleAuthPlugin(lifecycleLog)),
        throwsA(isA<ArgumentError>()),
      );
    });

    test('rechaza registro posterior a la inicialización', () async {
      final authPlugin = SampleAuthPlugin(lifecycleLog);
      registry.register(authPlugin);
      await registry.initialize(ctx);

      expect(
        () => registry.register(SampleBusinessPlugin(lifecycleLog)),
        throwsA(isA<StateError>()),
      );
    });
  });
}
