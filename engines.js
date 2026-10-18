/* NEON engines: pure calculations. No network, no DOM, no invented market prints. */
(function (root) {
  const clamp = (x, a, b) => x < a ? a : x > b ? b : x;

  const AGENT_DEFS = [
    { id: 'us', name: 'US Market', w: 0.08, role: 'index' },
    { id: 'gl', name: 'Global Risk', w: 0.04, role: 'macro' },
    { id: 'te', name: 'Technical', w: 0.10, role: 'tape' },
    { id: 'op', name: 'Options', w: 0.08, role: 'options' },
    { id: 'ma', name: 'Macro Vol', w: 0.05, role: 'macro' },
    { id: 'se', name: 'Sentiment', w: 0.05, role: 'news' },
    { id: 'ri', name: 'Risk', w: 0.06, role: 'risk' },
    { id: 'mo', name: 'Momentum', w: 0.07, role: 'tape' },
    { id: 'mr', name: 'Mean Reversion', w: 0.04, role: 'tape' },
    { id: 'br', name: 'Breadth', w: 0.05, role: 'index' },
    { id: 'rs', name: 'Relative Strength', w: 0.05, role: 'tape' },
    { id: 'vo', name: 'Volume', w: 0.04, role: 'tape' },
    { id: 'tr', name: 'Daily Trend', w: 0.07, role: 'trend' },
    { id: 'vl', name: 'Vol Regime', w: 0.04, role: 'risk' },
    { id: 'sx', name: 'Sector', w: 0.04, role: 'rotation' },
    { id: 'lq', name: 'Liquidity', w: 0.03, role: 'micro' },
    { id: 'ca', name: 'Catalyst', w: 0.04, role: 'news' },
    { id: 'bt', name: 'Beta', w: 0.03, role: 'risk' },
    { id: 'ss', name: 'Session', w: 0.02, role: 'structure' },
    { id: 'ad', name: 'Adversarial', w: 0.02, role: 'review' }
  ];

  const SECTOR_OF = {
    NVDA: 'XLK', AAPL: 'XLK', MSFT: 'XLK', QQQ: 'XLK',
    AMZN: 'XLY', TSLA: 'XLY', META: 'XLC', GOOGL: 'XLC',
    SPY: 'SPY', DIA: 'DIA', IWM: 'IWM'
  };

  const CATALYSTS = [
    [/earnings|\beps\b|revenue|guidance|outlook/i, 'EARNINGS'],
    [/\bfda\b|approval|clinical|trial/i, 'REGULATORY'],
    [/merger|acqui|buyout|takeover/i, 'M&A'],
    [/\bcpi\b|\bfomc\b|\bfed\b|inflation|rate cut|rate hike/i, 'MACRO'],
    [/upgrade|downgrade|price target|initiates/i, 'ANALYST'],
    [/lawsuit|probe|investigation|\bsec\b|subpoena/i, 'LEGAL'],
    [/buyback|dividend/i, 'CAPITAL']
  ];

  function catalystTag(text) {
    const t = String(text || '');
    for (const [re, tag] of CATALYSTS) if (re.test(t)) return tag;
    return '';
  }

  function nyParts(d) {
    const p = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false })
      .formatToParts(d).forEach(x => { p[x.type] = x.value; });
    return { wd: p.weekday, min: (+p.hour % 24) * 60 + +p.minute };
  }

  function sessionInfo(d) {
    const p = nyParts(d || new Date());
    const weekend = p.wd === 'Sat' || p.wd === 'Sun';
    let id = 'closed', label = 'CLOSED', detail = 'US cash session is shut. Crypto still trades.';
    if (!weekend && p.min >= 240 && p.min < 570) { id = 'pre'; label = 'PRE-MARKET'; detail = '04:00–09:30 ET. Cash open is ahead.'; }
    else if (!weekend && p.min >= 570 && p.min < 960) { id = 'open'; label = 'REGULAR'; detail = '09:30–16:00 ET regular session.'; }
    else if (!weekend && p.min >= 960 && p.min < 1200) { id = 'post'; label = 'AFTER HOURS'; detail = '16:00–20:00 ET. Liquidity is thinner.'; }
    const openMin = 570, closeMin = 960;
    let eta = null;
    if (!weekend && p.min < openMin) eta = openMin - p.min;
    else if (!weekend && p.min >= openMin && p.min < closeMin) eta = closeMin - p.min;
    return { id, label, detail, etaMin: eta, weekend };
  }

  function voteOf(score, id, extra) {
    if (id === 'ri') {
      const rl = extra || 0;
      const bias = rl > 0.55 ? 'CAUTION' : rl < 0.3 ? 'BULLISH' : 'NEUTRAL';
      return { bias, vote: bias === 'CAUTION' ? -1 : bias === 'BULLISH' ? 1 : 0 };
    }
    if (id === 'ad') {
      const bias = score >= 0.12 ? 'BULLISH' : score <= -0.12 ? 'BEARISH' : 'NEUTRAL';
      return { bias, vote: bias === 'BULLISH' ? 1 : bias === 'BEARISH' ? -1 : 0 };
    }
    const bias = score >= 0.15 ? 'BULLISH' : score <= -0.15 ? 'BEARISH' : 'NEUTRAL';
    return { bias, vote: bias === 'BULLISH' ? 1 : bias === 'BEARISH' ? -1 : 0 };
  }

  function pack(def, score, why, extra) {
    const s = clamp(score, -1, 1);
    const v = voteOf(s, def.id, extra);
    const conf = Math.round(clamp(def.id === 'ri' ? 35 + Math.abs((extra || 0.5) - 0.45) * 160 : 38 + 58 * Math.min(1, Math.abs(s) * 1.45), 28, 96));
    return { id: def.id, name: def.name, w: def.w, role: def.role, score: s, bias: v.bias, vote: v.vote, conf, why };
  }

  function scoreAgents(inp) {
    const f = inp.f, m = inp.m, df = inp.df, s = inp.s;
    const dT = df ? df.trendScore : 0;
    const dRS = df && df.rs20 != null ? clamp(df.rs20 / 0.05, -1, 1) : 0;
    const stretch = clamp((f.r14 - 50) / 28, -1, 1);
    const mr = -stretch * (Math.abs(f.r14 - 50) > 12 ? 1 : 0.35);
    const volConfirm = clamp((f.volRatio - 1) * (f.chg >= 0 ? 1 : -1), -1, 1);
    const sec = inp.secChg == null ? 0 : clamp(inp.secChg / 0.012, -1, 1);
    const liq = inp.spread == null ? clamp((f.volRatio - 0.6) / 1.2, -0.2, 0.8) : clamp(0.4 - inp.spread * 80, -1, 1);
    const cat = clamp((inp.nCats ? 0.35 : 0) + f.sent * 0.65, -1, 1);
    const betaGap = clamp((f.chg - (inp.spyC || 0)) / 0.01, -1, 1);
    const sess = inp.session || { id: 'closed' };
    const sessScore = sess.id === 'open' ? clamp(f.tech * 0.4 + (f.chg >= 0 ? 0.15 : -0.15), -1, 1) : sess.id === 'pre' ? clamp(f.chg / 0.01, -0.6, 0.6) : 0;
    const peers = [
      0.45 * m.us + 0.3 * (m.breadth * 2 - 1) + 0.25 * clamp(f.chg / 0.01, -1, 1),
      0.45 * m.cr - 0.35 * m.vixz + 0.2 * m.us,
      df ? 0.65 * f.tech + 0.25 * dT + 0.1 * dRS : f.tech,
      f.opt,
      clamp((20 - m.vix) / 9, -1, 1) * 0.6 - m.vixz * 0.4,
      f.sent,
      (0.5 - f.rl) * 2
    ];
    const adv = adversarialScore(peers);
    const rows = [
      pack(AGENT_DEFS[0], peers[0], [`Breadth ${Math.round(m.breadth * 100)}% advancing`, `US indices ${m.us >= 0 ? 'firm' : 'soft'}`, `${s} ${pct(f.chg)} vs SPY ${pct(inp.spyC || 0)}`]),
      pack(AGENT_DEFS[1], peers[1], [`Crypto appetite ${m.cr >= 0 ? 'positive' : 'negative'}`, `VIXY ${pct(inp.vixy || 0)} on the day`]),
      pack(AGENT_DEFS[2], peers[2], [`RSI(14) ${f.r14.toFixed(0)}`, `MACD histogram ${f.md.h >= 0 ? 'positive' : 'negative'}`, `Price ${f.px >= f.vw ? 'above' : 'below'} VWAP`, df ? `Daily trend ${df.trend}` : 'Daily history still loading']),
      pack(AGENT_DEFS[3], peers[3], f.hasOpt ? [`ATM IV ${f.iv != null ? (f.iv * 100).toFixed(1) + '%' : '--'}`, `IV/realized ${f.ivrv ? f.ivrv.toFixed(2) + 'x' : '--'}`, `Skew ${f.skew != null ? (f.skew * 100).toFixed(1) + ' pts' : '--'}`] : ['Options chain not loaded for this symbol yet']),
      pack(AGENT_DEFS[4], peers[4], [`SPY 20-day realized vol ${m.vix.toFixed(1)}%`, `Vol ETF ${m.vixz < 0 ? 'easing' : 'rising'}`]),
      pack(AGENT_DEFS[5], peers[5], f.nNews ? [`Headline tone ${Math.round((f.sent + 1) * 50)}/100 across ${f.nNews}`, 'Lexicon score, not a language model'] : ['No recent headlines tagged to this symbol']),
      pack(AGENT_DEFS[6], peers[6], [`Realized vol ${(f.dvol * 100).toFixed(2)}%/day`, `Risk level ${Math.round(f.rl * 100)}/100`], f.rl),
      pack(AGENT_DEFS[7], clamp(Math.tanh(f.momz * 0.55), -1, 1), [`30-bar move ${pct(f.mom)}`, `${f.momz.toFixed(1)} sigma`, `Relative volume ${f.volRatio.toFixed(1)}x`]),
      pack(AGENT_DEFS[8], mr, [`RSI distance from 50 is ${Math.abs(f.r14 - 50).toFixed(0)}`, mr < -0.2 ? 'Stretched up — fade bias' : mr > 0.2 ? 'Stretched down — snapback bias' : 'Not stretched enough to fade']),
      pack(AGENT_DEFS[9], clamp((m.breadth - 0.5) * 2.2, -1, 1), [`${Math.round(m.breadth * 100)}% of the tracked book is green`, m.breadth > 0.6 ? 'Broad participation' : m.breadth < 0.4 ? 'Narrow or risk-off tape' : 'Mixed breadth']),
      pack(AGENT_DEFS[10], dRS || betaGap * 0.6, [df && df.rs20 != null ? `20-day residual vs SPY ${pct(df.rs20, 1)}` : `Session residual vs SPY ${pct(f.chg - (inp.spyC || 0))}`]),
      pack(AGENT_DEFS[11], volConfirm, [`Relative volume ${f.volRatio.toFixed(2)}x the 20-day pace`, volConfirm > 0 ? 'Volume confirms the direction' : 'Volume does not confirm']),
      pack(AGENT_DEFS[12], dT, df ? [`Daily structure ${df.trend}`, df.d200 ? `${df.px >= df.d200 ? 'Above' : 'Below'} the 200-day` : '200-day not available yet', `52-week position ${Math.round((df.pos52 || 0) * 100)}%`] : ['Need about 25 daily bars']),
      pack(AGENT_DEFS[13], clamp((18 - m.vix) / 12, -1, 1), [m.vix > 28 ? 'High-vol regime — size down' : m.vix < 14 ? 'Compressed vol' : 'Mid vol regime', `Level ${m.vix.toFixed(1)}%`]),
      pack(AGENT_DEFS[14], sec, [inp.secChg == null ? 'No sector ETF print for this name' : `Sector ETF ${pct(inp.secChg)}`, SECTOR_OF[s] ? `Mapped to ${SECTOR_OF[s]}` : 'Index or unmapped']),
      pack(AGENT_DEFS[15], liq, [inp.spread == null ? 'No bid/ask yet — using volume as a proxy' : `Spread ${(inp.spread * 100).toFixed(3)}%`, `Session volume pace ${f.volRatio.toFixed(1)}x`]),
      pack(AGENT_DEFS[16], cat, [inp.nCats ? `${inp.nCats} catalyst-tagged headline(s)` : 'No catalyst keyword in recent headlines', `Tone ${Math.round((f.sent + 1) * 50)}/100`]),
      pack(AGENT_DEFS[17], clamp(1 - Math.min(1, Math.abs(betaGap)) * 0.3 + (Math.abs(inp.spyC || 0) < 0.002 ? 0 : Math.sign(f.chg) === Math.sign(inp.spyC || 0) ? 0.15 : -0.35), -1, 1), [`Idiosyncratic gap vs SPY ${pct(f.chg - (inp.spyC || 0))}`, 'High agreement with SPY means less standalone edge']),
      pack(AGENT_DEFS[18], sessScore, [`Session ${sess.label}`, sess.detail || '']),
      pack(AGENT_DEFS[19], adv.score, adv.why)
    ];
    return rows;
  }

  function adversarialScore(scores) {
    const dirs = scores.map(s => s > 0.15 ? 1 : s < -0.15 ? -1 : 0);
    const bull = dirs.filter(d => d > 0).length;
    const bear = dirs.filter(d => d < 0).length;
    const n = scores.length || 1;
    const crowd = Math.max(bull, bear) / n;
    const mean = scores.reduce((a, b) => a + b, 0) / n;
    let v = 0;
    scores.forEach(s => { v += (s - mean) * (s - mean); });
    const disp = Math.sqrt(v / n);
    if (crowd >= 0.72 && disp < 0.22) {
      const fade = bull > bear ? -0.42 : 0.42;
      return { score: fade, why: [`${Math.round(crowd * 100)}% of the desk is on one side`, 'Low dispersion — adversarial review fades the crowd', 'This is a check, not a trade'] };
    }
    if (disp > 0.42) return { score: -0.25, why: ['Agents disagree', `Dispersion ${disp.toFixed(2)} — confidence should be cut`, 'Wait for the conflict to resolve'] };
    return { score: clamp(mean * 0.15, -0.2, 0.2), why: ['No crowd and no breakdown', 'Adversarial review does not veto', `Desk dispersion ${disp.toFixed(2)}`] };
  }

  function coordinate(agents) {
    let net = 0, bw = 0, sw = 0, nw = 0;
    const conflicts = [];
    agents.forEach(a => {
      net += a.w * a.score;
      if (a.vote > 0) bw += a.w; else if (a.vote < 0) sw += a.w; else nw += a.w;
    });
    const maj = bw >= sw && bw >= nw ? 1 : sw >= nw ? -1 : 0;
    const agree = agents.filter(a => a.vote === maj).length;
    const adv = agents.find(a => a.id === 'ad');
    let haircut = 0;
    if (adv && maj !== 0 && adv.vote === -maj) {
      haircut = 12;
      conflicts.push('Adversarial review opposes the majority. Confidence is cut.');
    }
    agents.forEach(a => {
      if (a.id === 'ad' || a.vote === 0 || maj === 0) return;
      if (a.vote !== maj && a.w >= 0.05) conflicts.push(`${a.name} disagrees with the weighted majority.`);
    });
    const conf = Math.round(clamp(40 + 70 * Math.abs(net) + 12 * (agree / agents.length) - haircut, 25, 96));
    const dir = net > 0.12 ? 'BULLISH' : net < -0.12 ? 'BEARISH' : 'NEUTRAL';
    return { net, bull: Math.round(bw * 100), bear: Math.round(sw * 100), neu: Math.max(0, 100 - Math.round(bw * 100) - Math.round(sw * 100)), agree, conf, dir, conflicts: conflicts.slice(0, 6), haircut };
  }

  function pct(x, d) {
    d = d == null ? 2 : d;
    return (x >= 0 ? '+' : '') + (x * 100).toFixed(d) + '%';
  }

  function normCdf(x) {
    const ax = Math.abs(x);
    const t = 1 / (1 + 0.2316419 * ax);
    const d = 0.3989422804014327 * Math.exp(-x * x / 2);
    const p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    return x >= 0 ? 1 - p : p;
  }

  function bs(S, K, T, sigma, type, r) {
    r = r == null ? 0.04 : r;
    if (!(S > 0 && K > 0 && sigma > 0 && T > 0)) return null;
    const vol = sigma * Math.sqrt(T);
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / vol;
    const d2 = d1 - vol;
    const df = Math.exp(-r * T);
    const call = type === 'C' || type === 'c';
    const price = call ? S * normCdf(d1) - K * df * normCdf(d2) : K * df * normCdf(-d2) - S * normCdf(-d1);
    const pdf = Math.exp(-d1 * d1 / 2) / Math.sqrt(2 * Math.PI);
    return {
      price, d1, d2,
      delta: call ? normCdf(d1) : normCdf(d1) - 1,
      gamma: pdf / (S * vol),
      vega: S * pdf * Math.sqrt(T) / 100,
      theta: -(S * pdf * sigma) / (2 * Math.sqrt(T)) / 365,
      probITM: call ? normCdf(d2) : normCdf(-d2)
    };
  }

  function expectedMove(S, iv, dte) {
    if (!(S > 0 && iv > 0 && dte > 0)) return null;
    return S * iv * Math.sqrt(dte / 365);
  }

  function sma(a, e, n) {
    n = Math.min(n, e);
    let s = 0;
    for (let i = e - n; i < e; i++) s += a[i];
    return s / n;
  }
  function rsi(a, e, n) {
    let g = 0, l = 0;
    for (let i = Math.max(1, e - n); i < e; i++) {
      const d = a[i] - a[i - 1];
      if (d > 0) g += d; else l -= d;
    }
    return g + l === 0 ? 50 : 100 * g / (g + l);
  }

  const OPS = {
    '>': (a, b) => a > b, '<': (a, b) => a < b,
    '>=': (a, b) => a >= b, '<=': (a, b) => a <= b
  };
  const IND_SET = new Set(['rsi', 'sma_gap', 'ret1', 'ret20', 'break_hi', 'break_lo']);

  function indAt(a, i, name, p) {
    p = p || {};
    if (name === 'rsi') return i >= 14 ? rsi(a, i + 1, 14) : 50;
    if (name === 'sma_gap') {
      const f = p.fast || 20, s = p.slow || 50;
      if (i + 1 < s) return 0;
      return sma(a, i + 1, f) - sma(a, i + 1, s);
    }
    if (name === 'ret1') return i >= 1 ? a[i] / a[i - 1] - 1 : 0;
    if (name === 'ret20') return i >= 20 ? a[i] / a[i - 20] - 1 : 0;
    if (name === 'break_hi' || name === 'break_lo') {
      const n = p.n || 20;
      if (i < n) return 0;
      let mx = -1e18, mn = 1e18;
      for (let k = i - n; k < i; k++) { mx = Math.max(mx, a[k]); mn = Math.min(mn, a[k]); }
      return name === 'break_hi' ? a[i] - mx : mn - a[i];
    }
    return 0;
  }

  function matchGroup(a, i, group) {
    if (!group) return false;
    const test = c => {
      if (!c || !IND_SET.has(c.ind) || !OPS[c.op]) return false;
      return OPS[c.op](indAt(a, i, c.ind, c.p), Number(c.val));
    };
    const all = group.all || [];
    const any = group.any || [];
    if (!all.length && !any.length) return false;
    if (all.length && !all.every(test)) return false;
    if (any.length && !any.some(test)) return false;
    return true;
  }

  function validateSpec(spec) {
    const errs = [];
    if (!spec || typeof spec !== 'object') return ['Strategy is empty.'];
    const walk = g => {
      ['all', 'any'].forEach(k => ((g && g[k]) || []).forEach(c => {
        if (!IND_SET.has(c.ind)) errs.push('Unknown indicator ' + c.ind);
        if (!OPS[c.op]) errs.push('Unknown operator');
        if (!isFinite(Number(c.val))) errs.push('Condition value must be a number');
      }));
    };
    walk(spec.entry); walk(spec.exit);
    if (spec.stopPct != null && !(spec.stopPct > 0 && spec.stopPct < 50)) errs.push('Stop must be between 0 and 50 percent.');
    return errs;
  }

  function runStrategy(closes, spec, costBps) {
    const errs = validateSpec(spec);
    if (errs.length) return { ok: false, errs };
    const a = closes;
    if (!a || a.length < 80) return { ok: false, errs: ['Need at least 80 closes.'] };
    const cost = (costBps || 0) / 1e4;
    const stop = Number(spec.stopPct) > 0 ? Number(spec.stopPct) / 100 : null;
    const maxHold = Math.max(1, Math.round(spec.maxHold || 40));
    const pos = new Array(a.length).fill(0);
    const trades = [];
    let st = 0, en = null, ei = 0, held = 0;
    for (let i = 0; i < a.length; i++) {
      if (st === 1) {
        held++;
        const stopped = stop && a[i] <= en * (1 - stop);
        const timed = held >= maxHold;
        const exited = matchGroup(a, i, spec.exit);
        if (stopped || timed || exited) {
          trades.push({ en, ex: a[i], r: a[i] / en - 1 - 2 * cost, i, why: stopped ? 'stop' : timed ? 'time' : 'rule' });
          st = 0; en = null; held = 0;
        }
      } else if (matchGroup(a, i, spec.entry)) {
        st = 1; en = a[i]; ei = i; held = 0;
      }
      pos[i] = st;
    }
    if (en != null) trades.push({ en, ex: a[a.length - 1], r: a[a.length - 1] / en - 1 - cost, i: a.length - 1, open: true, why: 'open' });
    const eq = [1], bench = [1], dr = [];
    for (let i = 1; i < a.length; i++) {
      const pr = a[i] / a[i - 1] - 1;
      const p = pos[i - 1], pp = i >= 2 ? pos[i - 2] : 0;
      const r = p * pr - cost * Math.abs(p - pp);
      dr.push(r);
      eq.push(eq[i - 1] * (1 + r));
      bench.push(bench[i - 1] * (1 + pr));
    }
    const mean = dr.reduce((x, y) => x + y, 0) / (dr.length || 1);
    const sd = Math.sqrt(dr.reduce((x, y) => x + (y - mean) ** 2, 0) / (dr.length - 1 || 1)) || 1e-9;
    let pk = 1, dd = 0;
    eq.forEach(x => { pk = Math.max(pk, x); dd = Math.min(dd, x / pk - 1); });
    const wins = trades.filter(t => t.r > 0).length;
    const yrs = (a.length - 1) / 252;
    return {
      ok: true, eq, bench, trades,
      stats: {
        tot: eq[eq.length - 1] - 1,
        cagr: Math.pow(eq[eq.length - 1], 1 / yrs) - 1,
        dd, sharpe: mean / sd * Math.sqrt(252),
        n: trades.length,
        win: trades.length ? wins / trades.length : 0,
        avg: trades.length ? trades.reduce((x, t) => x + t.r, 0) / trades.length : 0,
        expo: pos.reduce((x, y) => x + y, 0) / a.length,
        btot: bench[bench.length - 1] - 1
      }
    };
  }

  const TEMPLATES = [
    { id: 'sma', name: 'SMA cross 20/50', note: 'Long when the 20-day average is above the 50-day. Exit on the cross back.', spec: { entry: { all: [{ ind: 'sma_gap', op: '>', val: 0, p: { fast: 20, slow: 50 } }] }, exit: { all: [{ ind: 'sma_gap', op: '<', val: 0, p: { fast: 20, slow: 50 } }] }, stopPct: 8, maxHold: 80 } },
    { id: 'rsi', name: 'RSI revert 30/55', note: 'Buy a washed-out RSI, exit when it mean-reverts.', spec: { entry: { all: [{ ind: 'rsi', op: '<', val: 30 }] }, exit: { any: [{ ind: 'rsi', op: '>', val: 55 }] }, stopPct: 4, maxHold: 15 } },
    { id: 'brk', name: '20-day breakout', note: 'Long a close through the prior 20-day high. Time stop at 30 sessions.', spec: { entry: { all: [{ ind: 'break_hi', op: '>', val: 0, p: { n: 20 } }] }, exit: { any: [{ ind: 'break_lo', op: '>', val: 0, p: { n: 10 } }] }, stopPct: 6, maxHold: 30 } },
    { id: 'trend-pull', name: 'Trend pullback', note: 'Uptrend (20 above 50) and a one-day dip. Exit on a 20-day pop or a trend break.', spec: { entry: { all: [{ ind: 'sma_gap', op: '>', val: 0, p: { fast: 20, slow: 50 } }, { ind: 'ret1', op: '<', val: -0.01 }] }, exit: { any: [{ ind: 'ret20', op: '>', val: 0.06 }, { ind: 'sma_gap', op: '<', val: 0, p: { fast: 20, slow: 50 } }] }, stopPct: 5, maxHold: 25 } }
  ];

  function newBook(cash) {
    const c = cash > 0 ? cash : 100000;
    return {
      cash: c, positions: {}, orders: [], fills: [],
      kill: false, liveArmed: false,
      limits: { maxPosPct: 15, maxDailyLossPct: 2, maxNotional: 50000, maxOrdersDay: 40 },
      dayStartEquity: c
    };
  }

  function markEquity(book, priceOf) {
    let eq = book.cash;
    Object.keys(book.positions).forEach(s => { eq += book.positions[s].qty * (priceOf(s) || book.positions[s].avg || 0); });
    return eq;
  }

  function guardOrder(book, order, phrase, px) {
    const reasons = [];
    const o = order || {};
    if (!book || book.kill) reasons.push('Kill switch is on. New orders are blocked.');
    const sym = String(o.symbol || '').toUpperCase();
    const crypto = /^[A-Z]{2,5}\/USD$/.test(sym);
    const equity = /^[A-Z][A-Z.]{0,5}$/.test(sym);
    if (/[CP]\d{8}$/.test(sym) || String(o.asset || '') === 'option') reasons.push('Option contracts are not routed. The options engine is analysis only.');
    else if (!crypto && !equity) reasons.push('Symbol must be an equity ticker or a crypto pair like BTC/USD.');
    const qty = Number(o.qty);
    if (!(qty > 0) || qty > 10000) reasons.push('Quantity must be above 0 and at most 10,000.');
    else if (!crypto && Math.round(qty) !== qty) reasons.push('Equity quantity must be a whole number.');
    if (o.side !== 'buy' && o.side !== 'sell') reasons.push('Side must be buy or sell.');
    const env = o.env === 'live' ? 'live' : o.env === 'paper' ? 'paper' : 'ledger';
    if ((o.type || 'market') === 'limit' && !(Number(o.limit_price) > 0)) reasons.push('A limit order needs a limit price.');
    if (env === 'live') {
      if (!book.liveArmed) reasons.push('Live routing is disarmed. Arm it in Execute, then confirm each order.');
      if (o.type !== 'limit') reasons.push('Live orders must be limit orders.');
      if (phrase !== `LIVE ${sym} ${qty}`) reasons.push('Confirmation phrase does not match this live order.');
    } else if (env === 'paper') {
      if (phrase !== `PAPER ${sym} ${qty}`) reasons.push('Confirmation phrase does not match this Alpaca paper order.');
    }
    const px0 = Number(o.limit_price) > 0 ? Number(o.limit_price) : Number(px);
    if (!(px0 > 0)) reasons.push('No price is available to size this order.');
    const notional = (qty > 0 && px0 > 0) ? qty * px0 : 0;
    const eq = Number(o.equity) > 0 ? Number(o.equity) : (book ? book.cash : 0);
    const lim = (book && book.limits) || {};
    if (lim.maxNotional && notional > lim.maxNotional) reasons.push('Order exceeds the max notional limit ($' + lim.maxNotional + ').');
    if (lim.maxPosPct && eq > 0 && notional > eq * lim.maxPosPct / 100) reasons.push('Order exceeds the max position size (' + lim.maxPosPct + '% of equity).');
    if (o.dailyLossPct != null && lim.maxDailyLossPct && Number(o.dailyLossPct) <= -Math.abs(lim.maxDailyLossPct)) reasons.push('Daily loss limit is already breached.');
    const dayOrders = (book && book.orders || []).filter(x => x.dayKey === o.dayKey).length;
    if (lim.maxOrdersDay && o.dayKey && dayOrders >= lim.maxOrdersDay) reasons.push('Daily order count limit is reached.');
    return { ok: reasons.length === 0, reasons, symbol: sym, qty, env, notional };
  }

  function fillPaper(book, order, px, now) {
    const g = guardOrder(book, Object.assign({}, order, { env: 'ledger', type: order.type || 'market' }), '', px);
    if (!g.ok) return { ok: false, reasons: g.reasons };
    const slip = ((order && order.slipBps) || 5) / 1e4;
    const fillPx = order.side === 'buy' ? px * (1 + slip) : px * (1 - slip);
    const pos = book.positions[g.symbol] || { qty: 0, avg: 0 };
    if (order.side === 'sell' && pos.qty + 1e-9 < g.qty) return { ok: false, reasons: ['Paper book does not short. Sell only shares you hold.'] };
    if (order.side === 'buy' && book.cash + 1e-6 < g.qty * fillPx) return { ok: false, reasons: ['Not enough paper cash.'] };
    const signed = order.side === 'buy' ? g.qty : -g.qty;
    const newQty = pos.qty + signed;
    if (signed > 0) pos.avg = newQty ? (pos.avg * pos.qty + fillPx * signed) / newQty : 0;
    if (Math.abs(newQty) < 1e-9) delete book.positions[g.symbol];
    else book.positions[g.symbol] = { qty: newQty, avg: pos.avg };
    book.cash -= signed * fillPx;
    const fill = { id: now || 0, symbol: g.symbol, side: order.side, qty: g.qty, px: fillPx, venue: 'ledger', status: 'filled' };
    book.fills.unshift(fill);
    book.orders.unshift(Object.assign({ dayKey: order.dayKey || '' }, fill));
    if (book.fills.length > 200) book.fills.pop();
    if (book.orders.length > 200) book.orders.pop();
    return { ok: true, fill };
  }

  function brier(signals) {
    const xs = (signals || []).filter(g => g.status === 'WIN' || g.status === 'LOSS');
    if (!xs.length) return null;
    let s = 0;
    xs.forEach(g => {
      const p = clamp(g.dir > 0 ? g.score / 100 : 1 - g.score / 100, 0.02, 0.98);
      const y = g.status === 'WIN' ? 1 : 0;
      s += (p - y) * (p - y);
    });
    return s / xs.length;
  }

  function calibration(signals) {
    const buckets = [{ lo: 0, hi: 40, n: 0, win: 0 }, { lo: 40, hi: 60, n: 0, win: 0 }, { lo: 60, hi: 75, n: 0, win: 0 }, { lo: 75, hi: 101, n: 0, win: 0 }];
    (signals || []).forEach(g => {
      if (g.status !== 'WIN' && g.status !== 'LOSS') return;
      const b = buckets.find(x => g.score >= x.lo && g.score < x.hi);
      if (!b) return;
      b.n++; if (g.status === 'WIN') b.win++;
    });
    return buckets.map(b => ({ label: b.lo + '–' + (b.hi - 1), n: b.n, win: b.n ? b.win / b.n : null }));
  }

  function drawdown(equity) {
    let pk = -1e18, dd = 0;
    (equity || []).forEach(x => { pk = Math.max(pk, x); if (pk > 0) dd = Math.min(dd, x / pk - 1); });
    return dd;
  }

  root.NeonEngines = {
    AGENT_DEFS, SECTOR_OF, catalystTag, sessionInfo, scoreAgents, coordinate, adversarialScore,
    bs, expectedMove, normCdf, runStrategy, validateSpec, TEMPLATES, IND_SET,
    newBook, markEquity, guardOrder, fillPaper, brier, calibration, drawdown, sma, rsi
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
