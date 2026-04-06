// =============================================
// UI HELPERS - PRAXIFY
// Funções utilitárias para interface
// =============================================

import { debug } from '../core/config.js';

// =============================================
// LOADING STATES
// =============================================

/**
 * Mostra loading global
 */
export function showLoading(message = 'Carregando...') {
    let loader = document.getElementById('global-loader');

    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.className = 'global-loader';
        loader.innerHTML = `
      <div class="loader-content">
        <div class="spinner"></div>
        <p class="loader-message">${message}</p>
      </div>
    `;
        document.body.appendChild(loader);
    } else {
        const messageEl = loader.querySelector('.loader-message');
        if (messageEl) messageEl.textContent = message;
        loader.style.display = 'flex';
    }
}

/**
 * Esconde loading global
 */
export function hideLoading() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

/**
 * Adiciona loading a um elemento específico
 */
export function addLoadingToElement(element, message = '') {
    if (!element) return;

    element.classList.add('loading');
    element.setAttribute('data-original-content', element.innerHTML);

    element.innerHTML = `
    <div class="inline-loader">
      <div class="spinner-small"></div>
      ${message ? `<span>${message}</span>` : ''}
    </div>
  `;
    element.disabled = true;
}

/**
 * Remove loading de um elemento
 */
export function removeLoadingFromElement(element) {
    if (!element) return;

    const original = element.getAttribute('data-original-content');
    if (original) {
        element.innerHTML = original;
        element.removeAttribute('data-original-content');
    }

    element.classList.remove('loading');
    element.disabled = false;
}

// =============================================
// TOASTS E NOTIFICAÇÕES
// =============================================

let toastContainer = null;

/**
 * Garante que container de toasts existe
 */
function ensureToastContainer() {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    return toastContainer;
}

/**
 * Mostra toast notification
 */
export function showToast(message, type = 'info', duration = 3000) {
    const container = ensureToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    }[type] || 'ℹ';

    toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close">×</button>
  `;

    container.appendChild(toast);

    // Animar entrada
    setTimeout(() => toast.classList.add('show'), 10);

    // Botão fechar
    toast.querySelector('.toast-close').addEventListener('click', () => {
        removeToast(toast);
    });

    // Auto-remover
    if (duration > 0) {
        setTimeout(() => removeToast(toast), duration);
    }

    return toast;
}

/**
 * Remove toast
 */
function removeToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

/**
 * Atalhos para tipos de toast
 */
export function showSuccess(message, duration) {
    return showToast(message, 'success', duration);
}

export function showError(message, duration) {
    return showToast(message, 'error', duration);
}

export function showWarning(message, duration) {
    return showToast(message, 'warning', duration);
}

export function showInfo(message, duration) {
    return showToast(message, 'info', duration);
}

// =============================================
// MODALS
// =============================================

/**
 * Abre modal
 */
export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        debug(`Modal ${modalId} não encontrado`);
        return;
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * Fecha modal
 */
export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('hidden');
    document.body.style.overflow = '';

    // Limpar formulário se houver
    const form = modal.querySelector('form');
    if (form) form.reset();
}

/**
 * Fecha modal ao clicar fora
 */
export function setupModalCloseOnClickOutside(modalId) {
    const overlay = document.getElementById(modalId);
    if (!overlay) return;

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal(modalId);
        }
    });
}

// =============================================
// FORMATAÇÃO
// =============================================

/**
 * Formata data para pt-BR
 */
export function formatDate(dateString) {
    if (!dateString) return '-';

    try {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR');
    } catch {
        return dateString;
    }
}

/**
 * Formata data e hora para pt-BR
 */
export function formatDateTime(dateString) {
    if (!dateString) return '-';

    try {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR');
    } catch {
        return dateString;
    }
}

/**
 * Formata CPF
 */
export function formatCPF(cpf) {
    if (!cpf) return '';
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CNPJ
 */
export function formatCNPJ(cnpj) {
    if (!cnpj) return '';
    const cleaned = cnpj.replace(/\D/g, '');
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata CPF ou CNPJ automaticamente
 */
export function formatCPFCNPJ(value) {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length <= 11) {
        return formatCPF(cleaned);
    } else {
        return formatCNPJ(cleaned);
    }
}

/**
 * Formata número de telefone
 */
export function formatPhone(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    return phone;
}

/**
 * Trunca texto com ellipsis
 */
export function truncate(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// =============================================
// VALIDAÇÃO
// =============================================

/**
 * Valida email
 */
export function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida CPF
 */
export function isValidCPF(cpf) {
    const cleaned = cpf.replace(/\D/g, '');

    if (cleaned.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleaned)) return false;

    // Validar dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleaned.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleaned.charAt(10))) return false;

    return true;
}

/**
 * Valida CNPJ
 */
export function isValidCNPJ(cnpj) {
    const cleaned = cnpj.replace(/\D/g, '');

    if (cleaned.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cleaned)) return false;

    // Validar dígitos verificadores
    let length = cleaned.length - 2;
    let numbers = cleaned.substring(0, length);
    const digits = cleaned.substring(length);
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += numbers.charAt(length - i) * pos--;
        if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    length = length + 1;
    numbers = cleaned.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += numbers.charAt(length - i) * pos--;
        if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
}

// =============================================
// DEBOUNCE
// =============================================

/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// =============================================
// DOM HELPERS
// =============================================

/**
 * Cria elemento com classes e atributos
 */
export function createElement(tag, classes = [], attributes = {}) {
    const element = document.createElement(tag);

    if (classes.length) {
        element.classList.add(...classes);
    }

    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });

    return element;
}

/**
 * Limpa conteúdo de elemento
 */
export function clearElement(element) {
    if (element) {
        element.innerHTML = '';
    }
}

/**
 * Mostra/esconde elemento
 */
export function toggleElement(element, show) {
    if (!element) return;

    if (show) {
        element.classList.remove('hidden');
    } else {
        element.classList.add('hidden');
    }
}

export default {
    showLoading,
    hideLoading,
    addLoadingToElement,
    removeLoadingFromElement,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    openModal,
    closeModal,
    setupModalCloseOnClickOutside,
    formatDate,
    formatDateTime,
    formatCPF,
    formatCNPJ,
    formatCPFCNPJ,
    formatPhone,
    truncate,
    isValidEmail,
    isValidCPF,
    isValidCNPJ,
    debounce,
    createElement,
    clearElement,
    toggleElement
};
