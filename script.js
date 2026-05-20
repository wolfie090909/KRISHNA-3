/**
 * Storefront interactions (Krishna Mobiles).
 * Keeps cart buttons responsive without silent failures.
 */
document.querySelectorAll('.add-to-cart').forEach((button) => {
  button.addEventListener('click', () => {
    button.setAttribute('aria-busy', 'true');
    window.setTimeout(() => button.removeAttribute('aria-busy'), 350);
  });
});
