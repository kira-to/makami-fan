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
  98:"47", 99:"47", 100:"47" // 沖縄
};
let castlesData = [];

// 都道府県名表記（北海道は"県"を付けない等）
function displayPref(pref){
  if(!pref) return '';
  const last = pref.slice(-1);
  return (last==='都' || last==='道' || last==='府') ? pref : `${pref}県`;
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
            <strong>${castle.name}</strong> (${displayPref(castle.pref)})
        `;
        timelineList.appendChild(li);
    });
    
    if (visitedCastles.length === 0) {
        timelineList.innerHTML = '<li>まだ訪問した城がありません</li>';
    }
}

// 地図マーカーハイライト
function highlightMapMarkers() {
    // SVG がまだ挿入されていなければ後で再試行
    if(!document.querySelector('#map svg')) return;

    // 都道府県パスをハイライト
    castlesData.filter(c=>c.visited).forEach(castle => {
        const prefCode = castle2Pref[castle.no];
        if(prefCode){
            document.querySelector(`[data-code='${prefCode}']`)?.classList.add('visited');
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
