/* GeoClick analytics – GoatCounter.
 * GoatCounter site code: vllada255.
 * Endpoint: https://vllada255.goatcounter.com/count
 */
(function () {
  const GOATCOUNTER_CODE = 'vllada255';
  const queue = [];
  let ready = false;

  window.geoclickTrack = function (name) {
    if (!name) return;
    if (ready && window.goatcounter && typeof window.goatcounter.count === 'function') {
      window.goatcounter.count({ path: name, title: name, event: true });
    } else {
      queue.push(name);
    }
  };

  if (!GOATCOUNTER_CODE || GOATCOUNTER_CODE === 'DOPLNIT-KOD-GOATCOUNTER') {
    console.info('GeoClick: GoatCounter zatím není nakonfigurován. Doplňte kód v analytics.js.');
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://gc.zgo.at/count.js';
  script.dataset.goatcounter = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`;
  script.onload = function () {
    ready = true;
    while (queue.length) {
      const name = queue.shift();
      window.goatcounter.count({ path: name, title: name, event: true });
    }
  };
  script.onerror = function () {
    console.warn('GeoClick: GoatCounter se nepodařilo načíst.');
  };
  document.head.appendChild(script);
})();
