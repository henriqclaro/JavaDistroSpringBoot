/**
 * Linux Distro Architecture - Frontend Application
 * Consumes the Spring Boot REST API for Linux Distributions.
 * Adheres strictly to front/DESIGN.md specifications.
 * All internal code structure, comments, and variables in English;
 * All user-facing interface text in Portuguese.
 */

'use strict';

/* ==========================================================================
   1. Configuration & Global State
   ========================================================================== */

const CONFIG = {
  DEFAULT_API_BASE: 'http://localhost:8080',
  STORAGE_THEME_KEY: 'distro_theme_preference',
  STORAGE_API_KEY: 'distro_api_base_url',
  STORAGE_CACHE_KEY: 'distro_session_history_v1',
  TOAST_DURATION_MS: 4000,
  POPULAR_SHORTCUTS: [
    'Ubuntu',
    'Debian',
    'Fedora',
    'Arch Linux',
    'Alpine',
    'openSUSE',
    'Void Linux',
    'Gentoo'
  ]
};

const state = {
  apiBaseUrl: getStoredApiBase(),
  theme: getInitialTheme(),
  activeDistro: null,
  cachedDistros: getStoredCache(),
  pendingDeleteName: null
};

/* ==========================================================================
   2. Utility Functions & String Escaping
   ========================================================================== */

/**
 * Escapes unsafe characters for HTML injection.
 * @param {any} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ==========================================================================
   2. API Client Module
   ========================================================================== */

class DistroApiClient {
  /**
   * Retrieves the current normalized base URL.
   * @returns {string}
   */
  static getBaseUrl() {
    return state.apiBaseUrl.replace(/\/+$/, '');
  }

