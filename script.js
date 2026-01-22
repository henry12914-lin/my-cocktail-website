/* =========================================
   1. CANVAS ENGINE (背景动画)
   ========================================= */
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let width, height, cx, cy;
let particles = [];
const COUNT = 850; 
let mode = 'nebula'; 
let isScattering = false;

function resize() {
    width = canvas.width = document.getElementById('iphone-frame').offsetWidth;
    height = canvas.height = document.getElementById('iphone-frame').offsetHeight;
    cx = width / 2; cy = height / 2;
}
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = (Math.random() - 0.5) * 1200;
        this.y = (Math.random() - 0.5) * 1200;
        this.z = Math.random() * 2000;
        this.size = Math.random() * 3.5 + 0.5; 
        this.color = Math.random() > 0.85 ? '#ffffff' : '#d4a373';
        this.alpha = 0; 
        this.targetAlpha = 0.8;
        this.vx = 0; this.vy = 0;
    }
    update() {
        if (isScattering) {
            this.x += this.vx; this.y += this.vy;
            this.alpha -= 0.02;
        } else {
            if (mode === 'nebula') {
                const angle = 0.003;
                const c = Math.cos(angle), s = Math.sin(angle);
                const nx = this.x * c - this.y * s;
                const ny = this.x * s + this.y * c;
                this.x = nx; this.y = ny;
                this.z -= 4;
                if(this.alpha < this.targetAlpha) this.alpha += 0.01;
            } else {
                this.z -= 0.8;
                if(this.alpha > 0.2) this.alpha -= 0.01; 
            }
            if (this.z <= 0) this.z = 2000;
        }
    }
    draw() {
        if (this.alpha <= 0) return;
        const scale = 500 / (500 + this.z);
        const sx = this.x * scale + cx;
        const sy = this.y * scale + cy;
        const r = this.size * scale;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI*2);
        ctx.fill();
    }
    scatter(mx, my) {
        const dx = (this.x * (500/(500+this.z)) + cx) - mx;
        const dy = (this.y * (500/(500+this.z)) + cy) - my;
        const d = Math.sqrt(dx*dx + dy*dy) || 1;
        const f = 40;
        this.vx = (dx/d) * f + (Math.random()-0.5)*15;
        this.vy = (dy/d) * f + (Math.random()-0.5)*15;
    }
}

