
// ─── CURSOR ───────────────────────────────────────────
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
  ring.style.left = e.clientX + 'px';
  ring.style.top = e.clientY + 'px';
});
document.querySelectorAll('a,button,.cal-btn,.filter-btn,.event-card,.ach-card,.member-card,.project-card').forEach(el => {
  el.addEventListener('mouseenter', () => { ring.style.width='60px'; ring.style.height='60px'; cursor.style.opacity='0'; });
  el.addEventListener('mouseleave', () => { ring.style.width='40px'; ring.style.height='40px'; cursor.style.opacity='1'; });
});

// ─── NAVBAR SCROLL ──────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
  // ticker hide on scroll
  document.getElementById('ticker').style.opacity = window.scrollY > 80 ? '0' : '1';
});

// ─── HERO 3D CANVAS ─────────────────────────────────
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [];

function resizeCanvas() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.z = Math.random() * 1200 + 200;
    this.ox = this.x; this.oy = this.y;
    this.size = (1200 - this.z) / 600;
    this.speedZ = Math.random() * 1.5 + 0.5;
    this.color = Math.random() > 0.7 ? '#00f5d4' : Math.random() > 0.5 ? '#7c3aed' : '#f72585';
    this.alpha = (1200 - this.z) / 1200;
  }
  update() {
    this.z -= this.speedZ;
    if (this.z <= 0) { this.reset(); return; }
    this.size = ((1200 - this.z) / 600) * 2;
    this.alpha = Math.min(1, (1200 - this.z) / 600);
    this.sx = (this.x - W/2) * (1200/this.z) + W/2;
    this.sy = (this.y - H/2) * (1200/this.z) + H/2;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha * 0.7;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 8; ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.sx, this.sy, Math.max(0.3, this.size), 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}

for (let i=0;i<200;i++) particles.push(new Particle());

// Grid lines
function drawGrid() {
  ctx.save();
  ctx.strokeStyle='rgba(0,245,212,0.03)';
  ctx.lineWidth=1;
  const step=80;
  for(let x=0;x<W;x+=step){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<H;y+=step){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.restore();
}

let mouseX = W/2, mouseY = H/2;
document.addEventListener('mousemove', e => { mouseX=e.clientX; mouseY=e.clientY; });

function heroLoop() {
  ctx.fillStyle='rgba(5,5,16,0.15)';
  ctx.fillRect(0,0,W,H);
  drawGrid();
  particles.forEach(p => { p.update(); p.draw(); });
  // Mouse glow
  const grd = ctx.createRadialGradient(mouseX,mouseY,0,mouseX,mouseY,250);
  grd.addColorStop(0,'rgba(0,245,212,0.04)');
  grd.addColorStop(1,'transparent');
  ctx.fillStyle=grd;
  ctx.fillRect(0,0,W,H);
  requestAnimationFrame(heroLoop);
}
heroLoop();

// ─── COUNTERS ──────────────────────────────────────
function animateCounter(el) {
  const target = +el.dataset.target;
  let current = 0;
  const step = target / 80;
  const t = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current) + (el.dataset.suffix||'+');
    if (current >= target) clearInterval(t);
  }, 20);
}
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){ animateCounter(e.target); counterObs.unobserve(e.target); }});
},{threshold:.5});
document.querySelectorAll('.counter').forEach(el => {
  el.dataset.suffix = '+';
  counterObs.observe(el);
});

// ─── REVEAL ────────────────────────────────────────
const revObs = new IntersectionObserver(entries => {
  entries.forEach((e,i) => {
    if(e.isIntersecting){
      setTimeout(() => e.target.classList.add('visible'), i*80);
    }
  });
},{threshold:.1});
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