  /**
   * Performs an HTTP request and parses errors gracefully.
   * @param {string} endpoint
   * @param {RequestInit} options
   * @returns {Promise<any>}
   */
  static async request(endpoint, options = {}) {
    const url = `${this.getBaseUrl()}${endpoint}`;
    const defaultHeaders = {
      'Accept': 'application/json'
    };

    if (options.body && typeof options.body === 'string') {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const mergedOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    };

    try {
      const response = await fetch(url, mergedOptions);

      if (!response.ok) {
        let errorMessage = `Erro HTTP ${response.status}`;
        try {
          const text = await response.text();
          if (text) {
            errorMessage = text;
          }
        } catch {
          // Keep default status text
        }
        throw new Error(errorMessage);
      }

      // If response has no content (200 with empty body)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return null;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Não foi possível conectar à API. Verifique se o servidor backend está em execução na porta configurada e se o CORS está liberado.');
      }
      throw error;
    }
  }

  /**
   * GET /distro?name={name}
   * @param {string} name
   * @returns {Promise<Distro>}
   */
  static async getByName(name) {
    const cleanName = name.trim();
    if (!cleanName) {
      throw new Error('Informe o nome da distribuição para consulta.');
    }
    const data = await this.request(`/distro?name=${encodeURIComponent(cleanName)}`, {
      method: 'GET'
    });
    return this.normalizeDistro(data);
  }

  /**
   * POST /distro
   * @param {Object} distroData
   * @returns {Promise<void>}
   */
  static async create(distroData) {
    const payload = {
      name: distroData.name.trim(),
      base: distroData.base.trim() || 'independent',
      environment: distroData.environment.trim(),
      // Send both camelCase and snake_case for robust Jackson mapping
      packageManager: distroData.packageManager.trim(),
      package_manager: distroData.packageManager.trim()
    };

    await this.request('/distro', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * PUT /distro?id={id}
   * @param {number|string} id
   * @param {Object} distroData
   * @returns {Promise<void>}
   */
  static async update(id, distroData) {
    const payload = {
      name: distroData.name ? distroData.name.trim() : undefined,
      base: distroData.base ? distroData.base.trim() : undefined,
      environment: distroData.environment ? distroData.environment.trim() : undefined,
      packageManager: distroData.packageManager ? distroData.packageManager.trim() : undefined,
      package_manager: distroData.packageManager ? distroData.packageManager.trim() : undefined
    };

    await this.request(`/distro?id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  /**
   * DELETE /distro?name={name}
   * @param {string} name
   * @returns {Promise<void>}
   */
  static async deleteByName(name) {
    const cleanName = name.trim();
    if (!cleanName) {
      throw new Error('Nome da distribuição obrigatório para exclusão.');
    }
    await this.request(`/distro?name=${encodeURIComponent(cleanName)}`, {
      method: 'DELETE'
    });
  }

  /**
   * Normalizes distro properties from API response.
   * @param {Object} raw
   * @returns {Object|null}
   */
  static normalizeDistro(raw) {
    if (!raw) return null;
    return {
      id: raw.id,
      name: raw.name || '',
      base: raw.base || 'independent',
      environment: raw.environment || '',
      packageManager: raw.packageManager || raw.package_manager || ''
    };
  }
}

/* ==========================================================================
   3. Theme Management (Light / Dark Mode)
   ========================================================================== */

function getInitialTheme() {
  const stored = localStorage.getItem(CONFIG.STORAGE_THEME_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
  if (metaColorScheme) {
    metaColorScheme.setAttribute('content', theme);
  }

  localStorage.setItem(CONFIG.STORAGE_THEME_KEY, theme);

  const themeIcon = document.getElementById('theme-toggle-icon');
  const themeLabel = document.getElementById('theme-toggle-label');
  if (themeIcon) {
    themeIcon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
  }
  if (themeLabel) {
    themeLabel.textContent = theme === 'dark' ? 'Modo Claro' : 'Modo Escuro';
  }
}

function toggleTheme() {
  const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  showToast('info', 'Tema alterado', `Esquema de cores alterado para modo ${nextTheme === 'dark' ? 'escuro' : 'claro'}.`);
}

/* ==========================================================================
   4. Local Cache & Persistence Helpers
   ========================================================================== */

function getStoredApiBase() {
  const stored = localStorage.getItem(CONFIG.STORAGE_API_KEY);
  if (stored) return stored.trim();
  // If hosted on the same origin and port 8080, use origin
  if (window.location.protocol.startsWith('http') && window.location.port === '8080') {
    return window.location.origin;
  }
  return CONFIG.DEFAULT_API_BASE;
}

function setStoredApiBase(url) {
  state.apiBaseUrl = url.trim().replace(/\/+$/, '');
  localStorage.setItem(CONFIG.STORAGE_API_KEY, state.apiBaseUrl);
  updateApiStatusUi();
}

function getStoredCache() {
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCache(list) {
  state.cachedDistros = list;
  try {
    localStorage.setItem(CONFIG.STORAGE_CACHE_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage quota errors
  }
  renderSessionGrid();
  updateSessionCount();
}

function upsertToCache(distro) {
  if (!distro || !distro.name) return;
  const filtered = state.cachedDistros.filter(
    item => item.name.toLowerCase() !== distro.name.toLowerCase()
  );
  // Add to top of list
  const updated = [distro, ...filtered].slice(0, 24);
  saveCache(updated);
}

function removeFromCache(distroName) {
  if (!distroName) return;
  const filtered = state.cachedDistros.filter(
    item => item.name.toLowerCase() !== distroName.toLowerCase()
  );
  saveCache(filtered);
}

function clearSessionCache() {
  saveCache([]);
  showToast('info', 'Histórico limpo', 'O histórico de distribuições da sessão foi redefinido.');
}

/* ==========================================================================
   5. Toast Notification System (Zero-Radius)
   ========================================================================== */

function showToast(type, title, message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');

  let iconName = 'info';
  if (type === 'success') iconName = 'check_circle';
  if (type === 'error') iconName = 'error';

  toast.innerHTML = `
    <span class="material-symbols-sharp toast-icon" aria-hidden="true">${iconName}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button type="button" class="toast-close" aria-label="Fechar notificação">
      <span class="material-symbols-sharp" aria-hidden="true">close</span>
    </button>
  `;

  const closeBtn = toast.querySelector('.toast-close');
  const dismiss = () => {
    toast.classList.add('toast-hiding');
    setTimeout(() => toast.remove(), 200);
  };

  closeBtn.addEventListener('click', dismiss);

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.isConnected) {
      dismiss();
    }
  }, CONFIG.TOAST_DURATION_MS);
}

/* ==========================================================================
   6. UI Rendering & Presentation
   ========================================================================== */

function renderSearchResult(distro) {
  const container = document.getElementById('search-result-container');
  if (!container) return;

  if (!distro) {
    container.innerHTML = `
      <div class="notice-box">
        <span class="material-symbols-sharp notice-icon" aria-hidden="true">travel_explore</span>
        <h3 class="notice-title">Aguardando Parâmetro de Busca</h3>
        <p class="notice-desc">
          Digite o nome comercial da distribuição no campo acima (ex: <code>Ubuntu</code>, <code>Fedora</code>, <code>Arch</code>) ou clique em um dos atalhos rápidos.
        </p>
      </div>
    `;
    return;
  }

  const isIndependent = distro.base.toLowerCase() === 'independent' || distro.base.toLowerCase() === 'independente';
  const baseLabel = isIndependent ? 'Independente (Sem Base)' : distro.base;

  const narrativeText = isIndependent
    ? `Distribuição Linux de arquitetura independente, equipada nativamente com o ambiente gráfico ${distro.environment || 'não especificado'} e gerenciador de pacotes ${distro.packageManager || 'não especificado'}.`
    : `Distribuição Linux desenvolvida sobre a base ${distro.base}, adotando como padrão o ambiente gráfico ${distro.environment || 'não especificado'} e gerenciador de pacotes ${distro.packageManager || 'não especificado'}.`;

  container.innerHTML = `
    <article class="distro-card featured-result" aria-labelledby="active-distro-title">
      <div>
        <div class="card-header-row">
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            <span class="slug-badge">/distro:${escapeHtml(distro.name.toLowerCase())}</span>
            <span class="slug-badge" style="background-color: var(--bg-surface-subtle); color: var(--text-secondary); border-color: var(--border-subtle);">
              /base:${escapeHtml(distro.base)}
            </span>
          </div>
          <span class="id-badge font-mono">#ID ${distro.id != null ? distro.id : 'N/A'}</span>
        </div>

        <h3 id="active-distro-title" class="card-title font-serif">
          ${escapeHtml(distro.name)}
        </h3>

        <p class="card-lead">
          ${escapeHtml(narrativeText)}
        </p>

        <div class="spec-matrix">
          <div class="spec-cell">
            <span class="spec-key">Nome Comercial</span>
            <span class="spec-val">${escapeHtml(distro.name)}</span>
          </div>
          <div class="spec-cell">
            <span class="spec-key">Base do Sistema</span>
            <span class="spec-val ${isIndependent ? 'is-independent' : ''}">${escapeHtml(baseLabel)}</span>
          </div>
          <div class="spec-cell">
            <span class="spec-key">Ambiente Gráfico</span>
            <span class="spec-val">${escapeHtml(distro.environment || 'Não informado')}</span>
          </div>
          <div class="spec-cell">
            <span class="spec-key">Gerenciador de Pacotes</span>
            <span class="spec-val">${escapeHtml(distro.packageManager || 'Não informado')}</span>
          </div>
        </div>
      </div>

      <div class="card-footer-row">
        <div class="card-actions-group">
          <button type="button" class="btn btn-outline btn-sm" id="btn-edit-active" title="Editar propriedades desta distribuição">
            <span class="material-symbols-sharp" aria-hidden="true">edit</span>
            <span>Editar (PUT)</span>
          </button>
          <button type="button" class="btn btn-danger btn-sm" id="btn-delete-active" title="Remover distribuição do banco">
            <span class="material-symbols-sharp" aria-hidden="true">delete</span>
            <span>Excluir (DELETE)</span>
          </button>
        </div>

        <button type="button" class="btn btn-subtle btn-sm" id="btn-toggle-json" aria-expanded="false">
          <span class="material-symbols-sharp" aria-hidden="true">data_object</span>
          <span>Ver JSON Bruto</span>
        </button>
      </div>

      <div id="json-raw-container" style="display: none; margin-top: 1.25rem;">
        <div class="endpoint-schema font-mono">
          <pre><code>${escapeHtml(JSON.stringify(distro, null, 2))}</code></pre>
        </div>
      </div>
    </article>
  `;

  // Attach dynamic handlers for the active card
  document.getElementById('btn-edit-active')?.addEventListener('click', () => {
    openEditDialog(distro);
  });

  document.getElementById('btn-delete-active')?.addEventListener('click', () => {
    openDeleteDialog(distro.name);
  });

  const toggleJsonBtn = document.getElementById('btn-toggle-json');
  const jsonContainer = document.getElementById('json-raw-container');
  if (toggleJsonBtn && jsonContainer) {
    toggleJsonBtn.addEventListener('click', () => {
      const isHidden = jsonContainer.style.display === 'none';
      jsonContainer.style.display = isHidden ? 'block' : 'none';
      toggleJsonBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      toggleJsonBtn.innerHTML = `
        <span class="material-symbols-sharp" aria-hidden="true">data_object</span>
        <span>${isHidden ? 'Ocultar JSON' : 'Ver JSON Bruto'}</span>
      `;
    });
  }
}

function renderSearchLoading(name) {
  const container = document.getElementById('search-result-container');
  if (!container) return;

  container.innerHTML = `
    <div class="notice-box">
      <span class="material-symbols-sharp notice-icon" aria-hidden="true" style="animation: spin 1s linear infinite;">sync</span>
      <h3 class="notice-title">Consultando Banco de Dados...</h3>
      <p class="notice-desc font-mono" style="font-size: 0.8rem; color: var(--accent-primary);">
        GET /distro?name=${escapeHtml(name)}
      </p>
    </div>
  `;
}

function renderSearchError(name, errorMessage) {
  const container = document.getElementById('search-result-container');
  if (!container) return;

  container.innerHTML = `
    <div class="notice-box notice-error">
      <span class="material-symbols-sharp notice-icon" aria-hidden="true">error_outline</span>
      <h3 class="notice-title">Distribuição Não Encontrada</h3>
      <p class="notice-desc">
        A consulta para "<strong>${escapeHtml(name)}</strong>" não retornou nenhum registro no banco de dados.
      </p>
      <div style="margin-top: 1.25rem; display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center;">
        <button type="button" class="btn btn-primary btn-sm" id="btn-prefill-register">
          <span class="material-symbols-sharp" aria-hidden="true">add</span>
          <span>Cadastrar "${escapeHtml(name)}" Agora</span>
        </button>
        <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('search-input').focus();">
          <span class="material-symbols-sharp" aria-hidden="true">search</span>
          <span>Tentar Outro Nome</span>
        </button>
      </div>
      <p class="font-mono" style="margin-top: 1rem; font-size: 0.75rem; color: var(--text-muted);">
        Detalhes técnicos: ${escapeHtml(errorMessage)}
      </p>
    </div>
  `;

  document.getElementById('btn-prefill-register')?.addEventListener('click', () => {
    openRegisterDialog(name);
  });
}

function renderSessionGrid() {
  const container = document.getElementById('session-cards-grid');
  const emptyNotice = document.getElementById('session-empty-notice');
  if (!container) return;

  if (!state.cachedDistros || state.cachedDistros.length === 0) {
    if (emptyNotice) emptyNotice.style.display = 'block';
    container.innerHTML = '';
    return;
  }

  if (emptyNotice) emptyNotice.style.display = 'none';

  container.innerHTML = state.cachedDistros.map(distro => {
    const isIndependent = distro.base.toLowerCase() === 'independent' || distro.base.toLowerCase() === 'independente';
    return `
      <article class="distro-card" data-distro-name="${escapeHtml(distro.name)}">
        <div>
          <div class="card-header-row">
            <span class="slug-badge">/base:${escapeHtml(distro.base)}</span>
            <span class="id-badge font-mono">#ID ${distro.id != null ? distro.id : 'N/A'}</span>
          </div>

          <h3 class="card-title font-serif" style="font-size: 1.25rem;">
            ${escapeHtml(distro.name)}
          </h3>

          <p class="card-lead" style="font-size: 0.85rem; margin-bottom: 0.85rem;">
            Ambiente: <strong>${escapeHtml(distro.environment || 'N/A')}</strong> · Gerenciador: <strong>${escapeHtml(distro.packageManager || 'N/A')}</strong>
          </p>
        </div>

        <div class="card-footer-row">
          <button type="button" class="btn btn-subtle btn-sm btn-inspect-card" data-name="${escapeHtml(distro.name)}">
            <span class="material-symbols-sharp" aria-hidden="true">visibility</span>
            <span>Inspecionar</span>
          </button>

          <div style="display: flex; gap: 0.35rem;">
            <button type="button" class="btn btn-outline btn-sm btn-icon-only btn-edit-card" data-name="${escapeHtml(distro.name)}" title="Editar">
              <span class="material-symbols-sharp" aria-hidden="true">edit</span>
            </button>
            <button type="button" class="btn btn-danger btn-sm btn-icon-only btn-delete-card" data-name="${escapeHtml(distro.name)}" title="Excluir">
              <span class="material-symbols-sharp" aria-hidden="true">delete</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Attach event delegation for session cards
  container.querySelectorAll('.btn-inspect-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name');
      const found = state.cachedDistros.find(d => d.name === name);
      if (found) {
        state.activeDistro = found;
        renderSearchResult(found);
        document.getElementById('section-search')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        performSearch(name);
      }
    });
  });

  container.querySelectorAll('.btn-edit-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name');
      const found = state.cachedDistros.find(d => d.name === name);
      if (found) {
        openEditDialog(found);
      }
    });
  });

  container.querySelectorAll('.btn-delete-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name');
      openDeleteDialog(name);
    });
  });
}

