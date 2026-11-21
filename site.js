/* Brulezzi Transportes: comportamento comum (entrada ao rolar, contadores, barra do celular, pausa de movimento). Nenhum dado pessoal. */
(function () {
  "use strict";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  // Entrada ao rolar
  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !hasIO) reveals.forEach(function (el) { el.classList.add("is-visible"); });
  else {
    var ro = new IntersectionObserver(function (items) {
      items.forEach(function (it) { if (it.isIntersecting) { it.target.classList.add("is-visible"); ro.unobserve(it.target); } });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { ro.observe(el); });
  }

  // Contadores
  function run(el) {
    var end = parseInt(el.getAttribute("data-count"), 10), suffix = el.getAttribute("data-suffix") || "", prefix = el.getAttribute("data-prefix") || "";
    if (reduce || !end) { el.textContent = prefix + end + suffix; return; }
    var start = null;
    function tick(t) {
      if (start === null) start = t;
      var k = Math.min((t - start) / 1200, 1);
      el.textContent = prefix + Math.round(end * (1 - Math.pow(1 - k, 3))) + suffix;
      if (k < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (hasIO) {
    var co = new IntersectionObserver(function (items) {
      items.forEach(function (it) { if (it.isIntersecting) { run(it.target); co.unobserve(it.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  } else counters.forEach(run);

  // A barra fixa some enquanto o formulario esta na tela
  var bar = document.getElementById("mobileBar"), quote = document.getElementById("cotacao") || document.getElementById("contactForm");
  if (bar && quote && hasIO) {
    new IntersectionObserver(function (items) { bar.classList.toggle("bar-hide", items[0].isIntersecting); }, { threshold: 0.15 }).observe(quote);
  }

  // Pausar movimentos
  var toggle = document.getElementById("motionToggle");
  if (toggle) toggle.addEventListener("click", function () {
    var paused = document.body.classList.toggle("motion-paused");
    toggle.textContent = paused ? "Retomar movimentos" : "Pausar movimentos";
    toggle.setAttribute("aria-pressed", String(paused));
  });
})();
