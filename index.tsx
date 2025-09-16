/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// --- DOM Elements ---
const loginForm = document.getElementById('login-form') as HTMLFormElement;
const emailInput = document.getElementById('email') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const errorMessage = document.getElementById(
  'error-message'
) as HTMLParagraphElement;
const loginContainer = document.getElementById(
  'login-container'
) as HTMLElement;
const dashboardContainer = document.getElementById(
  'dashboard-container'
) as HTMLElement;
const welcomeMessage = document.getElementById(
  'welcome-message'
) as HTMLSpanElement;
const pageTitle = document.getElementById('page-title') as HTMLElement;
const navButtons = document.querySelectorAll('.nav-button');
const contentPanels = document.querySelectorAll('.panel');
const notificationBell = document.getElementById(
  'notification-bell'
) as HTMLButtonElement;
const notificationPanel = document.getElementById(
  'notification-panel'
) as HTMLElement;

// Anamnese Panel Elements
const anamneseActions = document.getElementById(
  'anamnese-actions'
) as HTMLElement;
const anamneseFormContainer = document.getElementById(
  'anamnese-form-container'
) as HTMLElement;
const comecarAnamneseBtn = document.getElementById(
  'comecar-anamnese-btn'
) as HTMLButtonElement;
const anamneseForm = document.getElementById('anamnese-form') as HTMLFormElement;

// Patient search elements for anamnese
const pacienteNomeInput = document.getElementById('paciente-nome') as HTMLInputElement;
const pacienteSearchSuggestions = document.createElement('ul');
pacienteSearchSuggestions.id = 'paciente-search-suggestions';
pacienteSearchSuggestions.className = 'search-suggestions';
pacienteNomeInput?.parentElement?.appendChild(pacienteSearchSuggestions);

// Pacientes Panel Elements
const pacienteSearchContainer = document.getElementById(
  'paciente-search-container'
) as HTMLElement;
const pacienteProfileContainer = document.getElementById(
  'paciente-profile-container'
) as HTMLElement;
const pacienteSearchForm = document.getElementById(
  'paciente-search-form'
) as HTMLFormElement;
const pacienteSearchInput = document.getElementById(
  'paciente-search-input'
) as HTMLInputElement;
// Search results list element added to HTML
const searchResultsList = document.getElementById('search-results-list') as HTMLUListElement;
const backToSearchBtn = document.getElementById(
  'back-to-search-btn'
) as HTMLButtonElement;

// Cartas Panel Elements
const cartasMainView = document.getElementById('cartas-main-view') as HTMLElement;
const cartasEscreverView = document.getElementById(
  'cartas-escrever-view'
) as HTMLElement;
const escreverCartaBtn = document.getElementById(
  'escrever-carta-btn'
) as HTMLButtonElement;
const backToCartasMainBtn = document.getElementById(
  'back-to-cartas-main-btn'
) as HTMLButtonElement;

// Profile Modal Elements
const viewProfileBtn = document.getElementById(
  'view-profile-btn'
) as HTMLButtonElement;
const profileModalOverlay = document.getElementById(
  'profile-modal-overlay'
) as HTMLElement;
const closeProfileModalBtn = document.getElementById(
  'close-profile-modal-btn'
) as HTMLButtonElement;

// --- Auth e Usuários ---
type Role = 'TO' | 'Fono' | 'Psico' | 'Admin';
interface AppUser { username: string; role: Role; }
const USERS: AppUser[] = [
  { username: 'TO', role: 'TO' },
  { username: 'FONO', role: 'Fono' },
  { username: 'PSICO', role: 'Psico' },
];

function setCurrentUser(user: AppUser | null) {
  if (user) localStorage.setItem('currentUser', JSON.stringify(user));
  else localStorage.removeItem('currentUser');
}