function updateSessionCount() {
  const counter = document.getElementById('metric-session-count');
  if (counter) {
    counter.textContent = String(state.cachedDistros.length).padStart(2, '0');
  }
}

function updateApiStatusUi() {
  const pills = document.querySelectorAll('.api-url-display');
  pills.forEach(p => {
    p.textContent = state.apiBaseUrl;
  });
}

function renderPopularShortcuts() {
  const container = document.getElementById('popular-chips-container');
  if (!container) return;

  container.innerHTML = CONFIG.POPULAR_SHORTCUTS.map(name => `
    <button type="button" class="chip-btn" data-search-name="${escapeHtml(name)}">
      ${escapeHtml(name)}
    </button>
  `).join('');

  container.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-search-name');
      const input = document.getElementById('search-input');
      if (input) input.value = name;
      performSearch(name);
    });
  });
}

/* ==========================================================================
   7. Form Actions & Dialog Controllers
   ========================================================================== */

/**
 * Executes GET /distro?name={name}
 * @param {string} name
 */
async function performSearch(name) {
  const cleanName = (name || '').trim();
  if (!cleanName) {
    showToast('info', 'Campo vazio', 'Por favor, digite o nome de uma distribuição.');
    return;
  }

  renderSearchLoading(cleanName);

  try {
    const distro = await DistroApiClient.getByName(cleanName);
    state.activeDistro = distro;
    upsertToCache(distro);
    renderSearchResult(distro);
    showToast('success', 'Distribuição localizada', `Ficha técnica de "${distro.name}" carregada com sucesso.`);
  } catch (error) {
    state.activeDistro = null;
    renderSearchError(cleanName, error.message);
  }
}

