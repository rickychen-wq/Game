/* ==================================================================
   家庭任務系統 — 共用常數與純函式
   ⚠️ 這是唯一的真實來源（single source of truth）
   index.html / admin.html / stats.html 都讀這裡，
   不要在任何 HTML 內重複定義這些常數或函式。

   刻意使用傳統 script + 全域物件而非 ES module：
   `import` 在 file:// 協定下會被 CORS 擋掉，改用這個寫法才能雙擊本機測試。
   本檔案不得出現任何 Firebase 呼叫，只放純資料與純函式。
================================================================== */
(function (global) {
  'use strict';

  /* ==============================================================
     抽獎
  ============================================================== */
  const TICKET_PRICE = 500;

  const PRIZES = [
    { type:'coin', icon:'🪙', name:'金幣 200',  value:200,           prob:13 },
    { type:'coin', icon:'🪙', name:'金幣 200',  value:200,           prob:13 },
    { type:'coin', icon:'🪙', name:'金幣 200',  value:200,           prob:13 },
    { type:'coin', icon:'🪙', name:'金幣 200',  value:200,           prob:13 },
    { type:'again',icon:'🔄', name:'AGAIN',     value:0,             prob:3.5 },
    { type:'again',icon:'🔄', name:'AGAIN',     value:0,             prob:3.5 },
    { type:'coin', icon:'💰', name:'金幣 1000', value:1000,          prob:1.5 },
    { type:'coin', icon:'💰', name:'金幣 1000', value:1000,          prob:1.5 },
    { type:'mat',  icon:'🟣', name:'紫晶碎片 ×1', key:'purple', n:1,  prob:7.5 },
    { type:'mat',  icon:'🟣', name:'紫晶碎片 ×3', key:'purple', n:3,  prob:3 },
    { type:'mat',  icon:'⬜', name:'長白玉石 ×1', key:'jade',   n:1,  prob:7.5 },
    { type:'mat',  icon:'⬜', name:'長白玉石 ×3', key:'jade',   n:3,  prob:3 },
    { type:'mat',  icon:'🟦', name:'靈青石 ×1',  key:'azure',  n:1,  prob:7.5 },
    { type:'mat',  icon:'🟦', name:'靈青石 ×3',  key:'azure',  n:3,  prob:3 },
    { type:'mat',  icon:'💎', name:'鑽粉 ×1',    key:'dust',   n:1,  prob:5.5 },
    { type:'mat',  icon:'🫧', name:'魂源泉水 ×1', key:'soul',   n:1,  prob:1 },
  ];

  const MAT_IDX  = [8,9,10,11,12,13,14,15];   // 材料格，合計 38%
  const COIN_IDX = [0,1,2,3];                 // 金幣 200 四格，吸收差額
  const MAT_BASE = 38;                        // 材料格基礎合計
  const LUCK_MAX = 2.3;                       // 幸運上限（90 - 38×2.3 = 2.6 > 0）

  const POS = [
    [1,1],[1,2],[1,3],[1,4],[1,5],
    [2,5],[3,5],[4,5],[5,5],
    [5,4],[5,3],[5,2],[5,1],
    [4,1],[3,1],[2,1],
  ];

  const PITY_MAX = 70;          // 第 70 抽保底
  const AGAIN_LIMIT = 10;       // 連續 AGAIN 上限

  const MATERIALS = [
    { key:'purple', icon:'🟣', name:'紫晶碎片', need:5 },
    { key:'jade',   icon:'⬜', name:'長白玉石', need:5 },
    { key:'azure',  icon:'🟦', name:'靈青石',  need:5 },
    { key:'dust',   icon:'💎', name:'鑽粉',    need:2 },
    { key:'soul',   icon:'🫧', name:'魂源泉水', need:2 },
  ];

  const CRAFT_TITLES = [
    { id:'shadow', icon:'🌑', name:'暗影使者', mult:1.1,  prob:52 },
    { id:'ghost',  icon:'👻', name:'幽靈冠王', mult:1.15, prob:30 },
    { id:'sky',    icon:'☁️', name:'蒼天使者', mult:1.2,  prob:15 },
    { id:'chosen', icon:'✨', name:'天選之人', mult:1.5, prob:3 },
  ];

  /* ==============================================================
     稱號商店
  ============================================================== */
  const SHOP_TITLES = [
    // ===== D 級 =====
    { id:'d01', tier:'D', name:'擺爛之王' },
    { id:'d02', tier:'D', name:'睡到自然醒' },
    { id:'d03', tier:'D', name:'三分鐘熱度' },
    { id:'d04', tier:'D', name:'已讀不回' },
    { id:'d05', tier:'D', name:'明天的事明天再說' },
    { id:'d06', tier:'D', name:'沙發長期租戶' },
    { id:'d07', tier:'D', name:'我媽叫我' },
    { id:'d08', tier:'D', name:'隨便啦' },
    { id:'d09', tier:'D', name:'裝忙專家' },
    { id:'d10', tier:'D', name:'廢到笑' },
    // ===== C 級 =====
    { id:'c01', tier:'C', name:'碗盤終結者' },
    { id:'c02', tier:'C', name:'拖地小當家' },
    { id:'c03', tier:'C', name:'手速還行' },
    { id:'c04', tier:'C', name:'假日限定勤勞' },
    { id:'c05', tier:'C', name:'微波爐工程師' },
    { id:'c06', tier:'C', name:'遙控器守護神' },
    { id:'c07', tier:'C', name:'剛好路過' },
    { id:'c08', tier:'C', name:'有做就好' },
    { id:'c09', tier:'C', name:'半夜找食物的人' },
    { id:'c10', tier:'C', name:'一日限定認真' },
    // ===== B 級 =====
    { id:'b01', tier:'B', name:'家務老手' },
    { id:'b02', tier:'B', name:'說到做到' },
    { id:'b03', tier:'B', name:'連續紀錄保持人' },
    { id:'b04', tier:'B', name:'深夜清潔隊' },
    { id:'b05', tier:'B', name:'效率至上' },
    { id:'b06', tier:'B', name:'沒在怕的' },
    { id:'b07', tier:'B', name:'誰都攔不住' },
    // ===== A 級 =====
    { id:'a01', tier:'A', name:'不敗神話' },
    { id:'a02', tier:'A', name:'一擊必殺' },
    { id:'a03', tier:'A', name:'領域展開' },
    { id:'a04', tier:'A', name:'無人能及' },
    { id:'a05', tier:'A', name:'逆風翻盤' },
    // ===== S 級 =====
    { id:'s01', tier:'S', name:'君臨天下' },
    { id:'s02', tier:'S', name:'命運支配者' },
    { id:'s03', tier:'S', name:'萬象歸一' },
  ];

  const TIERS = {
    D:{ luck:1.05, price:500   },
    C:{ luck:1.07, price:1500  },
    B:{ luck:1.10, price:4000  },
    A:{ luck:1.15, price:10000 },
    S:{ luck:1.50, price:30000 },
  };

  /* ==============================================================
     等級與稱號
  ============================================================== */
  function xpThreshold(lv){ return 50 * (lv - 1) * (lv + 2); }
  function levelFromXp(xp){
    let lv = 1;
    while (xp >= xpThreshold(lv + 1)) lv++;
    return lv;
  }

  const TITLES = [
    { lv:1,  name:'見習生' },
    { lv:3,  name:'打工仔' },
    { lv:5,  name:'老手' },
    { lv:7,  name:'家務戰神' },
    { lv:10, name:'傳說 ✨' },
  ];

  function titleFromLevel(lv){
    let t = TITLES[0].name;
    for(const x of TITLES){ if(lv >= x.lv) t = x.name; }
    return t;
  }

  function equippedTitle(p){
    const id = p && p.equippedTitle;
    if(!id) return null;
    const c = CRAFT_TITLES.find(t => t.id === id);
    if(c) return { kind:'craft', id, icon:c.icon, name:c.name, mult:c.mult, luck:1.0 };
    const s = SHOP_TITLES.find(t => t.id === id);
    if(s) return { kind:'shop', id, icon:'', name:s.name, tier:s.tier, mult:1.0, luck:TIERS[s.tier].luck };
    return null;   // 資料裡有不認識的 id → 當沒裝
  }

  /* ==============================================================
     天賦（v1.1 起為永久功能，沒有開關）
  ============================================================== */
  const TALENT_ICON = '🔮';
  const TALENT_NAME = '天賦結晶';
  const TALENT_MAX_LV = 6;
  const RESPEC_COST = 3000;                 // 洗點費用（金幣回收池）
  const TALENT_TREES = [
    { key:'coin', icon:'💰', name:'財富', unit:'任務金幣',
      add:[0, 0.03, 0.06, 0.09, 0.12, 0.15], cost:[5, 10, 15, 20, 25] },   // 全滿 75（永久終極目標，最貴）
    { key:'luck', icon:'🍀', name:'幸運', unit:'抽獎幸運',
      add:[0, 0.05, 0.10, 0.15, 0.20, 0.30], cost:[3,  5, 10, 15, 15] },
    { key:'xp',   icon:'📈', name:'經驗', unit:'任務 XP',
      add:[0, 0.20, 0.40, 0.60, 0.80, 1.00], cost:[5, 10, 15, 15, 20] },   // 全滿 65（只是加速手段）
  ];

  function talentLv(p, key){
    const v = ((p && p.talents) || {})[key];
    return Math.min(TALENT_MAX_LV, Math.max(1, Number(v) || 1));
  }

  function talentSpent(p){
    return TALENT_TREES.reduce((sum,t)=>
      sum + t.cost.slice(0, talentLv(p,t.key) - 1).reduce((a,b)=>a+b, 0), 0);
  }

  function talentEarned(p){
    // Lv.20 以前不給等級點，Lv.21 起每級 1 顆
    const lv = levelFromXp(p?.xp ?? 0);
    return Math.max(0, lv - 20)
         + (((p && p.achievements) || []).length)
         + (p?.bonusTokens ?? 0);
  }

  function talentAvail(p){ return Math.max(0, talentEarned(p) - talentSpent(p)); }

  function talentAdd(p, key){
    const t = TALENT_TREES.find(x=>x.key===key);
    return t ? t.add[talentLv(p,key) - 1] : 0;
  }

  /* ==============================================================
     EP（能量點）：打 Boss 的資源
     xp 永遠只增不減；消耗 EP 只累加 epSpent，不動 xp
     epBonus 專存 Boss 獎勵的 EP，絕對不可以寫進 xp（否則等級與天賦點會暴衝）
  ============================================================== */
  const EP_START_LV = 20;
  function epTotal(p){                       // 累計 EP：Lv.20 之後的 xp 才算
    return Math.max(0, (p?.xp ?? 0) - xpThreshold(EP_START_LV));
  }
  function epAvail(p){
    return Math.max(0, epTotal(p) + (p?.epBonus ?? 0) - (p?.epSpent ?? 0));
  }

  /* ==============================================================
     成就（achAdd 直接用 ACHIEVEMENTS.length，不再有 ACHIEVEMENT_TOTAL）
  ============================================================== */
  const ACHIEVEMENTS = [
    { id:'first_task',  icon:'🐣', name:'第一滴血',   desc:'完成第 1 個任務',      check: s => s.tasksDone >= 1 },
    { id:'task_10',     icon:'💪', name:'勞動模範',   desc:'完成 10 個任務',       check: s => s.tasksDone >= 10 },
    { id:'task_50',     icon:'🏭', name:'血汗工廠',   desc:'完成 50 個任務',       check: s => s.tasksDone >= 50 },
    { id:'earn_500',    icon:'💰', name:'小有積蓄',   desc:'累計賺 500 金幣',      check: s => s.totalEarned >= 500 },
    { id:'earn_2000',   icon:'🤑', name:'小富翁',     desc:'累計賺 2000 金幣',     check: s => s.totalEarned >= 2000 },
    { id:'earn_10000',  icon:'👑', name:'家裡蹲首富', desc:'累計賺 10000 金幣',    check: s => s.totalEarned >= 10000 },
    { id:'first_buy',   icon:'🛍️', name:'剁手初體驗', desc:'第一次購買',           check: s => s.buyCount >= 1 },
    { id:'buy_10',      icon:'💸', name:'月光族',     desc:'購買 10 次',           check: s => s.buyCount >= 10 },
    { id:'hoard_1000',  icon:'🏦', name:'守財奴',     desc:'同時持有 1000 金幣',   check: s => s.coins >= 1000 },
    { id:'grab_king',   icon:'⚡', name:'手速之王',   desc:'搶到 10 個開放任務',   check: s => s.tasksGrabbed >= 10 },
    { id:'streak_7',    icon:'🔥', name:'燃燒吧',     desc:'任一每日任務連續達成 7 天', check: s => s.maxStreak >= 7 },
    { id:'lottery_30',  icon:'🎰', name:'賭場常客',   desc:'抽獎 30 次',           check: s => s.lotteryCount >= 30 },
    { id:'lv_20',       icon:'🏅', name:'資深工人',   desc:'等級達到 Lv.20',       check: s => s.level >= 20 },
    { id:'lv_30',       icon:'💎', name:'家務大師',   desc:'等級達到 Lv.30',       check: s => s.level >= 30 },
    { id:'clean_30',    icon:'😇', name:'清白之身',   desc:'連續 30 天沒有任何罰單', check: s => s.cleanDays >= 30 },
  ];

  /* ==============================================================
     活動：內容寫死，開關與期限存在 config/system.events
  ============================================================== */
  const EVENTS = [
    { key:'doubleCoin', icon:'🪙', name:'雙倍金幣日', ef:'任務金幣加成 +100%',       type:'coin',  add:1.0 },
    { key:'xpFest',     icon:'📈', name:'經驗祭',     ef:'任務 XP 加成 +100%',        type:'xp',    add:1.0 },
    { key:'luckyDay',   icon:'🍀', name:'幸運日',     ef:'抽獎幸運 +30%',             type:'luck',  add:0.3 },
    { key:'tokenBoost', icon:'🔮', name:'結晶加碼',   ef:'每完成一個任務多 1 顆結晶', type:'token', add:0 },
    { key:'saleTicket', icon:'🎰', name:'抽獎特賣',   ef:'抽獎券 500 → 350',          type:'sale',  add:0 },
    { key:'doubleDmg',  icon:'⚔️', name:'雙倍傷害日', ef:'打 Boss 傷害 ×2',           type:'dmg',   add:1.0 },
  ];
  const SALE_TICKET_PRICE = 350;

  /* 執行期狀態：由各檔案從 Firestore 讀到 config/system 後注入 */
  let runtime = { events:{} };
  function setRuntime(next){ runtime = Object.assign({}, runtime, next || {}); }
  function getRuntime(){ return runtime; }

  /* 進行中判定：on 為 true 且（沒設期限 或 還沒到期）→ 到期自動失效，不需清理 */
  function eventOn(key){
    const c = (runtime.events || {})[key];
    if(!c || c.on !== true) return false;
    if(!c.until) return true;
    const t = new Date(c.until).getTime();
    return isNaN(t) ? true : Date.now() < t;
  }
  /* 已開啟但已過期 → 面板要提醒關閉 */
  function eventExpired(key){
    const c = (runtime.events || {})[key];
    if(!c || c.on !== true || !c.until) return false;
    const t = new Date(c.until).getTime();
    return !isNaN(t) && Date.now() >= t;
  }
  function activeEvents(){ return EVENTS.filter(e => eventOn(e.key)); }
  function eventAdd(type){
    return EVENTS.filter(e => e.type === type && eventOn(e.key))
                 .reduce((a,b) => a + b.add, 0);
  }
  function eventUntil(key){ return ((runtime.events || {})[key] || {}).until || null; }
  /* 券價：特賣期間 350，購買 transaction 內必須重新呼叫取當下價 */
  function ticketPrice(){ return eventOn('saleTicket') ? SALE_TICKET_PRICE : TICKET_PRICE; }

  /* ==============================================================
     卡牌系統（數值已經過 30 天 × 120 種雙卡組合模擬驗證，不要自行調整）
  ============================================================== */
  const PACKS = [
    { id:'onepiece', name:'海賊王',     role:'重擊型：EP 貴、CD 長、單發大' },
    { id:'haikyu',   name:'排球少年',   role:'連擊型：EP 便宜、CD 短，負責倒空 EP' },
    { id:'naruto',   name:'火影忍者',   role:'持續型：大招是 DOT，分 10 小時給傷害' },
    { id:'kuroko',   name:'影子籃球員', role:'機制型：帶增益效果' },
  ];
  const RARITIES = [
    { id:'S', prob:3,  color:'#f7e3a1' },
    { id:'A', prob:17, color:'#c9a0ff' },
    { id:'B', prob:35, color:'#5aa9ff' },
    { id:'C', prob:45, color:'#8a8f9e' },
  ];
  // 卡包等級：傷害倍率只影響傷害，EP 與 CD 完全不變
  const PACK_TIERS = [
    { id:'normal',  name:'普通', prob:70,  price:500,  mult:1.0, color:'#8a8f9e' },
    { id:'gold',    name:'黃金', prob:22,  price:750,  mult:1.3, color:'#e9c46a' },
    { id:'diamond', name:'鑽石', prob:7.5, price:1250, mult:1.7, color:'#5ff0dc' },
    { id:'rainbow', name:'彩虹', prob:0.5, price:2500, mult:2.5, color:'#ff8fd4' },
  ];
  const TIER_ORDER = ['normal','gold','diamond','rainbow'];
  const PACK_PITY_MAX = 30;          // 30 包保底必出 S
  const EQUIP_MAX = 2;               // 最多裝 2 張
  const EQUIP_LOCK_MS = 12 * 3600000;// 卸下後 12 小時不能裝
  const BUFF_MULT = 1.35;            // 幻影傳球：下一個傷害技能 +35%
  const ZONE_MULT = 1.35;            // ZONE：8 小時內所有技能 +35%
  const ZONE_MS   = 8 * 3600000;
  const DOT_HOURS = 10;              // DOT 傷害分 10 小時平均給

  const CARDS = [
    // ===== 海賊王 onepiece =====
    { id:'luffy',      pack:'onepiece', rar:'S', name:'魯夫',   skills:[
       { id:'gatling', name:'橡膠機關槍',      ep:160, dmg:240, cd:6,  sp:null },
       { id:'elephant',name:'象槍',            ep:240, dmg:480, cd:12, sp:null }]},
    { id:'zoro',       pack:'onepiece', rar:'A', name:'索隆',   skills:[
       { id:'onigiri', name:'三刀流·鬼斬',     ep:150, dmg:195, cd:5,  sp:null },
       { id:'sanzen',  name:'一大三千世界',     ep:220, dmg:374, cd:12, sp:null }]},
    { id:'sanji',      pack:'onepiece', rar:'B', name:'香吉士', skills:[
       { id:'diable',  name:'惡魔風腳',        ep:140, dmg:168, cd:4,  sp:null },
       { id:'shishi',  name:'肉叉燒',          ep:200, dmg:300, cd:10, sp:null }]},
    { id:'nami',       pack:'onepiece', rar:'C', name:'娜美',   skills:[
       { id:'thunder', name:'天候棒·雷電',     ep:120, dmg:120, cd:3,  sp:null },
       { id:'tornado', name:'颶風龍捲',        ep:180, dmg:234, cd:9,  sp:null }]},
    // ===== 排球少年 haikyu =====
    { id:'hinata',     pack:'haikyu',   rar:'S', name:'日向',   skills:[
       { id:'quick',   name:'極速快攻',        ep:60,  dmg:78,  cd:1,  sp:null },
       { id:'varquick',name:'變速快攻',        ep:120, dmg:192, cd:5,  sp:null }]},
    { id:'kageyama',   pack:'haikyu',   rar:'A', name:'影山',   skills:[
       { id:'setter',  name:'王者托球',        ep:60,  dmg:66,  cd:1,  sp:null },
       { id:'jumpserve',name:'跳躍發球',       ep:110, dmg:154, cd:5,  sp:null }]},
    { id:'oikawa',     pack:'haikyu',   rar:'B', name:'及川',   skills:[
       { id:'serve',   name:'精準發球',        ep:50,  dmg:50,  cd:1,  sp:null },
       { id:'control', name:'全場調度',        ep:100, dmg:120, cd:4,  sp:null }]},
    { id:'tsukishima', pack:'haikyu',   rar:'C', name:'月島',   skills:[
       { id:'read',    name:'讀球攔網',        ep:50,  dmg:45,  cd:1,  sp:null },
       { id:'triple',  name:'三枚攔網',        ep:90,  dmg:99,  cd:4,  sp:null }]},
    // ===== 火影 naruto（大招為 DOT，總傷分 10 小時給）=====
    { id:'naruto',     pack:'naruto',   rar:'S', name:'鳴人',   skills:[
       { id:'rasengan',name:'螺旋丸',          ep:150, dmg:225, cd:5,  sp:null },
       { id:'shuriken',name:'螺旋手裏劍',      ep:250, dmg:500, cd:14, sp:'DOT' }]},
    { id:'sasuke',     pack:'naruto',   rar:'A', name:'佐助',   skills:[
       { id:'chidori', name:'千鳥',            ep:140, dmg:182, cd:5,  sp:null },
       { id:'amaterasu',name:'天照',           ep:230, dmg:390, cd:14, sp:'DOT' }]},
    { id:'kakashi',    pack:'naruto',   rar:'B', name:'卡卡西', skills:[
       { id:'raikiri', name:'雷切',            ep:130, dmg:156, cd:4,  sp:null },
       { id:'kamui',   name:'神威',            ep:210, dmg:320, cd:12, sp:'DOT' }]},
    { id:'sakura',     pack:'naruto',   rar:'C', name:'小櫻',   skills:[
       { id:'shannaro',name:'櫻花衝',          ep:110, dmg:110, cd:3,  sp:null },
       { id:'byakugo', name:'百豪之術',        ep:180, dmg:230, cd:12, sp:'DOT' }]},
    // ===== 影子籃球員 kuroko =====
    { id:'akashi',     pack:'kuroko',   rar:'S', name:'赤司',   skills:[
       { id:'emperor', name:'天帝之眼',        ep:100, dmg:150, cd:8,  sp:null },
       { id:'ankle',   name:'皇帝式腳踝終結者', ep:230, dmg:414, cd:12, sp:null }]},
    { id:'aomine',     pack:'kuroko',   rar:'A', name:'青峰',   skills:[
       { id:'formless',name:'無形式射球',      ep:130, dmg:169, cd:4,  sp:null },
       { id:'zone',    name:'ZONE',           ep:120, dmg:0,   cd:14, sp:'ZONE' }]},
    { id:'kagami',     pack:'kuroko',   rar:'B', name:'火神',   skills:[
       { id:'meteor',  name:'流星灌籃',        ep:160, dmg:192, cd:5,  sp:null },
       { id:'alleyoop',name:'空中接力',        ep:90,  dmg:99,  cd:2,  sp:null }]},
    { id:'kuroko',     pack:'kuroko',   rar:'C', name:'黑子',   skills:[
       { id:'phantom', name:'幻影傳球',        ep:50,  dmg:0,   cd:3,  sp:'BUFF' },
       { id:'ignite',  name:'幻影射球',        ep:80,  dmg:80,  cd:2,  sp:null }]},
  ];

  const cardById  = id => CARDS.find(c => c.id === id) || null;
  const packById  = id => PACKS.find(p => p.id === id) || null;
  const tierById  = id => PACK_TIERS.find(t => t.id === id) || PACK_TIERS[0];
  const skillOf   = (cardId, skillId) => (cardById(cardId)?.skills || []).find(s => s.id === skillId) || null;
  // packId + 稀有度 → 唯一一張卡
  const cardOfPack = (packId, rar) => CARDS.find(c => c.pack === packId && c.rar === rar) || null;
  // 等級序比較：只有更好才覆蓋
  const tierBetter = (a, b) => TIER_ORDER.indexOf(a) > TIER_ORDER.indexOf(b);

  /* 加權抽選 */
  function pickWeighted(list, probKey){
    const total = list.reduce((a,b)=> a + b[probKey], 0);
    let r = Math.random() * total;
    for(const item of list){ r -= item[probKey]; if(r < 0) return item; }
    return list[list.length - 1];
  }
  function rollRarity(pity){
    if((pity ?? 0) >= PACK_PITY_MAX - 1) return 'S';       // 第 30 包保底
    return pickWeighted(RARITIES, 'prob').id;
  }
  function rollTier(){ return pickWeighted(PACK_TIERS, 'prob').id; }

  /* 活動：打 Boss 傷害倍率 */
  function dmgMult(){ return 1 + eventAdd('dmg'); }

  /* 實際傷害 = 基礎 × 等級倍率 × BUFF × ZONE × 活動 */
  function skillDamage(base, tierId, opts){
    const o = opts || {};
    let d = base * tierById(tierId).mult;
    if(o.buff) d *= BUFF_MULT;
    if(o.zone) d *= ZONE_MULT;
    d *= (o.dmgMult ?? dmgMult());
    return Math.round(d);
  }

  /* ==============================================================
     Boss（1-10 關 HP 已刻意翻倍；11 關以後之後再往陣列加元素即可）
  ============================================================== */
  const BOSSES = [
    { id:'boss01', name:'巴基',       from:'海賊王',   hp: 5400, coin:300, token:1, ticket:1, ep:300  },
    { id:'boss02', name:'再不斬',     from:'火影忍者', hp: 8000, coin:300, token:1, ticket:1, ep:350  },
    { id:'boss03', name:'阿龍',       from:'海賊王',   hp: 9200, coin:350, token:1, ticket:1, ep:400  },
    { id:'boss04', name:'大蛇丸',     from:'火影忍者', hp:11000, coin:350, token:1, ticket:1, ep:500  },
    { id:'boss05', name:'克洛克達爾', from:'海賊王',   hp:13000, coin:350, token:1, ticket:1, ep:550  },
    { id:'boss06', name:'猗窩座',     from:'鬼滅之刃', hp:15600, coin:400, token:1, ticket:1, ep:650  },
    { id:'boss07', name:'宇智波鼬',   from:'火影忍者', hp:17600, coin:450, token:1, ticket:1, ep:750  },
    { id:'boss08', name:'童磨',       from:'鬼滅之刃', hp:21200, coin:500, token:1, ticket:1, ep:950  },
    { id:'boss09', name:'佩恩',       from:'火影忍者', hp:24800, coin:600, token:2, ticket:2, ep:1100 },
    { id:'boss10', name:'多佛朗明哥', from:'海賊王',   hp:28600, coin:600, token:2, ticket:2, ep:1500 },
  ];
  /* ===== 攻擊時段：每個整點的 00~15 分才能打 Boss =====
     用 windowId 比對取代小時制 CD，不需要任何倒數就能判斷「這時段用過沒」 */
  const ATTACK_WINDOW_MIN = 15;
  const windowId = (t) => Math.floor((t ?? Date.now()) / 3600000);
  function inAttackWindow(t){
    const d = new Date(t ?? Date.now());
    return d.getMinutes() < ATTACK_WINDOW_MIN;
  }
  // 時段內 → 距離時段結束；時段外 → 距離下個整點
  function windowEdge(t){
    const now = t ?? Date.now();
    const d = new Date(now);
    const top = new Date(d); top.setMinutes(0,0,0);          // 本小時整點
    return inAttackWindow(now)
      ? top.getTime() + ATTACK_WINDOW_MIN*60000              // 時段結束時刻
      : top.getTime() + 3600000;                             // 下個整點
  }
  const skillKey = (cardId, sid) => cardId + '.' + sid;
  // 這個技能在「目前時段」用過沒（舊的 skillReady 欄位不再讀寫）
  function castUsed(boss, cardId, sid, t){
    const m = (boss && boss.lastCastWindow) || {};
    return m[skillKey(cardId, sid)] === windowId(t);
  }

  const MILESTONES = [75, 50, 25];        // 血量里程碑，各給該關 coin 的 20%
  const bossOfStage = stage => BOSSES[(stage || 1) - 1] || null;   // 超出陣列 → null（已通關全部）
  const bossImg = stage => 'assets/bosses/boss' + String(stage).padStart(2,'0') + '.png';

  /* ==============================================================
     加法池：總倍率 = 1 + 成就 + 稱號 + 天賦 + 活動
  ============================================================== */
  const r3 = n => Math.round(n * 1000) / 1000;

  function achAdd(p){
    return (((p && p.achievements) || []).length >= ACHIEVEMENTS.length) ? 0.1 : 0;
  }

  function titleCoinAdd(p){ return r3((equippedTitle(p)?.mult || 1) - 1); }
  function titleLuckAdd(p){ return r3((equippedTitle(p)?.luck || 1) - 1); }

  function coinMultOf(p){ return r3(1 + achAdd(p) + titleCoinAdd(p) + talentAdd(p,'coin') + eventAdd('coin')); }
  function xpMultOf(p){   return r3(1 + achAdd(p) + titleCoinAdd(p) + talentAdd(p,'xp')   + eventAdd('xp')); }
  function luckOf(p){     return r3(1 + titleLuckAdd(p) + talentAdd(p,'luck') + eventAdd('luck')); }

  /* ==============================================================
     抽獎權重（抽獎與機率公示共用）
  ============================================================== */
  function getWeights(luck){
    const L = Math.max(1, Math.min(LUCK_MAX, Number(luck) || 1));
    const w = PRIZES.map(p => p.prob);
    MAT_IDX.forEach(i => { w[i] = PRIZES[i].prob * L; });
    const coinTotal = 90 - MAT_BASE * L;              // 200 四格總機率
    COIN_IDX.forEach(i => { w[i] = coinTotal / COIN_IDX.length; });
    // 浮點誤差補回索引 0，確保加權抽獎不漏邊界
    const sum = w.reduce((a,b)=>a+b, 0);
    w[0] += 100 - sum;
    return w;
  }

  /* ==============================================================
     台灣日期
  ============================================================== */
  function todayKey(){
    return new Date().toLocaleDateString('en-CA', { timeZone:'Asia/Taipei' });
  }

  function prevKey(dateKey){
    return new Date(new Date(dateKey).getTime() - 86400000).toISOString().slice(0,10);
  }

  /* ============================================================== */
  global.GAME = {
    // 抽獎
    TICKET_PRICE, SALE_TICKET_PRICE, PRIZES, MAT_IDX, COIN_IDX, MAT_BASE, LUCK_MAX,
    POS, PITY_MAX, AGAIN_LIMIT, MATERIALS, CRAFT_TITLES, getWeights,
    // 稱號
    SHOP_TITLES, TIERS, TITLES, titleFromLevel, equippedTitle,
    // 等級
    xpThreshold, levelFromXp,
    // 天賦
    TALENT_ICON, TALENT_NAME, TALENT_MAX_LV, RESPEC_COST, TALENT_TREES,
    talentLv, talentSpent, talentEarned, talentAvail, talentAdd,
    // 成就
    ACHIEVEMENTS,
    // EP
    EP_START_LV, epTotal, epAvail,
    // 卡牌
    PACKS, RARITIES, PACK_TIERS, TIER_ORDER, PACK_PITY_MAX, CARDS,
    EQUIP_MAX, EQUIP_LOCK_MS, BUFF_MULT, ZONE_MULT, ZONE_MS, DOT_HOURS,
    cardById, packById, tierById, skillOf, cardOfPack, tierBetter,
    pickWeighted, rollRarity, rollTier, skillDamage, dmgMult,
    // Boss
    BOSSES, MILESTONES, bossOfStage, bossImg,
    ATTACK_WINDOW_MIN, windowId, inAttackWindow, windowEdge, skillKey, castUsed,
    // 活動
    EVENTS, setRuntime, getRuntime, eventOn, eventExpired, eventAdd, eventUntil,
    activeEvents, ticketPrice,
    // 加法池
    r3, achAdd, titleCoinAdd, titleLuckAdd, coinMultOf, xpMultOf, luckOf,
    // 日期
    todayKey, prevKey,
  };
})(window);