for(let i=0; i<COUNT; i++) particles.push(new Particle());
function animate() {
    ctx.clearRect(0,0,width,height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
}
animate();

const welcome = document.getElementById('page-welcome');
function triggerEnter(e) {
    if(isScattering) return;
    isScattering = true;
    const r = canvas.getBoundingClientRect();
    const cx = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const cy = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    particles.forEach(p => p.scatter(cx - r.left, cy - r.top));

    setTimeout(() => {
        welcome.style.opacity = 0;
        setTimeout(() => {
            welcome.classList.remove('active');
            document.getElementById('page-filter').classList.add('active');
            isScattering = false; mode = 'deep-space';
            particles.forEach(p => { p.reset(); p.alpha = 0; p.targetAlpha = 0.3; });
            initPickers();
        }, 800);
    }, 600);
}
welcome.addEventListener('mousedown', triggerEnter);
welcome.addEventListener('touchstart', triggerEnter);

function goHome() {
    document.querySelectorAll('.page').forEach(p => { p.classList.remove('active'); p.style.opacity = 0; });
    welcome.classList.add('active');
    setTimeout(() => welcome.style.opacity = 1, 100);
    mode = 'nebula'; isScattering = false; particles.forEach(p => p.reset());
    userSelections = {}; document.getElementById('pickers').innerHTML = '';
    // 默认日记记录设为 index 15 (Cuba Libre), 对应 15.png
    diaryData = { 15: { n: "Cuba Libre", t: "RUM / COKE", c: "#ff7f50", i: "assets/images/15.png" } }; 
    document.getElementById('mini-card-box').classList.remove('show');
}


/* =========================================
   2. DATABASE (完整数据结构)
   ========================================= */
const DB = {
    q: [
        { id: 'taste', l: 'TASTE PROFILE', o: ['sweet', 'sour', 'bitter', 'smoky', 'fruity'] },
        { id: 'energy', l: 'ENERGY LEVEL', o: ['chill', 'active', 'brainy'] },
        { id: 'safety', l: 'RISK TOLERANCE', o: ['safe', 'adventurous'] },
        { id: 'mood', l: 'ATMOSPHERE', o: ['happy', 'quiet', 'tipsy'] },
        { id: 'tool', l: 'COMPLEXITY', o: ['finger', 'spoon'] }
    ],
    recipes: [
        // 注意：顺序非常重要！
        // Index 0 -> Negroni -> 对应 1.png
        // Index 1 -> Old Fashioned -> 对应 2.png
        // 以此类推...
        { n: "Negroni", t: "Bitter / Brainy / Quiet", r: "Gin, Campari, Sweet Vermouth", ra: "1 : 1 : 1", pq: "Facing a complex truth requires a more complex bitterness." },
        { n: "Old Fashioned", t: "Sweet / Brainy / Quiet", r: "Bourbon, Sugar, Bitters", ra: "2 : 1/2 : 2", pq: "The sweetness of time is the ultimate reward for maturity." },
        { n: "Martini", t: "Bitter / Brainy / Quiet", r: "Gin, Dry Vermouth", ra: "6 : 1", pq: "Extreme simplicity, extreme cold, extreme clarity." },
        { n: "Gin Tonic", t: "Fruity / Chill / Happy", r: "Gin, Tonic Water", ra: "1 : 3", pq: "Crisp effervescence that instantly washes away the day's fatigue." },
        { n: "Moscow Mule", t: "Sour / Chill / Happy", r: "Vodka, Ginger Beer, Lime", ra: "2 : 4 : 1/2", pq: "The sting of ginger and the bite of ice: an antidote for the soul." },
        { n: "Mojito", t: "Fruity / Active / Happy", r: "Rum, Mint, Soda, Lime", ra: "2 : 1 : 1", pq: "The sound of crushing mint is your ticket to a summer escape." },
        { n: "Margarita", t: "Sour / Active / Happy", r: "Tequila, Cointreau, Lime", ra: "3 : 2 : 1", pq: "The salt on the rim highlights the sweet sourness of the spirit." },
        { n: "Manhattan", t: "Bitter / Brainy / Quiet", r: "Rye, Sweet Vermouth, Bitters", ra: "2 : 1 : 2", pq: "A skyline in a glass, dark and full of promise." },
        { n: "Daiquiri", t: "Sour / Chill / Happy", r: "Rum, Lime, Sugar", ra: "2 : 1 : 1", pq: "Ideally balanced, like a perfect memory." },
        { n: "Whiskey Sour", t: "Sour / Active / Happy", r: "Whiskey, Lemon, Sugar, Egg White", ra: "2 : 1 : 1/2", pq: "The silky foam is a cloud hiding a thunderbolt of rye." },
        { n: "Gimlet", t: "Sour / Chill / Quiet", r: "Gin, Lime Juice", ra: "3 : 1", pq: "Sharp as a gimlet, piercing through the fog of social pretension." },
        { n: "Tom Collins", t: "Fruity / Chill / Happy", r: "Gin, Lemon, Soda, Sugar", ra: "1.5 : 1 : 3", pq: "As bubbles rise in the glass, your spirit begins to float." },
        { n: "Sidecar", t: "Sour / Active / Tipsy", r: "Cognac, Cointreau, Lemon", ra: "2 : 1 : 1", pq: "Deep amber hues carrying the ghosts of a golden era." },
        { n: "Americano", t: "Bitter / Chill / Quiet", r: "Campari, Vermouth, Soda", ra: "1 : 1 : 3", pq: "Low-alcohol bitterness—the most decent form of afternoon sobriety." },
        { n: "Boulevardier", t: "Bitter / Brainy / Quiet", r: "Bourbon, Campari, Vermouth", ra: "1 : 1 : 1", pq: "Whiskey's answer to the Negroni: deeper, wider, darker." },
        { n: "Espresso Martini", t: "Sweet / Active / Happy", r: "Vodka, Espresso, Kahlua", ra: "1 : 1 : 1/2", pq: "Wide awake and tipsy—the most efficient recharge for the night." },
        { n: "Sazerac", t: "Smoky / Brainy / Quiet", r: "Rye, Absinthe Rinse, Bitters", ra: "2 : Rinse : 1", pq: "The hallucination of herbs and tobacco dancing on the tongue." },
        { n: "Bloody Mary", t: "Smoky / Brainy / Tipsy", r: "Vodka, Tomato Juice, Spices", ra: "1 : 3", pq: "Not just a drink, but a meal for the hungover soul." },
        { n: "Mimosa", t: "Fruity / Chill / Happy", r: "Champagne, Orange Juice", ra: "1 : 1", pq: "Sparkling sunshine in a flute, celebrating the morning." },
        { n: "Cuba Libre", t: "Sweet / Chill / Happy", r: "Rum, Cola, Lime", ra: "1 : 3", pq: "The taste of freedom, simple and unadorned." },
        { n: "Aperol Spritz", t: "Bubbly / Light / Chill", r: "Aperol, Prosecco, Soda", ra: "3 : 2 : 1", pq: "Sunset in a glass." },
        { n: "Long Island", t: "Strong / Party / Tipsy", r: "Vodka, Rum, Gin, Tequila, Cola", ra: "1:1:1:1:Top", pq: "Dangerously drinkable." }
    ]
};

// 【核心逻辑】自动配对图片
// 这里会自动将第1个配方指向 assets/images/1.png
// 第2个指向 assets/images/2.png，以此类推
DB.recipes.forEach((item, index) => {
    item.i = `assets/images/${index + 1}.png`; 
});

/* =========================================
   3. ALGORITHM (Strict Weighted Scoring)
   ========================================= */
const TAG_DICT = {
    'sweet':   ['Sweet', 'Fruity', 'Creamy', 'Sugar', 'Honey', 'Cola', 'Tiki', 'Tropical'],
    'sour':    ['Sour', 'Citrus', 'Lime', 'Lemon', 'Margarita', 'Daiquiri', 'Grapefruit'],
    'bitter':  ['Bitter', 'Negroni', 'Campari', 'Aperol', 'Herbal', 'Paper Plane'],
    'smoky':   ['Smoky', 'Scotch', 'Mezcal', 'Penicillin', 'Tobacco', 'Wood'],
    'fruity':  ['Fruity', 'Berry', 'Pineapple', 'Orange', 'Peach', 'Juice', 'Tropical'],
    'chill':   ['Light', 'Refreshing', 'Bubbles', 'Fizzy', 'Spritz', 'Highball', 'Minty', 'Chill'],
    'active':  ['Strong', 'Party', 'Energy', 'Coffee', 'Espresso', 'Shooter', 'Vodka', 'Tequila', 'Active'],
    'brainy':  ['Complex', 'Dry', 'Classic', 'Sophisticated', 'Martini', 'Manhattan', 'Old Fashioned', 'Sazerac', 'Brainy'],
    'finger':  ['Easy', 'Simple', 'Cola', 'Tonic', 'Highball'], 
    'spoon':   ['Complex', 'Foam', 'Creamy', 'Layered', 'Tiki', 'Egg', 'Absinthe'],
    'safe':        ['Classic', 'Popular', 'Sweet', 'Easy', 'Fruity'],
    'adventurous': ['Spicy', 'Strong', 'Herbal', 'Bitter', 'Absinthe', 'Chili'],
    'happy':       ['Bubbly', 'Fruity', 'Sweet', 'Party', 'Tiki'],
    'quiet':       ['Strong', 'Complex', 'Dark', 'Classic', 'Sipping'],
    'tipsy':       ['Strong', 'Long Island', 'Zombie', 'Shooter']
};

let playlist = []; 
let cardIdx = 0;
let userSelections = {};

function initPickers() {
    const container = document.getElementById('pickers');
    container.innerHTML = ''; 
    DB.q.forEach((q, idx) => {
        const group = document.createElement('div');
        group.className = 'picker-group';
        group.style.animationDelay = `${idx * 0.1}s`;
        group.innerHTML = `
            <div class="picker-label">${q.l}</div>
            <div class="wheel-container">
                <div class="wheel-scroll" id="scroll-${q.id}">
                    <div class="wheel-placeholder">-</div>
                    ${q.o.map(opt => `<div class="wheel-item">${opt}</div>`).join('')}
                    <div class="wheel-placeholder">-</div>
                </div>
            </div>
        `;
        container.appendChild(group);

        const scroll = group.querySelector('.wheel-scroll');
        scroll.addEventListener('scroll', () => {
            const center = scroll.scrollLeft + scroll.offsetWidth/2;
            const items = scroll.querySelectorAll('.wheel-item');
            items.forEach(item => {
                const box = item.offsetLeft + item.offsetWidth/2;
                if(Math.abs(center - box) < 40) {
                    if(!item.classList.contains('active')) {
                        items.forEach(i => i.classList.remove('active'));
                        item.classList.add('active');
                        userSelections[q.id] = item.innerText;
                        updateButton();
                    }
                }
            });
        });
    });
    updateButton();
}

function updateButton() {
    const btn = document.getElementById('btn-submit');
    const count = Object.keys(userSelections).length;
    btn.className = 'btn-submit'; btn.onclick = null;
    if (count < 3) { btn.classList.add('lvl-1'); btn.innerText = "WAITING FOR YOU..."; } 
    else if (count >= 3 && count < 5) { btn.classList.add('lvl-3'); btn.innerText = "SEARCH NOW!"; btn.onclick = goToResult; } 
    else if (count === 5) { btn.classList.add('lvl-5'); btn.innerText = "INITIATE SEQUENCE"; btn.onclick = goToResult; }
}

function goToResult() {
    document.getElementById('page-filter').classList.remove('active');
    document.getElementById('page-result').classList.add('active');
    initCards();
}

function checkMatch(userKey, drinkText) {
    const keywords = TAG_DICT[userKey];
    if (!keywords) return false;
    return keywords.some(k => drinkText.includes(k.toLowerCase()));
}

function calculatePlaylist() {
    const uTaste  = (userSelections['taste'] || '').toLowerCase();
    const uEnergy = (userSelections['energy'] || '').toLowerCase();
    const uTool   = (userSelections['tool'] || '').toLowerCase();
    const uSafe   = (userSelections['safety'] || '').toLowerCase();
    const uMood   = (userSelections['mood'] || '').toLowerCase();

    const scoredRecipes = DB.recipes.map(drink => {
        let score = 0;
        const text = (drink.t + " " + drink.r + " " + drink.n).toLowerCase();
        if (uTaste && checkMatch(uTaste, text)) score += 10000;
        if (uEnergy && checkMatch(uEnergy, text)) score += 1000;
        if (uTool) {
            const isComplex = text.includes('complex') || text.includes('tiki') || drink.r.split(',').length > 4;
            if (uTool === 'spoon' && isComplex) score += 100;
            else if (uTool === 'finger' && !isComplex) score += 100;
        }
        if (uSafe && checkMatch(uSafe, text)) score += 10;
        if (uMood && checkMatch(uMood, text)) score += 10;
        return { ...drink, score: score };
    });

    scoredRecipes.sort((a, b) => b.score - a.score);

    if (scoredRecipes.length > 0) {
        const maxScore = scoredRecipes[0].score;
        playlist = scoredRecipes.filter(d => d.score === maxScore);
        if (playlist.length < 3) {
             const secondTier = scoredRecipes.filter(d => d.score < maxScore).slice(0, 5);
             playlist = playlist.concat(secondTier);
        }
    } else {
        playlist = DB.recipes;
    }
    playlist = playlist.sort(() => Math.random() - 0.5);
    cardIdx = 0;
}

function initCards() { calculatePlaylist(); renderStack(); }
 
function renderStack() {
    const stack = document.getElementById('stack');
    stack.innerHTML = '';
    if (playlist.length === 0) return;
    
    const nextData = playlist[(cardIdx + 1) % playlist.length];
    const nextEl = createCard(nextData);
    nextEl.classList.add('next');
    stack.appendChild(nextEl);

    const currData = playlist[cardIdx];
    const currEl = createCard(currData);
    currEl.classList.add('current');
    bindGestures(currEl, currData);
    stack.appendChild(currEl);
}

/* =========================================
   4. NEW CARD LAYOUT (UPDATED)
   ========================================= */
function createCard(data) {
    const el = document.createElement('div');
    el.className = 'card';
    el.style.cssText = "padding: 35px; display: flex; flex-direction: column; align-items: flex-start; font-family: var(--f-main);";

    el.innerHTML = `
        <div style="width: 70%; position: relative; margin-bottom: 30px;">
            <div style="width: 100%; padding-bottom: 100%; position: relative; border-radius: 4px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.6);">
                <img src="${data.i}" alt="${data.n}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
            </div>
        </div>

        <div style="margin-bottom: 15px; width: 100%;">
            <h2 style="
                margin: 0; 
                font-size: 1.4rem; 
                color: #ffd8b3;        
                font-family: var(--f-main); 
                font-weight: normal;   
                text-transform: uppercase; 
                letter-spacing: 2px;
            ">${data.n}</h2>
            
            <div style="font-size: 0.7rem; color: rgba(255,255,255,0.2); margin-top: 5px; text-transform: uppercase; letter-spacing: 1px; font-family: var(--f-main);">${data.t}</div>
        </div>

        <div style="margin-bottom: auto; padding-right: 15%; width: 100%;">
            <p style="font-size: 0.95rem; line-height: 1.6; font-style: italic; color: rgba(255,255,255,0.35); margin: 0; font-family: var(--f-main);">
                "${data.pq}"
            </p>
        </div>

        <div style="width: 100%; padding-top: 25px; border-top: 1px solid rgba(255,255,255,0.05);">
            <div style="font-size: 0.65rem; color: #FFFFFF; font-weight: bold; letter-spacing: 2px; margin-bottom: 10px; text-transform: uppercase; font-family: var(--f-main);">
                ${data.ra}
            </div>
            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.3); line-height: 1.4; font-family: var(--f-main);">
                ${data.r}
            </div>
        </div>

        <button class="btn-card" style="
            margin-top: 25px;
            width: 100%;
            padding: 12px 0;
            background: transparent;
            color: #fff;
            border: 1px solid var(--accent);
            border-radius: 12px;
            font-weight: bold;
            font-size: 0.9rem;
            letter-spacing: 2px;
            cursor: pointer;
            font-family: var(--f-main);
            box-shadow: 0 0 10px var(--accent-dim), inset 0 0 10px rgba(212,163,115,0.1);
            text-shadow: 0 0 5px rgba(212,163,115,0.8);
            transition: all 0.3s ease;
        ">DRINK THIS TONIGHT</button>
        <div class="hint" style="font-family: var(--f-main);">Swipe Up to Skip / Swipe Down to Confirm</div>
    `;
    return el;
}

function bindGestures(card, data) {
    let sy = 0, drag = false;
    const start = y => { sy = y; drag = true; card.style.transition='none'; };
    const move = y => { if(drag) card.style.transform = `translateY(${(y-sy)*0.5}px) rotate(${(y-sy)*0.05}deg)`; };
    const end = y => {
        if(!drag) return; drag = false;
        card.style.transition = 'transform 0.6s, opacity 0.5s';
        if (y - sy < -80) switchCard(card); 
        else if (y - sy > 100) confirmCard(card, data); 
        else card.style.transform = 'translateY(0)';
    };

    card.onmousedown = e => start(e.clientY);
    window.onmousemove = e => move(e.clientY);
    window.onmouseup = e => end(e.clientY);
    card.ontouchstart = e => start(e.touches[0].clientY);
    card.ontouchmove = e => move(e.touches[0].clientY);
    card.ontouchend = e => end(e.changedTouches[0].clientY);
    
    card.querySelector('.btn-card').onclick = (e) => { e.stopPropagation(); confirmCard(card, data); };
}

function switchCard(card) {
    card.classList.add('discard'); 
    const next = document.querySelector('.card.next');
    if(next) setTimeout(() => { next.classList.remove('next'); next.classList.add('current'); }, 50);
    setTimeout(() => { cardIdx = (cardIdx + 1) % playlist.length; renderStack(); }, 600);
}

function confirmCard(card, data) {
    card.classList.add('confirm'); 
    setTimeout(() => {
        document.getElementById('page-result').classList.remove('active');
        document.getElementById('page-diary').classList.add('active');
        initCalendar(data);
    }, 600);
}

/* =========================================
   5. DIARY & DATA SAVING
   ========================================= */
let diaryData = {
    // 默认数据也是指向 15.png
    15: { n: "Cuba Libre", t: "RUM / COKE", c: "#ff7f50", i: "assets/images/15.png" } 
};

function initCalendar(newDrinkData) {
    const cal = document.getElementById('calendar');
    cal.innerHTML = '';
    const today = 20; 

    const energy = userSelections['energy'] || 'chill'; 
    let dayColor = '#fff';
    if(energy === 'chill') dayColor = 'var(--c-chill)';
    if(energy === 'active') dayColor = 'var(--c-active)';
    if(energy === 'brainy') dayColor = 'var(--c-brainy)';

    if(newDrinkData) {
        diaryData[today] = {
            n: newDrinkData.n,
            t: newDrinkData.t,
            c: dayColor,
            i: newDrinkData.i 
        };
    }

    for(let i=1; i<=31; i++) {
        const d = document.createElement('div');
        d.className = 'day'; d.innerText = i;
        if(diaryData[i]) {
            d.classList.add('highlight');
            d.style.color = diaryData[i].c; 
            d.onclick = () => showMiniCard(diaryData[i]);
        }
        cal.appendChild(d);
    }
    if(diaryData[today]) showMiniCard(diaryData[today]);
}

function showMiniCard(data) {
    const container = document.getElementById('mini-card-box');
    container.innerHTML = `
        <div class="mini-card" style="font-family: var(--f-main);">
            <div class="mini-img" style="padding:0; overflow:hidden; border:none; background:transparent;">
                 <img src="${data.i}" alt="${data.n}" style="width:100%; height:100%; object-fit:contain; border-radius:8px;">
            </div>
            <div class="mini-info">
                <h3 style="font-family: var(--f-main);">${data.n}</h3>
                <p style="font-family: var(--f-main);">${data.t}</p>
            </div>
        </div>
    `;
    container.classList.remove('show');
    void container.offsetWidth; 
    container.classList.add('show');
}