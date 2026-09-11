/**
 * PROYECTO DAVID — LÓGICA DE CLIENTE Y COMPONENTES INTERACTIVOS
 * Microkernel Explorer, Consola Simulada MCP y Gestor de Código
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initMicrokernelExplorer();
  initMcpTerminal();
  initLlmWikiExplorer();
  initCodeTabs();
  initCopyButtons();
  initMobileNav();
  initSpotlightCards();
  initParallaxAndTilt();
  initScrollReveal();
});

/* --------------------------------------------------------------------------
   1. EXPLORADOR INTERACTIVO DEL MICROKERNEL (DAVID CONTEXT & PLUGINS)
   -------------------------------------------------------------------------- */
const PLUGINS_DATA = {
  firestore: {
    id: 'core.database.firestore',
    name: 'FirestorePlugin',
    category: 'Core / Infraestructura',
    contract: 'DatabaseService',
    description: 'Provee almacenamiento reactivo NoSQL con persistencia offline explícita y converters fuertemente tipados.',
    provides: ['DatabaseService'],
    dependencies: ['None (Root Service)'],
    lifecycle: {
      onLoad: 'Registra DatabaseService en ctx.provide<DatabaseService>()',
      onReady: 'Verifica conectividad inicial y habilita cache offline',
      onDestroy: 'Cierra listeners y vacía buffers locales'
    },
    mcpTools: 'N/A (Infraestructura base)'
  },
  auth: {
    id: 'core.auth.firebase',
    name: 'FirebaseAuthPlugin',
    category: 'Core / Infraestructura',
    contract: 'AuthService',
    description: 'Gestión segura de identidades, tokens JWT, roles y sesiones locales con refresco transparente.',
    provides: ['AuthService', 'CurrentUserStream'],
    dependencies: ['None (Root Service)'],
    lifecycle: {
      onLoad: 'Registra AuthService en DavidContext',
      onReady: 'Emite estado inicial de autenticación al Shell UI',
      onDestroy: 'Cancela stream de sesión y revoca credenciales en memoria'
    },
    mcpTools: 'validar_sesion_operador()'
  },
  orders: {
    id: 'business.orders.fast_pos',
    name: 'OrdersPlugin',
    category: 'Negocio / Feature-First',
    contract: 'OrdersService & OrdersRepository',
    description: 'Captura y toma rápida de pedidos, preventa en ruta, cálculo dinámico de tarifas e impuestos en modo offline.',
    provides: ['OrdersRepository', 'OrderDraftNotifier'],
    dependencies: ['DatabaseService', 'AuthService'],
    lifecycle: {
      onLoad: 'Inyecta DatabaseService mediante ctx.inject<DatabaseService>()',
      onReady: 'Registra rutas /orders y /orders/:id en el App Shell',
      onDestroy: 'Persiste borradores en cola local de sincronización'
    },
    mcpTools: 'consultar_pedidos(), crear_pedido_borrador(), emitir_albaran()'
  },
  routes: {
    id: 'business.routes.logistics',
    name: 'RoutesPlugin',
    category: 'Negocio / Feature-First',
    contract: 'RouteManagerService',
    description: 'Planificación de itinerarios diarios para repartidores y comerciales, optimización de paradas y geolocalización.',
    provides: ['RoutePlannerService'],
    dependencies: ['DatabaseService', 'OrdersService'],
    lifecycle: {
      onLoad: 'Inyecta DatabaseService y vincula paradas con clientes',
      onReady: 'Monta vista de mapa reactivo y lista de ruta en curso',
      onDestroy: 'Guarda kilometraje y estado final de ruta'
    },
    mcpTools: 'obtener_ruta_del_dia(), registrar_entrega_cliente()'
  },
  printer: {
    id: 'hardware.printer.escpos',
    name: 'EscPosPrinterPlugin',
    category: 'Hardware & Periféricos',
    contract: 'ThermalPrinterService',
    description: 'Controlador directo de impresión térmica vía Bluetooth, USB o Red para tickets y albaranes en furgoneta.',
    provides: ['PrinterService'],
    dependencies: ['None (Hardware Driver)'],
    lifecycle: {
      onLoad: 'Registra adaptador de puerto serie/BT en DavidContext',
      onReady: 'Escucha eventos de albarán emitido por OrdersPlugin',
      onDestroy: 'Libera socket Bluetooth y drena cola de impresión'
    },
    mcpTools: 'imprimir_resumen_cierre_caja()'
  },
  scanner: {
    id: 'hardware.scanner.barcode2d',
    name: 'BarcodeScannerPlugin',
    category: 'Hardware & Periféricos',
    contract: 'BarcodeScannerService',
    description: 'Captura de códigos 1D/2D (EAN13, QR, DataMatrix) mediante hardware integrado o cámara nativa.',
    provides: ['ScannerStreamService'],
    dependencies: ['None'],
    lifecycle: {
      onLoad: 'Registra canal nativo de escaneo en background',
      onReady: 'Canaliza eventos de lectura al bus de eventos de David',
      onDestroy: 'Cierra listener de cámara/láser'
    },
    mcpTools: 'escanear_codigo_producto()'
  },
  ai_harness: {
    id: 'ai.copilot.mcp_harness',
    name: 'McpAgentHarnessPlugin',
    category: 'AI Agéntica Nativa',
    contract: 'McpServerBridge & AgentService',
    description: 'Expone capacidades del sistema como Tools & Resources bajo el estándar universal MCP para LLMs locales y en la nube.',
    provides: ['McpServerBridge'],
    dependencies: ['DatabaseService', 'OrdersService'],
    lifecycle: {
      onLoad: 'Inspecciona plugins registrados y agrega sus McpToolDefinition',
      onReady: 'Levanta servidor MCP local (stdio/SSE) o sincroniza con Cloud Functions',
      onDestroy: 'Detiene sesiones agénticas activas de forma segura'
    },
    mcpTools: 'ejecutar_auditoria_nocturna(), pronosticar_demanda_stock()'
  }
};