/**
 * Handles creation of new distro (POST /distro)
 * @param {Event} e
 */
async function handleRegisterSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');

  const name = form.name.value.trim();
  const isIndependent = form.querySelector('#reg-is-independent')?.checked;
  const base = isIndependent ? 'independent' : form.base.value.trim() || 'independent';
  const environment = form.environment.value.trim();
  const packageManager = form.packageManager.value.trim();

  if (!name) {
    showToast('error', 'Nome obrigatório', 'O nome comercial da distribuição é obrigatório.');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
  }

  try {
    await DistroApiClient.create({
      name,
      base,
      environment,
      packageManager
    });

    showToast('success', 'Cadastro realizado', `Distribuição "${name}" cadastrada com sucesso no banco de dados!`);

    // Close modal if open
    const dialog = document.getElementById('register-dialog');
    if (dialog && dialog.open) {
      dialog.close();
    }

    form.reset();

    // Query newly created distro to update view
    await performSearch(name);
  } catch (error) {
    showToast('error', 'Erro no cadastro', error.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span class="material-symbols-sharp" aria-hidden="true">add_circle</span>
        <span>Confirmar Cadastro (POST)</span>
      `;
    }
  }
}

/**
 * Handles update of existing distro (PUT /distro?id={id})
 * @param {Event} e
 */
async function handleEditSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');

  const id = (form.id.value || form.querySelector('#edit-id-display')?.value || '').trim();
  const name = form.name.value.trim();
  const isIndependent = form.querySelector('#edit-is-independent')?.checked;
  const base = isIndependent ? 'independent' : form.base.value.trim();
  const environment = form.environment.value.trim();
  const packageManager = form.packageManager.value.trim();

  if (!id) {
    showToast('error', 'ID ausente', 'O identificador ID da distribuição é obrigatório para atualização.');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Atualizando...';
  }

  try {
    await DistroApiClient.update(id, {
      name,
      base,
      environment,
      packageManager
    });

    showToast('success', 'Atualização concluída', `Distribuição "${name}" atualizada com sucesso no PostgreSQL!`);

    const dialog = document.getElementById('edit-dialog');
    if (dialog && dialog.open) {
      dialog.close();
    }

    // Refresh active view
    await performSearch(name);
  } catch (error) {
    showToast('error', 'Erro na atualização', error.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span class="material-symbols-sharp" aria-hidden="true">save</span>
        <span>Salvar Alterações (PUT)</span>
      `;
    }
  }
}

