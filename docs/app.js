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

  if (!articlesListEl || typeof LLM_WIKI_DATA === 'undefined') return;

  const dataset = LLM_WIKI_DATA;
  const articlesMap = dataset.articles;
  const allArticles = Object.values(articlesMap);

  let activeCategory = 'all';
  let activeSearch = '';
  let selectedArticleId = 'microkernel-core';

  if (articlesCountEl) {
    articlesCountEl.textContent = `${allArticles.length} Entradas Activas`;
  }

  // Renderizador liviano de Markdown de precisión
  function renderMarkdown(md) {
    if (!md) return '';
    let html = md;

    // Escapar etiquetas HTML crudas (excepto las que creemos)
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bloques de código pre / code (```dart ... ```)
    html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="wiki-code-block"><div class="wiki-code-lang">${lang || 'código'}</div><code>${code.trim()}</code></pre>`;
    });

    // Código en línea (`...`)
    html = html.replace(/`([^`]+)`/g, '<code class="wiki-inline-code">$1</code>');

    // Citas (> ...)
    html = html.replace(/^>\s*(.+)$/gm, '<blockquote class="wiki-quote">$1</blockquote>');

    // Encabezados
    html = html.replace(/^### (.*$)/gm, '<h4 class="wiki-h3">$1</h4>');
    html = html.replace(/^## (.*$)/gm, '<h3 class="wiki-h2">$1</h3>');
    html = html.replace(/^# (.*$)/gm, '<h2 class="wiki-h1">$1</h2>');

    // Negrita y cursiva
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Tablas Markdown simples
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

    // Listas desordenadas (- o *)
    html = html.replace(/^[\*\-]\s+(.*)$/gm, '<li class="wiki-li">$1</li>');
    html = html.replace(/(<li class="wiki-li">[\s\S]*?<\/li>)/g, '<ul class="wiki-ul">$1</ul>');
    // Limpiar <ul> anidadas contiguas
    html = html.replace(/<\/ul>\s*<ul class="wiki-ul">/g, '');

    // Listas ordenadas (1. 2.)
    html = html.replace(/^\d+\.\s+(.*)$/gm, '<li class="wiki-oli">$1</li>');
    html = html.replace(/(<li class="wiki-oli">[\s\S]*?<\/li>)/g, '<ol class="wiki-ol">$1</ol>');
    html = html.replace(/<\/ol>\s*<ol class="wiki-ol">/g, '');

    // Wikilinks [[target]] o [[target|label]]
    html = html.replace(/\[\[(?:wiki\/)?([a-zA-Z0-9_\-\/]+)(?:\|([^\]]+))?\]\]/g, (match, linkTarget, label) => {
      // Normalizar target a slug / id
      const parts = linkTarget.split('/');
      const slugOrId = parts[parts.length - 1];
      
      // Buscar artículo que coincida por id o por slug
      const found = allArticles.find(a => a.id === slugOrId || a.slug === slugOrId);
      const displayLabel = label || (found ? found.title : slugOrId);
      const targetId = found ? found.id : slugOrId;

      return `<a href="#wiki" class="wiki-wikilink" data-wikilink="${targetId}">[[${displayLabel}]]</a>`;
    });

    // Párrafos (líneas con contenido no envueltas)
    html = html.split('\n\n').map(para => {
      const trimmed = para.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h') || trimmed.startsWith('<pre') || 
          trimmed.startsWith('<blockquote') || trimmed.startsWith('<ul') || 
          trimmed.startsWith('<ol') || trimmed.startsWith('<div') || trimmed.startsWith('---')) {
        return trimmed;
      }
      if (trimmed === '---') {
        return '<hr class="wiki-divider">';
      }
      return `<p class="wiki-p">${trimmed.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');

    return html;
  }

  // Renderizar el artículo seleccionado en el lector
  function displayArticle(articleId) {
    const article = articlesMap[articleId] || allArticles[0];
    if (!article) return;

    selectedArticleId = article.id;

    // Metadatos
    if (readerCategory) readerCategory.textContent = article.category;
    if (readerTime) readerTime.textContent = `${article.reading_time_min || 3} min de lectura`;
    if (readerPath) readerPath.textContent = article.path;
    if (readerTitle) readerTitle.textContent = article.title;

    // Tags
    if (readerTags) {
      readerTags.innerHTML = (article.tags || []).map(t => `<span class="wiki-tag">#${t}</span>`).join('');
    }

    // Cuerpo
    if (readerBody) {
      readerBody.innerHTML = renderMarkdown(article.body);
    }

    // Nodos Conectados (Links del Grafo)
    if (readerLinks) {
      const links = article.links || [];
      if (!links.length) {
        readerLinks.innerHTML = '<span class="wiki-no-links">Nodo raíz sin enlaces directos.</span>';
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

    // Actualizar clase activa en la lista lateral
    document.querySelectorAll('.wiki-article-item').forEach(item => {
      item.classList.toggle('active', item.dataset.articleId === article.id);
    });

    // Añadir escuchadores a los wikilinks inyectados en el cuerpo y en el pie
    document.querySelectorAll('[data-wikilink]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = el.getAttribute('data-wikilink');
        if (articlesMap[targetId]) {
          displayArticle(targetId);
          // Scroll suave hacia el reader si estamos en pantalla pequeña
          if (window.innerWidth <= 992) {
            const readerEl = document.getElementById('wiki-reader');
            if (readerEl) readerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  // Filtrado reactivo de artículos
  function filterArticles() {
    const q = activeSearch.toLowerCase().trim();
    const cat = activeCategory;

    const filtered = allArticles.filter(art => {
      const matchCat = (cat === 'all' || art.category === cat);
      if (!matchCat) return false;

      if (!q) return true;

      const titleMatch = art.title.toLowerCase().includes(q);
      const descMatch = (art.description || '').toLowerCase().includes(q);
      const tagsMatch = (art.tags || []).some(t => t.toLowerCase().includes(q));
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

  // Renderizar lista en la columna izquierda
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
            ${(art.tags || []).slice(0, 3).map(t => `<span class="wiki-item-tag">#${t}</span>`).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Eventos de selección de artículo
    articlesListEl.querySelectorAll('.wiki-article-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.articleId;
        displayArticle(id);
      });
    });
  }

  // Listeners de búsqueda
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeSearch = e.target.value;
      if (clearBtn) clearBtn.style.display = activeSearch ? 'block' : 'none';
      filterArticles();
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

  // Listeners de categorías
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      filterArticles();
    });
  });

  // Inicializar vista
  filterArticles();
  displayArticle(selectedArticleId);
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
