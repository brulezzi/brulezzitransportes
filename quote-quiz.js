document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('contactForm');
  if (!form) return;
  var fieldset = form.querySelector('fieldset');
  var steps = [
    {title:'Qual veículo você precisa?', names:['servico']},
    {title:'O que vamos transportar?', names:['carga','peso','dimensoes','especial']},
    {title:'Onde coletar?', names:['coleta_cep','coleta_logradouro','coleta_numero','coleta_complemento','coleta_bairro','coleta_cidade','coleta_uf']},
    {title:'Onde entregar?', names:['entrega_cep','entrega_logradouro','entrega_numero','entrega_complemento','entrega_bairro','entrega_cidade','entrega_uf','paradas']},
    {title:'Quando e como?', names:['urgencia','horario','frequencia','retorno','ajudante']},
    {title:'Com quem vamos falar?', names:['empresa','nome','whatsapp']},
    {title:'Confira sua solicitação', names:[]}
  ];
  var labels = {};
  steps.forEach(function(step){step.names.forEach(function(name){labels[name]=form.elements[name].closest('label');});});
  var progress = document.createElement('div'); progress.className='quote-progress';
  var status = document.createElement('p');status.className='quote-step-status';status.setAttribute('aria-live','polite');
  var title = document.createElement('h3'); title.tabIndex=-1;
  var review = document.createElement('dl');review.className='quote-review';review.hidden=true;
  fieldset.insertBefore(progress,fieldset.firstChild);fieldset.insertBefore(status,progress.nextSibling);fieldset.insertBefore(title,status.nextSibling);
  var submit = fieldset.querySelector('button[type="submit"]');
  fieldset.insertBefore(review,submit);
  // Optional price estimate from the public calculator endpoint. Any answer other than status ok shows nothing and the team confirms the value.
  // To turn it off: window.brulezziCalculadora = {enabled:false}.
  var calc = window.brulezziCalculadora || {enabled:true, apiUrl:'/publico/cotar'};
  var estimate = document.createElement('p'); estimate.className='quote-estimate'; estimate.hidden=true; estimate.setAttribute('aria-live','polite');
  fieldset.insertBefore(estimate,submit);
  var privacy=document.createElement('p'); privacy.className='quote-privacy'; privacy.hidden=true;
  privacy.appendChild(document.createTextNode('Usamos seus endereços só para calcular a estimativa (CEP pelo ViaCEP e rota pelo Google Maps). '));
  var plink=document.createElement('a'); plink.href='/privacidade/'; plink.textContent='Saiba mais em Privacidade.'; privacy.appendChild(plink);
  fieldset.insertBefore(privacy,submit);
  function address(prefix){var v=function(n){return form.elements[prefix+'_'+n].value.trim();};return {logradouro:v('logradouro'),numero:v('numero'),complemento:v('complemento'),bairro:v('bairro'),cidade:v('cidade'),uf:v('uf').toUpperCase(),cep:v('cep')};}
  function vehicleFor(){
    var kind=form.elements.servico.value, kg=parseFloat(String(form.elements.peso.value).replace(',','.'));
    if(kind==='Motoboy')return 'moto';
    if(kind==='Utilitário'&&kg>0&&kg<=550)return 'utilitario_leve';
    return null; // other vehicles: the team quotes
  }
  function brl(cents){return 'R$ '+(cents/100).toFixed(2).replace('.',',');}
  function runEstimate(){
    estimate.hidden=true; estimate.textContent=''; if(window.brulezziQuote)window.brulezziQuote.estimateText='';
    var vehicle=vehicleFor();
    if(!calc.enabled||!calc.apiUrl||!vehicle||form.elements.paradas.value.trim()||typeof fetch!=='function')return;
    var body={veiculo:vehicle,origem:address('coleta'),destino:address('entrega'),paradas:[],retorno:form.elements.retorno.value==='Sim',ajudante:form.elements.ajudante.value==='Sim',site:''};
    fetch(calc.apiUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
      .then(function(r){return r.json();})
      .then(function(j){
        if(!j||j.status!=='ok'||!(j.totalCentavos>0))return; // anything else: say nothing, the team confirms
        var text='Estimativa de '+brl(j.totalCentavos)+', sujeita à confirmação da operação.';
        estimate.textContent=text; estimate.hidden=false;
        if(window.brulezziQuote)window.brulezziQuote.estimateText=text;
      })
      .catch(function(){});
  }
  var back=document.createElement('button');back.type='button';back.className='quiz-back';back.textContent='← Voltar';fieldset.insertBefore(back,submit);
  // CEP: ao completar 8 digitos o endereco inteiro aparece pronto (ViaCEP); a pessoa so confirma o numero.
  var auto={coleta:false,entrega:false}, cards={}, AUTO=['logradouro','bairro','cidade','uf'];
  function applyAuto(){
    ['coleta','entrega'].forEach(function(p){
      AUTO.forEach(function(n){var l=labels[p+'_'+n];if(l&&auto[p])l.hidden=true;});
      if(cards[p])cards[p].hidden=!(auto[p]&&steps[index].names.indexOf(p+'_cep')>-1);
    });
  }
  function refresh(){Object.keys(labels).forEach(function(name){labels[name].hidden=steps[index].names.indexOf(name)<0;});applyAuto();}
  ['coleta','entrega'].forEach(function(prefix){
    var cep=form.elements[prefix+'_cep'];
    if(!cep||typeof fetch!=='function')return;
    var card=document.createElement('div');card.className='addr-card';card.hidden=true;card.setAttribute('aria-live','polite');
    var cepLabel=labels[prefix+'_cep'];cepLabel.parentNode.insertBefore(card,cepLabel.nextSibling);cards[prefix]=card;
    var ticket=0;
    function manual(){auto[prefix]=false;card.hidden=true;refresh();}
    cep.addEventListener('input',function(){
      var digits=cep.value.replace(/[^0-9]/g,'').slice(0,8);
      cep.value=digits.length>5?digits.slice(0,5)+'-'+digits.slice(5):digits;
      if(digits.length<8){ticket++;manual();return;}
      var mine=++ticket;
      fetch('https://viacep.com.br/ws/'+digits+'/json/').then(function(r){return r.json();}).then(function(d){
        if(mine!==ticket)return;
        if(!d||d.erro){manual();return;}
        [['logradouro',d.logradouro],['bairro',d.bairro],['cidade',d.localidade],['uf',d.uf]].forEach(function(p){var f=form.elements[prefix+'_'+p[0]];if(f)f.value=p[1]||'';});
        if(!d.logradouro){manual();var lf=form.elements[prefix+'_logradouro'];if(lf)lf.focus();return;}
        auto[prefix]=true;
        card.replaceChildren();
        card.insertAdjacentHTML('beforeend','<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg>');
        var span=document.createElement('span');span.textContent=d.logradouro+', '+(d.bairro?d.bairro+', ':'')+d.localidade+'/'+d.uf+'. Falta só o número.';card.appendChild(span);
        var fix=document.createElement('button');fix.type='button';fix.textContent='Corrigir endereço';card.appendChild(fix);
        fix.addEventListener('click',function(){manual();var lf=form.elements[prefix+'_logradouro'];if(lf)lf.focus();});
        refresh();
        var nf=form.elements[prefix+'_numero'];if(nf)nf.focus();
      }).catch(function(){if(mine===ticket)manual();});
    });
  });
  var index=0;
  // GA4: "cotacao_iniciada" dispara uma vez por visita (clique em botao ou primeiro campo preenchido); sem valores do formulario.
  var started=false;
  function startTracking(origin,buttonId){
    if(started)return;
    started=true;
    if(typeof window.trackContact==='function')window.trackContact('cotacao_iniciada',origin,'formulario_cotacao',buttonId||'cotacao_preenchimento');
  }
  function trackFirstInput(event){if(event.target&&event.target.value)startTracking('preenchimento_direto','cotacao_preenchimento');}
  form.addEventListener('input',trackFirstInput);
  form.addEventListener('change',trackFirstInput);
  function show(next,focus){
    index=next;title.textContent=steps[index].title;status.textContent='Etapa '+(index+1)+' de '+steps.length;
    progress.style.setProperty('--progress',((index+1)/steps.length*100)+'%');
    Object.keys(labels).forEach(function(name){var active=steps[index].names.includes(name);labels[name].hidden=!active;form.elements[name].disabled=!active&&index!==steps.length-1;});
    applyAuto();
    // Ajudante so existe para carro, utilitario e caminhao; para moto o campo some e fica "Nao".
    if(form.elements.servico.value==='Motoboy'&&labels.ajudante){labels.ajudante.hidden=true;form.elements.ajudante.value='Não';}
    back.hidden=index===0;review.hidden=index!==steps.length-1;
    privacy.hidden=index!==steps.length-1;
    if(index!==steps.length-1){estimate.hidden=true;}else{runEstimate();}
    submit.textContent=index===steps.length-1?'Preparar mensagem no WhatsApp':'Continuar →';
    if(index===steps.length-1){review.replaceChildren();steps.slice(0,-1).forEach(function(step){step.names.forEach(function(name){if(name==='ajudante'&&form.elements.servico.value==='Motoboy')return;var dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=labels[name].childNodes[0].textContent.replace('*','').replace('(opcional)','').trim();dd.textContent=form.elements[name].value||'Não informado';review.append(dt,dd);});});}
    if(focus)title.focus({preventScroll:true});
    if(focus && typeof window.trackContact==='function')window.trackContact('cotacao_etapa','etapa_'+(index+1),'formulario_cotacao','cotacao_etapa_'+(index+1));
  }
  form.addEventListener('submit',function(event){
    if(index===steps.length-1)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(form.reportValidity())show(index+1,true);
  },true);
  back.addEventListener('click',function(){show(index-1,true);});
  window.brulezziQuote={start:function(){show(0,true);form.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}};
  document.querySelectorAll('[data-start-quiz]').forEach(function(button){
    button.addEventListener('click',function(event){
      event.preventDefault();
      if(button.dataset.servico&&form.elements.servico)form.elements.servico.value=button.dataset.servico;
      if(button.dataset.urgencia&&form.elements.urgencia)form.elements.urgencia.value=button.dataset.urgencia;
      window.brulezziQuote.start();
      startTracking('botao_inicial',button.getAttribute('data-track-id')||'solicitar_cotacao');
    });
  });
  form.classList.add('quote-quiz');show(0,false);
});
