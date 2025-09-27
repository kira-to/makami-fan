
// 100名城チャレンジサイト メインスクリプト

// 総城数（変更する場合はここを修正）
const TOTAL_CASTLES = 100;
// 終盤の未登城ターゲット（固定表示用）
const ENDGAME_TARGETS = [
  { no: 9,  name: '久保田城',   yomi: 'くぼたじょう',   pref: '秋田', city: '秋田県秋田市' },
  { no: 21, name: '江戸城',     yomi: 'えどじょう',     pref: '東京', city: '東京都千代田区' },
  { no: 23, name: '小田原城',   yomi: 'おだわらじょう', pref: '神奈川', city: '神奈川県小田原市' },
  { no: 38, name: '岩村城',     yomi: 'いわむらじょう', pref: '岐阜', city: '岐阜県恵那市' },
  { no: 39, name: '岐阜城',     yomi: 'ぎふじょう',     pref: '岐阜', city: '岐阜県岐阜市' },
  { no: 41, name: '駿府城',     yomi: 'すんぷじょう',   pref: '静岡', city: '静岡県静岡市' },
  { no: 42, name: '掛川城',     yomi: 'かけがわじょう', pref: '静岡', city: '静岡県掛川市' },
  { no: 43, name: '犬山城',     yomi: 'いぬやまじょう', pref: '愛知', city: '愛知県犬山市' },
  { no: 44, name: '名古屋城',   yomi: 'なごやじょう',   pref: '愛知', city: '愛知県名古屋市' },
  { no: 45, name: '岡崎城',     yomi: 'おかざきじょう', pref: '愛知', city: '愛知県岡崎市' },
  { no: 46, name: '長篠城',     yomi: 'ながしのじょう', pref: '愛知', city: '愛知県新城市' },
  { no: 53, name: '二条城',     yomi: 'にじょうじょう', pref: '京都', city: '京都府京都市' },
  { no: 54, name: '大阪城',     yomi: 'おおさかじょう', pref: '大阪', city: '大阪府大阪市' }
];
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
  62:"JP-30",   // 和歌山
  // === 2025-08-10 追加 ===
  58:"JP-28", 59:"JP-28", 60:"JP-28",  // 兵庫
  // === 2025-08-12 追加 ===
  67:"JP-33", 68:"JP-33", 69:"JP-33", 70:"JP-33",   // 岡山
  77:"JP-37", 78:"JP-37", // 香川
  // === 2025-08-13 追加 ===
  80:"JP-38", 81:"JP-38", 82:"JP-38", 83:"JP-38",   // 愛媛
  // === 2025-08-14 追加 ===
  79:"JP-38",  // 愛媛（今治）
  84:"JP-39",  // 高知
  // === 2025-08-18 追加 ===
  71:"JP-34", 72:"JP-34", 73:"JP-34", // 広島
  74:"JP-35",   // 山口
  // === 2025-08-19 追加 ===
  66:"JP-32",   // 島根（津和野城）
  75:"JP-35",   // 山口（萩城）
  // === 2025-08-20 追加 ===
  94:"JP-44",   // 大分（大分府内城）
  95:"JP-44",   // 大分（岡城）
  96:"JP-45",    // 宮崎（飫肥城）
  // === 2025-08-21 追加 ===
  92:"JP-43",   // 熊本（熊本城）
  93:"JP-43",   // 熊本（人吉城）
  97:"JP-46",    // 鹿児島（鹿児島城）
  // === 2025-08-22 返加 ===
  87:"JP-41", 88:"JP-41", 89:"JP-41", // 佐賀（名護屋城・吉野ヶ里・佐賀城）
  // === 2025-08-23 追加 ===
  90:"JP-42", 91:"JP-42", // 長崎（平戸城・島原城）
};
let castlesData = [];

// 旧データ（data/castles.backup.json）があれば visited/date/photo/yomi を引き継ぐ
async function mergeVisited(baseAll) {
  try {
    const oldRes = await fetch('data/castles.backup.json', { cache: 'no-store' });
    if (!oldRes.ok) return baseAll;
    const old = await oldRes.json();
    const oldByNo = new Map((old||[]).map(c => [c.no, c]));
    return (baseAll||[]).map(c => {
      const o = oldByNo.get(c.no);
      if (!o) return c;
      return {
        ...c,
        visited: (o.visited ?? c.visited),
        date:    (o.date    ?? c.date),
        photo:   (o.photo   ?? c.photo),
        yomi:    (o.yomi    ?? c.yomi)
      };
    });
  } catch (e) {
    return baseAll;
  }
}

