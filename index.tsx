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

// Handle patient search
pacienteSearchForm?.addEventListener('submit', (e: Event) => {
  e.preventDefault();
  // In a real app, you would fetch patient data here
  pacienteSearchContainer.style.display = 'none';
  pacienteProfileContainer.style.display = 'block';
});

// Handle "back to search" button click
backToSearchBtn?.addEventListener('click', () => {
  pacienteProfileContainer.style.display = 'none';
  pacienteSearchContainer.style.display = 'block';
  (pacienteSearchForm.querySelector('input') as HTMLInputElement).value = ''; // Clear search input
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
