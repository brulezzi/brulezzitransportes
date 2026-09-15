document.addEventListener("DOMContentLoaded", function () {
  var header = document.getElementById("siteHeader");
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("mainNav");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }
  if (header) {
    function updateHeader() { header.classList.toggle("scrolled", window.scrollY > 20); }
    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", function (event) {
      if (!nav.contains(event.target) && !toggle.contains(event.target)) setMenu(false);
    });
  }
  function track(name, origin) {
    if (typeof window.trackContact === "function") window.trackContact(name, origin);
  }
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      var fields = form.elements;
      var message = [
        "Olá, vim pelo site e gostaria de cotar um transporte para minha empresa.", "",
        "Nome: " + fields.nome.value.trim(),
        "WhatsApp: " + fields.whatsapp.value.trim(),
        "Empresa: " + fields.empresa.value.trim(),
        "Serviço: " + fields.servico.value,
        "Carga: " + fields.carga.value.trim(),
        "Frequência: " + fields.frequencia.value,
        "Coleta: " + fields.coleta.value.trim(),
        "Entrega: " + fields.entrega.value.trim()
      ].join("\n");
      var fallback = document.getElementById("whatsappFallback");
      var url = "https://wa.me/5519992445953?text=" + encodeURIComponent(message);
      fallback.href = url;
      fallback.hidden = false;
      document.getElementById("formStatus").textContent = "Sua cotação está pronta. Envie a mensagem no WhatsApp para iniciar o atendimento. Se ele não abriu, use o link abaixo.";
      track("contato_whatsapp", "formulario");
      window.open(url, "_blank", "noopener,noreferrer");
    });
    // Enable fields only after installing the submit handler.
    form.querySelector("fieldset").disabled = false;
  }
  document.addEventListener("click", function (event) {
    var link = event.target.closest("a");
    if (!link || link.id === "whatsappFallback") return;
    if (link.href.startsWith("https://wa.me/")) track("contato_whatsapp", "link");
    if (link.href.startsWith("tel:")) track("contato_telefone", "link");
  });
});