function getCurrentUser(): AppUser | null {
  try {
    const raw = localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// --- Notificações locais ---
function getNotifications(): any[] {
  try {
    const raw = localStorage.getItem('notifications');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setNotifications(items: any[]) {
  localStorage.setItem('notifications', JSON.stringify(items));
}

function createNotificationForRole(targetRole: Role, message: string, anamnesisId: number) {
  const list = getNotifications();
  list.unshift({ id: Date.now(), targetRole, message, anamnesisId, read: false, createdAt: new Date().toISOString() });
  setNotifications(list);
}

// --- Visibilidade das seções de anamnese ---
function getFieldsetByLegendText(legendIncludes: string): HTMLElement | null {
  if (!anamneseForm) return null;
  const fieldsets = Array.from(anamneseForm.querySelectorAll('fieldset')) as HTMLElement[];
  for (const fs of fieldsets) {
    const lg = fs.querySelector('legend');
    if (lg && lg.textContent && lg.textContent.toLowerCase().includes(legendIncludes.toLowerCase())) {
      return fs as HTMLElement;
    }
  }
  return null;
}

function updateAnamnesisVisibility() {
  // Seções comuns (sempre visíveis)
  const identificacao = getFieldsetByLegendText('IDENTIFICAÇÃO');
  const escolaRotina = getFieldsetByLegendText('ESCOLA E ROTINA ESCOLAR');
  const rotinaAvd = getFieldsetByLegendText('ROTINA DIÁRIA E AVDs');
  const infoMedicas = getFieldsetByLegendText('INFORMAÇÕES MÉDICAS');

  for (const el of [identificacao, escolaRotina, rotinaAvd, infoMedicas]) {
    if (el) (el as HTMLElement).style.display = '';
  }

  // Questionários específicos
  const fsTO = getFieldsetByLegendText('TERAPIA OCUPACIONAL');
  const fsPsico = getFieldsetByLegendText('PSICOLOGIA');
  const fsFono = getFieldsetByLegendText('FONOAUDIOLOGIA');

  const current = getCurrentUser();
  const role = current?.role;

  // Por padrão, esconder todas específicas
  if (fsTO) fsTO.style.display = 'none';
  if (fsPsico) fsPsico.style.display = 'none';
  if (fsFono) fsFono.style.display = 'none';

  if (role === 'TO' && fsTO) fsTO.style.display = '';
  if (role === 'Psico' && fsPsico) fsPsico.style.display = '';
  if (role === 'Fono' && fsFono) fsFono.style.display = '';
}

// --- Event Listeners ---

// Handle login form submission
loginForm?.addEventListener('submit', (e: Event) => {
  e.preventDefault();
  const username = (emailInput.value || '').trim().toUpperCase();
  const password = passwordInput.value;

  const found = USERS.find(u => u.username === username);
  if (found && password === '12345') {
    errorMessage.textContent = '';
    setCurrentUser(found);
    loginContainer.style.display = 'none';
    dashboardContainer.style.display = 'flex';
    welcomeMessage.textContent = `Bem-vindo, ${found.username} (${found.role})`;
    const initialActiveButton = document.querySelector('.nav-button.active') as HTMLElement;
    updatePageTitle(initialActiveButton?.dataset.page || 'Intranet');
    // Ajustar visibilidade das seções conforme papel
    updateAnamnesisVisibility();
  } else {
    errorMessage.textContent = 'Credenciais inválidas. Tente novamente.';
  }
});

// Handle navigation button clicks
navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    // Get target panel from data attribute
    const targetPanelSelector = (button as HTMLElement).dataset.target;
    if (!targetPanelSelector) return;

    // Update button active states
    navButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');

    // Update panel visibility
    contentPanels.forEach((panel) => {
      panel.classList.remove('active');
    });

    const targetPanel = document.querySelector(targetPanelSelector);
    targetPanel?.classList.add('active');

    // Update the page title
    const page = (button as HTMLElement).dataset.page;
    if (page) {
      updatePageTitle(page);
    }
  });
});

// Handle notification bell click
notificationBell?.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevent the window click listener from firing immediately
  const isExpanded = notificationBell.getAttribute('aria-expanded') === 'true';
  notificationPanel.classList.toggle('show');
  notificationBell.classList.toggle('active');
  notificationBell.setAttribute('aria-expanded', String(!isExpanded));
});

// Close notification panel when clicking outside
window.addEventListener('click', (e) => {
  if (
    notificationPanel?.classList.contains('show') &&
    !notificationBell.contains(e.target as Node) &&
    !notificationPanel.contains(e.target as Node)
  ) {
    notificationPanel.classList.remove('show');
    notificationBell.classList.remove('active');
    notificationBell.setAttribute('aria-expanded', 'false');
  }
});

