// 100名城チャレンジサイト メインスクリプト

// 総城数（変更する場合はここを修正）
const TOTAL_CASTLES = 100;
// 城番号→都道府県ID 対応表（MapSVG）
const castle2Pref = {
  1:"1",   // 北海道
  11:"7", 12:"7", 13:"7", // 福島
  14:"8", // 茨城
  20:"12", // 千葉
  // === 2025-07-26 追加 ===
  16:"10", 17:"10", // 群馬
  26:"20", 27:"20", 28:"20", // 長野
  18:"11", // 埼玉
  // === 2025-08-02 追加 ===
  15:"9",  // 栃木
  19:"11", // 埼玉
  22:"13", // 東京
  // === 2025-07-31 追加 ===
  24:"19", 25:"19", // 山梨
  29:"20", 30:"20", // 長野
  98:"47", 99:"47", 100:"47", // 沖縄
  // === 2025-08-04 追加 ===
  40:"22", // 静岡
  // === 2025-08-05 追加 ===
  31:"15", 32:"15", // 新潟
  33:"16", // 富山
  34:"17",  // 石川
  // === 2025-08-06 追加 ===
  35:"17", // 石川
  36:"18", 37:"18", // 福井
  // === 2025-08-07 追加 ===
  49:"25", 50:"25", 51:"25", 52:"25", // 滋賀
  // === 2025-08-08 追加 ===
  47:"JP-24",   // 三重
  55:"JP-27",   // 大阪
  61:"JP-29",   // 奈良
  // === 2025-08-09 追加 ===
  62:"JP-30"    // 和歌山
};
let castlesData = [];

// 都道府県名表記（北海道は"県"を付けない等）
function displayPref(pref){
  if(!pref) return '';
  const last = pref.slice(-1);
  return (last==='都' || last==='道' || last==='府') ? pref : `${pref}県`;
}

// 地図クリックで都道府県名と訪問城を表示
function bindMapClicks(){
    const svgRoot = document.querySelector('#map svg');
    if(!svgRoot) return;
    if(svgRoot.__boundClicks) return; // 二重バインド防止
    svgRoot.__boundClicks = true;

    const resolvePrefFromElement = (el)=>{
        if(!el) return {};
        // 最近傍の候補要素
        const t = el.closest('[data-code], [data-jis-code], [data-jis], .prefecture, [id]');
        if(!t) return {};
        // コード候補を取得
        let code = t.getAttribute('data-code') || t.getAttribute('data-jis-code') || t.getAttribute('data-jis') || t.id || '';
        if(!code) return {};
        // 数値化
        let num = String(code).replace(/^(JP-|pref-)/,'');
        num = num.replace(/^(..).*$/, '$1');
        num = num.padStart(2,'0').slice(0,2);
        const jp = `JP-${num}`;
        // 名称候補
        const name = t.getAttribute('data-name') || (t.querySelector('title')?.textContent) || '';
        return { num, jp, name };
    };

    svgRoot.addEventListener('click', (e)=>{
        const { num, jp, name } = resolvePrefFromElement(e.target);
        if(!num) return;

        // 対象都道府県の訪問城を抽出
        const visitedList = castlesData.filter(c=> c.visited && (String(castle2Pref[c.no]).replace(/^JP-/,'').padStart(2,'0')===num));

        const title = name || jp;
        const listHtml = visitedList.length
            ? `<ul style="margin:8px 0 0 18px;">${visitedList.map(c=>`<li>No.${c.no} ${c.name} <small>${formatDate(c.date)}</small></li>`).join('')}</ul>`
            : `<p style="margin:8px 0 0; color:#666;">この都道府県の訪問記録はありません</p>`;

        openInfoModal(title, listHtml);
    });
}

// テキスト用モーダル
function openInfoModal(title, html){
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,.5);
        display:flex; align-items:center; justify-content:center; z-index:1000;
    `;
    const box = document.createElement('div');
    box.style.cssText = `
        background:#fff; color:#333; border-radius:12px; max-width:520px; width:90%;
        box-shadow:0 10px 30px rgba(0,0,0,.25); padding:18px 20px; font-size:14px; line-height:1.6;
    `;
    box.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
            <h3 style="margin:0; font-size:18px;">${title}</h3>
            <button id="modalCloseBtn" style="border:none; background:#eee; padding:6px 10px; border-radius:8px; cursor:pointer;">閉じる</button>
        </div>
        <div style="margin-top:10px;">${html}</div>
    `;
    modal.appendChild(box);
    document.body.appendChild(modal);
    const close = ()=>{ if(modal.parentNode) modal.parentNode.removeChild(modal); };
    modal.addEventListener('click', (e)=>{ if(e.target===modal) close(); });
    box.querySelector('#modalCloseBtn').addEventListener('click', close);
    const onEsc=(e)=>{ if(e.key==='Escape'){ close(); document.removeEventListener('keydown', onEsc);} };
    document.addEventListener('keydown', onEsc);
}

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
    loadJapanMap().then(loadCastlesData);
});

