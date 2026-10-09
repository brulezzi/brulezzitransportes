document.addEventListener("DOMContentLoaded", function () {
  // Only approved campaign labels are included; never forward arbitrary query data.
  var campaignLabels = {
    brz_campinas: "BRZ-CAMPINAS",
    brz_indaiatuba: "BRZ-INDAIATUBA",
    brz_santos: "BRZ-SANTOS"
  };
  var params = window.location ? new URLSearchParams(window.location.search) : { get: function () { return null; } };
  var campaignLabel = params.get("utm_source") === "google" && params.get("utm_medium") === "cpc"
    ? campaignLabels[params.get("utm_campaign")] : null;
  function labelMessage(message) {
    return campaignLabel ? message + "\nReferência: " + campaignLabel : message;
  }
  if (campaignLabel) window.brulezziCampaign = { name: params.get("utm_campaign") };
  if (campaignLabel) {
    // Preserve only the approved campaign on same-site navigation, without identifiers.
    document.querySelectorAll('a[href]').forEach(function (link) {
      var target = new URL(link.href, window.location.href);
      if (target.origin !== window.location.origin || target.pathname === window.location.pathname) return;
      target.searchParams.set('utm_source','google');target.searchParams.set('utm_medium','cpc');
      target.searchParams.set('utm_campaign',params.get('utm_campaign'));link.href=target.toString();
    });
    document.querySelectorAll('a[href^="https://wa.me/5519992445953"]').forEach(function (link) {
      var contactUrl = new URL(link.href);
      if (contactUrl.pathname !== "/5519992445953") return;
      contactUrl.searchParams.set("text", labelMessage(contactUrl.searchParams.get("text") || "Olá, gostaria de cotar um transporte para minha empresa."));
      link.href = contactUrl.toString();
    });
  }
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
  function track(name, origin, place) {
    if (typeof window.trackContact !== "function") return;
    if (place) window.trackContact(name, origin, place);
    else window.trackContact(name, origin);
  }
  // Where on the page a contact click happened (added to GA4 as local_contato; origem_contato stays "link").
  var places = [[".site-header", "cabecalho"], [".whatsapp-float", "botao_flutuante"], [".mobile-bar", "barra_celular"], [".site-footer", "rodape"], [".contact-section", "secao_contato"], [".quick-quote", "cartao_cotacao"], [".article-cta", "chamada_final"], [".dispatch-hero", "topo"], [".city-hero", "topo"], [".hero", "topo"]];
  function placeOf(link) {
    for (var i = 0; i < places.length; i++) if (link.closest(places[i][0])) return places[i][1];
    return "conteudo";
  }
  var preparedWhatsAppUrl = null;
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
      var url = "https://wa.me/5519992445953?text=" + encodeURIComponent(labelMessage(message));
      // Keep personal quote details out of the DOM link URL and automatic click events.
      preparedWhatsAppUrl = url;
      fallback.href = "https://wa.me/5519992445953";
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
    if (!link) return;
    if (link.id === "whatsappFallback") {
      if (preparedWhatsAppUrl) {
        event.preventDefault();
        window.open(preparedWhatsAppUrl, "_blank", "noopener,noreferrer");
      }
      return; // This retries the already recorded request, not a new contact.
    }
    if (link.href.startsWith("https://wa.me/")) track("contato_whatsapp", "link", placeOf(link));
    if (link.href.startsWith("tel:")) track("contato_telefone", "link", placeOf(link));
  });
});
