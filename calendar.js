/* Official macro calendar + Fed feed client.
   Dates below were taken from agency pages on 2026-10-17.
   They are a snapshot, not a promise the agency will not reschedule. */
const CAL_ASOF = '2026-10-17';
const CAL = [
  { d: '2026-10-02', t: '08:30', impact: 'high', title: 'Employment Situation', period: 'September 2026', src: 'BLS', url: 'https://www.bls.gov/schedule/2026/10_sched_list.htm', kind: 'labor' },
  { d: '2026-10-07', t: '14:00', impact: 'high', title: 'FOMC minutes', period: 'September 15–16 meeting', src: 'Federal Reserve', url: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm', kind: 'fed' },
  { d: '2026-10-14', t: '08:30', impact: 'high', title: 'Consumer Price Index', period: 'September 2026', src: 'BLS', url: 'https://www.bls.gov/schedule/2026/10_sched_list.htm', kind: 'inflation' },
  { d: '2026-10-14', t: '08:30', impact: 'med', title: 'Real Earnings', period: 'September 2026', src: 'BLS', url: 'https://www.bls.gov/schedule/2026/10_sched_list.htm', kind: 'labor' },
  { d: '2026-10-14', t: '14:00', impact: 'med', title: 'Beige Book', period: 'October 2026', src: 'Federal Reserve', url: 'https://www.federalreserve.gov/newsevents/2026-october.htm', kind: 'fed' },
  { d: '2026-10-15', t: '08:30', impact: 'high', title: 'Producer Price Index', period: 'September 2026', src: 'BLS', url: 'https://www.bls.gov/schedule/2026/10_sched_list.htm', kind: 'inflation' },
  { d: '2026-10-16', t: '08:30', impact: 'med', title: 'Import and Export Price Indexes', period: 'September 2026', src: 'BLS', url: 'https://www.bls.gov/schedule/2026/10_sched_list.htm', kind: 'inflation' },
  { d: '2026-10-20', t: '10:00', impact: 'low', title: 'State Employment and Unemployment', period: 'September 2026', src: 'BLS', url: 'https://www.bls.gov/schedule/2026/10_sched_list.htm', kind: 'labor' },
  { d: '2026-10-21', t: '10:00', impact: 'low', title: 'Usual Weekly Earnings', period: 'Q3 2026', src: 'BLS', url: 'https://www.bls.gov/schedule/2026/10_sched_list.htm', kind: 'labor' },
  { d: '2026-10-27', t: '09:00', impact: 'high', title: 'FOMC meeting begins', period: 'October 27–28', src: 'Federal Reserve', url: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm', kind: 'fed' },
  { d: '2026-10-28', t: '14:00', impact: 'high', title: 'FOMC statement', period: 'October meeting', src: 'Federal Reserve', url: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm', kind: 'fed', note: 'Second day of the meeting. Statement time is the Board’s usual 2:00 p.m. ET release.' },
  { d: '2026-10-28', t: '14:30', impact: 'high', title: 'FOMC press conference', period: 'October meeting', src: 'Federal Reserve', url: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm', kind: 'fed' },
  { d: '2026-10-28', t: '10:00', impact: 'low', title: 'Metropolitan Area Employment', period: 'September 2026', src: 'BLS', url: 'https://www.bls.gov/schedule/2026/10_sched_list.htm', kind: 'labor' },
  { d: '2026-10-29', t: '08:30', impact: 'high', title: 'GDP, advance estimate', period: 'Q3 2026', src: 'BEA', url: 'https://www.bea.gov/news/schedule', kind: 'growth' },
  { d: '2026-10-29', t: '08:30', impact: 'high', title: 'Personal Income and Outlays', period: 'September 2026', src: 'BEA', url: 'https://www.bea.gov/news/schedule', kind: 'inflation', note: 'Includes the PCE price indexes.' },
  { d: '2026-10-29', t: '10:00', impact: 'low', title: 'Consumer Expenditures, annual', period: '2025', src: 'BLS', url: 'https://www.bls.gov/schedule/2026/10_sched_list.htm', kind: 'growth' },
  { d: '2026-10-30', t: '08:30', impact: 'med', title: 'Employment Cost Index', period: 'Q3 2026', src: 'BLS', url: 'https://www.bls.gov/schedule/2026/10_sched_list.htm', kind: 'labor' },
  { d: '2026-11-04', t: '08:30', impact: 'high', title: 'International Trade in Goods and Services', period: 'September 2026', src: 'BEA', url: 'https://www.bea.gov/news/schedule', kind: 'growth' },
  { d: '2026-11-20', t: '08:30', impact: 'low', title: 'Activities of U.S. Multinational Enterprises', period: '2024', src: 'BEA', url: 'https://www.bea.gov/news/schedule', kind: 'growth' },
  { d: '2026-11-25', t: '08:30', impact: 'high', title: 'GDP, second estimate, and corporate profits', period: 'Q3 2026', src: 'BEA', url: 'https://www.bea.gov/news/schedule', kind: 'growth' },
  { d: '2026-11-25', t: '08:30', impact: 'high', title: 'Personal Income and Outlays', period: 'October 2026', src: 'BEA', url: 'https://www.bea.gov/news/schedule', kind: 'inflation' },
  { d: '2026-12-02', t: '08:30', impact: 'low', title: 'GDP by County and Personal Income by County', period: '2025', src: 'BEA', url: 'https://www.bea.gov/news/schedule', kind: 'growth' },
  { d: '2026-12-08', t: '08:30', impact: 'med', title: 'International Trade', period: 'October 2026', src: 'BEA', url: 'https://www.bea.gov/news/schedule', kind: 'growth' },
  { d: '2026-12-08', t: '09:00', impact: 'high', title: 'FOMC meeting begins', period: 'December 8–9, with projections', src: 'Federal Reserve', url: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm', kind: 'fed' },
  { d: '2026-12-09', t: '14:00', impact: 'high', title: 'FOMC statement and projections', period: 'December meeting', src: 'Federal Reserve', url: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm', kind: 'fed', note: 'SEP meeting. Statement time is the usual 2:00 p.m. ET.' },
  { d: '2026-12-10', t: '08:30', impact: 'low', title: 'Real PCE and income by state', period: '2025', src: 'BEA', url: 'https://www.bea.gov/news/schedule', kind: 'growth' },
  { d: '2026-12-18', t: '08:30', impact: 'med', title: 'International Transactions and Investment Position', period: 'Q3 2026', src: 'BEA', url: 'https://www.bea.gov/news/schedule', kind: 'growth' },
  { d: '2026-12-23', t: '08:30', impact: 'high', title: 'GDP, third estimate', period: 'Q3 2026', src: 'BEA', url: 'https://www.bea.gov/news/schedule', kind: 'growth' },
  { d: '2026-12-23', t: '08:30', impact: 'high', title: 'Personal Income and Outlays', period: 'November 2026', src: 'BEA', url: 'https://www.bea.gov/news/schedule', kind: 'inflation' },
  { d: '2027-01-26', t: '09:00', impact: 'high', title: 'FOMC meeting begins', period: 'January 26–27, 2027', src: 'Federal Reserve', url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20250905a.htm', kind: 'fed' },
  { d: '2027-01-27', t: '14:00', impact: 'high', title: 'FOMC statement', period: 'January 2027', src: 'Federal Reserve', url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20250905a.htm', kind: 'fed' },
  { d: '2027-03-16', t: '09:00', impact: 'high', title: 'FOMC meeting begins', period: 'March 16–17, 2027, with projections', src: 'Federal Reserve', url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20250905a.htm', kind: 'fed' },
  { d: '2027-03-17', t: '14:00', impact: 'high', title: 'FOMC statement and projections', period: 'March 2027', src: 'Federal Reserve', url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20250905a.htm', kind: 'fed' },
  { d: '2027-04-28', t: '14:00', impact: 'high', title: 'FOMC statement', period: 'April 27–28, 2027', src: 'Federal Reserve', url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20250905a.htm', kind: 'fed' },
  { d: '2027-06-09', t: '14:00', impact: 'high', title: 'FOMC statement and projections', period: 'June 8–9, 2027', src: 'Federal Reserve', url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20250905a.htm', kind: 'fed' },
  { d: '2027-07-28', t: '14:00', impact: 'high', title: 'FOMC statement', period: 'July 27–28, 2027', src: 'Federal Reserve', url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20250905a.htm', kind: 'fed' },
  { d: '2027-09-15', t: '14:00', impact: 'high', title: 'FOMC statement and projections', period: 'September 14–15, 2027', src: 'Federal Reserve', url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20250905a.htm', kind: 'fed' },
  { d: '2027-10-27', t: '14:00', impact: 'high', title: 'FOMC statement', period: 'October 26–27, 2027', src: 'Federal Reserve', url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20250905a.htm', kind: 'fed' },
  { d: '2027-12-08', t: '14:00', impact: 'high', title: 'FOMC statement and projections', period: 'December 7–8, 2027', src: 'Federal Reserve', url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20250905a.htm', kind: 'fed' }
];

/* Snapshot of the Board’s public RSS, pulled 2026-10-17. Replaced when /api/feeds answers. */
const FED_SEED = {
  asof: '2026-10-17T12:00:00Z',
  monetary: [
    { title: "Minutes of the Board's discount rate meetings on August 17, September 9, and September 16, 2026", url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20261013a.htm', date: '2026-10-13T18:00:00Z', cat: 'Monetary Policy' },
    { title: 'Minutes of the Federal Open Market Committee, September 15-16, 2026', url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20261007a.htm', date: '2026-10-07T18:00:00Z', cat: 'Monetary Policy' },
    { title: 'Federal Reserve issues FOMC statement', url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916a.htm', date: '2026-09-16T18:00:00Z', cat: 'Monetary Policy' },
    { title: 'FOMC economic projections, September 15-16, 2026', url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916b.htm', date: '2026-09-16T18:00:00Z', cat: 'Monetary Policy' }
  ],
  speeches: [
    { title: 'Waller, The Signaling Value of the Summary of Economic Projections', url: 'https://www.federalreserve.gov/feeds/speeches.xml', date: '2026-10-08T08:30:00Z', cat: 'Speech' },
    { title: 'Bowman, Modernizing the Regulatory and Supervisory Landscape', url: 'https://www.federalreserve.gov/feeds/speeches.xml', date: '2026-10-06T14:45:00Z', cat: 'Speech' },
    { title: 'Jefferson, The U.S. Economy and Monetary Policy', url: 'https://www.federalreserve.gov/feeds/speeches.xml', date: '2026-10-01T17:30:00Z', cat: 'Speech' },
    { title: 'Cook, The Dual Mandate in Rural America', url: 'https://www.federalreserve.gov/feeds/speeches.xml', date: '2026-09-30T19:25:00Z', cat: 'Speech' }
  ],
  all: [
    { title: 'Minutes of the Board\'s discount rate meetings', url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20261013a.htm', date: '2026-10-13T18:00:00Z', cat: 'Monetary Policy' },
    { title: 'Federal Reserve Board releases results of the 2025 Survey of Consumer Finances', url: 'https://www.federalreserve.gov/newsevents/pressreleases.htm', date: '2026-10-09T14:00:00Z', cat: 'Other Announcements' },
    { title: 'Enforcement action against American Express Company', url: 'https://www.federalreserve.gov/newsevents/pressreleases.htm', date: '2026-10-08T20:30:00Z', cat: 'Enforcement Actions' },
    { title: 'FOMC minutes, September 15-16, 2026', url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20261007a.htm', date: '2026-10-07T18:00:00Z', cat: 'Monetary Policy' }
  ]
};

const FED = { id: 'monetary', items: [], stale: true, err: '', loading: false };

function calWhen(ev) {
  const [y, m, d] = ev.d.split('-').map(Number);
  const [hh, mm] = (ev.t || '00:00').split(':').map(Number);
  // Eastern Time, no DST table: use the offset that America/New_York has on that date via Intl is hard.
  // Build a UTC guess and correct with formatToParts.
  const guess = new Date(Date.UTC(y, m - 1, d, hh + 4, mm));
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit' });
  for (let i = 0; i < 3; i++) {
    const p = {};
    fmt.formatToParts(guess).forEach(x => { p[x.type] = x.value; });
    const got = (+p.hour % 24) * 60 + +p.minute;
    const want = hh * 60 + mm;
    const dayOff = (Number(p.year) - y) * 400 + (Number(p.month) - m) * 32 + (Number(p.day) - d);
    guess.setTime(guess.getTime() + (want - got) * 60000 - dayOff * 86400000);
  }
  return guess;
}
function upcomingCal(now) {
  now = now || new Date();
  return CAL.map(ev => Object.assign({ at: calWhen(ev) }, ev)).sort((a, b) => a.at - b.at);
}
function nextCal(now, impact) {
  return upcomingCal(now).find(ev => ev.at > (now || new Date()) && (!impact || ev.impact === impact || (impact === 'high' && ev.impact === 'high')));
}

async function refreshFed(id) {
  FED.id = id || FED.id;
  FED.loading = true;
  try {
    const r = await fetch('/api/feeds?id=' + encodeURIComponent(FED.id), { headers: { accept: 'application/json' } });
    if (!r.ok) throw new Error('Feed proxy HTTP ' + r.status);
    const j = await r.json();
    if (!j.items || !j.items.length) throw new Error('Feed returned no items');
    FED.items = j.items;
    FED.stale = false;
    FED.err = '';
    FED.asof = new Date().toISOString();
  } catch (e) {
    FED.items = (FED_SEED[FED.id] || FED_SEED.all).slice();
    FED.stale = true;
    FED.err = e.message || String(e);
    FED.asof = FED_SEED.asof;
  } finally {
    FED.loading = false;
  }
  return FED;
}
