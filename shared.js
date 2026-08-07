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
  /* ⚠️ 改動 shared.js 之後，這個數字和四個 HTML 的 ?v= 都要一起 +1。
     不然瀏覽器會沿用舊的 shared.js，新函式全部 undefined，畫面直接變白。 */
  const SHARED_VERSION = 7;
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
      add:[0, 0.03, 0.06, 0.09, 0.12, 0.15], cost:[5, 10, 15, 35, 115] },  // 全滿 180（永久終極目標，最貴）
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
    { id:'coop_10',     icon:'🤝', name:'最佳拍檔',   desc:'完成 10 個合作任務',   check: s => s.coopDone >= 10 },
    { id:'streak_7',    icon:'🔥', name:'燃燒吧',     desc:'任一每日任務連續達成 7 天', check: s => s.maxStreak >= 7 },
    { id:'lottery_30',  icon:'🎰', name:'賭場常客',   desc:'抽獎 30 次',           check: s => s.lotteryCount >= 30 },
    { id:'lv_20',       icon:'🏅', name:'資深工人',   desc:'等級達到 Lv.20',       check: s => s.level >= 20 },
    { id:'lv_30',       icon:'💎', name:'家務大師',   desc:'等級達到 Lv.30',       check: s => s.level >= 30 },
    { id:'clean_30',    icon:'😇', name:'清白之身',   desc:'連續 30 天沒有任何罰單', check: s => s.cleanDays >= 30 },
  ];

  /* ==============================================================
     管理員臨時活動（與常態 EVENTS 分開：以分鐘計、可疊加）
     ⚠️ 泉水活動不能走現有 luck 公式：
        現有公式材料總計 38×L 由金幣200四格(52%)吸收，L 最大只到 2.37，
        ×4 以上會產生負機率。所以泉水活動只放大魂源那一格。
  ============================================================== */
  const SOUL_IDX = 15;                    // 魂源泉水在 PRIZES 的索引
  const ADMIN_EVENTS = [
    { id:'luck2', icon:'🍀', name:'幸運 ×2', ef:'所有材料格機率 ×2', luck:2,   soul:1 },
    { id:'soul4', icon:'🫧', name:'泉水 ×4', ef:'魂源泉水機率 ×4',   luck:1,   soul:4 },
    { id:'soul6', icon:'🫧', name:'泉水 ×6', ef:'魂源泉水機率 ×6',   luck:1,   soul:6 },
    { id:'soul8', icon:'🫧', name:'泉水 ×8', ef:'魂源泉水機率 ×8',   luck:1,   soul:8 },
  ];
  const ADMIN_DURATIONS = [5, 10, 15, 30];          // 分鐘
  const adminEventById = id => ADMIN_EVENTS.find(e => e.id === id) || null;

  // 生效判定：id 存在且未到期 → 到期自動失效，不需清理
  function adminEventOn(){
    const a = runtime.adminEvent;
    if(!a || !a.id) return null;
    if(!(Date.now() < (a.until || 0))) return null;
    return adminEventById(a.id);
  }
  const adminEventUntil = () => (runtime.adminEvent || {}).until || 0;
  const adminLuck = () => adminEventOn()?.luck || 1;
  const adminSoul = () => adminEventOn()?.soul || 1;

  /* 管理員版權重：先套一般幸運，再單獨放大魂源
     AGAIN(7%) 與金幣1000(3%) 永遠不動；差額只由金幣200四格吸收 */
  function getWeightsAdmin(luck, soulMult){
    const w = getWeights(luck);
    const m = Number(soulMult) || 1;
    if(m > 1){
      const extra = w[SOUL_IDX] * (m - 1);
      w[SOUL_IDX] += extra;
      const per = extra / COIN_IDX.length;
      COIN_IDX.forEach(j => { w[j] -= per; });
    }
    // 防呆：任一格為負 → clamp 到 0，缺口從最大的那格補回
    let deficit = 0;
    for(let i = 0; i < w.length; i++){
      if(w[i] < 0){ deficit += -w[i]; w[i] = 0; }
    }
    if(deficit > 0){
      let big = 0;
      for(let i = 1; i < w.length; i++) if(w[i] > w[big]) big = i;
      w[big] = Math.max(0, w[big] - deficit);
    }
    // 浮點誤差補回索引 0，確保加總為 100
    const sum = w.reduce((a,b) => a + b, 0);
    w[0] += 100 - sum;
    if(w[0] < 0){                       // 極端情況：索引 0 被補成負數
      const need = -w[0];
      w[0] = 0;
      let big = 1;
      for(let i = 1; i < w.length; i++) if(w[i] > w[big]) big = i;
      w[big] = Math.max(0, w[big] - need);
    }
    return w;
  }
  // 目前實際生效的權重（抽獎與機率公示共用）
  function currentWeights(p){
    const base = luckOf(p) * adminLuck();
    return getWeightsAdmin(base, adminSoul());
  }

  /* ==============================================================
     合作任務（取代原本的「開放搶」）
     所有成員各自回報 → 全員完成才進審核 → 通過時每人各拿全額（各自倍率）
  ============================================================== */
  const COOP_ASSIGNEE = 'coop';
  const REPORT_COOLDOWN_MS = 24 * 3600000;   // 同任務同舉報人 24 小時只能舉報一次
  const REPORT_MIN_LEN = 5;                  // 舉報理由最少字數

  // 舊的 assignee:'all' 一律視為合作任務，不讓它們變孤兒
  const isCoop = t => !!t && (t.assignee === COOP_ASSIGNEE || t.assignee === 'all');
  // 成員名單：以任務建立當下的快照為準；舊任務沒有快照就用傳入的現有玩家
  function coopMembers(t, fallbackIds){
    const m = t && t.coopMembers;
    return (Array.isArray(m) && m.length) ? m : (fallbackIds || []);
  }
  const coopDoneBy = (t, id) => !!((t && t.coopDone) || {})[id];
  function coopProgress(t, fallbackIds){
    const ids = coopMembers(t, fallbackIds);
    const done = ids.filter(id => coopDoneBy(t, id));
    return { ids, done, total: ids.length, allDone: ids.length > 0 && done.length === ids.length };
  }
  // 舉報冷卻：同一任務、同一舉報人 24 小時內只能一次
  function canReport(t, byId, now){
    const r = t && t.coopReport;
    if(!r) return true;
    if(r.status === 'pending') return false;              // 已有進行中的舉報
    if(r.by !== byId) return true;
    const at = r.at?.toMillis ? r.at.toMillis() : (r.at || 0);
    return (now ?? Date.now()) - at >= REPORT_COOLDOWN_MS;
  }

  /* ==============================================================
     每週排行：週次計算（以台灣時間週一 00:00 為一週開始）
  ============================================================== */
  // 取台灣時間的年月日（避免裝置時區影響）
  function tpeParts(d){
    const s = (d || new Date()).toLocaleDateString('en-CA', { timeZone:'Asia/Taipei' });
    return s;                                   // 'YYYY-MM-DD'
  }
  // 台灣時間的星期幾（0=日 ... 6=六）
  function tpeDay(d){
    const s = (d || new Date()).toLocaleDateString('en-US', { timeZone:'Asia/Taipei', weekday:'short' });
    return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(s);
  }
  // 該日期所屬那一週的週一（'YYYY-MM-DD'）
  function weekKey(d){
    const key = tpeParts(d);
    const dow = tpeDay(d);                       // 0=日
    const back = (dow === 0) ? 6 : dow - 1;      // 週日算成上一個週一（往回 6 天）
    const t = new Date(key + 'T00:00:00Z').getTime() - back * 86400000;
    return new Date(t).toISOString().slice(0,10);
  }
  function prevWeekKey(d){
    const t = new Date(weekKey(d) + 'T00:00:00Z').getTime() - 7 * 86400000;
    return new Date(t).toISOString().slice(0,10);
  }
  // 本週結束時刻（下週一 00:00 台灣時間）的毫秒時間戳
  function weekEndAt(d){
    const t = new Date(weekKey(d) + 'T00:00:00+08:00').getTime();
    return t + 7 * 86400000;
  }
  // 顯示用：'7/20 - 7/26'
  function weekRangeTxt(wk){
    const a = new Date(wk + 'T00:00:00Z');
    const b = new Date(a.getTime() + 6 * 86400000);
    const f = x => `${x.getUTCMonth()+1}/${x.getUTCDate()}`;
    return `${f(a)} - ${f(b)}`;
  }
  const WEEKLY_BOARDS = [
    { key:'earned', icon:'📈', name:'累計賺到' },
    { key:'boss',   icon:'⚔️', name:'Boss 進度' },
    { key:'tasks',  icon:'✅', name:'完成任務' },
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
  /* 全圖卡專屬稀有度。⚠️ 絕對不可以放進 RARITIES ——
     RARITIES 是 rollRarity() 的抽卡池，放進去卡包就會直接開出全圖卡 */
  const FULL_RAR  = 'X';
  const RARITY_X  = { id:'X', name:'全圖', color:'#ff8c42' };
  const rarColorOf = r => r === FULL_RAR ? RARITY_X.color
                        : ((RARITIES.find(x => x.id === r) || RARITIES[3]).color);
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
  const DOT_MAX_STACK = 3;           // 同時最多 3 層 DOT
                                     // （不設限的話 10 小時內可疊 20 層，Boss 會被掛機輾過去）

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
    /* ===== 全圖卡（rar:'X'）=====
       只能用 CRAFT_SLOTS 合成取得，不會從任何卡包開出。
       數值 = 該卡包 S 卡 × 倍率，倍率各包不同是為了把「傷害/EP 效率」拉平到 6.0：
         海賊王 ×3.0（基準）／火影 ×3.0（DOT 有 3 層上限，吞吐已被壓低）
         黑籃   ×3.4        ／排球 ×3.8（原本 S 卡效率最低，不補會變下位卡） */
    { id:'strawhat',  pack:'onepiece', rar:'X', name:'草帽一夥', skills:[
       { id:'haoshoku',   name:'霸王色衝擊',      ep:160, dmg:720,  cd:6,  sp:null },
       { id:'onigashima', name:'萬國突入·總攻擊', ep:240, dmg:1440, cd:12, sp:null }]},
    { id:'karasuno',  pack:'haikyu',   rar:'X', name:'烏野高校', skills:[
       { id:'synchro',    name:'同步速攻連鎖',    ep:60,  dmg:296,  cd:1,  sp:null },
       { id:'fly',        name:'飛翔吧，烏野！',  ep:120, dmg:730,  cd:5,  sp:null }]},
    { id:'konoha',    pack:'naruto',   rar:'X', name:'木葉聯合', skills:[
       { id:'kagebunshin',name:'影分身千人斬',    ep:150, dmg:675,  cd:5,  sp:null },
       { id:'bijudama',   name:'尾獸玉齊射',      ep:250, dmg:1500, cd:14, sp:'DOT' }]},
    { id:'kiseki',    pack:'kuroko',   rar:'X', name:'奇蹟世代', skills:[
       { id:'muga',       name:'無我的境界',      ep:100, dmg:510,  cd:8,  sp:null },
       // sp:'DMGZONE' = 打傷害的同時開 ZONE（青峰的 ZONE 是純增益、0 傷害，這個不一樣）
       { id:'allstar',    name:'ZONE全開·全明星', ep:230, dmg:1408, cd:12, sp:'DMGZONE' }]},
  ];

  /* ===== 卡包券分等級（v2.0 起）=====
     資料結構：packTickets = { normal:n, gold:n, diamond:n, rainbow:n }
     舊資料是純數字 → 一律視為普通券，不會消失 */
  function packTicketsOf(p){
    const t = (p && p.packTickets);
    if(typeof t === 'number') return { normal: t, gold:0, diamond:0, rainbow:0 };   // 舊資料相容
    const m = t || {};
    return {
      normal:  m.normal  || 0, gold:    m.gold    || 0,
      diamond: m.diamond || 0, rainbow: m.rainbow || 0,
    };
  }
  const packTicketTotal = p => TIER_ORDER.reduce((a,k)=> a + packTicketsOf(p)[k], 0);

  /* Boss 擊破發的券：等級用機率決定（與卡包商店的出現率不同，這是專屬機率） */
  const BOSS_TICKET_ODDS = [
    { id:'normal',  prob:75 },
    { id:'gold',    prob:15 },
    { id:'diamond', prob:9  },
    { id:'rainbow', prob:1  },
  ];
  function rollBossTicketTier(){
    const r = Math.random() * 100;
    let acc = 0;
    for(const t of BOSS_TICKET_ODDS){ acc += t.prob; if(r < acc) return t.id; }
    return 'normal';
  }

  /* ==============================================================
     卡片各等級張數（v2.1 起）
     結構：cards[id] = { tier:'rainbow', count:6, counts:{normal:3,gold:1,diamond:1,rainbow:1} }
       tier  = 目前最高等級（傷害計算用，保留不動）
       count = 總張數（保留不動）
       counts= 各等級張數（新增，未來合成系統要用）
     舊資料沒有 counts → 用 migrateCounts 推算，不會遺失張數
  ============================================================== */
  // 舊資料轉換：從最高等級往下每級各 1 張，分完還有剩就全塞最高等級
  //   彩虹×2 → 彩虹1 鑽石1
  //   鑽石×3 → 鑽石1 黃金1 普通1
  //   黃金×3 → 黃金2 普通1（逐級分完剩 1 張 → 塞回最高）
  function migrateCounts(tier, count){
    const out = { normal:0, gold:0, diamond:0, rainbow:0 };
    const top = Math.max(0, TIER_ORDER.indexOf(tier));
    let left = Math.max(0, Number(count) || 0);
    if(!left) return out;
    for(let i = top; i >= 0 && left > 0; i--){    // 由高往低各發 1 張
      out[TIER_ORDER[i]] += 1;
      left--;
    }
    if(left > 0) out[TIER_ORDER[top]] += left;    // 還有剩 → 全給最高等級
    return out;
  }
  // 取得各等級張數（沒有 counts 就即時推算，不寫回 DB）
  function cardCounts(owned){
    if(!owned) return { normal:0, gold:0, diamond:0, rainbow:0 };
    const c = owned.counts;
    if(c && typeof c === 'object'){
      return { normal:c.normal||0, gold:c.gold||0, diamond:c.diamond||0, rainbow:c.rainbow||0 };
    }
    return migrateCounts(owned.tier || 'normal', owned.count || 1);
  }
  const cardCountTotal = owned => TIER_ORDER.reduce((a,k)=> a + cardCounts(owned)[k], 0);

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

  /* ==============================================================
     全圖卡合成
     配方：同一個卡包的 2C + 2B + 1A + 1S（共 6 張）+ 材料 + 金幣
     成品等級：每一格自帶權重，抽中哪一格 → 成品等級 = 那一格「投入的卡片等級」
       例：2 張 C 都餵彩虹、其餘餵普通
           → 彩虹 10+10 = 20%，普通 10+10+25+35 = 80%
     這不是平均值，是加權抽籤，所以變異度大（刻意的：要有賭博感）
  ============================================================== */
  const CRAFT_SLOTS = [
    { key:'c1', rar:'C', w:10 },
    { key:'c2', rar:'C', w:10 },
    { key:'b1', rar:'B', w:10 },
    { key:'b2', rar:'B', w:10 },
    { key:'a1', rar:'A', w:25 },
    { key:'s1', rar:'S', w:35 },
  ];
  const CRAFT_COIN = 1500;                 // 合成金幣花費

  /* 合成材料。之後要加第三種，只要在這裡加一行，三個檔案的 UI 都會自動長出來 */
  const CRAFT_MATS = [
    { id:'key',   icon:'🔑', name:'金鑰' },
    { id:'shard', icon:'🧩', name:'碎片' },
  ];
  const CRAFT_MAT_COST = { key:1, shard:1 };   // 一次合成消耗

  /* 任務附贈品：目前等於合成材料，但保留 path 讓之後能附贈別種東西
     （例如 { id:'token', icon:'🔮', name:'結晶', path:'bonusTokens' }） */
  const TASK_EXTRAS = CRAFT_MATS.map(m => ({ ...m, path: 'craftMats.' + m.id }));
  const extraById   = id => TASK_EXTRAS.find(x => x.id === id) || null;

  /* 從 task/template 取出乾淨的附贈清單：只留認得的 id 且數量 > 0 */
  function extrasOf(t){
    const raw = (t && t.extras) || {}, out = {};
    TASK_EXTRAS.forEach(d => { const n = Math.floor(Number(raw[d.id]) || 0); if(n > 0) out[d.id] = n; });
    return out;
  }
  const extrasTotal = ex => Object.values(extrasOf({ extras: ex })).reduce((a, b) => a + b, 0);
  function extrasText(ex){
    const o = extrasOf({ extras: ex });
    return TASK_EXTRAS.filter(d => o[d.id]).map(d => `${d.icon}×${o[d.id]}`).join(' ');
  }

  /* 玩家持有的合成材料（舊資料沒有 craftMats 欄位 → 一律補 0） */
  function craftMatsOf(p){
    const m = (p && p.craftMats) || {}, out = {};
    CRAFT_MATS.forEach(d => out[d.id] = Math.max(0, Math.floor(Number(m[d.id]) || 0)));
    return out;
  }
  const craftMatEnough = p => {
    const have = craftMatsOf(p);
    return CRAFT_MATS.every(d => have[d.id] >= (CRAFT_MAT_COST[d.id] || 0));
  };

  /* 各卡包的全圖卡 */
  const fullCardOf = packId => CARDS.find(c => c.pack === packId && c.rar === FULL_RAR) || null;
  const isFullCard = id => (cardById(id) || {}).rar === FULL_RAR;

  /* pick = { c1:'gold', c2:'normal', b1:..., b2:..., a1:..., s1:... }
     回傳各等級的百分比（總和 100，前提是六格都填滿） */
  function craftTierOdds(pick){
    const out = {};
    TIER_ORDER.forEach(t => out[t] = 0);
    CRAFT_SLOTS.forEach(s => {
      const t = (pick || {})[s.key];
      if(t && out[t] !== undefined) out[t] += s.w;
    });
    return out;
  }
  /* 抽出成品等級：先照權重抽中一格，成品等級就是那一格投入的等級 */
  function rollCraftTier(pick){
    const list = CRAFT_SLOTS.filter(s => (pick || {})[s.key]);
    if(!list.length) return 'normal';
    const hit = pickWeighted(list, 'w');
    return pick[hit.key] || 'normal';
  }
  /* 六格是否都填了，且填的等級是合法的 */
  function craftPickReady(pick){
    return CRAFT_SLOTS.every(s => TIER_ORDER.includes(((pick || {})[s.key]) || ''));
  }

  /* 活動：打 Boss 傷害倍率 */
  function dmgMult(){ return 1 + eventAdd('dmg'); }

  /* 實際傷害 = 基礎 × 等級倍率 × BUFF × ZONE × 活動 */
  function skillDamage(base, tierId, opts){
    const o = opts || {};
    let d = base * tierById(tierId).mult;
    if(o.buff) d *= BUFF_MULT;
    if(o.zone) d *= ZONE_MULT;
    // 圖鑑完成度 + 傷害藥水：走加法池（1 + 0.1 + 0.5 + 藥水），不做乘法避免爆炸
    const pool = 1 + (o.dexAdd || 0) + (o.potionAdd || 0);
    if(pool !== 1) d *= pool;
    d *= (o.dmgMult ?? dmgMult());
    return Math.round(d);
  }

  /* ==============================================================
     藥水（單次型：喝下去只對「下一次」生效，用完就沒）
     資料：players.potions = { coin:{30:2,50:1}, dmg:{...}, luck:{...} }
           players.activePotion = { coin:30, dmg:null, luck:100 }   ← 已喝下、等待生效
     一律走加法池，不做乘法，避免倍率爆炸
  ============================================================== */
  const POTION_TYPES = [
    { type:'coin', icon:'🪙', name:'金幣藥水', unit:'下一次任務獎勵' },
    { type:'dmg',  icon:'⚔️', name:'傷害藥水', unit:'下一招傷害' },
    { type:'luck', icon:'🍀', name:'幸運藥水', unit:'下一次開卡包的 S 機率' },
  ];
  const potionName = (type, v) =>
    `${(POTION_TYPES.find(p=>p.type===type)||{}).name || type} +${v}%`;
  // 取得持有的藥水：{ '30':2, '50':1 }
  function potionsOf(p, type){
    const m = ((p && p.potions) || {})[type] || {};
    const out = {};
    Object.entries(m).forEach(([k,v])=>{ if(Number(v) > 0) out[k] = Number(v); });
    return out;
  }
  const potionTotal = (p, type) => Object.values(potionsOf(p, type)).reduce((a,b)=>a+b, 0);
  // 已喝下、等待生效的藥水加成（0 = 沒有）
  function activePotion(p, type){
    const v = ((p && p.activePotion) || {})[type];
    return Number(v) || 0;
  }
  const potionAdd = (p, type) => activePotion(p, type) / 100;   // 30 → 0.3

  /* 卡包稀有度：幸運藥水只放大 S，缺口全部從 C 扣（A、B 不動） */
  function rarityOdds(luckPct){
    const base = {};
    RARITIES.forEach(r=> base[r.id] = r.prob);
    const boost = Math.max(0, Number(luckPct) || 0) / 100;
    if(boost > 0){
      const extra = base.S * boost;
      base.S += extra;
      base.C = Math.max(0, base.C - extra);
      const sum = base.S + base.A + base.B + base.C;
      base.C += 100 - sum;                       // 浮點誤差補回
    }
    return base;
  }
  function rollRarityWithLuck(pity, luckPct){
    if((pity ?? 0) >= PACK_PITY_MAX - 1) return 'S';       // 保底不受藥水影響
    const odds = rarityOdds(luckPct);
    let r = Math.random() * 100, acc = 0;
    for(const k of ['S','A','B','C']){ acc += odds[k]; if(r < acc) return k; }
    return 'C';
  }

  /* ==============================================================
     圖鑑完成度（各卡包等級獨立計算）
     單一動漫集滿 4 張 → 該系列傷害 +10%
     該等級全 16 張集滿 → 額外 +50%
  ============================================================== */
  const DEX_PACK_BONUS = 0.10;      // 單一動漫集滿（只看 S/A/B/C 四張）
  const DEX_FULL_BONUS = 0.50;      // 基礎 16 張集滿
  const DEX_XFULL_BONUS = 0.25;     // 四張全圖卡再集滿（終極獎勵，與上面兩層可疊加）
  const ownedCard = (p, id) => ((p && p.cards) || {})[id] || null;
  /* 圖鑑用的「曾經擁有」：合成會把材料卡吃到 0 張並刪掉 cards 物件，
     所以收集紀錄要獨立存在 players.dex（只增不減）。
     後面的 || 是舊資料 fallback：dex 還沒建立前，持有中就算收集過，不需要遷移腳本 */
  const everOwned = (p, id) => !!((p && p.dex) || {})[id] || !!ownedCard(p, id);
  // 某個動漫是否集滿 4 張
  function dexPackDone(p, packId){
    return ['S','A','B','C'].every(r=>{
      const c = cardOfPack(packId, r);
      return c && everOwned(p, c.id);
    });
  }
  const dexFullDone = p => PACKS.every(pk => dexPackDone(p, pk.id));
  // 對某張卡的圖鑑加成（該系列集滿 + 全集滿）
  // 四張全圖卡是否都收集過（用 everOwned，合成吃掉也不會掉）
  const dexXFullDone = p => PACKS.every(pk=>{
    const fc = fullCardOf(pk.id);
    return fc && everOwned(p, fc.id);
  });
  function dexBonusFor(p, cardId){
    const c = cardById(cardId);
    if(!c) return 0;
    let add = 0;
    if(dexPackDone(p, c.pack)) add += DEX_PACK_BONUS;
    if(dexFullDone(p))         add += DEX_FULL_BONUS;
    if(dexXFullDone(p))        add += DEX_XFULL_BONUS;
    return add;
  }
  /* ⚠️ 全圖卡「算進 haveTotal（20 張）」但「不算進 done / dexPackDone」——
     加成門檻永遠只看基礎四張，不然新玩家會被合成系統擋在 +50% 之外 */
  function dexProgress(p){
    const packs = PACKS.map(pk=>{
      const fc = fullCardOf(pk.id);
      return {
        id: pk.id, name: pk.name,
        have: ['S','A','B','C'].filter(r=>{
          const c = cardOfPack(pk.id, r); return c && everOwned(p, c.id);
        }).length,
        done: dexPackDone(p, pk.id),
        fullCard: fc,
        fullHave: !!(fc && everOwned(p, fc.id)),
      };
    });
    const fulls = packs.filter(x => x.fullHave).length;
    const baseHave = packs.reduce((a,b)=>a+b.have,0);
    return {
      packs, full: dexFullDone(p), fulls,
      xfull: dexXFullDone(p),
      baseHave, baseTotal: PACKS.length * 4,     // 基礎圖鑑（決定 +50%）
      fullTotal: PACKS.length,                   // 全圖卡（決定 +25%）
      haveTotal: baseHave + fulls,
      grandTotal: PACKS.length * 5,
    };
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
    { id:'boss10', name:'多佛朗明哥', from:'海賊王',   hp: 28600, coin: 600, token:2, ticket:2, ep:1500 },
    // ===== 11-20 關（預設關閉，在 stats 後台逐關開放）=====
    // drop 為藥水掉落，n = 瓶數；折價券見 COUPON_DROP
    { id:'boss11', name:'弗利沙',       from:'七龍珠',   hp: 75000, coin: 500, token:1, ticket:1, ep:1700,
      drops:[{type:'coin',v:30,n:1},{type:'dmg',v:30,n:1},{type:'luck',v:50,n:1}] },
    { id:'boss12', name:'真人',         from:'咒術迴戰', hp: 85000, coin: 500, token:1, ticket:1, ep:1900,
      drops:[{type:'coin',v:30,n:1},{type:'dmg',v:30,n:2},{type:'luck',v:50,n:2}] },
    { id:'boss13', name:'沙魯',         from:'七龍珠',   hp: 96000, coin: 500, token:2, ticket:1, ep:2100,
      drops:[{type:'coin',v:30,n:1},{type:'dmg',v:30,n:2},{type:'luck',v:80,n:1}] },
    { id:'boss14', name:'藍染惣右介',   from:'死神',     hp:108000, coin: 500, token:2, ticket:1, ep:2300,
      drops:[{type:'coin',v:30,n:1},{type:'dmg',v:40,n:1},{type:'luck',v:80,n:2}] },
    { id:'boss15', name:'宇智波斑',     from:'火影忍者', hp:120000, coin: 500, token:2, ticket:1, ep:2500,
      drops:[{type:'coin',v:50,n:1},{type:'dmg',v:40,n:2},{type:'luck',v:100,n:1}] },
    { id:'boss16', name:'鬼舞辻無慘',   from:'鬼滅之刃', hp:133000, coin: 600, token:2, ticket:2, ep:2800,
      drops:[{type:'coin',v:50,n:1},{type:'dmg',v:50,n:1},{type:'luck',v:100,n:2}] },
    { id:'boss17', name:'凱多',         from:'海賊王',   hp:148000, coin: 600, token:3, ticket:2, ep:3100,
      drops:[{type:'coin',v:50,n:1},{type:'dmg',v:50,n:2},{type:'luck',v:120,n:1}] },
    { id:'boss18', name:'梅路艾姆',     from:'獵人',     hp:165000, coin: 600, token:4, ticket:2, ep:3400,
      drops:[{type:'coin',v:50,n:1},{type:'dmg',v:100,n:1},{type:'luck',v:120,n:2}] },
    { id:'boss19', name:'兩面宿儺',     from:'咒術迴戰', hp:182000, coin: 700, token:5, ticket:2, ep:3700,
      drops:[{type:'coin',v:60,n:1},{type:'dmg',v:100,n:2},{type:'luck',v:150,n:1}] },
    { id:'boss20', name:'破壞神比魯斯', from:'七龍珠',   hp:200000, coin:1000, token:5, ticket:2, ep:4000,
      drops:[{type:'coin',v:70,n:1},{type:'dmg',v:200,n:2},{type:'luck',v:150,n:2}] },
  ];
  const COUPON_FROM_STAGE = 11;      // 第 11 關起擊破必掉一張折價券
  const COUPON_MAX_PRICE = 20000;    // 折價券只能用在 20000 以下的商品
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

  /* ===== 關卡開放：改由 stats 後台逐關切換（config/system.bossOpen） =====
     1-3 關固定開啟不可關；4-10 關可手動切換 */
  const BOSS_FORCE_OPEN = 3;          // 前 N 關強制開啟
  // 目前開放到第幾關（連續開放；第 4 關關掉時，就算第 5 關是開的也到不了）
  /* 合成系統總開關：預設關閉。stats 後台按下去才會在玩家端整個長出來，
     出問題時關掉就回到「敬請期待下次更新」，不用改 code 也不用重新部署 */
  const craftOpen = () => runtime.craftOpen === true;


  /* ==============================================================
     地下城（雙人非同步協力副本）
     設計核心：獎勵完全均等、不看傷害，而且「誰打了多少」根本不存進資料庫。
     只要存了，遲早會被拿來比，那就會變成「你打太少」的爭吵來源，
     副本反而卡死沒人敢出手。所以只記合計 totalDmg 與「有沒有出手過」joined。
  ============================================================== */
  const DUN_REGEN_MS   = 12 * 3600 * 1000;   // 每 12 小時回血一次
  const DUN_REGEN_PCT  = 0.30;               // 回最大血量的 30%（死掉的不復活、滿血的不變）
  const DUN_EP_MULT    = 0.5;                // 地下城技能 EP 消耗砍半（傷害不變）
  const DUN_EQUIP_MAX  = 4;                  // 地下城可裝 4 張（Boss 是 2 張）
  const DUN_EQUIP_CD_H = 2;                  // 換卡冷卻 2 小時

  /* 七座地下城。floors 由淺到深，最後一層是鎮守（boss:true）。
     mobHp × count 就是該層總血量 */
  const DUNGEONS = [
    { id:'E', name:'廢棄哨站', icon:'🏚️', color:'#8a8f9e', floors:[
      { name:'守門小兵', mobHp:   600, count:5 },
      { name:'深處小兵', mobHp:  1200, count:5 },
      { name:'鎮守',     mobHp:  9000, count:1, boss:true },
    ]},
    { id:'D', name:'石壁要塞', icon:'🏯', color:'#5fd08a', floors:[
      { name:'守門小兵', mobHp:  1200, count:5 },
      { name:'內廷守衛', mobHp:  1800, count:5 },
      { name:'精銳',     mobHp:  3500, count:2 },
      { name:'鎮守',     mobHp: 23000, count:1, boss:true },
    ]},
    { id:'C', name:'冰封坑道', icon:'🧊', color:'#5aa9ff', floors:[
      { name:'守門小兵', mobHp:  2400, count:5 },
      { name:'坑道遊魂', mobHp:  3600, count:5 },
      { name:'霜衛',     mobHp:  7500, count:2 },
      { name:'鎮守',     mobHp: 45000, count:1, boss:true },
    ]},
    { id:'B', name:'蝕骨墓城', icon:'💀', color:'#c9a0ff', floors:[
      { name:'守門小兵', mobHp:  4000, count:5 },
      { name:'墓城行屍', mobHp:  6000, count:5 },
      { name:'骨將',     mobHp:  9000, count:3 },
      { name:'墓城雙衛', mobHp: 14000, count:2 },
      { name:'鎮守',     mobHp: 75000, count:1, boss:true },
    ]},
    { id:'A', name:'熔岩深淵', icon:'🌋', color:'#f7e3a1', floors:[
      { name:'守門小兵', mobHp:  8000, count:5 },
      { name:'熔岩爬蟲', mobHp: 12000, count:5 },
      { name:'炎魔',     mobHp: 18000, count:3 },
      { name:'深淵雙衛', mobHp: 28000, count:2 },
      { name:'鎮守',     mobHp:140000, count:1, boss:true },
    ]},
    { id:'S', name:'天穹迴廊', icon:'🌌', color:'#e8f0ff', floors:[
      { name:'守門小兵', mobHp: 16000, count:5 },
      { name:'迴廊哨兵', mobHp: 24000, count:5 },
      { name:'星使',     mobHp: 34000, count:4 },
      { name:'天穹衛',   mobHp: 44000, count:3 },
      { name:'雙生守望', mobHp: 56000, count:2 },
      { name:'鎮守',     mobHp:120000, count:1, boss:true },
    ]},
    { id:'RED', name:'紅色門', icon:'🚪', color:'#ff3c5a', red:true, floors:[
      { name:'門扉守衛', mobHp: 30000, count:5 },
      { name:'裂界獸',   mobHp: 42000, count:5 },
      { name:'血衛',     mobHp: 55000, count:4 },
      { name:'異相',     mobHp: 70000, count:3 },
      { name:'深層異相', mobHp: 90000, count:3 },
      { name:'雙王',     mobHp:110000, count:2 },
      { name:'門主',     mobHp:220000, count:1, boss:true },
    ]},
  ];
  const dungeonDef   = id => DUNGEONS.find(d => d.id === id) || null;
  const dungeonHp    = d => (d ? d.floors.reduce((a,f)=> a + f.mobHp * f.count, 0) : 0);
  const dungeonMobs  = d => (d ? d.floors.reduce((a,f)=> a + f.count, 0) : 0);

  /* 建立一份新的地下城戰況（存進 Firestore 的 dungeons/active）
     ⚠️ Firestore 的陣列不能直接包陣列，所以是 floors:[{hp:[...]}, ...]（陣列→物件→陣列，合法） */
  function dungeonInit(tierId, opts){
    const def = dungeonDef(tierId);
    if(!def) return null;
    const now = Date.now();
    return {
      tier: tierId,
      status: 'open',
      openedAt: now,
      endsAt: (opts && opts.endsAt) || null,      // null = 不限時
      lastRegenAt: now,
      cur: 0,                                     // 目前在第幾層（index）
      floors: def.floors.map(f=>({ hp: Array(f.count).fill(f.mobHp) })),
      totalDmg: 0,                                // 只存合計，不分人
      joined: {},                                 // { playerId: true } 只存有沒有出手過
      claimed: {},
      rewards: (opts && opts.rewards) || {},
    };
  }

  /* 每 12 小時回血：死掉的（0）不復活，滿血的不變，補到滿為止
     用「距離 lastRegenAt 過了幾個 12 小時」惰性計算，不需要排程 */
  function dungeonRegenTicks(d, now){
    if(!d || d.status !== 'open') return 0;
    const base = d.lastRegenAt || d.openedAt || now;
    return Math.max(0, Math.floor(((now || Date.now()) - base) / DUN_REGEN_MS));
  }
  function dungeonApplyRegen(d, now){
    const ticks = dungeonRegenTicks(d, now);
    if(ticks <= 0) return null;
    const def = dungeonDef(d.tier);
    if(!def) return null;
    let healed = 0;
    const floors = (d.floors || []).map((fl, i)=>{
      const max = def.floors[i] ? def.floors[i].mobHp : 0;
      return { hp: (fl.hp || []).map(h=>{
        if(h <= 0 || h >= max) return h;             // 死掉的不復活、滿血的不變
        const next = Math.min(max, h + Math.round(max * DUN_REGEN_PCT * ticks));
        healed += next - h;
        return next;
      }) };
    });
    if(!healed) return { floors, lastRegenAt: (d.lastRegenAt || d.openedAt) + ticks * DUN_REGEN_MS, healed: 0 };
    return { floors, lastRegenAt: (d.lastRegenAt || d.openedAt) + ticks * DUN_REGEN_MS, healed };
  }

  const dungeonEpCost   = ep => Math.max(1, Math.round((ep || 0) * DUN_EP_MULT));
  const dungeonFloorHp  = fl => (fl && fl.hp ? fl.hp.reduce((a,b)=>a+b, 0) : 0);
  const dungeonFloorDone= fl => dungeonFloorHp(fl) <= 0;
  const dungeonLeftHp   = d  => (d && d.floors ? d.floors.reduce((a,f)=> a + dungeonFloorHp(f), 0) : 0);
  function dungeonProgress(d){
    const def = dungeonDef(d && d.tier);
    if(!def) return { pct:0, left:0, max:0, floor:0, floors:0 };
    const max = dungeonHp(def), left = dungeonLeftHp(d);
    return { pct: max ? Math.round((max - left) / max * 100) : 0,
             left, max, floor: (d.cur || 0), floors: def.floors.length };
  }
  const dungeonOpen     = () => !!(runtime.dungeon && runtime.dungeon.status === 'open');
  const dungeonExpired  = d => !!(d && d.endsAt && Date.now() > d.endsAt);
  const dungeonJoined   = (d, pid) => !!((d && d.joined) || {})[pid];

  /* 地下城的增益狀態，存在玩家自己的 p.dun，與 Boss 的 p.boss 完全分離。
     ⚠️ DOT 在地下城改成「立即打滿全部傷害」而不是分 10 小時扣：
        地下城沒有時段限制，DOT 原本「離線也繼續掉血」的價值不存在；
        而且小兵會被打死、會回血、血量存在共用文件裡，
        要正確追蹤「哪一隻身上有幾層 DOT」在多人併發下極易出錯。
        總傷害完全相同，只是結算時間點不一樣 */
  const dunStateOf = p => ({
    buff: !!((p && p.dun) || {}).buff,
    zoneUntil: (((p && p.dun) || {}).zoneUntil) || 0,
  });

  /* 地下城裝備：固定 4 個格子，每一格獨立、每一格有自己的冷卻。
     ⚠️ 不能用「一個全域冷卻」——那樣放完第一張就鎖住兩小時，其他三格永遠填不滿。
     dungeonEquipped 是長度 4 的稀疏陣列（空格是 null），dungeonSlotCd 是對應的冷卻時間 */
  function dunSlotsOf(p){
    const raw = Array.isArray(p && p.dungeonEquipped) ? p.dungeonEquipped : [];
    const out = [];
    for(let i = 0; i < DUN_EQUIP_MAX; i++) out.push(raw[i] || null);
    return out;
  }
  function dunSlotCds(p){
    const raw = Array.isArray(p && p.dungeonSlotCd) ? p.dungeonSlotCd : [];
    const out = [];
    for(let i = 0; i < DUN_EQUIP_MAX; i++) out.push(Math.max(0, Number(raw[i]) || 0));
    return out;
  }
  const dunSlotReady = (p, i, t) => dunSlotCds(p)[i] <= (t ?? Date.now());
  // 舊用法相容：只要「有裝哪些卡」的清單時用這個
  const dunEquipOf = p => dunSlotsOf(p).filter(Boolean);
  const dunEquipLocked = (p, cardId) => ((p && p.equipped) || []).includes(cardId);   // 已裝在 Boss → 這裡不能裝

  /* 獎勵：前台只看得到「種類」，數量藏起來（金幣顯示 1~99,000，其他 1~99） */
  const DUNGEON_REWARDS = [
    { id:'coins',        icon:'🪙', name:'金幣',     path:'coins',        max:99000 },
    { id:'bonusTokens',  icon:'🔮', name:'結晶',     path:'bonusTokens',  max:99 },
    { id:'epBonus',      icon:'⚡', name:'EP',       path:'epBonus',      max:99000 },
    { id:'ticket',       icon:'🎟️', name:'抽獎券',   path:'ticket',       max:99 },
    { id:'coupons',      icon:'🎟️', name:'折價券',   path:'coupons',      max:99 },
    { id:'bossFreePass', icon:'🎫', name:'免時段券', path:'bossFreePass', max:99 },
    ...CRAFT_MATS.map(m=>({ id:'craft_'+m.id, icon:m.icon, name:m.name, path:'craftMats.'+m.id, max:99 })),
    ...PACK_TIERS.map(t=>({ id:'pack_'+t.id, icon:'🎴', name:t.name+'卡包券', path:'packTickets.'+t.id, max:99 })),
  ];
  const dunRewardById = id => DUNGEON_REWARDS.find(r => r.id === id) || null;
  function dunRewardsOf(d){
    const raw = (d && d.rewards) || {}, out = {};
    DUNGEON_REWARDS.forEach(r=>{
      const n = Math.floor(Number(raw[r.id]) || 0);
      if(n > 0) out[r.id] = Math.min(r.max, n);
    });
    return out;
  }
  const dunRewardTotal = d => Object.keys(dunRewardsOf(d)).length;

  function bossOpenMap(){ return (runtime.bossOpen || {}); }
  function bossStageOpen(stage){
    if(stage <= BOSS_FORCE_OPEN) return true;
    return bossOpenMap()[String(stage)] === true;
  }
  function bossMaxOpen(){
    let n = 0;
    for(let i = 1; i <= BOSSES.length; i++){
      if(!bossStageOpen(i)) break;
      n = i;
    }
    return n;
  }

  /* ===== 全通關里程碑：先搶先贏，每個里程碑只有第一個達成的人拿得到 =====
     第 3 關已有人領過 → 本次起取消，不再發放（已領的不回收） */
  const BOSS_MILESTONES = [
    { stage: 5,  reward: 3 },
    { stage: 7,  reward: 3 },
    { stage: 10, reward: 5 },
    { stage: 13, reward: 5 },
    { stage: 16, reward: 5 },
    { stage: 20, reward: 8 },
  ];
  const bossMilestoneAt = stage => BOSS_MILESTONES.find(m => m.stage === stage) || null;
  // 得獎紀錄存全域 config/system.bossClearWinners = { '5':'Ca', '7':null, ... }
  function bossMilestoneWinner(stage){
    return (runtime.bossClearWinners || {})[String(stage)] || null;
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
    SHARED_VERSION,
    PACKS, RARITIES, PACK_TIERS, TIER_ORDER, PACK_PITY_MAX, CARDS,
    FULL_RAR, RARITY_X, rarColorOf,
    // 合成
    CRAFT_SLOTS, CRAFT_COIN, CRAFT_MATS, CRAFT_MAT_COST, craftOpen,
    TASK_EXTRAS, extraById, extrasOf, extrasTotal, extrasText,
    craftMatsOf, craftMatEnough, fullCardOf, isFullCard, everOwned, ownedCard,
    craftTierOdds, rollCraftTier, craftPickReady,
    EQUIP_MAX, EQUIP_LOCK_MS, BUFF_MULT, ZONE_MULT, ZONE_MS, DOT_HOURS, DOT_MAX_STACK,
    cardById, packById, tierById, skillOf, cardOfPack, tierBetter,
    packTicketsOf, packTicketTotal, BOSS_TICKET_ODDS, rollBossTicketTier,
    migrateCounts, cardCounts, cardCountTotal,
    pickWeighted, rollRarity, rollTier, skillDamage, dmgMult,
    // Boss
    // 藥水
    POTION_TYPES, potionName, potionsOf, potionTotal, activePotion, potionAdd,
    rarityOdds, rollRarityWithLuck,
    // 圖鑑完成度
    DEX_PACK_BONUS, DEX_FULL_BONUS, DEX_XFULL_BONUS,
    dexPackDone, dexFullDone, dexXFullDone, dexBonusFor, dexProgress,
    COUPON_FROM_STAGE, COUPON_MAX_PRICE,
    BOSSES, MILESTONES, bossOfStage, bossImg,
    BOSS_FORCE_OPEN, bossOpenMap, bossStageOpen, bossMaxOpen,
    BOSS_MILESTONES, bossMilestoneAt, bossMilestoneWinner,
    // 地下城
    DUNGEONS, DUN_REGEN_MS, DUN_REGEN_PCT, DUN_EP_MULT, DUN_EQUIP_MAX, DUN_EQUIP_CD_H,
    dungeonDef, dungeonHp, dungeonMobs, dungeonInit,
    dungeonRegenTicks, dungeonApplyRegen, dungeonEpCost,
    dungeonFloorHp, dungeonFloorDone, dungeonLeftHp, dungeonProgress,
    dungeonOpen, dungeonExpired, dungeonJoined,
    dunEquipOf, dunEquipLocked, dunStateOf, dunSlotsOf, dunSlotCds, dunSlotReady,
    DUNGEON_REWARDS, dunRewardById, dunRewardsOf, dunRewardTotal,
    // 管理員臨時活動
    SOUL_IDX, ADMIN_EVENTS, ADMIN_DURATIONS, adminEventById,
    adminEventOn, adminEventUntil, adminLuck, adminSoul,
    getWeightsAdmin, currentWeights,
    // 合作任務
    COOP_ASSIGNEE, REPORT_COOLDOWN_MS, REPORT_MIN_LEN,
    isCoop, coopMembers, coopDoneBy, coopProgress, canReport,
    // 每週排行
    weekKey, prevWeekKey, weekEndAt, weekRangeTxt, WEEKLY_BOARDS, tpeDay,
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