/**
 * Handles deletion of a distro (DELETE /distro?name={name})
 */
async function handleConfirmDelete() {
  const name = state.pendingDeleteName;
  if (!name) return;

  const dialog = document.getElementById('delete-dialog');
  const confirmBtn = document.getElementById('btn-confirm-delete-action');

  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Excluindo...';
  }

  try {
    await DistroApiClient.deleteByName(name);
    showToast('success', 'Distribuição removida', `A distribuição "${name}" foi excluída permanentemente.`);

    removeFromCache(name);

    if (state.activeDistro && state.activeDistro.name.toLowerCase() === name.toLowerCase()) {
      state.activeDistro = null;
      renderSearchResult(null);
    }

    if (dialog && dialog.open) {
      dialog.close();
    }
  } catch (error) {
    showToast('error', 'Erro na exclusão', error.message);
  } finally {
    state.pendingDeleteName = null;
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = `
        <span class="material-symbols-sharp" aria-hidden="true">delete_forever</span>
        <span>Confirmar Remoção (DELETE)</span>
      `;
    }
  }
}

/* ==========================================================================
   8. Modal Helpers
   ========================================================================== */

function openRegisterDialog(initialName = '') {
  const dialog = document.getElementById('register-dialog');
  const form = document.getElementById('register-modal-form');
  if (!dialog || !form) return;

  form.reset();
  if (initialName) {
    form.name.value = initialName;
  }

  const indCheckbox = form.querySelector('#reg-is-independent');
  const baseInput = form.querySelector('#reg-base-input');
  if (indCheckbox && baseInput) {
    indCheckbox.checked = false;
    baseInput.disabled = false;
  }

  dialog.showModal();
  form.name.focus();
}

