// ─── NAVBAR ───────────────────────────────────
function toggleNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

// ─── SKILL BAR ANIMATION (IntersectionObserver) ───
const bars = document.querySelectorAll('.skill-fill');
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if(e.isIntersecting) {
      e.target.style.transform = `scaleX(${e.target.dataset.pct})`;
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
bars.forEach(b => obs.observe(b));

// ─── RIPPLE ───────────────────────────────────
function ripple(el, e) {
  const r = document.createElement('span');
  r.className = 'ripple';
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  r.style.cssText = `width:${size}px;height:${size}px;left:${(e.clientX||rect.left+rect.width/2)-rect.left-size/2}px;top:${(e.clientY||rect.top+rect.height/2)-rect.top-size/2}px`;
  el.appendChild(r);
  r.addEventListener('animationend', ()=> r.remove());
}

// ─── CALC STATE ───────────────────────────────
const CNAME = 'Arsyad';
let current='0', previous='', operator=null;
let waitingSecond=false, justEval=false;

const mainEl = document.getElementById('main');
const exprEl = document.getElementById('expr');

function setDisplay(val, expr='', nlp=false) {
  mainEl.className = nlp ? 'nlp-mode' : '';
  mainEl.textContent = val;
  exprEl.textContent = expr;
  void mainEl.offsetWidth;
  mainEl.classList.add('pop');
  setTimeout(()=> mainEl.classList.remove('pop'), 150);
}
function updateDisplay() {
  setDisplay(current, previous && operator ? previous+' '+operator : '');
}

function pressNum(n, e) {
  if(e) ripple(e.currentTarget, e);
  if(justEval||waitingSecond){ current=n; justEval=false; waitingSecond=false; }
  else current = current==='0' ? n : current+n;
  updateDisplay();
}
function pressDot(e) {
  if(e) ripple(e.currentTarget, e);
  if(waitingSecond){ current='0.'; waitingSecond=false; updateDisplay(); return; }
  if(!current.includes('.')){ current+='.'; updateDisplay(); }
}
function pressOp(op, e) {
  if(e) ripple(e.currentTarget, e);
  if(operator && !waitingSecond) compute();
  previous=current; operator=op; waitingSecond=true; justEval=false;
  updateDisplay();
}
function pressEq(e) {
  if(e) ripple(e.currentTarget, e);
  if(!operator) return;
  compute(); operator=null; previous=''; justEval=true;
}
function compute() {
  const a=parseFloat(previous), b=parseFloat(current);
  let res;
  try {
    if(operator==='+') res=a+b;
    else if(operator==='-') res=a-b;
    else if(operator==='×') res=a*b;
    else if(operator==='÷') {
      if(b===0) throw new Error('Tidak bisa bagi nol!');
      res=a/b;
    }
    else if(operator==='%') res=a%b;
    current=String(parseFloat(res.toFixed(10)));
    updateDisplay();
  } catch(err) {
    setDisplay('⚠ '+err.message); current='0'; operator=null; previous='';
  }
}
function pressAC(e) {
  if(e) ripple(e.currentTarget, e);
  current='0'; previous=''; operator=null; waitingSecond=false; justEval=false;
  updateDisplay();
}
function pressBackspace(e) {
  if(e) ripple(e.currentTarget, e);
  current = current.length>1 ? current.slice(0,-1) : '0';
  updateDisplay();
}

// ─── NLP ──────────────────────────────────────
const panel = document.getElementById('nlpPanel');
const inputEl = document.getElementById('nlpInput');
const historyEl = document.getElementById('nlpHistory');

function toggleNLP(e) {
  if(e) ripple(e.currentTarget, e);
  panel.classList.toggle('open');
  if(panel.classList.contains('open')) setTimeout(()=>inputEl.focus(),200);
}

const wordMap = {
  'dua belas':12,'tiga belas':13,'empat belas':14,'lima belas':15,
  'enam belas':16,'tujuh belas':17,'delapan belas':18,'sembilan belas':19,
  'dua puluh':20,'tiga puluh':30,'empat puluh':40,'lima puluh':50,
  'enam puluh':60,'tujuh puluh':70,'delapan puluh':80,'sembilan puluh':90,
  'dua ratus':200,'tiga ratus':300,'empat ratus':400,'lima ratus':500,
  'enam ratus':600,'tujuh ratus':700,'delapan ratus':800,'sembilan ratus':900,
  'nol':0,'satu':1,'dua':2,'tiga':3,'empat':4,'lima':5,
  'enam':6,'tujuh':7,'delapan':8,'sembilan':9,'sepuluh':10,
  'sebelas':11,'seratus':100,'seribu':1000
};
function extractNumbers(text) {
  let s = text.toLowerCase();
  const sorted = Object.entries(wordMap).sort((a,b)=>b[0].length-a[0].length);
  for(const [w,v] of sorted) s=s.replaceAll(w,' '+v+' ');
  const m = s.match(/\d+(\.\d+)?/g);
  return m ? m.map(Number) : [];
}
function detectOp(text) {
  const s=text.toLowerCase();
  if(/tambah|ditambah|plus|jumlah|total/.test(s)) return '+';
  if(/kurang|dikurang|minus|selisih/.test(s)) return '-';
  if(/kali|dikali|perkalian/.test(s)) return '×';
  if(/bagi|dibagi/.test(s)) return '÷';
  if(/persen|modulo|sisa\s*bagi/.test(s)) return '%';
  return null;
}
function processNLP(text) {
  const s = text.toLowerCase().trim();
  if(/siapa\s*(nama(mu|kamu|anda)?|kamu|anda|kau|lo)?$/.test(s)||/nama\s*(mu|kamu|anda|kau|lo)/.test(s))
    return `Nama saya ${CNAME} 😊`;
  if(/^(halo|hai|hello|hi|hey|selamat)/.test(s))
    return `Halo! Saya ${CNAME}. Ada yang bisa saya bantu? 👋`;
  if(/(apa yang|apa saja).*(bisa|dapat).*(kamu|anda)|kamu bisa apa/.test(s))
    return `Saya bisa: penjumlahan, pengurangan, perkalian, pembagian, persen, dan soal cerita! 🧮`;
  if(/terima kasih|makasih|thanks/.test(s))
    return `Sama-sama! 😊 Senang membantu!`;
  const nums=extractNumbers(text), op=detectOp(text);
  if(nums.length>=2 && op) {
    const a=nums[0], b=nums[1]; let hasil;
    try {
      if(op==='+') hasil=a+b;
      else if(op==='-') hasil=a-b;
      else if(op==='×') hasil=a*b;
      else if(op==='÷') { if(b===0) return 'Tidak bisa bagi nol! ❌'; hasil=a/b; }
      else if(op==='%') hasil=a%b;
      hasil=parseFloat(hasil.toFixed(10));
      current=String(hasil); updateDisplay();
      return `${a} ${op} ${b} = ${hasil} ✅`;
    } catch { return 'Terjadi kesalahan. ❌'; }
  }
  if(nums.length>=2) return `Ada angka ${nums.join(' dan ')}, tapi operasinya belum jelas.`;
  if(nums.length===1) return `Menemukan angka ${nums[0]}. Mau diapakan? 🤔`;
  return `Maaf, belum bisa memahami itu. Coba lebih spesifik! 🤔`;
}
function addHistory(q, a) {
  const d=document.createElement('div');
  d.className='history-item';
  d.innerHTML=`${q.substring(0,28)}${q.length>28?'…':''} → <b>${a}</b>`;
  historyEl.prepend(d);
}
function sendNLP() {
  const q=inputEl.value.trim(); if(!q) return;
  const ans=processNLP(q);
  setDisplay(ans, '💬 '+q.substring(0,26)+(q.length>26?'…':''), true);
  addHistory(q, ans); inputEl.value='';
}
function solveSoalCerita(e) {
  if(e) ripple(e.currentTarget, e);
  const soal=prompt('✨ Masukkan soal cerita:\n\ncth: "Dua mobil kuning ditambah 2 mobil merah berapa total?"');
  if(!soal) return;
  const ans=processNLP(soal);
  panel.classList.add('open');
  setDisplay(ans, '📖 '+soal.substring(0,26)+(soal.length>26?'…':''), true);
  addHistory(soal, ans);
}