// JSON読み込み
async function loadCastlesData() {
    try {
        const response = await fetch(`data/castles.json?v=${Date.now()}`);
        castlesData = await response.json();
        initializePage();
    } catch (error) {
        console.error('城データの読み込みに失敗しました:', error);
        // エラー時はダミーデータで初期化
        castlesData = [
            { "no": 11, "name": "二本松城", "pref": "福島", "visited": true, "date": "2025-07-20" },
            { "no": 12, "name": "会津若松城", "pref": "福島", "visited": true, "date": "2025-07-20" },
            { "no": 13, "name": "白河小峰城", "pref": "福島", "visited": true, "date": "2025-07-20" },
            { "no": 14, "name": "水戸城", "pref": "茨城", "visited": true, "date": "2025-07-19" },
            { "no": 20, "name": "佐倉城", "pref": "千葉", "visited": true, "date": "2025-07-19" },
            { "no": 1, "name": "根室半島チャシ跡群", "pref": "北海道", "visited": true, "date": "2025-07-22" }
        ];
        initializePage();
    }
}

// ページ初期化
function initializePage() {
    renderWallProgress();
    generateTimeline();
    highlightMapMarkers();
    bindMapClicks();
    generateGallery();
}

// 進捗バー更新
function renderWallProgress() {
    const total = TOTAL_CASTLES;
    const visited = castlesData.filter(c => c.visited).length;

    const wallGrid = document.getElementById('wall-grid');
    if (!wallGrid) return;

    // グリッドを生成・再描画
    wallGrid.innerHTML = '';
    for (let i = 0; i < total; i++) {
        const block = document.createElement('div');
        const visitedFlag = i < visited;
        block.className = 'wall-block' + (visitedFlag ? ' filled' : '');

        if (visitedFlag) {
            const em = document.createElement('span');
            em.className = 'emoji';
            em.textContent = '🔥';
            block.appendChild(em);
        } else {
            const num = document.createElement('span');
            num.className = 'num';
            num.textContent = total - i; // 残数カウントダウン
            block.appendChild(num);
        }
        wallGrid.appendChild(block);
    }

    // 数値情報を更新
    const info = document.getElementById('wall-info');
    const percent = Math.round((visited / total) * 100);
    if (info) info.textContent = `${visited} / ${total}（${percent}%）`;

    // 100達成で天守を表示
    if (visited === total) {
        const wp = document.getElementById('wall-progress');
        if (wp && !document.getElementById('castle-finish')) {
            const castle = document.createElement('div');
            castle.id = 'castle-finish';
            castle.textContent = '🏯 完成！';
            wp.appendChild(castle);
            wp.classList.add('complete');
        }
    }
}


// タイムライン生成（新しい順）
function generateTimeline() {
    const timelineList = document.getElementById('timeline-list');
    if (!timelineList) return;
    
    const visitedCastles = castlesData
        .filter(castle => castle.visited && castle.date)
        .sort((a, b) => b.date.localeCompare(a.date));
    
    timelineList.innerHTML = '';
    
    visitedCastles.forEach(castle => {
        const li = document.createElement('li');
        li.innerHTML = `
            <time>${formatDate(castle.date)}</time>
            <strong><ruby><rb>${castle.name}</rb><rt>${castle.yomi || ''}</rt></ruby></strong> (${displayPref(castle.pref)})
        `;
        timelineList.appendChild(li);
    });
    
    if (visitedCastles.length === 0) {
        timelineList.innerHTML = '<li>まだ訪問した城がありません</li>';
    }
}

// 地図マーカーハイライト
function highlightMapMarkers() {
    const svgRoot = document.querySelector('#map svg');
    if(!svgRoot) return;

    const markVisited = (el) => {
        if(!el) return;
        el.classList.add('visited');
        el.querySelectorAll('path').forEach(p=>p.classList.add('visited'));
    };

    // 都道府県パスをハイライト（複数の属性スキーマに対応）
    castlesData.filter(c=>c.visited).forEach(castle => {
        const prefCode = castle2Pref[castle.no];
        if(!prefCode) return;

        const num = String(prefCode).replace(/^JP-/,'').padStart(2,'0');
        const numNoPad = String(parseInt(num,10));
        const jp  = `JP-${num}`;
        const prefName = castle.pref || '';

        const candidates = [
            `[data-code='${jp}']`,
            `[data-code='${num}']`,
            `[data-code='JP-${numNoPad}']`,
            `[data-code='${numNoPad}']`,
            `[data-jis-code='${num}']`,
            `[data-jis='${num}']`,
            `[data-jis-code='${numNoPad}']`,
            `[data-jis='${numNoPad}']`,
            `#pref-${num}`,
            `#pref-${numNoPad}`,
            `#${jp}`,
            `[data-name='${prefName}']`
        ];

        let targets = [];
        const safeQuery = (sel)=>{ try { return svgRoot.querySelector(sel); } catch(_) { return null; } };
        const safeQueryAll = (sel)=>{ try { return Array.from(svgRoot.querySelectorAll(sel)); } catch(_) { return []; } };
        for (const sel of candidates) {
            const tAll = safeQueryAll(sel);
            if (tAll.length) targets.push(...tAll);
        }
        // .prefecture グループ内の title でも照合（北海道など分割形状対策）
        if (targets.length === 0 && prefName) {
            const groups = Array.from(svgRoot.querySelectorAll('.prefecture'));
            groups.forEach(g=>{
                const title = g.querySelector('title')?.textContent?.trim();
                if (title === prefName || title === jp || title === num) {
                    targets.push(g);
                }
            });
        }
        // さらに title 直指定（グループclassが無い場合）
        if (targets.length === 0 && prefName) {
            const titled = Array.from(svgRoot.querySelectorAll('title'))
                .filter(t=> (t.textContent||'').trim() === prefName)
                .map(t=> t.parentElement);
            if (titled.length) targets.push(...titled);
        }
        // 重複除去
        targets = Array.from(new Set(targets.filter(Boolean)));
        // 見つかった全対象に反映（島が分割されている県対策）
        if (targets.length) {
            targets.forEach(el=> markVisited(el));
        }
    });
}

