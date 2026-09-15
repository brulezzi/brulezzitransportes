(function () {
  "use strict";
  var key = "brulezzi-analytics-choice";
  var enabled = false;
  var loaded = false;
  var returnFocus = false;
  function readChoice() {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function enable() {
    enabled = true;
    window["ga-disable-G-CENYXB4MYP"] = false;
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", "G-CENYXB4MYP", {
      send_page_view: false,
      page_location: location.origin + location.pathname,
      page_referrer: "",
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    // Exclude query strings, fragments, form values and referrers from events.
    window.gtag("event", "page_view", {
      page_location: location.origin + location.pathname,
      page_referrer: ""
    });
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-CENYXB4MYP";
    document.head.appendChild(script);
  }
  window.trackContact = function (name, origin) {
    if (!enabled || typeof window.gtag !== "function") return;
    window.gtag("event", name, {
      origem_contato: origin,
      page_path: location.pathname,
      page_location: location.origin + location.pathname,
      page_referrer: ""
    });
  };
  function choose(value) {
    try { localStorage.setItem(key, value); } catch (_) { /* Current visit only. */ }
    if (value === "accepted") enable();
    else {
      enabled = false;
      window["ga-disable-G-CENYXB4MYP"] = true;
      document.cookie.split(";").forEach(function (cookie) {
        var name = cookie.split("=")[0].trim();
        if (!/^_ga(?:_|$)/.test(name)) return;
        ["", location.hostname, "." + location.hostname].forEach(function (domain) {
          document.cookie = name + "=; Max-Age=0; path=/" + (domain ? "; domain=" + domain : "");
        });
      });
    }
    document.getElementById("privacyChoice").hidden = true;
    var button = document.getElementById("privacySettings");
    if (button && returnFocus) button.focus();
    returnFocus = false;
  }
  document.addEventListener("DOMContentLoaded", function () {
    var panel = document.createElement("section");
    panel.id = "privacyChoice";
    panel.className = "privacy-choice";
    panel.setAttribute("aria-label", "Preferências de privacidade");
    var text = document.createElement("p");
    text.textContent = "Usamos o Google Analytics para entender as visitas e os cliques de contato. Você pode recusar a qualquer momento.";
    panel.appendChild(text);
    [["Entendi", "accepted"], ["Recusar", "rejected"]].forEach(function (item) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-ghost btn-sm";
      button.textContent = item[0];
      button.addEventListener("click", function () { choose(item[1]); });
      panel.appendChild(button);
    });
    var link = document.createElement("a");
    link.href = "/privacidade/";
    link.textContent = "Como usamos os dados";
    panel.appendChild(link);
    document.body.appendChild(panel);
    var settings = document.getElementById("privacySettings");
    if (settings) settings.addEventListener("click", function () {
      returnFocus = true;
      panel.hidden = false;
      panel.querySelector("button").focus();
    });
    var choice = readChoice();
    panel.hidden = choice === "accepted" || choice === "rejected";
    // Track by default (opt-out model) — only stop if the visitor explicitly declines.
    if (choice !== "rejected") enable();
  });
})();