// ─── CALENDAR ──────────────────────────────────────
const eventDates = {
  '2025-1-25':true,'2025-2-7':true,'2025-2-19':true,
  '2025-3-8':true,'2025-3-17':true,'2025-4-5':true
};
let calDate = new Date(2025,0,1);
const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function renderCal() {
  const y=calDate.getFullYear(), m=calDate.getMonth();
  document.getElementById('calMonth').textContent = `${months[m]} ${y}`;
  const grid = document.getElementById('calGrid');
  grid.innerHTML='';
  const first = new Date(y,m,1).getDay();
  const days = new Date(y,m+1,0).getDate();
  const today = new Date();
  for(let i=0;i<first;i++){
    const c=document.createElement('div');
    c.className='cal-cell other-month';
    const d=new Date(y,m,1-first+i);
    c.textContent=d.getDate();
    grid.appendChild(c);
  }
  for(let d=1;d<=days;d++){
    const c=document.createElement('div');
    c.className='cal-cell';
    c.textContent=d;
    if(today.getFullYear()===y&&today.getMonth()===m&&today.getDate()===d) c.classList.add('today');
    if(eventDates[`${y}-${m+1}-${d}`]) c.classList.add('has-event');
    c.title=eventDates[`${y}-${m+1}-${d}`]?'Event scheduled':'';
    grid.appendChild(c);
  }
  const remaining = 42 - first - days;
  for(let i=1;i<=remaining;i++){
    const c=document.createElement('div');c.className='cal-cell other-month';c.textContent=i;grid.appendChild(c);
  }
}
renderCal();
document.getElementById('prevMonth').addEventListener('click',()=>{calDate.setMonth(calDate.getMonth()-1);renderCal();});
document.getElementById('nextMonth').addEventListener('click',()=>{calDate.setMonth(calDate.getMonth()+1);renderCal();});

// ─── MEMBERS ──────────────────────────────────────
const members = [
  {name:'Arjun Sharma',role:'President',tier:'lead',emoji:'A',skills:['React','Node','MongoDB']},
  {name:'Priya Nair',role:'Vice President',tier:'lead',emoji:'P',skills:['Vue','Python','Design']},
  {name:'Rohit Kumar',role:'Tech Lead',tier:'lead',emoji:'R',skills:['TypeScript','AWS','Docker']},
  {name:'Sneha Patel',role:'Design Lead',tier:'lead',emoji:'S',skills:['Figma','CSS','Motion']},
  {name:'Amit Verma',role:'Senior Dev',tier:'senior',emoji:'A',skills:['Next.js','GraphQL']},
  {name:'Kavya Reddy',role:'Senior Dev',tier:'senior',emoji:'K',skills:['Flutter','Firebase']},
  {name:'Dev Mishra',role:'Senior Dev',tier:'senior',emoji:'D',skills:['Rust','WebAssembly']},
  {name:'Ananya Singh',role:'Senior Design',tier:'senior',emoji:'A',skills:['Framer','Blender']},
  {name:'Rahul Gupta',role:'Member',tier:'member',emoji:'R',skills:['HTML','CSS','JS']},
  {name:'Ishaan Joshi',role:'Member',tier:'member',emoji:'I',skills:['Python','Flask']},
  {name:'Meera Pillai',role:'Member',tier:'member',emoji:'M',skills:['Angular','SCSS']},
  {name:'Karthik Rao',role:'Member',tier:'member',emoji:'K',skills:['React Native']},
];
const tierLabel={lead:'Lead',senior:'Senior',member:'Core'};
function renderMembers(filter='all'){
  const grid=document.getElementById('membersGrid');
  grid.innerHTML='';
  members.filter(m=>filter==='all'||m.tier===filter).forEach((m,i)=>{
    const card=document.createElement('div');
    card.className='member-card';
    card.style.animationDelay=`${i*.05}s`;
    card.innerHTML=`
      <span class="hierarchy-badge">${tierLabel[m.tier]}</span>
      <div class="member-avatar"><div class="ring"></div>${m.emoji}</div>
      <div class="member-name">${m.name}</div>
      <span class="member-role ${m.tier}">${m.role}</span>
      <div class="member-skills">${m.skills.map(s=>`<span class="skill-tag">${s}</span>`).join('')}</div>
    `;
    grid.appendChild(card);
  });
}
renderMembers();
document.querySelectorAll('.filter-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderMembers(btn.dataset.filter);
  });
});

