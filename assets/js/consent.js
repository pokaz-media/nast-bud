// NAST-BUD: zgoda na cookies (Google Consent Mode v2) i konwersje z kliknięć w telefon i e-mail.
// Ładowany w <head> przed jakimkolwiek tagiem Google, żeby domyślna odmowa zgody zadziałała od pierwszego żądania.

// Identyfikatory od osoby prowadzącej reklamy. Puste pole = dany tag się nie ładuje.
// Wystarczy GTM albo GA4/Ads; przy GTM zdarzenia trafiają tylko do dataLayer i konfiguruje się je w kontenerze.
const NB_TAGS = {
  gtm: '',             // GTM-XXXXXXX
  ga4: '',             // G-XXXXXXXXXX
  ads: '',             // AW-XXXXXXXXXX
  adsPhoneLabel: '',   // etykieta konwersji Google Ads dla kliknięcia w telefon
  adsEmailLabel: '',   // etykieta konwersji Google Ads dla kliknięcia w e-mail
};

(() => {
  const KEY = 'nb-consent';
  const VERSION = 1;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ dataLayer.push(arguments); };

  const toConsent = (c) => ({
    analytics_storage:  c.analytics ? 'granted' : 'denied',
    ad_storage:         c.marketing ? 'granted' : 'denied',
    ad_user_data:       c.marketing ? 'granted' : 'denied',
    ad_personalization: c.marketing ? 'granted' : 'denied',
  });

  const read = () => {
    try {
      const c = JSON.parse(localStorage.getItem(KEY));
      return c && c.v === VERSION ? c : null;
    } catch { return null; }
  };
  const save = (c) => {
    try { localStorage.setItem(KEY, JSON.stringify({ v: VERSION, ts: new Date().toISOString(), ...c })); } catch {}
  };

  gtag('consent', 'default', { ...toConsent({}), wait_for_update: 500 });
  gtag('set', 'ads_data_redaction', true);
  let stored = read();
  if (stored) gtag('consent', 'update', toConsent(stored));

  // Tagi Google
  const load = (src) => {
    const s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  };
  if (NB_TAGS.gtm) {
    dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    load('https://www.googletagmanager.com/gtm.js?id=' + NB_TAGS.gtm);
  } else if (NB_TAGS.ga4 || NB_TAGS.ads) {
    load('https://www.googletagmanager.com/gtag/js?id=' + (NB_TAGS.ga4 || NB_TAGS.ads));
    gtag('js', new Date());
    if (NB_TAGS.ga4) gtag('config', NB_TAGS.ga4);
    if (NB_TAGS.ads) gtag('config', NB_TAGS.ads);
  }

  // Konwersje: każdy link tel: i mailto: na stronie
  const track = (kind, a) => {
    const params = {
      contact_value: a.getAttribute('href').replace(/^(tel|mailto):/, ''),
      contact_placement: a.closest('[data-screen-label]')?.dataset.screenLabel || '',
    };
    const name = kind === 'tel' ? 'phone_click' : 'email_click';
    if (NB_TAGS.gtm) {
      dataLayer.push({ event: name, ...params });
      return;
    }
    gtag('event', name, params);
    const label = kind === 'tel' ? NB_TAGS.adsPhoneLabel : NB_TAGS.adsEmailLabel;
    if (NB_TAGS.ads && label) gtag('event', 'conversion', { send_to: NB_TAGS.ads + '/' + label });
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href^="tel:"], a[href^="mailto:"]');
    if (a) track(a.getAttribute('href').startsWith('tel:') ? 'tel' : 'mail', a);
  });

  // Baner
  const html = `
    <div class="cc-box" role="dialog" aria-modal="false" aria-labelledby="cc-title" aria-describedby="cc-text">
      <span class="cc-eyebrow" id="cc-title">Pliki cookies</span>
      <p class="cc-text" id="cc-text">
        Niezbędne pliki cookies zapewniają działanie strony. Za Twoją zgodą użyjemy też
        cookies analitycznych i marketingowych Google, żeby mierzyć ruch na stronie
        i skuteczność reklam. Zgodę zmienisz w każdej chwili w stopce, w&nbsp;„Ustawieniach cookies”.
      </p>
      <div class="cc-prefs" hidden>
        <label class="cc-opt">
          <input type="checkbox" checked disabled>
          <span><b>Niezbędne</b> Zapamiętują Twój wybór dotyczący cookies. Zawsze aktywne.</span>
        </label>
        <label class="cc-opt">
          <input type="checkbox" name="analytics">
          <span><b>Analityczne</b> Statystyki odwiedzin strony (Google Analytics).</span>
        </label>
        <label class="cc-opt">
          <input type="checkbox" name="marketing">
          <span><b>Marketingowe</b> Pomiar skuteczności i dopasowanie reklam (Google Ads).</span>
        </label>
      </div>
      <div class="cc-actions">
        <button type="button" class="cc-btn cc-accept" data-cc="all">Akceptuję wszystkie</button>
        <button type="button" class="cc-btn" data-cc="none">Odrzucam</button>
        <button type="button" class="cc-btn cc-link" data-cc="prefs">Ustawienia</button>
        <button type="button" class="cc-btn" data-cc="save" hidden>Zapisz wybór</button>
      </div>
    </div>`;

  const init = () => {
    const root = document.createElement('div');
    root.className = 'cc';
    root.innerHTML = html;
    root.hidden = true;
    document.body.appendChild(root);

    const prefs = root.querySelector('.cc-prefs');
    const box = (name) => root.querySelector(`input[name="${name}"]`);
    const btn = (name) => root.querySelector(`[data-cc="${name}"]`);

    const showPrefs = (on) => {
      prefs.hidden = !on;
      btn('prefs').hidden = on;
      btn('save').hidden = !on;
    };
    const open = (withPrefs) => {
      box('analytics').checked = !!stored?.analytics;
      box('marketing').checked = !!stored?.marketing;
      showPrefs(withPrefs);
      root.hidden = false;
    };
    const decide = (c) => {
      stored = c;
      save(c);
      gtag('consent', 'update', toConsent(c));
      dataLayer.push({ event: 'consent_update', ...c });
      root.hidden = true;
    };

    root.addEventListener('click', (e) => {
      const action = e.target.closest('[data-cc]')?.dataset.cc;
      if (action === 'all')   decide({ analytics: true,  marketing: true });
      if (action === 'none')  decide({ analytics: false, marketing: false });
      if (action === 'prefs') showPrefs(true);
      if (action === 'save')  decide({ analytics: box('analytics').checked, marketing: box('marketing').checked });
    });
    document.querySelectorAll('[data-cookie-settings]').forEach(a => a.addEventListener('click', (e) => {
      e.preventDefault();
      open(true);
    }));

    if (!stored) open(false);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
