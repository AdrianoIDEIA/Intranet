import { sanitizeString, sanitizeNumber } from '../utils/queryUtils.js';

/**
 * Middleware para validar parâmetros de rota
 * @param {string[]} requiredParams - Lista de parâmetros obrigatórios
 * @returns {function} Middleware Express
 */
export function validateParams(requiredParams = []) {
  return (req, res, next) => {
    for (const param of requiredParams) {
      const value = req.params[param] || req.query[param];
      if (value === undefined || value === null) {
        return res.status(400).json({ message: `Parâmetro '${param}' é obrigatório.` });
      }
    }
    next();
  };
}

/**
 * Middleware para validar e sanitizar parâmetro string
 * @param {string} paramName - Nome do parâmetro
 * @param {number} maxLength - Comprimento máximo permitido
 * @returns {function} Middleware Express
 */
export function validateStringParam(paramName, maxLength = 255) {
  return (req, res, next) => {
    const value = req.params[paramName] || req.query[paramName];
    const sanitized = sanitizeString(value, maxLength);
    if (!sanitized) {
      return res.status(400).json({ message: `Parâmetro '${paramName}' inválido.` });
    }
    // Atualiza o valor sanitizado no req para uso posterior
    if (req.params[paramName]) req.params[paramName] = sanitized;
    if (req.query[paramName]) req.query[paramName] = sanitized;
    next();
  };
}

/**
 * Middleware para validar e sanitizar parâmetro numérico
 * @param {string} paramName - Nome do parâmetro
 * @param {number} min - Valor mínimo permitido
 * @param {number} max - Valor máximo permitido
 * @returns {function} Middleware Express
 */
export function validateNumberParam(paramName, min = null, max = null) {
  return (req, res, next) => {
    const value = req.params[paramName] || req.query[paramName];
    const sanitized = sanitizeNumber(value, min, max);
    if (sanitized === null) {
      return res.status(400).json({ message: `Parâmetro '${paramName}' inválido.` });
    }
    if (req.params[paramName]) req.params[paramName] = sanitized;
    if (req.query[paramName]) req.query[paramName] = sanitized;
    next();
  };
}
