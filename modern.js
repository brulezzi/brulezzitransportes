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
    form.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    var name = form.querySelector('input[name="nome"]');
    if (name) name.focus({ preventScroll: true });
  });
})();
