document.addEventListener("DOMContentLoaded", function () {
  var header = document.getElementById("siteHeader");
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("mainNav");

  window.addEventListener("scroll", function () {
    header.classList.toggle("scrolled", window.scrollY > 20);
  });

  toggle.addEventListener("click", function () {
    nav.classList.toggle("open");
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("open");
    });
  });

  // Reveal on scroll
  var revealEls = document.querySelectorAll("[data-reveal]");
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach(function (el) { revealObserver.observe(el); });

  // Animated counters
  var counters = document.querySelectorAll("[data-count]");
  var counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute("data-count"), 10);
        var suffix = el.getAttribute("data-suffix") || "";
        var start = 0;
        var duration = 1000;
        var startTime = null;

        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var value = Math.floor(progress * target);
          el.textContent = value + suffix;
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(step);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach(function (el) { counterObserver.observe(el); });

  // Contact form -> WhatsApp
  var form = document.getElementById("contactForm");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nome = form.nome.value.trim();
    var whatsapp = form.whatsapp.value.trim();
    var empresa = form.empresa.value.trim();
    var servico = form.servico.value;
    var coleta = form.coleta.value.trim();
    var entrega = form.entrega.value.trim();

    var linhas = [
      "Olá, vim pelo site e gostaria de solicitar um transporte.",
      "",
      "Nome: " + nome,
      "WhatsApp: " + whatsapp
    ];
    if (empresa) linhas.push("Empresa: " + empresa);
    linhas.push("Serviço: " + servico);
    linhas.push("Coleta: " + coleta);
    linhas.push("Entrega: " + entrega);

    var texto = linhas.join("\n");
    window.open("https://wa.me/5519992445953?text=" + encodeURIComponent(texto), "_blank");
  });
});
