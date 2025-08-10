// Simple offline tracker using localStorage
const STORAGE_KEY = 'series_tracker_v1';
let items = [];
let editingId = null;

function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7) }

function load(){
  try{
    items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }catch(e){ items = [] }
}
function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
function render(filter=''){
  const list = document.getElementById('list');
  list.innerHTML = '';
  const q = filter.trim().toLowerCase();
  const shown = items.filter(it => it.name.toLowerCase().includes(q));
  if(shown.length===0){
    list.innerHTML = '<p style="color:var(--muted);text-align:center;padding:18px">مافي بيانات</p>';
    return;
  }
  shown.forEach(it=>{
    const li = document.createElement('li');
    li.className='card';
    li.innerHTML = `
      <div class="info">
        <div class="title">${escapeHtml(it.name)}</div>
        <div class="meta">موسم ${it.season} • حلقة ${it.episode} • ${it.minute}m ${it.second}s ${it.source? '• '+escapeHtml(it.source):''}</div>
      </div>
      <div class="actions">
        <button class="smallBtn editBtn" data-id="${it.id}">تعديل</button>
        <button class="smallBtn delete deleteBtn" data-id="${it.id}">حذف</button>
      </div>
    `;
    list.appendChild(li);
  });
  // attach events
  document.querySelectorAll('.editBtn').forEach(b=>{
    b.addEventListener('click', ()=> openEdit(b.dataset.id));
  });
  document.querySelectorAll('.deleteBtn').forEach(b=>{
    b.addEventListener('click', ()=> { if(confirm('تأكد حذف المسلسل؟')) { deleteItem(b.dataset.id) } });
  });
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])) }

function openAdd(){
  editingId = null;
  document.getElementById('modalTitle').textContent='أضف مسلسل';
  ['name','season','episode','minute','second','source'].forEach(id=> document.getElementById(id).value = (id==='season'||id==='episode')?1:0);
  document.getElementById('name').value='';
  showModal(true);
}
function openEdit(id){
  const it = items.find(x=>x.id===id);
  if(!it) return;
  editingId = id;
  document.getElementById('modalTitle').textContent='تعديل';
  document.getElementById('name').value=it.name;
  document.getElementById('season').value=it.season;
  document.getElementById('episode').value=it.episode;
  document.getElementById('minute').value=it.minute;
  document.getElementById('second').value=it.second;
  document.getElementById('source').value=it.source||'';
  showModal(true);
}
function showModal(show){
  const m = document.getElementById('modal');
  if(show){ m.classList.remove('hidden'); m.setAttribute('aria-hidden','false') } else { m.classList.add('hidden'); m.setAttribute('aria-hidden','true') }
}

function saveFromModal(){
  const name = document.getElementById('name').value.trim();
  if(!name){ alert('اكتب اسم المسلسل'); return; }
  const season = parseInt(document.getElementById('season').value)||1;
  const episode = parseInt(document.getElementById('episode').value)||1;
  const minute = parseInt(document.getElementById('minute').value)||0;
  const second = parseInt(document.getElementById('second').value)||0;
  const source = document.getElementById('source').value.trim();
  if(editingId){
    const it = items.find(x=>x.id===editingId);
    it.name=name; it.season=season; it.episode=episode; it.minute=minute; it.second=second; it.source=source;
  } else {
    items.unshift({ id: uid(), name, season, episode, minute, second, source, created:Date.now() });
  }
  save();
  render(document.getElementById('search').value);
  showModal(false);
}

function deleteItem(id){
  items = items.filter(x=>x.id!==id);
  save();
  render(document.getElementById('search').value);
}

document.addEventListener('DOMContentLoaded', ()=>{
  load();
  render();
  document.getElementById('addBtn').addEventListener('click', openAdd);
  document.getElementById('saveBtn').addEventListener('click', saveFromModal);
  document.getElementById('cancelBtn').addEventListener('click', ()=> showModal(false));
  document.getElementById('search').addEventListener('input', e=> render(e.target.value));
});

// Service worker registration for basic offline caching
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('service-worker.js').catch(()=>{ /* ignore */ });
}
