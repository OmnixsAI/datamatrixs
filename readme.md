# OMNIXS AI · O.A.M.I — Omnixs AI Market Intelligence

An installable web app (PWA) that shows **real** market data from your own Alpaca account, runs a 20-agent desk on it, and sends alerts with chart images and a written description to your Telegram bot. There is no simulated data in the live path. If a feed is not connected, the app says so instead of making numbers up. `?preview=1` is a labeled sample layout only.

It is a folder of plain files. You put the folder on any free HTTPS web host, open the address in Safari on your iPhone, and add it to your Home Screen. It then opens full screen like a normal app.

## What is real, and what is not

| Part | Status |
|---|---|
| Alpaca live stock and crypto prices (WebSocket), minute and daily history, snapshots | Real |
| Alpaca options chains (prices, IV, Greeks) | Real (free "indicative" feed, or paid OPRA) |
| Alpaca news | Real |
| Alpaca portfolio view | Real, read only. The app never places orders. |
| Telegram alerts, charts, bot commands | Real |
| Claude-written alert descriptions | Real, optional, uses your own Anthropic API key |
| **Webull** | **Not connected.** See "About Webull" below. |

Agent scores, signals, VaR, backtests and alert descriptions are calculations on the real data. They are not investment advice and not predictions.

## Step 1: get your keys

**Alpaca** (market data). Create a free account at alpaca.markets, open the Paper Trading dashboard, and generate an API key. You get a *Key ID* and a *Secret*. Paper keys are recommended: they give the same market data but cannot touch real money. The free plan uses the IEX stock feed and the indicative options feed, which are the defaults in the app.

**Telegram bot.** In Telegram, message **@BotFather**, send `/newbot`, follow the prompts, and copy the token it gives you. Then open your new bot and send it any message (this lets the app find your chat ID).

## Step 2: put the app online (HTTPS is required)

iPhone only allows installing and running these apps from an `https://` address. Any one of these works and is free:

- **Netlify Drop (easiest).** Go to app.netlify.com/drop and drag the `omnixs-pwa` folder onto the page. You get an `https://…netlify.app` address.
- **Cloudflare Pages.** Workers & Pages → Create → Pages → Upload assets → upload the folder contents.
- **GitHub Pages.** Create a repository, upload the folder contents, then Settings → Pages → deploy from the main branch.

The files contain no keys. Your keys are typed into the app on your phone and stay on your phone.

## Step 3: install on your iPhone

1. Open the address in **Safari**.
2. Tap the **Share** button, then **Add to Home Screen**, then **Add**.
3. Open OMNIXS **from the Home Screen icon**.

> **Important on iPhone:** the Home Screen app has its own private storage, separate from Safari. Enter your keys in the Home Screen app, not only in Safari. Always launch from the icon, because Safari can erase website data after a week of not visiting.

## Step 4: connect

In the app: enter the Alpaca Key ID and Secret and tap **Save and connect**. The first load reads about two years of daily bars and recent minute bars for 24 instruments, so give it a few seconds.

Then open **More → Settings → Telegram bot**, paste the bot token, tap **Find my chat**, **Save**, and **Send test message**.

## Alerts

Open the **Alerts** tab.

- **Delivery**: chart image on or off, chart window (1H, 4H, 1D, 3M), overlays (VWAP, moving averages, RSI panel), quiet hours, and a maximum number of alerts per hour.
- **Description**: *Built-in* writes the commentary from the indicators on this device. *Claude* sends the indicator numbers and up to three headlines to Anthropic and uses your own API credit; if it fails, the alert still goes out with the built-in text.
- **Strategy lens**: Balanced, Momentum, Mean reversion, Breakout, or Options. It changes which indicators the description leads with.
- **Rules**: score above or below a level, consensus flips, RSI levels, MACD flips, 20/60 moving average crosses, price crossing VWAP, price crossing a level, big daily moves, volume spikes, breakouts, and new signals. Each rule has its own cooldown and can include or skip the chart and description. Presets are included.
- Rules fire when a condition **changes**, never just because it is already true when the app starts.

**Telegram commands** (answered only to your own chat): `/status`, `/price SPY`, `/score QQQ`, `/agents NVDA`, `/chart TSLA`, `/signals`, `/alerts on|off`.

## Limits you should know about

1. **Alerts only run while the app is open.** iPhone suspends web apps shortly after you leave them, and a web app cannot run in the background. Keep OMNIXS open (and the screen awake) while you want alerts and commands to flow. Always-on alerts need a small server, which this app does not include.
2. **Webull is not connected.** See below.
3. **Market-data calls are made straight from your phone.** Alpaca documents browser access for its trading API but not clearly for its market-data API. If Settings shows a CORS error or "request never reached the server", use the optional proxy below.
4. The agents, signals and descriptions are tools for thinking, not advice. Past performance and backtests do not predict results.
5. VIX is not available from Alpaca, so the app uses the VIXY ETF and SPY's realised volatility instead. Market hours are New York 9:30 to 16:00 on weekdays and do not account for holidays.

## About Webull

Webull's API signs every request with your secret on a server, and it is not designed to be called from a web page on a phone, so putting those keys into a static app would either not work or expose them. All live data in OMNIXS comes from Alpaca. If you want Webull added, the safe way is a small server of your own that holds the Webull keys and exposes only the read-only data the app needs.

## If Alpaca data will not load (optional proxy)

If **Settings → Connection status** shows a CORS error:

1. Create a free Cloudflare account and go to Workers & Pages → Create → Worker.
2. Paste in the contents of `proxy/worker.js` and deploy.
3. (Recommended) In the Worker's settings add a variable `ALLOW_ORIGIN` with your app's address, for example `https://your-app.netlify.app`.
4. In OMNIXS go to **Settings → Advanced**, paste the Worker address, and tap **Save and reconnect**.

The proxy forwards read-only GET requests to Alpaca and adds the browser permission headers. It cannot place orders. Live prices use a WebSocket, which is not affected by this problem.

## Other problems

- **"Alpaca rejected the keys"**: re-check the Key ID and Secret, and that the stock feed in Settings matches your plan (IEX for free).
- **"No recent minute bars for SPY"**: your account may not have data for the chosen feed. Switch to IEX.
- **Status says MKT CLOSED**: normal outside US market hours. Crypto still streams.
- **Stream shows an error about connection limit**: Alpaca allows one stock stream per account. Close other apps or scripts using the same keys.
- **Telegram "Unauthorized"**: the bot token is wrong or was revoked in BotFather.

## Your data

Keys, the Telegram token, rules, journal and settings are stored in your phone's browser storage (localStorage) only. **Settings → Erase everything on this device** removes them. Anyone who unlocks your phone and opens the app can see them, so use a passcode. If you ever share your phone or lose a key, revoke it at Alpaca or with @BotFather.

## Files

`index.html`, `app.js`, `ui.js`, `style.css` (the app) · `logo-*.png` (header logo and sphere core) · `sw.js` (offline shell; never touches data calls) · `manifest.webmanifest` and `icon-*.png` (Home Screen install) · `proxy/worker.js` (optional).