function openEditDialog(distro = null) {
  const dialog = document.getElementById('edit-dialog');
  const form = document.getElementById('edit-modal-form');
  if (!dialog || !form) return;

  const idInput = form.querySelector('#edit-id-input');
  const idDisplay = form.querySelector('#edit-id-display');
  const indCheckbox = form.querySelector('#edit-is-independent');
  const baseInput = form.querySelector('#edit-base-input');

  form.reset();

  if (distro) {
    if (idInput) idInput.value = distro.id != null ? distro.id : '';
    if (idDisplay) {
      idDisplay.value = distro.id != null ? distro.id : '';
      idDisplay.readOnly = true;
      idDisplay.style.cursor = 'not-allowed';
      idDisplay.style.opacity = '0.7';
    }
    form.name.value = distro.name || '';
    form.base.value = distro.base || '';
    form.environment.value = distro.environment || '';
    form.packageManager.value = distro.packageManager || '';

    const isIndependent = (distro.base || '').toLowerCase() === 'independent';
    if (indCheckbox && baseInput) {
      indCheckbox.checked = isIndependent;
      baseInput.disabled = isIndependent;
      if (isIndependent) baseInput.value = 'independent';
    }
  } else {
    if (idInput) idInput.value = '';
    if (idDisplay) {
      idDisplay.value = '';
      idDisplay.readOnly = false;
      idDisplay.style.cursor = 'text';
      idDisplay.style.opacity = '1';
      idDisplay.placeholder = 'Digite o ID numérico (ex: 6)';
      idDisplay.oninput = () => {
        if (idInput) idInput.value = idDisplay.value;
      };
    }
    if (indCheckbox && baseInput) {
      indCheckbox.checked = false;
      baseInput.disabled = false;
    }
  }

  dialog.showModal();
  if (distro) {
    form.name.focus();
  } else if (idDisplay) {
    idDisplay.focus();
  }
}