function initMicrokernelExplorer() {
  const slots = document.querySelectorAll('.plugin-slot');
  const inspectorTitle = document.getElementById('inspector-name');
  const inspectorCategory = document.getElementById('inspector-category');
  const inspectorContract = document.getElementById('inspector-contract');
  const inspectorProvides = document.getElementById('inspector-provides');
  const inspectorDependencies = document.getElementById('inspector-dependencies');
  const inspectorTools = document.getElementById('inspector-tools');
  const inspectorOnLoad = document.getElementById('step-onload');
  const inspectorOnReady = document.getElementById('step-onready');
  const inspectorOnDestroy = document.getElementById('step-ondestroy');

  if (!slots.length || !inspectorTitle) return;

  function updateInspector(pluginKey) {
    const data = PLUGINS_DATA[pluginKey];
    if (!data) return;

    inspectorTitle.textContent = data.name;
    inspectorCategory.textContent = data.category;
    inspectorContract.textContent = data.contract;
    inspectorProvides.textContent = data.provides.join(', ');
    inspectorDependencies.textContent = data.dependencies.join(', ');
    inspectorTools.textContent = data.mcpTools;
    inspectorOnLoad.textContent = data.lifecycle.onLoad;
    inspectorOnReady.textContent = data.lifecycle.onReady;
    inspectorOnDestroy.textContent = data.lifecycle.onDestroy;

    slots.forEach(slot => {
      slot.classList.toggle('active', slot.dataset.plugin === pluginKey);
    });
  }

  slots.forEach(slot => {
    slot.addEventListener('click', () => {
      const key = slot.dataset.plugin;
      updateInspector(key);
    });
  });

  // Activar el primero por defecto (orders)
  updateInspector('orders');
}

/* --------------------------------------------------------------------------
   2. CONSOLA SIMULADA DE DAVID COPILOT (MCP REPORTE & TOOLS)
   -------------------------------------------------------------------------- */
const MCP_DEMO_RESPONSES = {
  pedidos: {
    query: 'consultar_pedidos_pendientes()',
    output: `[MCP: Tools.Invoke -> OrdersPlugin.fetchPendingSync]
Status: 200 OK | Modo: Cache reactiva Firestore (Offline-First)

Resultados encontrados: 4 pedidos en cola local:
- Pedido #8491 | Cliente: Distribuciones Ramos | Total: 428.50 € [Sincronizado]
- Pedido #8492 | Cliente: Cafetería Central   | Total:  94.20 € [Sincronizado]
- Pedido #8493 | Cliente: Bar El Encuentro    | Total: 165.00 € [Pendiente de red]
- Pedido #8494 | Cliente: Hotel Mirador       | Total: 612.80 € [Pendiente de red]

Resumen: 2 pedidos persistidos en cloud, 2 encolados en SQLite/IndexedDB local.`
  },
  auditoria: {
    query: 'auditoria_nocturna_albaranes()',
    output: `[MCP: Tools.Invoke -> AuditService.reconcileShift]
Ejecutando cruce de transacciones 2026-09-08:
- Albaranes emitidos hoy: 18 documentos
- Cobros en metálico: 1.420,00 € (Coincide con arqueo de caja)
- Cobros vía Datafono/TPV: 2.890,50 € (Verificado con extracto bancario)
- Saldo pendiente en cuenta corriente: 340,00 € (Asignado a Crédito Cliente #104)

Discrepancias detectadas: 0
Estado del Cuadre: CONCILIADO CON ÉXITO (Cierre generado a las 21:00:00)`
  },
  stock: {
    query: 'predecir_reposicion_stock("Ruta Norte")',
    output: `[MCP: Tools.Invoke -> PredictiveStockService.forecastDemand]
Analizando histórico de 18 años y consumo estacional (Mes: Septiembre):
Ruta asignada: "Ruta Norte" (Comercial: David R.)

Recomendación de carga en furgoneta para mañana:
1. Ref. #A-201 (Café Tueste Natural 1kg)  -> Cargar +15 bultos (+22% vs media)
2. Ref. #B-104 (Azúcar Sobres 10kg)      -> Cargar +6 bultos (Consumo estable)
3. Ref. #C-550 (Vasos Biodegradables 8oz) -> Cargar +8 paquetes (Demanda alta)

Alerta de prevención: 1 cliente en ruta sin stock desde hace 4 días (Restaurante Bahía).`
  },
  limpiar: {
    query: 'clear',
    output: null
  }
};

function initMcpTerminal() {
  const terminalBody = document.getElementById('terminal-body');
  const buttons = document.querySelectorAll('.quick-query-btn');

  if (!terminalBody || !buttons.length) return;

  function runQuery(key) {
    const data = MCP_DEMO_RESPONSES[key];
    if (!data) return;

    if (key === 'limpiar') {
      terminalBody.innerHTML = `
        <div class="terminal-line">
          <span class="terminal-prompt">david-copilot@mcp:~$</span>
          <span class="terminal-input">ready</span>
        </div>
        <div class="terminal-output">
          Servidor MCP listo. Selecciona una consulta rápida o invoca una herramienta.
        </div>
      `;
      return;
    }

    const commandBlock = document.createElement('div');
    commandBlock.className = 'terminal-line';
    commandBlock.innerHTML = `
      <span class="terminal-prompt">david-copilot@mcp:~$</span>
      <span class="terminal-input">${data.query}</span>
    `;

    const outputBlock = document.createElement('div');
    outputBlock.className = 'terminal-output success';
    outputBlock.innerHTML = `<pre style="white-space: pre-wrap; font-family: inherit;">${data.output}</pre>`;

    terminalBody.appendChild(commandBlock);
    terminalBody.appendChild(outputBlock);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.query;
      runQuery(q);
    });
  });
}

/* --------------------------------------------------------------------------
   3. EXPLORADOR INTERACTIVO LLM-WIKI (GRAFO DE CONOCIMIENTO VIVO)
   -------------------------------------------------------------------------- */
