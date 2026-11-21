document.addEventListener("DOMContentLoaded", function () {
  // Only approved campaign labels are included; never forward arbitrary query data.
  var campaignLabels = {
    brz_campinas: "BRZ-CAMPINAS",
    brz_indaiatuba: "BRZ-INDAIATUBA",
    brz_santos: "BRZ-SANTOS",
    brz_valinhos: "BRZ-VALINHOS", brz_vinhedo: "BRZ-VINHEDO",
    brz_hortolandia: "BRZ-HORTOLANDIA", brz_sumare: "BRZ-SUMARE", brz_paulinia: "BRZ-PAULINIA"
  };
  var params = window.location ? new URLSearchParams(window.location.search) : { get: function () { return null; } };
  var campaignLabel = params.get("utm_source") === "google" && params.get("utm_medium") === "cpc"
    ? campaignLabels[params.get("utm_campaign")] : null;
  function labelMessage(message, skipPage) {
    var page = !skipPage && window.location && window.location.pathname ? "\nPágina: " + window.location.pathname : "";
    return message + page + (campaignLabel ? "\nReferência: " + campaignLabel + (params.get("utm_content") === "regional_empresas" ? " / regional_empresas" : "") : "");
  }
  if (campaignLabel) window.brulezziCampaign = { name: params.get("utm_campaign") };
  if (campaignLabel) {
    // Preserve only the approved campaign on same-site navigation, without identifiers.
    document.querySelectorAll('a[href]').forEach(function (link) {
      var target = new URL(link.href, window.location.href);
      if (target.origin !== window.location.origin || target.pathname === window.location.pathname) return;
      target.searchParams.set('utm_source','google');target.searchParams.set('utm_medium','cpc');
      target.searchParams.set('utm_campaign',params.get('utm_campaign'));
      if(params.get('utm_content')==='regional_empresas')target.searchParams.set('utm_content','regional_empresas');
      link.href=target.toString();
    });
    document.querySelectorAll('a[href^="https://wa.me/5519992445953"]').forEach(function (link) {
      var contactUrl = new URL(link.href);
      if (contactUrl.pathname !== "/5519992445953") return;
      contactUrl.searchParams.set("text", labelMessage(contactUrl.searchParams.get("text") || "Olá, gostaria de cotar um transporte."));
      link.href = contactUrl.toString();
    });
  }
  // The fixed quote bar stays hidden on the opening screen, so visitors read before they ask.
  var bar = document.getElementById("mobileBar");
  if (bar) {
    var toggleBar = function () { bar.classList.toggle("is-visible", window.scrollY > Math.max(window.innerHeight * 0.9, 480)); };
    window.addEventListener("scroll", toggleBar, { passive: true });
    toggleBar();
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
  function track(name, origin, place, buttonId) {
    if (typeof window.trackContact !== "function") return;
    if (buttonId) window.trackContact(name, origin, place, buttonId);
    else if (place) window.trackContact(name, origin, place);
    else window.trackContact(name, origin);
  }
  // Where on the page a contact click happened (added to GA4 as local_contato; origem_contato stays "link").
  var places = [[".site-header", "cabecalho"], [".whatsapp-float", "botao_flutuante"], [".mobile-bar", "barra_celular"], [".site-footer", "rodape"], [".contact-section", "secao_contato"], [".quick-quote", "cartao_cotacao"], [".article-cta", "chamada_final"], [".dispatch-hero", "topo"], [".city-hero", "topo"], [".hero", "topo"]];
  function placeOf(link) {
    for (var i = 0; i < places.length; i++) if (link.closest(places[i][0])) return places[i][1];
    return "conteudo";
  }
  // Reference the visitor can quote later; random, carries no personal data.
  function newQuoteRef() {
    var d = new Date(), alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ", code = "";
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    for (var i = 0; i < 4; i++) code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    return "BRZ-" + String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate()) + "-" + code;
  }
  var preparedWhatsAppUrl = null;
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      var fields = form.elements;
      var ref = newQuoteRef();
      function val(name) { return fields[name] ? fields[name].value.trim() : ""; }
      // Endereco em duas linhas: rua, numero e bairro; depois cidade, UF e CEP.
      function address(prefix) {
        var street = val(prefix + "_logradouro") + ", " + val(prefix + "_numero") + (val(prefix + "_complemento") ? " (" + val(prefix + "_complemento") + ")" : "");
        return street + " - " + val(prefix + "_bairro") + "\n" + val(prefix + "_cidade") + "/" + val(prefix + "_uf").toUpperCase() + " · CEP " + val(prefix + "_cep");
      }
      function line(label, value) { return label + ": " + value; }
      var origin = window.location && window.location.pathname ? window.location.pathname : "/";
      var isMoto = val("servico") === "Motoboy";
      var special = val("especial") && val("especial") !== "Carga comum";
      var cargo = [line("Serviço", val("servico")), line("Carga", val("carga")), line("Peso aproximado", val("peso") + " kg")];
      if (val("dimensoes")) cargo.push(line("Volumes e dimensões", val("dimensoes")));
      cargo.push(line("Tipo de carga", val("especial")));
      var when = [line("Urgência", val("urgencia")), line("Data e horário", val("horario")), line("Frequência", val("frequencia")), line("Retorno ao ponto de coleta", val("retorno"))];
      if (!isMoto) when.push(line("Ajudante", val("ajudante")));
      var blocks = [
        "Olá! Vim pelo site e gostaria de cotar um transporte.",
        "*PEDIDO*\nquote_ref: " + ref + "\nPágina de origem: " + origin,
        "*EMPRESA*\n" + [line("Empresa", val("empresa")), line("Contato", val("nome")), line("WhatsApp", val("whatsapp"))].join("\n"),
        "*CARGA*\n" + cargo.join("\n"),
        "*COLETA*\n" + address("coleta"),
        "*ENTREGA*\n" + address("entrega") + (val("paradas") ? "\nOutras paradas: " + val("paradas") : ""),
        "*QUANDO*\n" + when.join("\n")
      ];
      if (window.brulezziQuote && window.brulezziQuote.estimateText) blocks.push("*ESTIMATIVA DO SITE*\n" + window.brulezziQuote.estimateText);
      if (special) blocks.push("*ATENÇÃO*\nCarga especial. Encaminhar à operação antes de falar de valor ou prazo.");
      var message = blocks.join("\n\n");
      var fallback = document.getElementById("whatsappFallback");
      var url = "https://wa.me/5519992445953?text=" + encodeURIComponent(labelMessage(message, true));
      // Keep personal quote details out of the DOM link URL and automatic click events.
      preparedWhatsAppUrl = url;
      fallback.href = "https://wa.me/5519992445953";
      fallback.hidden = false;
      document.getElementById("formStatus").textContent = "Sua cotação está pronta. Envie a mensagem no WhatsApp para iniciar o atendimento. Se ele não abriu, use o link abaixo.";
      track("contato_whatsapp", "formulario", "formulario_cotacao", "cotacao_enviar");
      // Quote completed in the quiz (no form values, no quote_ref): the conversion to optimise on.
      track("cotacao_enviada", "formulario", "formulario_cotacao", "cotacao_enviar");
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
    var buttonId = link.getAttribute ? link.getAttribute("data-track-id") : null;
    if (link.href.startsWith("https://wa.me/")) track("contato_whatsapp", "link", placeOf(link), buttonId);
    if (link.href.startsWith("tel:")) track("contato_telefone", "link", placeOf(link), buttonId);
  });
});
