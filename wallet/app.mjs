import {
  formatMinorForLocale,
  parseDecimalStringToMinor,
} from './money.mjs';

const els = {
  form: /** @type {HTMLFormElement} */ (document.getElementById('send-form')),
  amount: /** @type {HTMLInputElement} */ (document.getElementById('amount')),
  currency: /** @type {HTMLSelectElement} */ (document.getElementById('currency')),
  recipient: /** @type {HTMLInputElement} */ (document.getElementById('recipient')),
  balance: /** @type {HTMLElement} */ (document.getElementById('balance')),
  status: /** @type {HTMLElement} */ (document.getElementById('status')),
  idem: /** @type {HTMLElement} */ (document.getElementById('idempotency-key')),
  submit: /** @type {HTMLButtonElement} */ (document.getElementById('submit-send')),
};

/** Demo-only cap: holds balance in minor units as BigInt. */
let balanceMinor = 2500_00n; // $2,500.00 demo balance

function setStatus(kind, message) {
  els.status.hidden = false;
  els.status.dataset.kind = kind;
  els.status.textContent = message;
}

function renderBalance() {
  const cur = els.currency.value;
  els.balance.textContent = formatMinorForLocale(balanceMinor, cur);
}

function newIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `idem_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function setLoading(isLoading) {
  els.submit.disabled = isLoading;
  els.submit.setAttribute('aria-busy', isLoading ? 'true' : 'false');
}

els.currency.addEventListener('change', renderBalance);

els.form.addEventListener('submit', async (e) => {
  e.preventDefault();
  setStatus('info', '');

  const currency = els.currency.value;
  let minor;
  try {
    minor = parseDecimalStringToMinor(els.amount.value, currency);
  } catch (err) {
    setStatus('error', err instanceof Error ? err.message : 'Check the amount and try again.');
    return;
  }

  if (minor > balanceMinor) {
    setStatus('error', 'That amount is more than your available balance. Try a smaller amount.');
    return;
  }

  const idem = newIdempotencyKey();
  els.idem.textContent = idem;

  setLoading(true);
  setStatus('info', 'Sending… stay on this screen.');

  await new Promise((r) => {
    setTimeout(r, 650);
  });

  balanceMinor -= minor;
  renderBalance();
  setLoading(false);
  setStatus(
    'success',
    `Sent ${formatMinorForLocale(minor, currency)} to ${els.recipient.value.trim()}. This demo does not move real money.`,
  );
  els.form.reset();
});

renderBalance();