// 都道府県名→JISコード（JP-__）簡易対応表
const PREF_JIS = {
  '北海道':'JP-01','青森':'JP-02','岩手':'JP-03','宮城':'JP-04','秋田':'JP-05','山形':'JP-06','福島':'JP-07',
  '茨城':'JP-08','栃木':'JP-09','群馬':'JP-10','埼玉':'JP-11','千葉':'JP-12','東京':'JP-13','神奈川':'JP-14',
  '新潟':'JP-15','富山':'JP-16','石川':'JP-17','福井':'JP-18','山梨':'JP-19','長野':'JP-20',
  '岐阜':'JP-21','静岡':'JP-22','愛知':'JP-23','三重':'JP-24',
  '滋賀':'JP-25','京都':'JP-26','大阪':'JP-27','兵庫':'JP-28','奈良':'JP-29','和歌山':'JP-30',
  '鳥取':'JP-31','島根':'JP-32','岡山':'JP-33','広島':'JP-34','山口':'JP-35',
  '徳島':'JP-36','香川':'JP-37','愛媛':'JP-38','高知':'JP-39',
  '福岡':'JP-40','佐賀':'JP-41','長崎':'JP-42','熊本':'JP-43','大分':'JP-44','宮崎':'JP-45','鹿児島':'JP-46','沖縄':'JP-47'
};

// 県名からJP-__に変換
function prefNameToCode(name){
  if(!name) return '';
  const key = normalizePref(name);
  // PREF_JISのキーは末尾の都道府県を除いた表記で定義
  for(const k in PREF_JIS){
    if(normalizePref(k) === key) return PREF_JIS[k];
  }
  return '';
}

// 城番号/県名からprefCodeを取得（castle2Pref優先、無ければ県名で解決）
function getPrefCodeForCastle(no, prefName){
  const direct = castle2Pref[no];
  if(direct) return /^JP-/.test(String(direct)) ? String(direct) : `JP-${String(direct).padStart(2,'0')}`;
  const code = prefNameToCode(prefName||'');
  return code || '';
}

// 都道府県名表記（北海道は"県"を付けない等）
function displayPref(pref){
  if(!pref) return '';
  const last = pref.slice(-1);
  return (last==='都' || last==='道' || last==='府') ? pref : `${pref}県`;
}

/* ユーティリティ：県名の表記ゆれを吸収（～都/道/府/県 を削除） */
function normalizePref(name){
  if(!name) return '';
  return String(name).trim().replace(/(都|道|府|県)$/,'');
}

