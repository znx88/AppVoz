'use strict';
const $ = id => document.getElementById(id);
const STORAGE_TASKS = 'voztask_tasks_v1';
const STORAGE_THEME = 'voztask_theme_v1';
function readTasks() { try { const data = JSON.parse(localStorage.getItem(STORAGE_TASKS)); return Array.isArray(data) ? data.filter(t => t && typeof t.text === 'string').map(t => ({id:String(t.id),text:t.text,done:!!t.done})) : []; } catch { return []; } }
let tasks = readTasks();
let dark = localStorage.getItem(STORAGE_THEME) === 'dark';
let listening = false;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
function persist() { try {localStorage.setItem(STORAGE_TASKS, JSON.stringify(tasks));} catch {reply('No se han podido guardar las tareas en este navegador.');} }
function render() {
  const list = $('taskList'); list.replaceChildren();
  if (!tasks.length) { const li=document.createElement('li'); li.className='empty-state'; const strong=document.createElement('strong');strong.textContent='Todavía no hay tareas';li.append(strong,document.createTextNode('Añade una usando tu voz o el modo demostración.'));list.append(li); }
  tasks.forEach(task => {
    const li=document.createElement('li'); const check=document.createElement('input');check.type='checkbox';check.checked=task.done;check.setAttribute('aria-label',`Completar ${task.text}`);check.addEventListener('change',()=>{task.done=check.checked;persist();render();});
    const span=document.createElement('span');span.className='task-name'+(task.done?' done':'');span.textContent=task.text;
    const remove=document.createElement('button');remove.type='button';remove.className='remove-one';remove.textContent='×';remove.setAttribute('aria-label',`Eliminar ${task.text}`);remove.addEventListener('click',()=>{tasks=tasks.filter(t=>t.id!==task.id);persist();render();reply(`Tarea «${task.text}» eliminada.`);});li.append(check,span,remove);list.append(li);
  });
  $('taskCount').textContent=`${tasks.length} ${tasks.length===1?'tarea':'tareas'}`;
  const percent=tasks.length?Math.round(tasks.filter(t=>t.done).length/tasks.length*100):0;
  $('progressText').textContent=percent+'%';$('progressFill').style.width=percent+'%';
}
function speak(message) { if (!('speechSynthesis' in window)) return; try {window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(message);utterance.lang='es-ES';utterance.rate=1;window.speechSynthesis.speak(utterance);}catch{} }
function reply(message, spoken=true){$('reply').textContent=message;if(spoken)speak(message);}
function setTheme(value){dark=value;document.body.classList.toggle('dark',dark);$('themeLabel').textContent=dark?'Modo claro':'Modo oscuro';$('themeBtn').setAttribute('aria-label',dark?'Cambiar a modo claro':'Cambiar a modo oscuro');try{localStorage.setItem(STORAGE_THEME,dark?'dark':'light');}catch{}}
function normalize(value){return value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/[.!?]+$/g,'').trim();}
function execute(command, demo=false){
  const original=command.trim();$('transcript').textContent=original+(demo?' (simulación)':'');
  const text=normalize(original);
  const add=text.match(/^(?:anadir|agregar|crear)\s+(?:una\s+)?tarea\s+(.+)$/);
  if(add){const name=original.replace(/^(?:añadir|anadir|agregar|crear)\s+(?:una\s+)?tarea\s+/i,'').trim();if(!name){reply('Indica el nombre de la tarea.');return;}tasks.push({id:globalThis.crypto?.randomUUID?.() || String(Date.now()+Math.random()),text:name,done:false});persist();render();reply(`He añadido la tarea: ${name}.`);return;}
  if(/^(?:mostrar|ver|listar)(?:\s+(?:las|mis))?\s+tareas$/.test(text)){render();reply(tasks.length?`Tienes ${tasks.length} tareas. ${tasks.map(t=>t.text+(t.done?' completada':' pendiente')).join('. ')}.`:'Tu lista está vacía.');$('taskList').scrollIntoView({behavior:'smooth',block:'nearest'});return;}
  if(/^(?:eliminar|borrar)(?:\s+(?:las|todas las|mis))?\s+tareas$/.test(text)){if(!tasks.length){reply('No hay tareas que eliminar.');return;}$('confirmDialog').showModal();reply('Confirma si quieres eliminar todas las tareas.',false);return;}
  if(/^(?:activar\s+)?modo\s+oscuro$/.test(text)){setTheme(!dark);reply(dark?'Modo oscuro activado.':'Modo claro activado.');return;}
  if(/^(?:activar\s+)?modo\s+claro$/.test(text)){setTheme(false);reply('Modo claro activado.');return;}
  reply('No he entendido ese comando. Prueba con añadir tarea, mostrar tareas, eliminar tareas o modo oscuro.');
}
function setListening(value){listening=value;$('micBtn').classList.toggle('listening',value);$('micBtn').setAttribute('aria-pressed',String(value));$('micBtn').setAttribute('aria-label',value?'Detener micrófono':'Activar micrófono');$('status').textContent=value?'Escuchando…':'Pulsa el micrófono para empezar';$('statusDetail').textContent=value?'Di uno de los cuatro comandos':'Tu asistente está preparado';}
if(SpeechRecognition){
  recognition=new SpeechRecognition();recognition.lang='es-ES';recognition.interimResults=true;recognition.continuous=false;recognition.maxAlternatives=1;
  recognition.onstart=()=>setListening(true);
  recognition.onresult=event=>{let phrase='';let finalPhrase='';for(let i=event.resultIndex;i<event.results.length;i++){phrase+=event.results[i][0].transcript;if(event.results[i].isFinal)finalPhrase+=event.results[i][0].transcript;}$('transcript').textContent=phrase;if(finalPhrase.trim())execute(finalPhrase);};
  recognition.onerror=event=>{const messages={not_allowed:'Permiso de micrófono denegado. Puedes usar los botones de demostración.',audio_capture:'No se ha detectado ningún micrófono.',no_speech:'No se ha detectado voz. Inténtalo de nuevo.',network:'Error de red del reconocimiento de voz. Usa el modo demostración.'};reply(messages[event.error]||'No se ha podido reconocer la voz. Prueba otra vez.',false);setListening(false);};
  recognition.onend=()=>setListening(false);
  $('supportPill').textContent='Voz disponible';
}else{$('supportPill').textContent='Solo demostración';$('statusDetail').textContent='Este navegador no admite reconocimiento de voz';}
$('micBtn').addEventListener('click',()=>{if(!recognition){reply('El reconocimiento de voz no está disponible en este navegador. Usa los botones de demostración.',false);return;}try{if(listening)recognition.stop();else{if('speechSynthesis' in window)window.speechSynthesis.cancel();recognition.start();}}catch{reply('Espera un momento y vuelve a intentarlo.',false);}});
$('themeBtn').addEventListener('click',()=>{setTheme(!dark);reply(dark?'Modo oscuro activado.':'Modo claro activado.',false);});
document.querySelectorAll('[data-command]').forEach(button=>button.addEventListener('click',()=>execute(button.dataset.command,true)));
$('cancelDelete').addEventListener('click',()=>{$('confirmDialog').close();reply('Eliminación cancelada. Tus tareas siguen guardadas.');});
$('confirmDelete').addEventListener('click',()=>{tasks=[];persist();render();$('confirmDialog').close();reply('He eliminado todas las tareas.');});
$('confirmDialog').addEventListener('cancel',()=>reply('Eliminación cancelada.',false));
setTheme(dark);render();
