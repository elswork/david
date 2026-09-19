/// Definición de herramienta expuesta al Model Context Protocol (MCP).
///
/// Cada plugin de negocio o hardware puede exponer herramientas mediante esta clase
/// para que agentes de IA (Claude, Gemini, DeepSeek Harness, Ollama) puedan operar el negocio.
class McpToolDefinition {
  /// Nombre único de la herramienta (ej. `catalog_search_articles`).
  final String name;

  /// Descripción clara de lo que hace la herramienta y cuándo usarla.
  final String description;

  /// Esquema JSON Schema con los parámetros de entrada requeridos y opcionales.
  final Map<String, dynamic> inputSchema;

  /// Función ejecutora que recibe los argumentos validados y devuelve el resultado en JSON.
  final Future<Map<String, dynamic>> Function(Map<String, dynamic> arguments) handler;

  const McpToolDefinition({
    required this.name,
    required this.description,
    required this.inputSchema,
    required this.handler,
  });
}
