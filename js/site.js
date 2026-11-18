/* Matboka.no
 *
 * Butikklenkene. Fyll inn lenkene når appen er ute i butikkene, så vises
 * knappene over hele nettsiden. Til da står det «Kommer snart».
 *
 *   appStore:   https://apps.apple.com/no/app/matboka/id<tallene fra App Store Connect>
 *   googlePlay: https://play.google.com/store/apps/details?id=no.matboka.app
 */
window.MATBOKA_BUTIKK = {
  appStore: '',
  googlePlay: '',
};

(function () {
  'use strict';
  var butikk = window.MATBOKA_BUTIKK || {};

  /** Viser knappene for butikkene som har lenke, og «Kommer snart» ellers. */
  window.matbokaButikker = function (root) {
    var groups = (root || document).querySelectorAll('[data-butikk]');
    for (var i = 0; i < groups.length; i++) {
      var group = groups[i];
      var any = false;
      var links = group.querySelectorAll('[data-butikk-lenke]');
      for (var j = 0; j < links.length; j++) {
        var url = butikk[links[j].getAttribute('data-butikk-lenke')];
        if (url) {
          links[j].href = url;
          any = true;
        } else {
          links[j].parentNode.removeChild(links[j]);
        }
      }
      group.setAttribute('data-klar', any ? 'ja' : 'nei');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { window.matbokaButikker(); });
  } else {
    window.matbokaButikker();
  }
})();
