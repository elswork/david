/**
 * PROYECTO DAVID — LÓGICA DE CLIENTE Y COMPONENTES INTERACTIVOS
 * Microkernel Explorer, Consola Simulada MCP y Gestor de Código
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initMicrokernelExplorer();
  initMcpTerminal();
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
   3. GESTOR DE PESTAÑAS DE CÓDIGO
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
    '.metric-card, .manifesto-quote-card, .kernel-canvas, .kernel-inspector, .mcp-feature-item, .terminal-window, .code-tabs-wrapper, .principle-card, .cta-box'
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