/* 都道府県カバー率を更新（ユニーク訪問都道府県数 X/47, Y%） */
function updatePrefCoverage(castles){
  const TOTAL = 47;
  const set = new Set();
  (castles||[]).filter(c => c.visited && c.pref).forEach(c => set.add(normalizePref(c.pref)));
  const visited = set.size;
  const rate = Math.round((visited / TOTAL) * 100);

  const v = document.getElementById('pref-visited');
  const r = document.getElementById('pref-rate');
  const b = document.getElementById('pref-bar');
  if(v) v.textContent = visited;
  if(r) r.textContent = `(${rate}%)`;
  if(b) b.style.width = `${rate}%`;
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

        // 対象都道府県の訪問城を抽出（prefコードは getPrefCodeForCastle で解決）
        const visitedList = castlesData.filter(c=>{
            if(!c.visited) return false;
            const code = getPrefCodeForCastle(c.no, c.pref);
            const n = String(code).replace(/^JP-/,'').padStart(2,'0');
            return n === num;
        });

        const title = name || jp;
        // 総数（この都道府県に属する全城）と達成判定
        const totalList = (castlesData||[]).filter(c => {
            const code = getPrefCodeForCastle(c.no, c.pref);
            const n = String(code).replace(/^JP-/,'').padStart(2,'0');
            return n === num;
        });
        const completed = totalList.length > 0 && visitedList.length === totalList.length;

        const headerHtml = completed
          ? `<div class="pref-completed-msg" style="margin-top:6px;padding:10px 12px;border-radius:8px;background:#e9f2ff;color:#1b5fcc;display:flex;gap:8px;align-items:center;">
               <span style="font-size:18px;">🎉</span>
               <div><strong>全城制覇！</strong> ${title} の <strong>${totalList.length}</strong> 城をすべて訪問しました。</div>
             </div>`
          : '';

        const bodyHtml = visitedList.length
            ? `<ul style="margin:8px 0 0 18px;">${visitedList.map(c=>`<li>No.${c.no} ${c.name} <small>${formatDate(c.date)}</small></li>`).join('')}</ul>`
            : `<p style="margin:8px 0 0; color:#666;">この都道府県の訪問記録はありません</p>`;

        openInfoModal(title, `${headerHtml}${bodyHtml}`);
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

// DOM読み込み完了後に初期化（地図読み込み失敗時でもデータは必ず読み込む）
document.addEventListener('DOMContentLoaded', () => {
  const safeLoadMap = () => loadJapanMap().catch(() => { /* 地図読み込み失敗は無視して続行 */ });
  safeLoadMap()
    .then(() => loadCastlesData())
    .then(() => { try{ addMapLegend(); }catch(_){} try{ updateRankBadge(); }catch(_){} })
    .catch(() => {
      // 予備: どこかで失敗しても最低限の描画を試行
      try{ initializePage(); }catch(_){}
    });
});

// JSON読み込み
async function loadCastlesData() {
    try {
        const response = await fetch(`data/castles.json?v=${Date.now()}`);
        const base = await response.json();
        castlesData = await mergeVisited(base);
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
    updatePrefCoverage(castlesData);
    renderEndgame();
    // 固定文言（TL;DR/FAQ/進捗見出し）を最新表示に揃える
    try { patchStaticTexts(); } catch(_) {}
}

// 固定文言のDOMを上書きして最新表示にする（index.html を直接編集できない場合の対策）
function patchStaticTexts(){
  // 進捗見出し（固定表示）
  const info = document.getElementById('wall-info');
  if(info){
    info.setAttribute('data-fixed','1');
    info.textContent = '100 / 100（100%）';
  }

  // TL;DR
  const tldr = document.getElementById('tldr');
  if(tldr){
    const h2 = tldr.querySelector('h2');
    if(h2) h2.textContent = '要点まとめ（最終更新：2025-09-27）';
    const img = tldr.querySelector('.tldr-thumb');
    if(img){ img.src = 'data/IMG_21a.JPG'; img.alt = '江戸城（東京）'; }
    const ul = tldr.querySelector('ul');
    if(ul){
      ul.innerHTML = [
        '            <li>日本100名城進捗：<strong>100/100</strong></li>',
        '            <li>最新登城：江戸城（9/26）</li>',
        '            <li>投票：『ゆるバース2025』受付中（下のボタンから）</li>'
      ].join('\n');
    }
    const pEn = tldr.querySelector('p[lang="en"]');
    if(pEn){
      pEn.textContent = "Makami’s “100 Japanese Castles” challenge: 100/100 completed as of 2025-09-27.";
    }
  }

  // FAQ（本文）
  const faq = document.getElementById('faq');
  if(faq){
    const ps = Array.from(faq.querySelectorAll('p'));
    ps.forEach(p=>{
      const txt = (p.textContent||'').trim();
      if(/99\s*\/\s*100/.test(txt)){
        p.innerHTML = 'A. <strong>100/100</strong> です（2025-09-27 更新）。';
      }
      if(/岐阜城|犬山城|名古屋城/.test(txt)){
        p.innerHTML = 'A. 東京の <strong>江戸城（No.21）</strong> です。';
      }
    });
  }
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
  if (info) {
    // 手動固定指定がある場合は上書きしない（表示系のみ任意固定を許容）
    const fixed = info.getAttribute('data-fixed');
    if (fixed !== '1') {
      info.textContent = `${visited} / ${total}（${percent}%）`;
    }
  }

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
    const markCompleted = (el) => {
        if(!el) return;
        // 競合回避: completed 付与時は visited を外す
        el.classList.remove('visited');
        el.classList.add('completed');
        // インラインは使わずCSSに委譲（既存があれば消す）
        try{ el.style.fill = ''; el.style.stroke = ''; }catch(_){}
        el.querySelectorAll('path').forEach(p=>{
          p.classList.remove('visited');
          p.classList.add('completed');
          try{ p.style.fill = ''; p.style.stroke = ''; }catch(_){}
        });
        // 祖先の.prefecture グループにも反映（グループ側にvisitedが残るケース対策）
        const group = el.closest && el.closest('.prefecture');
        if(group){
          group.classList.remove('visited');
          group.classList.add('completed');
          try{ group.style.fill = ''; group.style.stroke = ''; }catch(_){}
          group.querySelectorAll('path').forEach(p=>{
            p.classList.remove('visited');
            p.classList.add('completed');
            try{ p.style.fill = ''; p.style.stroke = ''; }catch(_){}
          });
        }
    };

    // 都道府県パスをハイライト（複数の属性スキーマに対応）
    castlesData.filter(c=>c.visited).forEach(castle => {
        const prefCode = getPrefCodeForCastle(castle.no, castle.pref);
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

    // ===== 県内全城訪問の達成判定 =====
    // Plan A 前提：castlesData に全100件（未訪問含む）が入っているときのみ有効
    try {
      if(!Array.isArray(castlesData) || castlesData.length < TOTAL_CASTLES){
        // 未訪問データが揃っていないため、達成判定はスキップ
        return;
      }
      // 県コードごとの総数/訪問数を集計
      const totalByPref = {};
      const visitedByPref = {};
      const nameByPref = {}; // フォールバック用の県名（title一致検索に利用）

      (castlesData||[]).forEach(c => {
        const code = getPrefCodeForCastle(c.no, c.pref);
        if(!code) return; // マッピング不明は対象外
        totalByPref[code] = (totalByPref[code]||0) + 1;
        if(c.visited) visitedByPref[code] = (visitedByPref[code]||0) + 1;
        if(c.pref && !nameByPref[code]) nameByPref[code] = normalizePref(c.pref);
      });

      // 県コードからSVG要素群を見つけるユーティリティ
      const getTargetsForPref = (prefCode, prefName) => {
        if(!prefCode) return [];
        let targets = [];
        const num = String(prefCode).replace(/^JP-/,'').padStart(2,'0');
        const numNoPad = String(parseInt(num,10));

        const safeQuery = (sel)=>{ try { return svgRoot.querySelector(sel); } catch(_) { return null; } };
        const safeQueryAll = (sel)=>{ try { return Array.from(svgRoot.querySelectorAll(sel)); } catch(_) { return []; } };

        // 直接一致（JP-xx と 数値の両方を試す）
        const direct = safeQuery(`[data-code="JP-${num}"]`) ||
                       safeQuery(`[data-jis-code="JP-${num}"]`) ||
                       safeQuery(`[data-jis="JP-${num}"]`) ||
                       safeQuery(`#JP-${num}`) ||
                       safeQuery(`#pref-${num}`) ||
                       safeQuery(`#prefecture-JP-${num}`) ||
                       // 数値 data-code の地図に対応
                       safeQuery(`[data-code="${num}"]`) ||
                       safeQuery(`[data-code="${numNoPad}"]`) ||
                       safeQuery(`.prefecture[data-code="${num}"]`) ||
                       safeQuery(`.prefecture[data-code="${numNoPad}"]`);
        if (direct) targets.push(direct);

        // .prefecture グループも検索（JP-xx と 数値の両方）
        const group = safeQuery(`.prefecture[data-code="JP-${num}"]`) ||
                      safeQuery(`.prefecture[data-jis-code="JP-${num}"]`) ||
                      safeQuery(`.prefecture[data-jis="JP-${num}"]`) ||
                      safeQuery(`.prefecture[data-code="${num}"]`) ||
                      safeQuery(`.prefecture[data-code="${numNoPad}"]`);
        if (group) targets.push(group);

        // 配下の path も拾う（分割形状対策）
        const paths = []
          .concat(safeQueryAll(`.prefecture[data-code="JP-${num}"] path`))
          .concat(safeQueryAll(`.prefecture[data-code="${num}"] path`))
          .concat(safeQueryAll(`.prefecture[data-code="${numNoPad}"] path`))
          .concat(safeQueryAll(`path[data-code="JP-${num}"]`))
          .concat(safeQueryAll(`path[data-code="${num}"]`))
          .concat(safeQueryAll(`path[data-code="${numNoPad}"]`))
          .concat(safeQueryAll(`path[id^="pref-${num}"]`));
        if (paths.length) targets.push(...paths);

        // title 一致（例: "沖縄 / Okinawa" の先頭の和名と比較）
        if (targets.length === 0 && prefName) {
          const titled = Array.from(svgRoot.querySelectorAll('title'))
            .filter(t=>{
              const raw = (t.textContent||'').trim();
              const ja = raw.split('/')[0].trim();
              return ja === prefName;
            })
            .map(t=> t.parentElement);
          if (titled.length) targets.push(...titled);
        }

        return Array.from(new Set(targets.filter(Boolean)));
      };

      Object.keys(totalByPref).forEach(code => {
        const total = totalByPref[code]||0;
        const done = visitedByPref[code]||0;
        if(total>0 && done === total){
          const targets = getTargetsForPref(code, nameByPref[code]);
          if(targets.length){
            targets.forEach(el => markCompleted(el));
          }
        }
      });
    } catch(e) {
      // 集計中のエラーは無視（データ不備時の安全策）
    }
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
        const nameHtml = castle.yomi
          ? `<ruby><rb>${castle.name}</rb><rt>${castle.yomi}</rt></ruby>`
          : castle.name;
        figure.innerHTML = `
            <img src="${imgSrc}" alt="${castle.name}" onerror="this.onerror=null;this.src='data/IMG_${castle.no}a.JPG';">
            <figcaption>
                <strong>${nameHtml}</strong><br>
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

// 地図の色説明（凡例）を #map 内に重ねて表示
function addMapLegend(){
  const mapEl = document.getElementById('map');
  if(!mapEl) return;
  if(document.getElementById('map-legend')) return; // 二重生成防止

  // #map が static の場合は相対配置にしてオーバーレイ可能に
  const cs = getComputedStyle(mapEl);
  if(cs.position === 'static'){ mapEl.style.position = 'relative'; }

  const wrap = document.createElement('div');
  wrap.id = 'map-legend';
  wrap.style.cssText = [
    // 位置は後でレスポンシブに切り替える
    'display:flex',
    'gap:12px',
    'align-items:center',
    'flex-wrap:wrap',
    'padding:8px 10px',
    'border-radius:8px',
    'background:rgba(255,255,255,0.9)',
    'box-shadow:0 2px 8px rgba(0,0,0,0.12)',
    'font-size:13px',
    'color:#333',
    'z-index:5'
  ].join(';');

  const item = (label, color) => {
    const el = document.createElement('div');
    el.style.cssText = 'display:flex; align-items:center; gap:6px;';
    const sw = document.createElement('span');
    sw.style.cssText = `width:14px; height:14px; border-radius:3px; background:${color}; border:1px solid rgba(0,0,0,.15); display:inline-block;`;
    const tx = document.createElement('span');
    tx.textContent = label;
    el.appendChild(sw);
    el.appendChild(tx);
    return el;
  };

  // 配色はCSSの completed/visited に合わせたトーン
  wrap.appendChild(item('全城達成（青）', '#1976d2'));
  wrap.appendChild(item('一部訪問（赤）', '#e53935'));
  wrap.appendChild(item('未訪問（薄灰）', '#dcdcdc'));

  mapEl.appendChild(wrap);

  // --- レスポンシブ配置（モバイルは地図の下に流す） ---
  const applyLegendLayout = () => {
    const isNarrow = window.matchMedia('(max-width: 640px)').matches;
    if (isNarrow) {
      // 地図コンテナの下にスペースを確保し、そこに絶対配置で収める
      // これによりSVGと重ならず、常に画面下側に見える
      wrap.style.position = 'absolute';
      wrap.style.right = '';
      wrap.style.left = '50%';
      wrap.style.transform = 'translateX(-50%)';
      wrap.style.bottom = '10px';
      wrap.style.margin = '0';
      wrap.style.justifyContent = 'center';
      wrap.style.maxWidth = 'min(560px, 100%)';
      // 凡例の高さ分＋余白をパディングで確保
      mapEl.style.paddingBottom = '110px';
    } else {
      // デスクトップ: 右下オーバーレイ
      wrap.style.position = 'absolute';
      wrap.style.right = '10px';
      wrap.style.bottom = '10px';
      wrap.style.margin = '0';
      wrap.style.justifyContent = '';
      wrap.style.maxWidth = '';
      wrap.style.left = '';
      wrap.style.transform = '';
      mapEl.style.paddingBottom = '';
    }
  };
  applyLegendLayout();
  // 画面回転やサイズ変更に追従
  window.addEventListener('resize', applyLegendLayout);
}

// ヒーロー内の順位バッジを data/ranking.json から更新
async function updateRankBadge(){
  const badge = document.querySelector('.rank-badge');
  if(!badge) return;
  try{
    const res = await fetch(`data/ranking.json?v=${Date.now()}`, { cache: 'no-store' });
    if(!res.ok) return;
    const data = await res.json();
    const dateEl = badge.querySelector('.date');
    const rankStrong = badge.querySelector('.rank strong');

    if(dateEl && data.date){
      dateEl.textContent = `${formatShortDate(data.date)} 現在`;
    }
    if(rankStrong && (data.rank!==undefined && data.rank!==null)){
      rankStrong.textContent = `${data.rank} 位`;
    }
  }catch(_){/* ネットワークエラー等は無視 */}
}

// YYYY-MM-DD → M/D
function formatShortDate(isoDate){
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(String(isoDate||''));
  if(!m) return String(isoDate||'');
  const mm = parseInt(m[2],10);
  const dd = parseInt(m[3],10);
  return `${mm}/${dd}`;
}

// === 終盤カウントダウン＆未登城リスト描画 ===
function renderEndgame(){
  try{
    const counterEl = document.getElementById('endgame-left');
    const listEl = document.getElementById('endgame-list');
    if(!counterEl || !listEl){
      console.debug('renderEndgame: container not found');
      return;
    }

    const visitedSet = new Set((castlesData||[]).filter(c=>c.visited).map(c=>c.no));
    const targets = [...ENDGAME_TARGETS].sort((a,b)=>a.no-b.no);
    const remaining = targets.filter(t=>!visitedSet.has(t.no));

    const to = remaining.length;
    const current = parseInt(counterEl.textContent.replace(/\D/g,'')) || 0;
    animateEndgameCounter(counterEl, current, to);

    listEl.innerHTML = '';
    targets.forEach(t=>{
      const li = document.createElement('li');
      const isCleared = visitedSet.has(t.no);
      li.className = 'endgame-item' + (isCleared ? ' cleared' : '');
      const c = (castlesData||[]).find(c=>c.no===t.no);
      const yomi = t.yomi || (c && c.yomi) || '';
      const nameHtml = yomi
        ? `<ruby><rb>${t.name}</rb><rt>${yomi}</rt></ruby>`
        : t.name;
      li.innerHTML = `
        <span class="badge">No.${String(t.no).padStart(2,'0')}</span>
        <strong class="tit">${nameHtml}</strong>
        <span class="loc">${t.city}</span>
      `;
      listEl.appendChild(li);
      if(isCleared){
        li.classList.add('flash');
        setTimeout(()=> li.classList.remove('flash'), 1200);
      }
    });

    if(!listEl.children.length){
      listEl.innerHTML = '<li class="endgame-item">未登城リストを表示できません（読み込み中または該当なし）</li>';
    }
  }catch(err){
    console.error('renderEndgame error:', err);
    const listEl = document.getElementById('endgame-list');
    if(listEl){
      listEl.innerHTML = '<li class="endgame-item">未登城リストの描画でエラーが発生しました</li>';
    }
  }
}

function animateEndgameCounter(el, from, to){
  if(from===to){ el.textContent = to; return; }
  const duration = 600;
  const start = performance.now();
  const easeOutCubic = x=>1-Math.pow(1-x,3);
  function tick(now){
    const p = Math.min(1, (now-start)/duration);
    const v = Math.round(from + (to-from)*easeOutCubic(p));
    el.textContent = v;
    if(el && el.parentElement) { el.parentElement.classList.add('boom'); }
    if(p<1){ requestAnimationFrame(tick); }
    else{
      setTimeout(()=>{ if(el && el.parentElement) el.parentElement.classList.remove('boom'); }, 200);
      if(to===0){
        try{
          var endgame = el.closest ? el.closest('#endgame') : null;
          if(endgame){
            endgame.insertAdjacentHTML('beforeend', '<div class="confetti">🎉 コンプリート！ 🎉</div>');
          }
          setTimeout(()=>{
            var endgame2 = el.closest ? el.closest('#endgame') : null;
            if(endgame2){
              var c = endgame2.querySelector('.confetti');
              if(c && c.parentNode) c.parentNode.removeChild(c);
            }
          }, 2000);
        }catch(_){/* noop */}
      }
    }
  }
  requestAnimationFrame(tick);
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
