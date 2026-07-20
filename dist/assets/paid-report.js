(function () {
  const base = (window.MCC_BASE_URL || "https://console.shanyuegroup.com").replace(/\/$/, "");
  const checkoutUrl = `${base}/api/checkout/create`;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function readInputMap(card) {
    try {
      return JSON.parse(card.getAttribute("data-paid-inputs") || "{}");
    } catch {
      return {};
    }
  }

  function collectIChingInput(card, root, input) {
    if (card.getAttribute("data-paid-site") !== "iching") return input;
    const castButton = root.querySelector("[data-cast]");
    const result = root.querySelector("#result");
    if (castButton && result && result.dataset.readingReady !== "true") castButton.click();
    const updatedResult = root.querySelector("#result");
    if (!updatedResult) return input;
    input.primaryHexagram = updatedResult.dataset.primaryHexagram || "";
    input.changingLines = updatedResult.dataset.changingLines || "";
    input.relatingHexagram = updatedResult.dataset.relatingHexagram || "";
    input.linePattern = updatedResult.dataset.linePattern || "";
    input.toolResult = updatedResult.textContent.replace(/\s+/g, " ").trim().slice(0, 1200);
    return input;
  }

  function collectInput(card) {
    const root = card.closest(".container") || document;
    const input = {};
    const inputMap = readInputMap(card);
    Object.entries(inputMap).forEach(([key, selector]) => {
      const field = root.querySelector(selector);
      input[key] = field ? String(field.value || field.textContent || "").trim() : "";
    });
    collectIChingInput(card, root, input);
    if (!input.source) input.source = card.getAttribute("data-paid-site") || "";
    if (!input.question) {
      input.question = input.symbol || input.setting || input.birth || input.name || input.source || "Paid report request";
    }
    return input;
  }

  function paidEventParams(card) {
    return {
      site: card.getAttribute("data-paid-site") || "",
      product: card.getAttribute("data-paid-product") || "full-report",
      provider: card.getAttribute("data-paid-provider") || "paypal",
      page_path: window.location.pathname
    };
  }

  function trackPaidEvent(name, card, extra = {}) {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", name, { ...paidEventParams(card), ...extra });
  }

  function setStatus(card, message, isError) {
    const status = card.querySelector("[data-paid-status]");
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("is-error", Boolean(isError));
  }

  async function startCheckout(card) {
    const emailInput = card.querySelector("[data-paid-email]");
    const button = card.querySelector("[data-paid-checkout]");
    const email = String(emailInput && emailInput.value || "").trim();
    if (!emailPattern.test(email)) {
      if (emailInput) {
        emailInput.focus();
        emailInput.setAttribute("aria-invalid", "true");
      }
      setStatus(card, "Enter a valid email address for report delivery.", true);
      return;
    }
    if (emailInput) emailInput.removeAttribute("aria-invalid");
    const oldText = button ? button.textContent : "";
    if (button) {
      button.disabled = true;
      button.textContent = "Creating checkout...";
    }
    trackPaidEvent("checkout_create_attempt", card);
    setStatus(card, "Connecting to secure checkout...", false);
    try {
      const response = await fetch(card.getAttribute("data-paid-endpoint") || checkoutUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: card.getAttribute("data-paid-provider") || "paypal",
          site: card.getAttribute("data-paid-site"),
          product: card.getAttribute("data-paid-product") || "full-report",
          email,
          input: collectInput(card)
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "checkout_failed");
      trackPaidEvent("checkout_create_success", card);
      window.location.href = data.checkoutUrl || data.approvalUrl;
    } catch (error) {
      if (button) {
        button.disabled = false;
        button.textContent = oldText;
      }
      trackPaidEvent("checkout_create_error", card, { error_message: error.message });
      setStatus(card, `Checkout failed: ${error.message}`, true);
    }
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-paid-checkout]");
    if (!button) return;
    const card = button.closest("[data-paid-report]");
    if (card) {
      trackPaidEvent("paid_cta_click", card);
      startCheckout(card);
    }
  });

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-paid-form]");
    if (!form) return;
    event.preventDefault();
    const card = form.closest("[data-paid-report]");
    if (card) {
      trackPaidEvent("paid_cta_click", card);
      startCheckout(card);
    }
  });
})();