// ギャラリー生成（訪問済みのみ）
function generateGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;
    
    const visitedCastles = castlesData.filter(castle => castle.visited);
    
    galleryGrid.innerHTML = '';
    
    visitedCastles.forEach(castle => {
        const figure = document.createElement('figure');
        const imgSrc = castle.photo ? castle.photo : `data/IMG_${castle.no}.JPG`;
        figure.innerHTML = `
            <img src="${imgSrc}" alt="${castle.name}" onerror="this.onerror=null;this.src='data/IMG_${castle.no}a.JPG';">
            <figcaption>
                <strong>${castle.name}</strong><br>
                No.${castle.no} (${displayPref(castle.pref)})<br>
                <small>${formatDate(castle.date)}</small>
            </figcaption>
        `;
        
        // 画像クリックで拡大表示
        const img = figure.querySelector('img');
        img.addEventListener('click', () => {
            openImageModal(img.src, castle.name);
        });
        
        galleryGrid.appendChild(figure);
    });
    
    if (visitedCastles.length === 0) {
        galleryGrid.innerHTML = '<p style="text-align: center; color: #666;">まだ訪問した城の写真がありません</p>';
    }
}

// 日付フォーマット
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 城情報表示（地図マーカークリック時）
function showCastleInfo(castle) {
    alert(`${castle.name}\n所在地: ${displayPref(castle.pref)}\n訪問日: ${formatDate(castle.date)}\nNo.${castle.no}`);
}

// 画像モーダル表示
function openImageModal(src, alt) {
    // シンプルなモーダル実装
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        cursor: pointer;
    `;
    
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 10px;
    `;
    
    modal.appendChild(img);
    document.body.appendChild(modal);
    
    // クリックで閉じる
    modal.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // ESCキーで閉じる
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

// 日本地図SVGを読み込み
function loadJapanMap(){
  return fetch('https://raw.githubusercontent.com/geolonia/japanese-prefectures/master/map-full.svg')
    .then(r=>r.text())
    .then(svg=>{
      document.querySelector('#map').insertAdjacentHTML('beforeend', svg);
    })
    .catch(err=>console.error('SVG読み込み失敗',err));
}

// スムーススクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// マカミ案内 吹き出し（×）で閉じる
document.addEventListener('click', (e) => {
  const t = e.target;
  if (t && t.id === 'hint-close') {
    const hint = document.getElementById('map-hint');
    if (hint) hint.style.display = 'none';
  }
});

// ページ読み込み時のアニメーション
// ===== 投票開始カウントダウン =====
(function(){
  const voteTarget = new Date("2025-08-01T00:00:00+09:00").getTime();
  const vc = document.getElementById('vote-countdown');
  if(!vc) return;
  function updateCountdown(){
    const diff = voteTarget - Date.now();
    if(diff<=0){vc.textContent='投票受付中！';return;}
    const d=Math.floor(diff/864e5);
    const h=Math.floor(diff%864e5/36e5);
    const m=Math.floor(diff%36e5/6e4);
    const s=Math.floor(diff%6e4/1e3);
    vc.textContent=`投票開始まで ${d}日 ${h}時間 ${m}分 ${s}秒`;
  }
  updateCountdown();
  setInterval(updateCountdown,1000);
})();

// ===== ハンバーガーメニュー開閉 =====
(function(){
  const btn = document.getElementById('menu-btn');
  const nav = document.getElementById('main-nav');
  if(btn && nav){
    btn.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }
})();

// ===== タイムライン展開トグル =====
(function(){
  const scrollbox = document.querySelector('.timeline-scrollbox');
  const btn = document.getElementById('toggleTimeline');
  if(!scrollbox || !btn) return;
  btn.addEventListener('click',()=>{
    const expanded = scrollbox.classList.toggle('expanded');
    btn.textContent = expanded ? '閉じる' : 'もっと見る';
  });
})();

window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});
