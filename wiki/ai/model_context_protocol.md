---
id: model-context-protocol
title: "Model Context Protocol (MCP) en David"
description: "Estándar abierto para conectar agentes inteligentes (Claude, Gemini, DeepSeek, Ollama) con la operativa de negocio."
category: "AI & Agentes"
tags: ["mcp", "model-context-protocol", "agentes", "tools", "deepseek-harness", "ollama"]
last_updated: "2026-09-11"
version: "1.0.0"
---

# 🤖 Model Context Protocol (MCP) en David

**Proyecto David** no integra chatbots comerciales aislados. Adopta el **Model Context Protocol (MCP)**, el estándar universal impulsado por la industria para comunicar modelos fundacionales con sistemas de software en producción.

## 1. Cada Plugin Expone Tools y Resources

Bajo el contrato `DavidPlugin`, cada módulo declara formalmente sus capacidades mediante `List<McpToolDefinition> get mcpTools`:

```dart
class McpToolDefinition {
  final String name;
  final String description;
  final Map<String, dynamic> inputSchema;
  final Future<McpToolResult> Function(Map<String, dynamic> args) handler;

  const McpToolDefinition({
    required this.name,
    required this.description,
    required this.inputSchema,
    required this.handler,
  });
}
```

### Ejemplos de Herramientas Expuestas:
- **`OrdersPlugin`**:
  - `consultar_pedidos(cliente_id, fecha)`
  - `crear_pedido_borrador(cliente_id, lineas)`
  - `emitir_albaran(pedido_id)`
- **`RoutesPlugin`**:
  - `obtener_ruta_del_dia(fecha)`
  - `registrar_entrega(cliente_id, firma)`
- **`LlmWikiPlugin`**:
  - `wiki_search(query)`
  - `wiki_read_page(page_id)`

## 2. El Agnosticismo Total de IA

David no está atado a ninguna API privativa ni a OpenAI, Anthropic o Google. Mediante el servidor MCP:
1. **Modelos en la Nube:** Puede conectarse con Claude 3.5/3.7, Gemini 1.5/2.0 o DeepSeek V3/R1.
2. **Modelos Locales Privados (Soberanía de Datos):** Puede enlazarse con instancias locales de **Ollama** (Llama 3, Qwen 2.5, DeepSeek R1 Distill) corriendo en el servidor del comercio o en la propia tablet del repartidor, sin enviar ningún dato de clientes a la nube pública.

## 3. Casos de Uso en Producción Real

- **Voz y Operativa en Ruta:** El comercial registra pedidos dictando por voz en lenguaje natural mientras conduce o examina un lineal de productos.
- **Auditoría Nocturna Autónoma:** Un agente agendado cruza albaranes emitidos contra cobros registrados en caja y alertas bancarias a las 21:00, generando un informe de conciliación sin intervención humana.
- **Predicción Inteligente de Carga:** El modelo predice la mercancía exacta a cargar en cada furgoneta basándose en historial, estacionalidad y festividades locales.

---

### Conceptos Relacionados
- [[wiki/architecture/everything_is_a_plugin]]: Los plugins como proveedores de tools MCP.
- [[wiki/ai/llm_wiki_architecture]]: Cómo los agentes leen y escriben en la base de conocimiento viva.
- [[wiki/decisions/ADR-001-microkernel-over-clean-monolith]]: Desacoplamiento agéntico.