// --- Profile Modal Logic ---
viewProfileBtn?.addEventListener('click', () => {
  profileModalOverlay.style.display = 'flex';
});

closeProfileModalBtn?.addEventListener('click', () => {
  profileModalOverlay.style.display = 'none';
});

profileModalOverlay?.addEventListener('click', (e) => {
  if (e.target === profileModalOverlay) {
    profileModalOverlay.style.display = 'none';
  }
});

// --- Anamnese Panel Logic ---

// Show form when "Começar" is clicked
comecarAnamneseBtn?.addEventListener('click', () => {
  anamneseActions.style.display = 'none';
  anamneseFormContainer.style.display = 'block';
  updateAnamnesisVisibility();
});

// Patient search functionality for anamnese form
let searchTimeout: any;

function showPatientSuggestions(pacientes: any[]) {
  if (!pacienteSearchSuggestions) return;
  pacienteSearchSuggestions.innerHTML = '';

  if (!pacientes || pacientes.length === 0) {
    pacienteSearchSuggestions.style.display = 'none';
    return;
  }

  const frag = document.createDocumentFragment();
  pacientes.slice(0, 5).forEach(p => { // Limit to 5 suggestions
    const li = document.createElement('li');
    li.textContent = `${p.pacNome} (Código: ${p.pacCodigo})`;
    li.dataset.pacCodigo = String(p.pacCodigo);
    li.dataset.pacNome = String(p.pacNome);
    li.addEventListener('click', async () => {
      // Fill form fields with patient data
      await fillPatientDataInForm(p.pacCodigo);
      pacienteNomeInput.value = p.pacNome;
      pacienteSearchSuggestions.style.display = 'none';
    });
    frag.appendChild(li);
  });
  pacienteSearchSuggestions.appendChild(frag);
  pacienteSearchSuggestions.style.display = 'block';
}

async function fillPatientDataInForm(codigo: number) {
  const details = await fetchPatientDetails(codigo);
  if (!details || !anamneseForm) return;

  // Fill patient information fields and disable them to block editing
  const pacienteNomeField = anamneseForm.querySelector('#paciente-nome') as HTMLInputElement;
  const pacienteSexoField = anamneseForm.querySelector('#paciente-sexo') as HTMLInputElement;
  const pacienteDnField = anamneseForm.querySelector('#paciente-dn') as HTMLInputElement;
  const pacienteIdadeField = anamneseForm.querySelector('#paciente-idade') as HTMLInputElement;
  const paiNomeField = anamneseForm.querySelector('#pai-nome') as HTMLInputElement;
  const maeNomeField = anamneseForm.querySelector('#mae-nome') as HTMLInputElement;

  if (pacienteNomeField) {
    pacienteNomeField.value = details.pacNome || '';
    // Keep name field editable for changes
  }
  if (pacienteSexoField) {
    pacienteSexoField.value = details.pacSexo || '';
    pacienteSexoField.disabled = true;
  }
  if (pacienteDnField && details.pacDtNasc) {
    const date = new Date(details.pacDtNasc);
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    pacienteDnField.value = formattedDate;
    pacienteDnField.disabled = true;
  }
  if (pacienteIdadeField && details.pacDtNasc) {
    const birthDate = new Date(details.pacDtNasc);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    pacienteIdadeField.value = String(age);
    pacienteIdadeField.disabled = true;
  }
  if (paiNomeField) {
    paiNomeField.value = details.pacPaiNome || '';
    paiNomeField.disabled = true;
  }
  if (maeNomeField) {
    maeNomeField.value = details.pacMaeNome || '';
    maeNomeField.disabled = true;
  }
}

// Event listeners for patient search in anamnese
pacienteNomeInput?.addEventListener('input', (e) => {
  const value = (e.target as HTMLInputElement).value.trim();
  clearTimeout(searchTimeout);

  if (value.length < 2) {
    pacienteSearchSuggestions.style.display = 'none';
    return;
  }

  searchTimeout = setTimeout(async () => {
    const results = await searchPatientsByName(value);
    showPatientSuggestions(results || []);
  }, 300); // Debounce search
});

pacienteNomeInput?.addEventListener('blur', () => {
  // Delay hiding suggestions to allow click events
  setTimeout(() => {
    if (pacienteSearchSuggestions) {
      pacienteSearchSuggestions.style.display = 'none';
    }
  }, 150);
});