function openDeleteDialog(name) {
  const dialog = document.getElementById('delete-dialog');
  const nameSpan = document.getElementById('delete-target-distro-name');
  if (!dialog) return;

  state.pendingDeleteName = name;
  if (nameSpan) {
    nameSpan.textContent = name;
  }

  dialog.showModal();
}

function openSettingsDialog() {
  const dialog = document.getElementById('settings-dialog');
  const input = document.getElementById('settings-api-url-input');
  if (!dialog || !input) return;

  input.value = state.apiBaseUrl;
  dialog.showModal();
}

async function testApiConnection() {
  const input = document.getElementById('settings-api-url-input');
  const feedback = document.getElementById('settings-connection-feedback');
  if (!input || !feedback) return;

  const testUrl = input.value.trim().replace(/\/+$/, '');
  feedback.style.display = 'block';
  feedback.className = 'font-mono';
  feedback.style.color = 'var(--accent-primary)';
  feedback.textContent = 'Testando comunicação com ' + testUrl + '...';

  try {
    const res = await fetch(`${testUrl}/distro?name=__test_ping__`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    // 200, 404, or 500 means the server replied
    feedback.style.color = 'var(--status-success)';
    feedback.textContent = `✔ Conectado com sucesso! Servidor respondeu com status HTTP ${res.status}.`;
  } catch (err) {
    feedback.style.color = 'var(--status-error)';
    feedback.textContent = `✖ Falha na conexão: ${err.message}. Verifique a URL e o suporte a CORS.`;
  }
}

/* ==========================================================================
   9. Initialization & Event Wiring
   ========================================================================== */

function setupLightDismissPolyfill() {
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    const isOutside = (e, dialog) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
      let pressedOutside = false;
      dialog.addEventListener('pointerdown', (e) => {
        pressedOutside = isOutside(e, dialog);
      });
      dialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && isOutside(e, dialog)) dialog.close();
      });
    }
  }
}

