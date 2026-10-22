document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('contactForm');
  if (!form) return;
  var fieldset = form.querySelector('fieldset');
  var steps = [
    {title:'O que vamos transportar?', names:['servico','carga','frequencia']},
    {title:'Qual é a rota e o horário?', names:['coleta','entrega','horario']},
    {title:'Confira e continue no WhatsApp', names:['nome','whatsapp','empresa']}
  ];
  var labels = {};
  steps.forEach(function(step){step.names.forEach(function(name){labels[name]=form.elements[name].closest('label');});});
  var progress = document.createElement('div'); progress.className='quote-progress';
  var status = document.createElement('p');status.className='quote-step-status';status.setAttribute('aria-live','polite');
  var title = document.createElement('h2'); title.className='quote-step-title'; title.tabIndex=-1;
  var review = document.createElement('dl');review.className='quote-review';review.hidden=true;
  fieldset.insertBefore(progress,fieldset.firstChild);fieldset.insertBefore(status,progress.nextSibling);fieldset.insertBefore(title,status.nextSibling);
  var submit = fieldset.querySelector('button[type="submit"]');
  fieldset.insertBefore(review,submit);
  var back=document.createElement('button');back.type='button';back.className='quiz-back';back.textContent='← Voltar à etapa anterior';fieldset.insertBefore(back,submit);
  var index=0;
  var started=false;
  function startTracking(origin,buttonId){
    if(started)return;
    started=true;
    if(typeof window.trackContact==='function')window.trackContact('cotacao_iniciada',origin,'formulario_cotacao',buttonId||'cotacao_preenchimento');
  }
  function trackFirstInput(event){if(event.target && event.target.value)startTracking('preenchimento_direto','cotacao_preenchimento');}
  form.addEventListener('input',trackFirstInput);
  form.addEventListener('change',trackFirstInput);
  function show(next,focus){
    index=next;title.textContent=steps[index].title;status.textContent='Etapa '+(index+1)+' de '+steps.length;
    progress.style.setProperty('--progress',((index+1)/steps.length*100)+'%');
    Object.keys(labels).forEach(function(name){var active=steps[index].names.includes(name);labels[name].hidden=!active;form.elements[name].disabled=!active&&index!==steps.length-1;});
    back.hidden=index===0;review.hidden=index!==steps.length-1;
    submit.textContent=['Informar coleta e destino →','Revisar minha solicitação →','Continuar no WhatsApp'][index];
    if(index===steps.length-1){review.replaceChildren();steps.slice(0,-1).forEach(function(step){step.names.forEach(function(name){var dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=labels[name].childNodes[0].textContent.replace('*','').trim();dd.textContent=form.elements[name].value;review.append(dt,dd);});});}
    if(focus)title.focus({preventScroll:true});
    if(focus && typeof window.trackContact==='function')window.trackContact('cotacao_etapa','etapa_'+(index+1),'formulario_cotacao','cotacao_etapa_'+(index+1));
  }
  form.addEventListener('submit',function(event){
    if(index===steps.length-1)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(form.reportValidity()){startTracking('preenchimento_direto','cotacao_preenchimento');show(index+1,true);}
  },true);
  back.addEventListener('click',function(){show(index-1,true);});
  window.brulezziQuote={start:function(){show(0,true);form.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}};
  document.querySelectorAll('[data-start-quiz]').forEach(function(button){
    button.addEventListener('click',function(event){
      event.preventDefault();window.brulezziQuote.start();
      startTracking('botao_inicial',button.getAttribute('data-track-id')||'solicitar_cotacao');
    });
  });
  form.classList.add('quote-quiz');show(0,false);
});
