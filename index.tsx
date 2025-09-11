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

// --- Event Listeners ---

// Handle login form submission
loginForm?.addEventListener('submit', (e: Event) => {
  e.preventDefault();
  const user = emailInput.value;
  const password = passwordInput.value;

  // Simple hardcoded login validation
  if (user === 'DEV' && password === '12345') {
    // On successful login
    errorMessage.textContent = '';
    loginContainer.style.display = 'none';
    dashboardContainer.style.display = 'flex'; // Use flex as it's a flex container
    welcomeMessage.textContent = `Welcome, Adriano Camargo`;
    // Set initial dashboard title based on the default active button
    const initialActiveButton = document.querySelector(
      '.nav-button.active'
    ) as HTMLElement;
    updatePageTitle(initialActiveButton?.dataset.page || 'Intranet');
  } else {
    // On failed login
    errorMessage.textContent = 'Invalid credentials. Please try again.';
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
});

// Handle form submission
anamneseForm?.addEventListener('submit', (e: Event) => {
  e.preventDefault();
  // Here you would typically handle the form data
  alert('Formulário salvo com sucesso!');
  anamneseForm.reset(); // Clear the form
  anamneseFormContainer.style.display = 'none';
  anamneseActions.style.display = 'flex'; // Show buttons again
});

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