function initLlmWikiExplorer() {
  const searchInput = document.getElementById('wiki-search-input');
  const clearBtn = document.getElementById('wiki-search-clear');
  const catButtons = document.querySelectorAll('.wiki-cat-btn');
  const articlesListEl = document.getElementById('wiki-articles-list');
  const resultsIndicator = document.getElementById('wiki-results-indicator');
  const articlesCountEl = document.getElementById('wiki-articles-count');

  const readerCategory = document.getElementById('wiki-current-category');
  const readerTime = document.getElementById('wiki-current-time');
  const readerPath = document.getElementById('wiki-current-path');
  const readerTitle = document.getElementById('wiki-current-title');
  const readerTags = document.getElementById('wiki-current-tags');
  const readerBody = document.getElementById('wiki-reader-body');
  const readerLinks = document.getElementById('wiki-current-links');
  const readerBacklinks = document.getElementById('wiki-current-backlinks');

  // Vistas y Contenedores
  const btnViewExplorer = document.getElementById('btn-view-explorer');
  const btnViewGraph = document.getElementById('btn-view-graph');
  const graphViewEl = document.getElementById('wiki-graph-view');
  const browserLayoutEl = document.getElementById('wiki-browser-layout');
  const canvas = document.getElementById('wiki-graph-canvas');

  // Acciones del Lector
  const copyLinkBtn = document.getElementById('wiki-copy-link-btn');
  const copyLlmBtn = document.getElementById('wiki-copy-llm-btn');
  const zenToggleBtn = document.getElementById('wiki-zen-toggle-btn');

  // Controles del Grafo
  const graphZoomIn = document.getElementById('graph-zoom-in');
  const graphZoomOut = document.getElementById('graph-zoom-out');
  const graphReset = document.getElementById('graph-reset');

  if (!articlesListEl || typeof LLM_WIKI_DATA === 'undefined') return;

  const dataset = LLM_WIKI_DATA;
  const articlesMap = dataset.articles;
  const allArticles = Object.values(articlesMap);

  let activeCategory = 'all';
  let activeSearch = '';
  let selectedArticleId = 'microkernel-core';
  let currentView = 'explorer';

  if (articlesCountEl) {
    articlesCountEl.textContent = `${allArticles.length} Entradas Activas`;
  }

  // --------------------------------------------------------------------------
  // A. CONSTRUCCIÓN DEL ÍNDICE DE BACKLINKS (REFERENCIAS ENTRANTES)
  // --------------------------------------------------------------------------
  const backlinksMap = {};
  allArticles.forEach(art => { backlinksMap[art.id] = []; });
  allArticles.forEach(art => {
    (art.links || []).forEach(targetId => {
      if (backlinksMap[targetId] && !backlinksMap[targetId].includes(art.id)) {
        backlinksMap[targetId].push(art.id);
      }
    });
  });

  // --------------------------------------------------------------------------
  // B. RENDERIZADOR LIVIANO DE MARKDOWN CON RESALTADO DE BÚSQUEDA
  // --------------------------------------------------------------------------
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function renderMarkdown(md, searchTerm) {
    if (!md) return '';
    let html = md;

    // Escapar etiquetas HTML
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bloques de código (```dart ... ```)
    const codeBlocks = [];
    html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(`<pre class="wiki-code-block"><div class="wiki-code-lang">${lang || 'código'}</div><code>${code.trim()}</code></pre>`);
      return placeholder;
    });

    // Código en línea (`...`)
    const inlineCodes = [];
    html = html.replace(/`([^`]+)`/g, (match, code) => {
      const placeholder = `__INLINE_CODE_${inlineCodes.length}__`;
      inlineCodes.push(`<code class="wiki-inline-code">${code}</code>`);
      return placeholder;
    });

    // Citas (> ...)
    html = html.replace(/^>\s*(.+)$/gm, '<blockquote class="wiki-quote">$1</blockquote>');

    // Encabezados
    html = html.replace(/^### (.*$)/gm, '<h4 class="wiki-h3">$1</h4>');
    html = html.replace(/^## (.*$)/gm, '<h3 class="wiki-h2">$1</h3>');
    html = html.replace(/^# (.*$)/gm, '<h2 class="wiki-h1">$1</h2>');

    // Negrita y cursiva
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Tablas Markdown
    html = html.replace(/\n\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.*\|\n?)*)/g, (match, header, rows) => {
      const ths = header.split('|').map(h => h.trim()).filter(h => h.length > 0)
        .map(h => `<th>${h}</th>`).join('');
      const trs = rows.trim().split('\n').map(row => {
        const tds = row.split('|').map(td => td.trim()).filter(td => td.length > 0)
          .map(td => `<td>${td}</td>`).join('');
        return `<tr>${tds}</tr>`;
      }).join('');
      return `<div class="wiki-table-wrapper"><table class="wiki-table"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`;
    });

    // Listas desordenadas
    html = html.replace(/^[\*\-]\s+(.*)$/gm, '<li class="wiki-li">$1</li>');
    html = html.replace(/(<li class="wiki-li">[\s\S]*?<\/li>)/g, '<ul class="wiki-ul">$1</ul>');
    html = html.replace(/<\/ul>\s*<ul class="wiki-ul">/g, '');

    // Listas ordenadas
    html = html.replace(/^\d+\.\s+(.*)$/gm, '<li class="wiki-oli">$1</li>');
    html = html.replace(/(<li class="wiki-oli">[\s\S]*?<\/li>)/g, '<ol class="wiki-ol">$1</ol>');
    html = html.replace(/<\/ol>\s*<ol class="wiki-ol">/g, '');

    // Wikilinks [[target]] o [[target|label]]
    html = html.replace(/\[\[(?:wiki\/)?([a-zA-Z0-9_\-\/]+)(?:\|([^\]]+))?\]\]/g, (match, linkTarget, label) => {
      const parts = linkTarget.split('/');
      const slugOrId = parts[parts.length - 1];
      const found = allArticles.find(a => a.id === slugOrId || a.slug === slugOrId);
      const displayLabel = label || (found ? found.title : slugOrId);
      const targetId = found ? found.id : slugOrId;

      return `<a href="#wiki/${targetId}" class="wiki-wikilink" data-wikilink="${targetId}">[[${displayLabel}]]</a>`;
    });

    // Párrafos
    html = html.split('\n\n').map(para => {
      const trimmed = para.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h') || trimmed.startsWith('<pre') || 
          trimmed.startsWith('<blockquote') || trimmed.startsWith('<ul') || 
          trimmed.startsWith('<ol') || trimmed.startsWith('<div') || trimmed.startsWith('__CODE_BLOCK_')) {
        return trimmed;
      }
      if (trimmed === '---') {
        return '<hr class="wiki-divider">';
      }
      return `<p class="wiki-p">${trimmed.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');

    // Restaurar códigos en línea y bloques de código
    inlineCodes.forEach((block, idx) => {
      html = html.replace(`__INLINE_CODE_${idx}__`, block);
    });
    codeBlocks.forEach((block, idx) => {
      html = html.replace(`__CODE_BLOCK_${idx}__`, block);
    });

    // Resaltado de término de búsqueda activo
    if (searchTerm && searchTerm.length >= 2 && !searchTerm.startsWith('#')) {
      try {
        const regex = new RegExp(`(?![^<]*>)(?![^<]*<\/code>)(?![^<]*<\/pre>)(${escapeRegex(searchTerm)})`, 'gi');
        html = html.replace(regex, '<mark class="wiki-highlight">$1</mark>');
      } catch (e) {
        // Ignorar si hay caracteres inválidos
      }
    }

    return html;
  }

  // --------------------------------------------------------------------------
  // C. RENDERIZADO DEL ARTÍCULO ACTIVO (CON BACKLINKS Y DEEP LINKING)
  // --------------------------------------------------------------------------
  function displayArticle(articleId, updateHistory = true) {
    const article = articlesMap[articleId] || allArticles[0];
    if (!article) return;

    selectedArticleId = article.id;

    // Sincronizar URL Hash para Deep Linking
    if (updateHistory) {
      if (window.location.hash !== `#wiki/${article.id}`) {
        history.replaceState(null, '', `#wiki/${article.id}`);
      }
    }

    // Metadatos
    if (readerCategory) readerCategory.textContent = article.category;
    if (readerTime) readerTime.textContent = `${article.reading_time_min || 3} min de lectura`;
    if (readerPath) readerPath.textContent = article.path;
    if (readerTitle) readerTitle.textContent = article.title;

    // Tags interactivos clicables
    if (readerTags) {
      readerTags.innerHTML = (article.tags || []).map(t => 
        `<span class="wiki-tag clickable" data-tag="${t}">#${t}</span>`
      ).join('');
    }

    // Cuerpo con renderizado Markdown
    if (readerBody) {
      readerBody.innerHTML = renderMarkdown(article.body, activeSearch);
    }

    // Nodos Conectados (Enlaces Salientes / Outgoing Links)
    if (readerLinks) {
      const links = article.links || [];
      if (!links.length) {
        readerLinks.innerHTML = '<span class="wiki-no-links">Nodo raíz sin enlaces salientes.</span>';
      } else {
        readerLinks.innerHTML = links.map(linkId => {
          const linkedArt = articlesMap[linkId];
          const title = linkedArt ? linkedArt.title : linkId;
          return `<button class="wiki-link-chip" data-wikilink="${linkId}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            <span>${title}</span>
          </button>`;
        }).join('');
      }
    }

    // Backlinks (Referencias Entrantes / Incoming Mentions)
    if (readerBacklinks) {
      const incoming = backlinksMap[article.id] || [];
      if (!incoming.length) {
        readerBacklinks.innerHTML = '<span class="wiki-no-links">Ningún otro nodo cita este documento aún.</span>';
      } else {
        readerBacklinks.innerHTML = incoming.map(sourceId => {
          const sourceArt = articlesMap[sourceId];
          const title = sourceArt ? sourceArt.title : sourceId;
          return `<button class="wiki-link-chip" data-wikilink="${sourceId}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 14 4 9l5-5"></path><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"></path></svg>
            <span>${title}</span>
          </button>`;
        }).join('');
      }
    }

    // Actualizar clase activa en la lista lateral
    document.querySelectorAll('.wiki-article-item').forEach(item => {
      item.classList.toggle('active', item.dataset.articleId === article.id);
    });

    // Escuchadores a wikilinks en el texto y pie
    document.querySelectorAll('[data-wikilink]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = el.getAttribute('data-wikilink');
        if (articlesMap[targetId]) {
          if (currentView === 'graph') {
            switchView('explorer');
          }
          displayArticle(targetId);
          if (window.innerWidth <= 992) {
            const readerEl = document.getElementById('wiki-reader');
            if (readerEl) readerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });

    // Escuchadores a tags interactivos
    document.querySelectorAll('.wiki-tag.clickable').forEach(tagEl => {
      tagEl.addEventListener('click', () => {
        const tag = tagEl.dataset.tag;
        activeSearch = tag;
        if (searchInput) {
          searchInput.value = tag;
          if (clearBtn) clearBtn.style.display = 'block';
        }
        filterArticles();
      });
    });
  }

  // --------------------------------------------------------------------------
  // D. FILTRADO Y BÚSQUEDA REACTIVA
  // --------------------------------------------------------------------------
  function filterArticles() {
    const q = activeSearch.toLowerCase().trim();
    const cat = activeCategory;

    const filtered = allArticles.filter(art => {
      const matchCat = (cat === 'all' || art.category === cat);
      if (!matchCat) return false;

      if (!q) return true;

      // Soporte para búsqueda por tag (#tag o tag)
      const cleanTag = q.replace(/^#/, '');
      const tagsMatch = (art.tags || []).some(t => t.toLowerCase().includes(cleanTag));

      const titleMatch = art.title.toLowerCase().includes(q);
      const descMatch = (art.description || '').toLowerCase().includes(q);
      const bodyMatch = (art.body || '').toLowerCase().includes(q);

      return titleMatch || descMatch || tagsMatch || bodyMatch;
    });

    renderArticlesList(filtered);

    if (resultsIndicator) {
      resultsIndicator.textContent = `${filtered.length} artículo${filtered.length === 1 ? '' : 's'}`;
    }

    // Si el seleccionado actual ya no está en los resultados, seleccionar el primero
    if (filtered.length > 0) {
      const stillThere = filtered.some(a => a.id === selectedArticleId);
      if (!stillThere) {
        displayArticle(filtered[0].id);
      }
    }
  }

  function renderArticlesList(items) {
    if (!items.length) {
      articlesListEl.innerHTML = `
        <div class="wiki-empty-state">
          <div class="wiki-empty-icon">🔍</div>
          <p>No se hallaron artículos para la búsqueda.</p>
          <button class="wiki-reset-btn" id="wiki-reset-search">Restablecer filtros</button>
        </div>
      `;
      const resetBtn = document.getElementById('wiki-reset-search');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          activeSearch = '';
          if (searchInput) searchInput.value = '';
          if (clearBtn) clearBtn.style.display = 'none';
          activeCategory = 'all';
          catButtons.forEach(b => b.classList.toggle('active', b.dataset.category === 'all'));
          filterArticles();
        });
      }
      return;
    }

    articlesListEl.innerHTML = items.map(art => {
      const isActive = art.id === selectedArticleId;
      return `
        <div class="wiki-article-item ${isActive ? 'active' : ''}" data-article-id="${art.id}">
          <div class="wiki-item-top">
            <span class="wiki-item-cat">${art.category}</span>
            <span class="wiki-item-time">${art.reading_time_min || 3}m</span>
          </div>
          <div class="wiki-item-title">${art.title}</div>
          <div class="wiki-item-desc">${art.description}</div>
          <div class="wiki-item-tags">
            ${(art.tags || []).slice(0, 3).map(t => `<span class="wiki-item-tag" data-tag="${t}">#${t}</span>`).join('')}
          </div>
        </div>
      `;
    }).join('');

    articlesListEl.querySelectorAll('.wiki-article-item').forEach(item => {
      item.addEventListener('click', (e) => {
        // Si hizo clic en un tag dentro del item
        if (e.target.classList.contains('wiki-item-tag')) {
          e.stopPropagation();
          const tag = e.target.dataset.tag;
          activeSearch = tag;
          if (searchInput) {
            searchInput.value = tag;
            if (clearBtn) clearBtn.style.display = 'block';
          }
          filterArticles();
          return;
        }
        const id = item.dataset.articleId;
        displayArticle(id);
      });
    });
  }

  // --------------------------------------------------------------------------
  // E. BOTONES DE ACCIÓN: COPIAR ENLACE, COPIAR PARA LLM, MODO ZEN
  // --------------------------------------------------------------------------
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', async () => {
      const fullUrl = `${window.location.origin}${window.location.pathname}#wiki/${selectedArticleId}`;
      try {
        await navigator.clipboard.writeText(fullUrl);
        const btnText = copyLinkBtn.querySelector('.btn-text');
        const originalText = btnText.textContent;
        copyLinkBtn.classList.add('copied');
        btnText.textContent = '¡Enlace Copiado!';
        setTimeout(() => {
          copyLinkBtn.classList.remove('copied');
          btnText.textContent = originalText;
        }, 2200);
      } catch (err) {
        console.error('Error al copiar al portapapeles:', err);
      }
    });
  }

  if (copyLlmBtn) {
    copyLlmBtn.addEventListener('click', async () => {
      const art = articlesMap[selectedArticleId];
      if (!art) return;

      const llmPrompt = `[CONTEXTO DE PROYECTO DAVID // DOCUMENTO DE ARQUITECTURA]
Título: ${art.title}
Categoría: ${art.category} | Ruta: ${art.path}
Etiquetas: ${(art.tags || []).join(', ')}
---
${art.body}
`;
      try {
        await navigator.clipboard.writeText(llmPrompt);
        const btnText = copyLlmBtn.querySelector('.btn-text');
        const originalText = btnText.textContent;
        copyLlmBtn.classList.add('copied');
        btnText.textContent = '¡Contexto Copiado!';
        setTimeout(() => {
          copyLlmBtn.classList.remove('copied');
          btnText.textContent = originalText;
        }, 2200);
      } catch (err) {
        console.error('Error al copiar contexto LLM:', err);
      }
    });
  }

  if (zenToggleBtn && browserLayoutEl) {
    zenToggleBtn.addEventListener('click', () => {
      const isZen = browserLayoutEl.classList.toggle('zen-active');
      const iconExpand = zenToggleBtn.querySelector('.icon-zen-expand');
      const iconCollapse = zenToggleBtn.querySelector('.icon-zen-collapse');
      if (iconExpand) iconExpand.style.display = isZen ? 'none' : 'block';
      if (iconCollapse) iconCollapse.style.display = isZen ? 'block' : 'none';
      zenToggleBtn.title = isZen ? 'Salir del Modo Zen' : 'Modo Pantalla Completa / Zen';
    });
  }

  // --------------------------------------------------------------------------
  // F. MOTOR DE GRAFO DE CONOCIMIENTO 2D INTERACTIVO (CANVAS CON FÍSICA)
  // --------------------------------------------------------------------------
  let graphAnimationId = null;
  let graphNodes = [];
  let graphEdges = [];
  let graphScale = 1;
  let graphPanX = 0;
  let graphPanY = 0;
  let isDraggingNode = false;
  let draggedNode = null;
  let isPanningGraph = false;
  let panStartX = 0;
  let panStartY = 0;
  let hoveredNode = null;

  const CATEGORY_COLORS = {
    'Filosofía': '#38bdf8',       // Cyan
    'Arquitectura': '#34d399',    // Verde Esmeralda
    'AI & Agentes': '#a78bfa',    // Violeta
    'Decisiones (ADRs)': '#fbbf24' // Ámbar
  };

  function initGraphEngine() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar resolución Retina
    function resizeCanvas() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = (rect.height || 600) * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height || 600}px`;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Inicializar Nodos y Aristas
    const width = canvas.parentElement.clientWidth || 800;
    const height = canvas.parentElement.clientHeight || 600;
    const centerX = width / 2;
    const centerY = height / 2;
    const count = allArticles.length;

    graphNodes = allArticles.map((art, idx) => {
      const angle = (idx / count) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.32;
      return {
        id: art.id,
        title: art.title,
        category: art.category,
        color: CATEGORY_COLORS[art.category] || '#94a3b8',
        x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 40,
        y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
        radius: 20,
        pinned: false
      };
    });

    // Mapear Aristas a partir de los links
    graphEdges = [];
    const nodeMap = {};
    graphNodes.forEach(n => { nodeMap[n.id] = n; });

    allArticles.forEach(art => {
      (art.links || []).forEach(targetId => {
        if (nodeMap[art.id] && nodeMap[targetId]) {
          graphEdges.push({
            source: nodeMap[art.id],
            target: nodeMap[targetId]
          });
        }
      });
    });

    // Física de resortes elásticos (Spring-Embedder)
    function stepPhysics() {
      const kRepulsion = 12000;
      const springLength = 140;
      const springK = 0.035;
      const centerGravity = 0.015;
      const currentCenterX = (canvas.parentElement.clientWidth || 800) / 2;
      const currentCenterY = (canvas.parentElement.clientHeight || 600) / 2;

      // 1. Repulsión mutua entre todos los pares de nodos
      for (let i = 0; i < graphNodes.length; i++) {
        for (let j = i + 1; j < graphNodes.length; j++) {
          const n1 = graphNodes[i];
          const n2 = graphNodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);

          const force = kRepulsion / distSq;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (!n1.pinned) { n1.vx -= fx; n1.vy -= fy; }
          if (!n2.pinned) { n2.vx += fx; n2.vy += fy; }
        }
      }

      // 2. Atracción elástica por aristas vinculadas
      graphEdges.forEach(edge => {
        const dx = edge.target.x - edge.source.x;
        const dy = edge.target.y - edge.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const delta = dist - springLength;
        const force = delta * springK;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (!edge.source.pinned) { edge.source.vx += fx; edge.source.vy += fy; }
        if (!edge.target.pinned) { edge.target.vx -= fx; edge.target.vy -= fy; }
      });

      // 3. Gravedad central suave y amortiguamiento
      graphNodes.forEach(n => {
        if (!n.pinned) {
          n.vx += (currentCenterX - n.x) * centerGravity;
          n.vy += (currentCenterY - n.y) * centerGravity;
          n.x += n.vx;
          n.y += n.vy;
          n.vx *= 0.82;
          n.vy *= 0.82;
        }
      });
    }

    // Bucle de renderizado a 60 fps
    function drawGraph() {
      if (currentView !== 'graph') return;

      stepPhysics();

      const rect = canvas.parentElement.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      ctx.save();
      ctx.translate(graphPanX, graphPanY);
      ctx.scale(graphScale, graphScale);

      // Dibujar fondo sutil de red
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = -rect.width; x < rect.width * 2; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, -rect.height);
        ctx.lineTo(x, rect.height * 2);
        ctx.stroke();
      }
      for (let y = -rect.height; y < rect.height * 2; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(-rect.width, y);
        ctx.lineTo(rect.width * 2, y);
        ctx.stroke();
      }

      // Dibujar aristas
      graphEdges.forEach(edge => {
        const isConnectedToHovered = hoveredNode && (edge.source === hoveredNode || edge.target === hoveredNode);
        const isConnectedToActive = selectedArticleId && (edge.source.id === selectedArticleId || edge.target.id === selectedArticleId);

        ctx.beginPath();
        ctx.moveTo(edge.source.x, edge.source.y);
        ctx.lineTo(edge.target.x, edge.target.y);

        if (isConnectedToHovered) {
          ctx.strokeStyle = 'rgba(217, 119, 6, 0.85)';
          ctx.lineWidth = 2.5;
        } else if (isConnectedToActive) {
          ctx.strokeStyle = 'rgba(217, 119, 6, 0.5)';
          ctx.lineWidth = 1.8;
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
        }
        ctx.stroke();
      });

      // Dibujar nodos
      graphNodes.forEach(node => {
        const isHovered = (node === hoveredNode);
        const isSelected = (node.id === selectedArticleId);

        // Halo resplandeciente exterior
        if (isHovered || isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + (isHovered ? 12 : 7), 0, Math.PI * 2);
          ctx.fillStyle = isHovered ? 'rgba(217, 119, 6, 0.25)' : 'rgba(217, 119, 6, 0.15)';
          ctx.fill();
        }

        // Círculo base del nodo
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#141720';
        ctx.fill();
        ctx.strokeStyle = isHovered ? '#f59e0b' : node.color;
        ctx.lineWidth = isSelected ? 3.5 : 2;
        ctx.stroke();

        // Punto interior coloreado
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Etiqueta tipográfica del nodo
        ctx.font = isHovered ? '600 12px Inter, sans-serif' : '500 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const label = node.title.length > 24 ? node.title.slice(0, 22) + '…' : node.title;
        const textWidth = ctx.measureText(label).width;

        // Pastilla de fondo para legibilidad
        ctx.fillStyle = 'rgba(10, 12, 16, 0.85)';
        ctx.fillRect(node.x - textWidth / 2 - 6, node.y + node.radius + 6, textWidth + 12, 18);
        ctx.strokeStyle = isHovered ? 'rgba(217, 119, 6, 0.6)' : 'rgba(255, 255, 255, 0.1)';
        ctx.strokeRect(node.x - textWidth / 2 - 6, node.y + node.radius + 6, textWidth + 12, 18);

        ctx.fillStyle = isHovered ? '#fbbf24' : '#e2e8f0';
        ctx.fillText(label, node.x, node.y + node.radius + 15);
      });

      ctx.restore();

      graphAnimationId = requestAnimationFrame(drawGraph);
    }

    // Coordenadas con soporte de transformaciones de Canvas
    function getCanvasCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      const rawX = clientX - rect.left;
      const rawY = clientY - rect.top;
      return {
        x: (rawX - graphPanX) / graphScale,
        y: (rawY - graphPanY) / graphScale,
        screenX: rawX,
        screenY: rawY
      };
    }

    function findNodeAt(x, y) {
      for (let i = graphNodes.length - 1; i >= 0; i--) {
        const n = graphNodes[i];
        const dx = n.x - x;
        const dy = n.y - y;
        if (Math.sqrt(dx * dx + dy * dy) <= n.radius + 8) {
          return n;
        }
      }
      return null;
    }

    // Eventos de ratón y touch para el grafo
    let clickStartX = 0;
    let clickStartY = 0;

    canvas.addEventListener('mousedown', (e) => {
      const coords = getCanvasCoords(e);
      clickStartX = coords.screenX;
      clickStartY = coords.screenY;
      const hit = findNodeAt(coords.x, coords.y);

      if (hit) {
        isDraggingNode = true;
        draggedNode = hit;
        draggedNode.pinned = true;
        canvas.style.cursor = 'grabbing';
      } else {
        isPanningGraph = true;
        panStartX = coords.screenX - graphPanX;
        panStartY = coords.screenY - graphPanY;
        canvas.style.cursor = 'move';
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!canvas || currentView !== 'graph') return;
      const coords = getCanvasCoords(e);

      if (isDraggingNode && draggedNode) {
        draggedNode.x = coords.x;
        draggedNode.y = coords.y;
      } else if (isPanningGraph) {
        graphPanX = coords.screenX - panStartX;
        graphPanY = coords.screenY - panStartY;
      } else {
        const hit = findNodeAt(coords.x, coords.y);
        hoveredNode = hit;
        canvas.style.cursor = hit ? 'pointer' : 'grab';
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (!canvas || currentView !== 'graph') return;
      const coords = getCanvasCoords(e);
      const dragDist = Math.hypot(coords.screenX - clickStartX, coords.screenY - clickStartY);

      if (isDraggingNode && draggedNode) {
        draggedNode.pinned = false;
        // Si fue un clic simple sin arrastre sustancial, abrir el artículo
        if (dragDist < 6) {
          const clickedId = draggedNode.id;
          switchView('explorer');
          displayArticle(clickedId);
        }
      }

      isDraggingNode = false;
      draggedNode = null;
      isPanningGraph = false;
      canvas.style.cursor = 'grab';
    });

    // Soporte para Touch móvil
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const coords = getCanvasCoords(e);
        clickStartX = coords.screenX;
        clickStartY = coords.screenY;
        const hit = findNodeAt(coords.x, coords.y);
        if (hit) {
          isDraggingNode = true;
          draggedNode = hit;
          draggedNode.pinned = true;
        }
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (isDraggingNode && draggedNode && e.touches.length === 1) {
        const coords = getCanvasCoords(e);
        draggedNode.x = coords.x;
        draggedNode.y = coords.y;
      }
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => {
      if (isDraggingNode && draggedNode) {
        draggedNode.pinned = false;
        const coords = getCanvasCoords(e);
        const dragDist = Math.hypot(coords.screenX - clickStartX, coords.screenY - clickStartY);
        if (dragDist < 10) {
          const clickedId = draggedNode.id;
          switchView('explorer');
          displayArticle(clickedId);
        }
      }
      isDraggingNode = false;
      draggedNode = null;
    });

    // Zoom y Reset
    if (graphZoomIn) {
      graphZoomIn.addEventListener('click', () => {
        graphScale = Math.min(graphScale * 1.25, 2.8);
      });
    }

    if (graphZoomOut) {
      graphZoomOut.addEventListener('click', () => {
        graphScale = Math.max(graphScale / 1.25, 0.4);
      });
    }

    if (graphReset) {
      graphReset.addEventListener('click', () => {
        graphScale = 1;
        graphPanX = 0;
        graphPanY = 0;
      });
    }

    // Iniciar loop
    if (graphAnimationId) cancelAnimationFrame(graphAnimationId);
    graphAnimationId = requestAnimationFrame(drawGraph);
  }

  // --------------------------------------------------------------------------
  // G. CONMUTACIÓN DE VISTAS (EXPLORADOR VS GRAFO 2D)
  // --------------------------------------------------------------------------
  function switchView(viewName) {
    currentView = viewName;
    if (viewName === 'graph') {
      if (btnViewExplorer) btnViewExplorer.classList.remove('active');
      if (btnViewGraph) btnViewGraph.classList.add('active');
      if (browserLayoutEl) browserLayoutEl.style.display = 'none';
      if (graphViewEl) graphViewEl.style.display = 'block';
      initGraphEngine();
    } else {
      if (btnViewGraph) btnViewGraph.classList.remove('active');
      if (btnViewExplorer) btnViewExplorer.classList.add('active');
      if (graphViewEl) graphViewEl.style.display = 'none';
      if (browserLayoutEl) browserLayoutEl.style.display = 'grid';
      if (graphAnimationId) {
        cancelAnimationFrame(graphAnimationId);
        graphAnimationId = null;
      }
    }
  }

  if (btnViewExplorer) {
    btnViewExplorer.addEventListener('click', () => switchView('explorer'));
  }

  if (btnViewGraph) {
    btnViewGraph.addEventListener('click', () => switchView('graph'));
  }

  // --------------------------------------------------------------------------
  // H. LISTENERS DE BÚSQUEDA Y CATEGORÍAS
  // --------------------------------------------------------------------------
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeSearch = e.target.value;
      if (clearBtn) clearBtn.style.display = activeSearch ? 'block' : 'none';
      filterArticles();
      // Si estamos en modo grafo y busca, volvemos a la lista para ver resultados
      if (activeSearch && currentView === 'graph') {
        switchView('explorer');
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      activeSearch = '';
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      clearBtn.style.display = 'none';
      filterArticles();
    });
  }

  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      filterArticles();
    });
  });

  // --------------------------------------------------------------------------
  // I. ENRUTAMIENTO POR HASH Y DEEP LINKING (HISTORIAL DEL NAVEGADOR)
  // --------------------------------------------------------------------------
  function handleHashChange() {
    const hash = window.location.hash;
    if (hash.startsWith('#wiki/')) {
      const targetSlug = hash.replace('#wiki/', '').trim();
      const found = allArticles.find(a => a.id === targetSlug || a.slug === targetSlug);
      if (found) {
        if (currentView === 'graph') switchView('explorer');
        displayArticle(found.id, false);
        const wikiSec = document.getElementById('wiki');
        if (wikiSec) wikiSec.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  window.addEventListener('hashchange', handleHashChange);

  // Inicializar vista al cargar
  filterArticles();

  // Comprobar si al cargar la página viene con un hash de artículo
  const initialHash = window.location.hash;
  if (initialHash && initialHash.startsWith('#wiki/')) {
    handleHashChange();
  } else {
    displayArticle(selectedArticleId, false);
  }
}

/* --------------------------------------------------------------------------
   4. GESTOR DE PESTAÑAS DE CÓDIGO
   -------------------------------------------------------------------------- */
function initCodeTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.code-tab-panel');

  if (!tabs.length || !panels.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;

      tabs.forEach(t => t.classList.toggle('active', t === tab));
      panels.forEach(p => p.style.display = (p.id === targetId ? 'block' : 'none'));
    });
  });
}

/* --------------------------------------------------------------------------
   4. BOTONES DE COPIADO RÁPIDO
   -------------------------------------------------------------------------- */
function initCopyButtons() {
  const copyButtons = document.querySelectorAll('[data-copy-target]');

  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetSelector = btn.dataset.copyTarget;
      const targetEl = document.querySelector(targetSelector);
      if (!targetEl) return;

      const textToCopy = targetEl.innerText || targetEl.textContent;

      try {
        await navigator.clipboard.writeText(textToCopy);
        const originalText = btn.textContent;
        btn.textContent = '✓ Copiado';
        btn.style.borderColor = 'var(--status-active)';
        btn.style.color = 'var(--status-active)';

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.borderColor = '';
          btn.style.color = '';
        }, 2000);
      } catch (err) {
        console.error('Error al copiar:', err);
      }
    });
  });
}

/* --------------------------------------------------------------------------
   5. NAVEGACIÓN MÓVIL
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', () => {
    const isVisible = navLinks.style.display === 'flex';
    navLinks.style.display = isVisible ? 'none' : 'flex';
    if (!isVisible) {
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = 'var(--header-height)';
      navLinks.style.left = '0';
      navLinks.style.right = '0';
      navLinks.style.background = 'var(--bg-surface)';
      navLinks.style.padding = '24px';
      navLinks.style.borderBottom = '1px solid var(--border-subtle)';
    }
  });

  // Cerrar al pulsar un enlace
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        navLinks.style.display = 'none';
      }
    });
  });
}

/* --------------------------------------------------------------------------
   6. BARRA DE PROGRESO DE SCROLL ARQUITECTÓNICA
   -------------------------------------------------------------------------- */
function initScrollProgress() {
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress-bar';
  document.body.prepend(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollTotal > 0) {
      const progress = (window.scrollY / scrollTotal) * 100;
      progressBar.style.width = `${progress}%`;
    }
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   7. EFECTO SPOTLIGHT INTERACTIVO (LUZ TÁCTIL EN BORDES)
   -------------------------------------------------------------------------- */
function initSpotlightCards() {
  const cards = document.querySelectorAll('.spotlight-card, .metric-card, .plugin-slot, .principle-card, .manifesto-quote-card, .terminal-window');

  cards.forEach(card => {
    card.classList.add('spotlight-card');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* --------------------------------------------------------------------------
   8. MOTOR DE PARALAJE Y TILT 3D INTERACTIVO
   -------------------------------------------------------------------------- */
function initParallaxAndTilt() {
  const heroVisual = document.querySelector('.hero-visual');
  const bannerFrame = document.querySelector('.banner-frame');
  const heroSection = document.querySelector('.hero');

  if (!heroVisual || !bannerFrame) return;

  let mouseX = 0;
  let mouseY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;
  let isHovered = false;

  // Seguimiento suave del cursor sobre la sección Hero
  heroSection.addEventListener('mousemove', (e) => {
    isHovered = true;
    const rect = heroVisual.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);

    // Limitación de ángulo para mantener sutileza arquitectónica
    mouseX = Math.max(-1, Math.min(1, deltaX)) * 8; // Max 8 grados en Y
    mouseY = Math.max(-1, Math.min(1, deltaY)) * -8; // Max 8 grados en X
  });

  heroSection.addEventListener('mouseleave', () => {
    isHovered = false;
    mouseX = 0;
    mouseY = 0;
  });

  // Animación continua con interpolación suave (Lerp) para 60/120 fps
  function animateTilt() {
    currentTiltX += (mouseY - currentTiltX) * 0.08;
    currentTiltY += (mouseX - currentTiltY) * 0.08;

    const scrollOffset = window.scrollY * 0.06;

    bannerFrame.style.transform = `
      translateY(${scrollOffset}px)
      rotateX(${currentTiltX.toFixed(2)}deg)
      rotateY(${currentTiltY.toFixed(2)}deg)
    `;

    requestAnimationFrame(animateTilt);
  }

  requestAnimationFrame(animateTilt);

  // Efecto Parallax en el fondo de cuadrícula arquitectónica al hacer scroll
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    document.body.style.backgroundPositionY = `${(scrollY * 0.18).toFixed(1)}px`;
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   9. REVELACIÓN CINEMÁTICA EN SCROLL (INTERSECTION OBSERVER)
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.metric-card, .manifesto-quote-card, .kernel-canvas, .kernel-inspector, .mcp-feature-item, .terminal-window, .wiki-explorer-card, .code-tabs-wrapper, .principle-card, .cta-box'
  );

  targets.forEach((el, index) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(index % 3) * 0.1}s`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  targets.forEach(el => observer.observe(el));
}