pacienteNomeInput?.addEventListener('focus', () => {
  const value = pacienteNomeInput.value.trim();
  if (value.length >= 2 && pacienteSearchSuggestions.children.length > 0) {
    pacienteSearchSuggestions.style.display = 'block';
  }
});

// Helpers para armazenar e serializar a anamnese localmente
function getStoredAnamneses(): any[] {
  try {
    const raw = localStorage.getItem('anamneses');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStoredAnamneses(items: any[]) {
  localStorage.setItem('anamneses', JSON.stringify(items));
}

function serializeForm(formEl: HTMLFormElement): Record<string, any> {
  const data: Record<string, any> = {};
  const inputs = Array.from(formEl.querySelectorAll('input, textarea')) as (HTMLInputElement | HTMLTextAreaElement)[];
  for (const el of inputs) {
    const key = el.name || el.id;
    if (!key) continue;
    if (el instanceof HTMLInputElement && el.type === 'checkbox') {
      data[key] = el.checked;
    } else {
      data[key] = el.value;
    }
  }
  return data;
}

function buildAnamnesisRecord(formEl: HTMLFormElement) {
  const formData = serializeForm(formEl);
  const id = Date.now();
  return {
    id,
    data: formData,
    // Status por seção inspirado na outra aplicação
    cadastralStatus: 'concluído',
    toStatus: 'pendente',
    fonoStatus: 'pendente',
    psicoStatus: 'pendente',
    overallStatus: 'incompleto',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function seedAnamnesesIfEmpty() {
  const existing = getStoredAnamneses();
  if (existing && existing.length > 0) return;

  const nowIso = new Date().toISOString();
  const samples = [
    {
      id: Date.now(),
      data: {
        'anamnese-data': '01/09/2025',
        'anamnese-responsavel': 'Dra. Beatriz',
        'paciente-nome': 'Ana Silva',
        'paciente-dn': '15/03/2018',
        'paciente-idade': '7',
        'mae-nome': 'Maria Silva',
        'pai-nome': 'João Silva'
      },
      cadastralStatus: 'concluído',
      toStatus: 'pendente',
      fonoStatus: 'pendente',
      psicoStatus: 'pendente',
      overallStatus: 'incompleto',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: Date.now() + 1,
      data: {
        'anamnese-data': '02/09/2025',
        'anamnese-responsavel': 'Dr. Ricardo',
        'paciente-nome': 'Carlos Souza',
        'paciente-dn': '22/11/2016',
        'paciente-idade': '8',
        'mae-nome': 'Patrícia Souza',
        'pai-nome': 'Roberto Souza'
      },
      cadastralStatus: 'concluído',
      toStatus: 'pendente',
      fonoStatus: 'pendente',
      psicoStatus: 'pendente',
      overallStatus: 'incompleto',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: Date.now() + 2,
      data: {
        'anamnese-data': '03/09/2025',
        'anamnese-responsavel': 'Dra. Carla',
        'paciente-nome': 'Mariana Costa',
        'paciente-dn': '05/05/2017',
        'paciente-idade': '8',
        'mae-nome': 'Fernanda Costa',
        'pai-nome': 'Carlos Costa'
      },
      cadastralStatus: 'concluído',
      toStatus: 'pendente',
      fonoStatus: 'pendente',
      psicoStatus: 'pendente',
      overallStatus: 'incompleto',
      createdAt: nowIso,
      updatedAt: nowIso,
    }
  ];

  setStoredAnamneses(samples);
}

// Handle form submission
anamneseForm?.addEventListener('submit', (e: Event) => {
  e.preventDefault();
  try {
    const record = buildAnamnesisRecord(anamneseForm);
    const list = getStoredAnamneses();

    // Setorizar por papel do usuário atual e disparar trigger
    const current = getCurrentUser();
    if (current) {
      const role = current.role;
      if (role === 'TO') {
        record.toStatus = 'concluído';
        record.updatedAt = new Date().toISOString();
        createNotificationForRole('Fono', `Avaliação de TO concluída. Próxima etapa: Fono.`, record.id);
      } else if (role === 'Fono') {
        record.fonoStatus = 'concluído';
        record.updatedAt = new Date().toISOString();
        createNotificationForRole('Psico', `Avaliação de Fono concluída. Próxima etapa: Psico.`, record.id);
      } else if (role === 'Psico') {
        record.psicoStatus = 'concluído';
        record.updatedAt = new Date().toISOString();
      }

      // Atualiza overallStatus se todas concluídas
      if (record.toStatus === 'concluído' && record.fonoStatus === 'concluído' && record.psicoStatus === 'concluído') {
        record.overallStatus = 'completo';
      }
    }

    list.unshift(record);
    setStoredAnamneses(list);

    alert('Anamnese salva com sucesso!');
  } catch (err) {
    console.error(err);
    alert('Falha ao salvar a anamnese.');
  } finally {
    anamneseForm.reset();
    anamneseFormContainer.style.display = 'none';
    anamneseActions.style.display = 'flex';
  }
});

// Seed inicial (apenas se vazio)
seedAnamnesesIfEmpty();


// --- Pacientes Panel Logic ---

// Configuration for API: prefer Vite env vars, then window fallbacks, then localhost
const API_URL = (import.meta as any).env?.VITE_API_URL || (window as any).__API_URL__ || 'http://localhost:5001';
const API_TOKEN = (import.meta as any).env?.VITE_API_TOKEN || (window as any).__API_TOKEN__ || 'troque_este_token';
console.log('API_URL:', API_URL);
console.log('API_TOKEN:', API_TOKEN ? '***' : 'not set');

// Local sample patients used when localStorage is empty (dev fallback)
const LOCAL_PATIENT_SAMPLES = [
  { pacCodigo: 4821, pacNome: 'Ana Silva' },
  { pacCodigo: 4822, pacNome: 'Carlos Souza' },
  { pacCodigo: 4823, pacNome: 'Mariana Costa' },
];

// Fetch patients from API by name, fallback to local storage if API fails
async function searchPatientsByName(nome: string) {
  const encoded = encodeURIComponent(nome.trim());
  try {
    const res = await fetch(`${API_URL}/api/consultas/paciente-por-nome/${encoded}`, {
      method: 'GET',
      headers: {
        'x-api-token': API_TOKEN,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // If API returned an empty array, attempt local fallback (useful in dev)
    if (Array.isArray(data) && data.length === 0) {
      console.warn('API returned no results — trying local fallback');
      // fallthrough to local fallback logic below
    } else {
      console.debug('API search returned', data.length ?? 'unknown', 'results');
      return data;
    }
  } catch (err) {
    console.warn('API search failed, using local fallback.', err);
    // Local fallback: search seeded anamneses for paciente-nome
    const list = getStoredAnamneses();
    let matches: any[] = [];
    if (list && list.length > 0) {
      matches = list.filter(item => {
        const nomeVal = (item.data && (item.data['paciente-nome'] || '')) as string;
        return nomeVal && nomeVal.toLowerCase().includes(nome.toLowerCase());
      }).map(item => ({ pacCodigo: item.id, pacNome: item.data['paciente-nome'] }));
    }

    // If nothing in local storage, use built-in samples
    if (!matches || matches.length === 0) {
      matches = LOCAL_PATIENT_SAMPLES.filter(s => s.pacNome.toLowerCase().includes(nome.toLowerCase()));
    }
    return matches;
  }
}

// Fetch patient details by codigo
async function fetchPatientDetails(codigo: number) {
  try {
    const res = await fetch(`${API_URL}/api/consultas/paciente/${codigo}`, {
      method: 'GET',
      headers: {
        'x-api-token': API_TOKEN,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.debug('Patient details fetched:', data);
    return data;
  } catch (err) {
    console.warn('Failed to fetch patient details:', err);
    return null;
  }
}

function clearSearchResults() {
  if (!searchResultsList) return;
  searchResultsList.innerHTML = '';
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function displaySearchResults(pacientes: any[]) {
  console.debug('displaySearchResults received', pacientes);
  if (!searchResultsList) return;
  clearSearchResults();
  if (!pacientes || pacientes.length === 0) {
    const noResultsDiv = document.createElement('div');
    noResultsDiv.className = 'no-results';
    noResultsDiv.textContent = 'Nenhum paciente encontrado.';
    searchResultsList.appendChild(noResultsDiv);
    return;
  }

  const frag = document.createDocumentFragment();
  pacientes.forEach(p => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'patient-card';
    cardDiv.style.border = '1px solid #ccc';
    cardDiv.style.borderRadius = '8px';
    cardDiv.style.padding = '12px';
    cardDiv.style.marginBottom = '10px';
    cardDiv.style.display = 'flex';
    cardDiv.style.justifyContent = 'space-between';
    cardDiv.style.alignItems = 'center';
    cardDiv.style.backgroundColor = '#f9f9f9';
    cardDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

    const infoSpan = document.createElement('span');
    infoSpan.textContent = `${p.pacNome} (Código: ${p.pacCodigo})`;
    infoSpan.className = 'patient-info';
    infoSpan.style.fontWeight = '600';
    infoSpan.style.fontSize = '1rem';

    const selectButton = document.createElement('button');
    selectButton.textContent = 'Selecionar';
    selectButton.className = 'select-patient-button';
    selectButton.style.backgroundColor = '#4a6cf7';
    selectButton.style.color = 'white';
    selectButton.style.border = 'none';
    selectButton.style.borderRadius = '4px';
    selectButton.style.padding = '6px 12px';  // Smaller padding for better size
    selectButton.style.cursor = 'pointer';
    selectButton.style.fontWeight = 'bold';
    selectButton.style.fontSize = '0.9rem';  // Slightly smaller font size
    selectButton.style.transition = 'background-color 0.3s ease';
    selectButton.addEventListener('mouseenter', () => {
      selectButton.style.backgroundColor = '#3a54d1';
    });
    selectButton.addEventListener('mouseleave', () => {
      selectButton.style.backgroundColor = '#4a6cf7';
    });

    selectButton.addEventListener('click', async () => {
      // Remove any existing confirmation card
      const existingCard = document.getElementById('confirmation-card');
      if (existingCard) {
        existingCard.remove();
      }

      // Create floating confirmation card element
      const confirmationCard = document.createElement('div');
      confirmationCard.id = 'confirmation-card';
      confirmationCard.style.position = 'fixed';
      confirmationCard.style.top = '50%';
      confirmationCard.style.left = '50%';
      confirmationCard.style.transform = 'translate(-50%, -50%)';
      confirmationCard.style.backgroundColor = 'white';
      confirmationCard.style.border = '1px solid #ccc';
      confirmationCard.style.borderRadius = '8px';
      confirmationCard.style.padding = '20px';
      confirmationCard.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
      confirmationCard.style.zIndex = '1000';
      confirmationCard.style.width = '300px';
      confirmationCard.style.textAlign = 'center';
      confirmationCard.style.fontSize = '1rem';
      confirmationCard.style.fontWeight = '600';

      const messageText = document.createElement('p');
      messageText.textContent = `Selecionar paciente ${p.pacNome} (Código: ${p.pacCodigo})?`;
      messageText.style.marginBottom = '20px';

      const buttonsContainer = document.createElement('div');
      buttonsContainer.style.display = 'flex';
      buttonsContainer.style.justifyContent = 'space-around';

      const yesButton = document.createElement('button');
      yesButton.textContent = 'Sim';
      yesButton.style.backgroundColor = '#4a6cf7';
      yesButton.style.color = 'white';
      yesButton.style.border = 'none';
      yesButton.style.borderRadius = '4px';
      yesButton.style.padding = '6px 12px';
      yesButton.style.cursor = 'pointer';
      yesButton.style.fontWeight = 'bold';
      yesButton.style.fontSize = '1rem';
      yesButton.style.transition = 'background-color 0.3s ease';
      yesButton.addEventListener('mouseenter', () => {
        yesButton.style.backgroundColor = '#3a54d1';
      });
      yesButton.addEventListener('mouseleave', () => {
        yesButton.style.backgroundColor = '#4a6cf7';
      });

      const noButton = document.createElement('button');
      noButton.textContent = 'Não';
      noButton.style.backgroundColor = '#ccc';
      noButton.style.color = 'black';
      noButton.style.border = 'none';
      noButton.style.borderRadius = '4px';
      noButton.style.padding = '6px 12px';
      noButton.style.cursor = 'pointer';
      noButton.style.fontWeight = 'bold';
      noButton.style.fontSize = '1rem';
      noButton.style.transition = 'background-color 0.3s ease';
      noButton.addEventListener('mouseenter', () => {
        noButton.style.backgroundColor = '#999';
      });
      noButton.addEventListener('mouseleave', () => {
        noButton.style.backgroundColor = '#ccc';
      });

      buttonsContainer.appendChild(yesButton);
      buttonsContainer.appendChild(noButton);
      confirmationCard.appendChild(messageText);
      confirmationCard.appendChild(buttonsContainer);

      // Append confirmation card to body
      document.body.appendChild(confirmationCard);

      // Wait for confirmation
      const confirmed = await new Promise<boolean>((resolve) => {
        yesButton.onclick = () => {
          document.body.removeChild(confirmationCard);
          resolve(true);
        };
        noButton.onclick = () => {
          document.body.removeChild(confirmationCard);
          resolve(false);
        };

        // Also remove the confirmation card if user clicks outside
        confirmationCard.addEventListener('click', (e) => {
          if (e.target === confirmationCard) {
            document.body.removeChild(confirmationCard);
            resolve(false);
          }
        });
      });

      if (!confirmed) return;

      // Fetch patient details and update profile
      const details = await fetchPatientDetails(p.pacCodigo);
      if (pacienteProfileContainer && details) {
        const nameEl = pacienteProfileContainer.querySelector('.profile-header-info h2');
        const infoPs = pacienteProfileContainer.querySelectorAll('.profile-header-info p');
        if (nameEl) (nameEl as HTMLElement).textContent = details.pacNome || p.pacNome;
        if (infoPs.length >= 5) {
          (infoPs[0] as HTMLElement).textContent = `ID: #${details.pacCodigo || p.pacCodigo}`;
          (infoPs[1] as HTMLElement).textContent = `Sexo: ${details.pacSexo || ''}`;
          (infoPs[2] as HTMLElement).textContent = `Data de Nascimento: ${formatDate(details.pacDtNasc)}`;
          (infoPs[3] as HTMLElement).textContent = `Pai: ${details.pacPaiNome || ''}`;
          (infoPs[4] as HTMLElement).textContent = `Mãe: ${details.pacMaeNome || ''}`;
        }
      }
      // Do not clear or reset profile container on new searches, keep info fixed until new selection
      pacienteSearchContainer.style.display = 'none';
      pacienteProfileContainer.style.display = 'block';

      // Show notification card only after patient selection
      if (notificationPanel && notificationBell) {
        // Remove fixed show class to avoid persistent display
        notificationPanel.classList.remove('show');
        notificationBell.classList.remove('active');
        notificationBell.setAttribute('aria-expanded', 'false');
      }
    });

    cardDiv.appendChild(infoSpan);
    cardDiv.appendChild(selectButton);
    frag.appendChild(cardDiv);
  });
  searchResultsList.appendChild(frag);
}

// Handle patient search
pacienteSearchForm?.addEventListener('submit', async (e: Event) => {
  e.preventDefault();
  const nome = (pacienteSearchInput?.value || '').trim();
  if (!nome) {
    alert('Por favor, digite um nome para buscar.');
    return;
  }
  // Call API (with fallback)
  const results = await searchPatientsByName(nome);
  displaySearchResults(results || []);
});

// Handle "back to search" button click
backToSearchBtn?.addEventListener('click', () => {
  pacienteProfileContainer.style.display = 'none';
  pacienteSearchContainer.style.display = 'block';
  (pacienteSearchForm.querySelector('input') as HTMLInputElement).value = ''; // Clear search input
  clearSearchResults();
});

// --- Cartas Panel Logic ---
escreverCartaBtn?.addEventListener('click', () => {
  cartasMainView.style.display = 'none';
  cartasEscreverView.style.display = 'block';
});

backToCartasMainBtn?.addEventListener('click', () => {
  cartasEscreverView.style.display = 'none';
  cartasMainView.style.display = 'block';
});

// --- Helper Functions ---

/**
 * Updates the main page title in the dashboard header.
 * @param {string} title - The new title to display.
 */
// Fix: Corrected function name from 'updatePage-title' to 'updatePageTitle' to match calls and be valid syntax.
function updatePageTitle(title: string) {
  if (pageTitle) {
    pageTitle.textContent = title;
  }
}
