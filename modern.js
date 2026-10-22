(() => {
  "use strict";
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (items) {
      items.forEach(function (item) {
        if (item.isIntersecting) { item.target.classList.add("is-visible"); observer.unobserve(item.target); }
      });
    }, { threshold: 0.06 });
    document.documentElement.classList.add("motion-ready");
    document.querySelectorAll("[data-reveal]").forEach(function (el) { observer.observe(el); });
  }

  var toggle = document.getElementById("motionToggle");
  if (toggle) toggle.addEventListener("click", function () {
    var paused = document.body.classList.toggle("motion-paused");
    toggle.textContent = paused ? "Retomar movimentos" : "Pausar movimentos";
    toggle.setAttribute("aria-pressed", String(paused));
  });

  // Keep one navigable set of cities; the seamless visual copy is inert.
  var ticker = document.querySelector(".city-ticker");
  var ribbonToggle = document.querySelector(".ribbon-toggle");
  if (ticker && ribbonToggle) {
    var track = ticker.querySelector(".city-track");
    var group = ticker.querySelector(".city-group");
    var copy = group.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    copy.setAttribute("inert", "");
    copy.querySelectorAll("a").forEach(function (link) { link.setAttribute("tabindex", "-1"); });
    track.appendChild(copy);
    ticker.classList.add("is-animated");
    var motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
    function updateRibbonMotion() {
      ribbonToggle.hidden = motionPreference.matches;
    }
    updateRibbonMotion();
    motionPreference.addEventListener("change", updateRibbonMotion);
    ribbonToggle.addEventListener("click", function () {
      var paused = ticker.classList.toggle("is-paused");
      ribbonToggle.setAttribute("aria-pressed", String(paused));
      ribbonToggle.textContent = paused ? "Retomar faixa" : "Pausar faixa";
    });
    // Focused links must stay visible and still while navigating by keyboard.
    ticker.addEventListener("focusin", function () { ticker.classList.add("is-focused"); });
    ticker.addEventListener("focusout", function (event) {
      if (!ticker.contains(event.relatedTarget)) ticker.classList.remove("is-focused");
    });
  }

  if (matchMedia("(hover:hover) and (prefers-reduced-motion:no-preference)").matches) {
    document.querySelectorAll(".intent-card,.bento-card").forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        if (document.body.classList.contains("motion-paused")) return;
        var box = card.getBoundingClientRect();
        card.style.setProperty("--pointer-x", ((event.clientX - box.left) / box.width * 100) + "%");
        card.style.setProperty("--pointer-y", ((event.clientY - box.top) / box.height * 100) + "%");
      });
    });
  }

  var selected = "Motoboy";
  var buttons = document.querySelectorAll("[data-vehicle]");
  var start = document.getElementById("startQuote");
  var status = document.getElementById("quoteStatus");
  var form = document.getElementById("contactForm");
  if (!buttons.length || !start || !form) return;
  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      selected = button.dataset.vehicle;
      buttons.forEach(function (b) {
        b.classList.toggle("selected", b === button);
        b.setAttribute("aria-pressed", String(b === button));
      });
      start.firstChild.textContent = "Cotar " + selected.toLocaleLowerCase("pt-BR") + " ";
      status.textContent = selected + " selecionado para sua cotação.";
    });
  });
  start.addEventListener("click", function () {
    var select = form.querySelector('select[name="servico"]');
    if (select) { select.value = selected; select.dispatchEvent(new Event("change", { bubbles: true })); }
    // Measurement only: which vehicle started a quote. No personal data.
    if (typeof window.trackContact === "function") {
      window.trackContact("cotacao_iniciada", "cartao_" + selected.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase());
    }
    if (window.brulezziQuote) { window.brulezziQuote.start(); return; }
    form.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    var name = form.querySelector('input[name="nome"]');
    if (name) name.focus({ preventScroll: true });
  });
})();
