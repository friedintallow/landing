/* Apply availability before the page scripts read persisted carts. */
(() => {
  const available = new Set(["thai-chili", "thai-lime", "black-pepper", "truffle", "tom-yum", "just-tallow"]);
  try {
    const cart = JSON.parse(localStorage.getItem("friedintallow-cart") || "{}");
    if (cart && typeof cart === "object" && !Array.isArray(cart)) {
      const current = Object.fromEntries(Object.entries(cart).filter(([id, quantity]) => available.has(id) && Number.isInteger(quantity) && quantity > 0));
      localStorage.setItem("friedintallow-cart", JSON.stringify(current));
    }
    const bundles = JSON.parse(localStorage.getItem("friedintallow-bundles") || "[]");
    if (Array.isArray(bundles)) {
      // A mixed box must be rebuilt rather than silently changing its contents.
      const current = bundles.filter(bundle => bundle && Object.keys(bundle.selections || {}).every(id => available.has(id)));
      localStorage.setItem("friedintallow-bundles", JSON.stringify(current));
    }
    const order = JSON.parse(sessionStorage.getItem("friedintallow-checkout") || "null");
    if (order) {
      const hiddenSingle = (order.singles || []).some(item => !available.has(item.id));
      const hiddenBundle = (order.bundles || []).some(bundle =>
        Object.keys(bundle.selections || {}).some(id => !available.has(id)) ||
        (bundle.flavors || []).some(item => !available.has(item.id))
      );
      if (hiddenSingle || hiddenBundle) sessionStorage.removeItem("friedintallow-checkout");
    }
  } catch { /* Storage can be unavailable in private browsing. */ }
})();
