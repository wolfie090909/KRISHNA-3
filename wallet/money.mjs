/**
 * Money helpers: all amounts are minor units (e.g. USD cents) as BigInt.
 * No floating-point on monetary paths.
 */

const ISO4217_EXPONENT = Object.freeze({
  USD: 2,
  EUR: 2,
  GBP: 2,
  AED: 2,
  JPY: 0,
});

/**
 * @param {string} code
 * @returns {number}
 */
export function minorExponentFor(code) {
  const c = code.toUpperCase();
  if (!Object.prototype.hasOwnProperty.call(ISO4217_EXPONENT, c)) {
    throw new Error(`Unsupported currency for this slice: ${code}`);
  }
  return ISO4217_EXPONENT[c];
}

/**
 * Parse a user-entered decimal string into minor units. Rejects scientific notation and ambiguity.
 * @param {string} raw
 * @param {string} currency
 * @returns {bigint}
 */
export function parseDecimalStringToMinor(raw, currency) {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error('Amount is required.');
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error('Use digits only, optional single decimal point.');
  }

  const exp = minorExponentFor(currency);
  const [wholePart, fracPart = ''] = trimmed.split('.');
  if (fracPart.length > exp) {
    throw new Error(`Use at most ${exp} decimal places for ${currency}.`);
  }

  const fracPadded = fracPart.padEnd(exp, '0');
  const minor = BigInt(wholePart) * 10n ** BigInt(exp) + BigInt(fracPadded || '0');
  if (minor <= 0n) throw new Error('Amount must be greater than zero.');
  return minor;
}

/**
 * @param {bigint} minor
 * @param {string} currency
 * @returns {string}
 */
export function formatMinorToDisplay(minor, currency) {
  const exp = minorExponentFor(currency);
  const neg = minor < 0n;
  const abs = neg ? -minor : minor;
  const divisor = 10n ** BigInt(exp);
  const whole = abs / divisor;
  const frac = abs % divisor;
  const fracStr = frac.toString().padStart(exp, '0');
  const sign = neg ? '-' : '';
  return exp === 0 ? `${sign}${whole}` : `${sign}${whole}.${fracStr}`;
}

/**
 * Narrow currency symbol for a locale (no monetary amount conversion).
 * @param {string} locale
 * @param {string} currency
 * @returns {string}
 */
function narrowCurrencySymbol(locale, currency) {
  const parts = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
  }).formatToParts(0);
  return parts.find((p) => p.type === 'currency')?.value ?? currency;
}

/**
 * Thousands grouping for the integer string (Western grouping of 3s).
 * @param {string} intDigits
 * @returns {string}
 */
function groupIntDigitsWestern(intDigits) {
  return intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Locale-aware label using Intl for the symbol only; numeric layout uses BigInt + string math (no float).
 * @param {bigint} minor
 * @param {string} currency
 * @param {string} [locale='en-US']
 * @returns {string}
 */
export function formatMinorForLocale(minor, currency, locale = 'en-US') {
  const exp = minorExponentFor(currency);
  const raw = formatMinorToDisplay(minor, currency);
  const neg = raw.startsWith('-');
  const unsigned = neg ? raw.slice(1) : raw;
  const [wholeStr, fracStr = ''] = exp === 0 ? [unsigned, ''] : unsigned.split('.');
  const groupedWhole = groupIntDigitsWestern(wholeStr);
  const numberText = exp === 0 ? groupedWhole : `${groupedWhole}.${fracStr}`;
  const sign = neg ? '-' : '';
  const sym = narrowCurrencySymbol(locale, currency);
  const symTrim = sym.trim();
  const isPrefixDollarLike = symTrim === '$' || symTrim === '£' || symTrim === '€';
  if (isPrefixDollarLike) {
    return `${symTrim}${sign}${numberText}`;
  }
  return `${sign}${numberText} ${symTrim}`;
}