function setupFormIndependentToggles() {
  // Register form toggle
  const regCheckbox = document.getElementById('reg-is-independent');
  const regBaseInput = document.getElementById('reg-base-input');
  if (regCheckbox && regBaseInput) {
    regCheckbox.addEventListener('change', () => {
      if (regCheckbox.checked) {
        regBaseInput.value = 'independent';
        regBaseInput.disabled = true;
      } else {
        if (regBaseInput.value === 'independent') regBaseInput.value = '';
        regBaseInput.disabled = false;
        regBaseInput.focus();
      }
    });
  }

  // Inline Register form toggle
  const inlineCheckbox = document.getElementById('inline-is-independent');
  const inlineBaseInput = document.getElementById('inline-base-input');
  if (inlineCheckbox && inlineBaseInput) {
    inlineCheckbox.addEventListener('change', () => {
      if (inlineCheckbox.checked) {
        inlineBaseInput.value = 'independent';
        inlineBaseInput.disabled = true;
      } else {
        if (inlineBaseInput.value === 'independent') inlineBaseInput.value = '';
        inlineBaseInput.disabled = false;
        inlineBaseInput.focus();
      }
    });
  }

  // Edit form toggle
  const editCheckbox = document.getElementById('edit-is-independent');
  const editBaseInput = document.getElementById('edit-base-input');
  if (editCheckbox && editBaseInput) {
    editCheckbox.addEventListener('change', () => {
      if (editCheckbox.checked) {
        editBaseInput.value = 'independent';
        editBaseInput.disabled = true;
      } else {
        if (editBaseInput.value === 'independent') editBaseInput.value = '';
        editBaseInput.disabled = false;
        editBaseInput.focus();
      }
    });
  }
}

function setupSuggestionButtons() {
  document.querySelectorAll('[data-fill-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-fill-target');
      const val = btn.getAttribute('data-fill-val');
      const input = document.getElementById(targetId);
      if (input) {
        input.value = val;
        input.focus();
      }
    });
  });
}

function initEventListeners() {
  // Theme switcher
  document.getElementById('btn-theme-toggle')?.addEventListener('click', toggleTheme);

  // Search form
  const searchForm = document.getElementById('search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('search-input');
      if (input) performSearch(input.value);
    });
  }

  // Modal open buttons
  document.getElementById('btn-open-register-modal')?.addEventListener('click', () => {
    openRegisterDialog();
  });

  document.getElementById('btn-open-edit-direct')?.addEventListener('click', () => {
    openEditDialog(null);
  });

  document.getElementById('btn-open-settings')?.addEventListener('click', () => {
    openSettingsDialog();
  });

  document.getElementById('btn-clear-cache')?.addEventListener('click', clearSessionCache);

  // Forms
  document.getElementById('register-modal-form')?.addEventListener('submit', handleRegisterSubmit);
  document.getElementById('register-inline-form')?.addEventListener('submit', handleRegisterSubmit);
  document.getElementById('edit-modal-form')?.addEventListener('submit', handleEditSubmit);

  // Delete confirmation
  document.getElementById('btn-confirm-delete-action')?.addEventListener('click', handleConfirmDelete);

  // Settings Save
  document.getElementById('settings-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('settings-api-url-input');
    if (input) {
      setStoredApiBase(input.value);
      showToast('success', 'Configuração salva', `Endpoint da API atualizado para: ${state.apiBaseUrl}`);
      document.getElementById('settings-dialog')?.close();
    }
  });

  // Settings Test Button
  document.getElementById('btn-test-connection')?.addEventListener('click', testApiConnection);

  // Modal close buttons
  document.querySelectorAll('.btn-close-dialog').forEach(btn => {
    btn.addEventListener('click', () => {
      const dialog = btn.closest('dialog');
      if (dialog) dialog.close();
    });
  });

  // Sync across tabs
  window.addEventListener('storage', (e) => {
    if (e.key === CONFIG.STORAGE_THEME_KEY && e.newValue) {
      applyTheme(e.newValue);
    }
    if (e.key === CONFIG.STORAGE_API_KEY && e.newValue) {
      state.apiBaseUrl = e.newValue;
      updateApiStatusUi();
    }
  });
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(state.theme);
  updateApiStatusUi();
  renderPopularShortcuts();
  renderSearchResult(null);
  renderSessionGrid();
  updateSessionCount();
  setupLightDismissPolyfill();
  setupFormIndependentToggles();
  setupSuggestionButtons();
  initEventListeners();
});