// ─── PROJECTS (with mini canvas art) ─────────────
const projects=[
  {title:'CampusConnect',desc:'Real-time campus event platform with live notifications and RSVP system.',stack:['Next.js','Socket.io','PostgreSQL'],color:['#00f5d4','#7c3aed']},
  {title:'CodeCollab',desc:'Browser-based collaborative code editor with pair programming features.',stack:['React','Monaco','WebRTC'],color:['#f72585','#7c3aed']},
  {title:'EcoTrack',desc:'Dashboard for tracking college carbon footprint with data visualization.',stack:['Vue','D3.js','Node'],color:['#00f5d4','#f72585']},
  {title:'StudySync',desc:'AI-powered study planner that adapts to your exam schedule.',stack:['React','Python','ML'],color:['#7c3aed','#00f5d4']},
  {title:'TechTalks',desc:'Podcast platform built for student-run tech shows with live streaming.',stack:['Svelte','Go','AWS'],color:['#f72585','#00f5d4']},
  {title:'PortfolioKit',desc:'Open-source template kit for developer portfolios — 3000+ downloads.',stack:['HTML','CSS','JS'],color:['#7c3aed','#f72585']},
];
const grid2=document.getElementById('projectsGrid');
projects.forEach(p=>{
  const card=document.createElement('div');
  card.className='project-card';
  const id='pc'+Math.random().toString(36).slice(2);
  card.innerHTML=`
    <div class="project-thumb">
      <canvas id="${id}" width="400" height="180"></canvas>
      <span class="project-thumb-label">${p.title.slice(0,2)}</span>
    </div>
    <div class="project-info">
      <div class="project-title">${p.title}</div>
      <div class="project-desc">${p.desc}</div>
      <div class="project-stack">${p.stack.map(s=>`<span class="stack-tag">${s}</span>`).join('')}</div>
      <a href="#" class="project-link">View Project →</a>
    </div>
  `;
  grid2.appendChild(card);
  // Draw abstract art on each thumb
  const c=document.getElementById(id);
  const x=c.getContext('2d');
  const grd=x.createLinearGradient(0,0,400,180);
  grd.addColorStop(0,p.color[0]+'22');
  grd.addColorStop(1,p.color[1]+'22');
  x.fillStyle=grd;x.fillRect(0,0,400,180);
  // Animated circles
  for(let i=0;i<5;i++){
    const cx2=Math.random()*400,cy2=Math.random()*180,r=20+Math.random()*60;
    const g2=x.createRadialGradient(cx2,cy2,0,cx2,cy2,r);
    g2.addColorStop(0,p.color[i%2]+'40');g2.addColorStop(1,'transparent');
    x.beginPath();x.arc(cx2,cy2,r,0,Math.PI*2);x.fillStyle=g2;x.fill();
  }
  // Lines
  x.strokeStyle=p.color[0]+'30';x.lineWidth=1;
  for(let i=0;i<8;i++){x.beginPath();x.moveTo(Math.random()*400,0);x.lineTo(Math.random()*400,180);x.stroke();}
});

// ─── TECH STACK SCROLL ───────────────────────────
const techs=[
  {icon:'⚛️',name:'React'},{icon:'🟢',name:'Node.js'},{icon:'⚡',name:'Next.js'},
  {icon:'🎨',name:'Figma'},{icon:'🐍',name:'Python'},{icon:'☁️',name:'AWS'},
  {icon:'🐳',name:'Docker'},{icon:'🔷',name:'TypeScript'},{icon:'🎭',name:'Three.js'},
  {icon:'🔥',name:'Firebase'},{icon:'📊',name:'D3.js'},{icon:'🦀',name:'Rust'},
];
const t1=document.getElementById('track1'),t2=document.getElementById('track2');
[...techs,...techs].forEach(t=>{
  [t1,t2].forEach((track,i)=>{
    const pill=document.createElement('div');
    pill.className='tech-pill';
    pill.innerHTML=`<span class="tech-icon">${t.icon}</span>${t.name}`;
    track.appendChild(pill);
  });
});

// ─── FORM SUBMIT ─────────────────────────────────
document.getElementById('submitBtn').addEventListener('click',()=>{
  const name=document.getElementById('fname').value;
  const email=document.getElementById('femail').value;
  if(!name||!email){
    document.getElementById('fname').style.borderColor='var(--accent3)';
    document.getElementById('femail').style.borderColor='var(--accent3)';
    setTimeout(()=>{
      document.getElementById('fname').style.borderColor='';
      document.getElementById('femail').style.borderColor='';
    },1500);
    return;
  }
  const t=document.getElementById('toast');
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3500);
  document.getElementById('fname').value='';
  document.getElementById('femail').value='';
  document.getElementById('fyear').value='';
  document.getElementById('finterest').value='';
});
