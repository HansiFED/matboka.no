/* Matboka.no: viser en delt oppskrift.
 *
 * Hele oppskriften ligger i lenken, etter #r=, som JSON komprimert med
 * lz-string. Det er samme format som appen lager (versjon 1):
 *
 *   v  versjon (1)          t  tittel             d  beskrivelse
 *   s  porsjoner            sl hva porsjonene heter («porsjoner», «stk» …)
 *   p  forberedelse (min)   c  tilberedning (min)  tt total tid (min)
 *   i  ingredienser, en per linje, grupper som «Saus:»
 *   st steg (liste)         n  notater            g  kategorier
 *   su kilde (lenke)        sa forfatter          sy kildetype
 *   by hvem som delte den
 *
 * Delen etter # sendes aldri til serveren; alt skjer i nettleseren. All
 * tekst settes inn som tekst (textContent), aldri som HTML.
 */
(function () {
  'use strict';

  var root = document.getElementById('oppskrift');
  if (!root) return;

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function str(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function num(value) {
    return typeof value === 'number' && isFinite(value) && value > 0 ? value : 0;
  }

  function readData() {
    var match = String(window.location.hash || '').match(/[#&]r=([A-Za-z0-9+\-$_]+)/);
    return match ? match[1] : null;
  }

  function decode(data) {
    if (!window.LZString) return null;
    try {
      var json = window.LZString.decompressFromEncodedURIComponent(data);
      if (!json) return null;
      var recipe = JSON.parse(json);
      if (!recipe || recipe.v !== 1 || !str(recipe.t)) return null;
      return recipe;
    } catch (e) {
      return null;
    }
  }

  function duration(minutes) {
    var m = Math.round(minutes);
    if (m < 60) return m + ' min';
    var h = Math.floor(m / 60);
    var rest = m % 60;
    return h + ' t' + (rest ? ' ' + rest + ' min' : '');
  }

  function servings(count, label) {
    var name = label || 'porsjoner';
    if (count === 1 && name === 'porsjoner') name = 'porsjon';
    var n = Math.round(count * 10) / 10;
    return String(n).replace('.', ',') + ' ' + name;
  }

  /** Samme regler som appen: en linje som «Saus:» uten tall starter en gruppe. */
  function ingredientGroups(text) {
    var groups = [{ title: '', items: [] }];
    String(text || '').split('\n').forEach(function (raw) {
      var line = raw.trim();
      if (!line) return;
      var header = line.match(/^(.{1,40}):$/);
      if (header && !/\d/.test(header[1])) {
        groups.push({ title: header[1].trim(), items: [] });
        return;
      }
      groups[groups.length - 1].items.push(line);
    });
    return groups.filter(function (g) { return g.items.length; });
  }

  function cleanStep(text) {
    return String(text || '')
      .replace(/\s*\n\s*/g, ' ')
      .replace(/^\s*(?:steg\s*)?\d{1,2}\s*[.):]\s*/i, '')
      .trim();
  }

  function safeUrl(value) {
    try {
      var url = new URL(value);
      return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
    } catch (e) {
      return null;
    }
  }

  /** Åpner appen direkte. På Android med en reserve til Google Play når lenken finnes. */
  function appLink(data) {
    var encoded = encodeURIComponent(data);
    if (/Android/i.test(navigator.userAgent)) {
      var play = (window.MATBOKA_BUTIKK || {}).googlePlay;
      return 'intent://i?r=' + encoded + '#Intent;scheme=matboka;package=no.matboka.app;' +
        (play ? 'S.browser_fallback_url=' + encodeURIComponent(play) + ';' : '') + 'end';
    }
    return 'matboka://i?r=' + encoded;
  }

  function storeButtons() {
    var wrap = el('div', 'stores');
    wrap.setAttribute('data-butikk', '');
    wrap.setAttribute('data-klar', 'nei');
    [['appStore', 'App Store'], ['googlePlay', 'Google Play']].forEach(function (s) {
      var a = el('a', 'store');
      a.setAttribute('data-butikk-lenke', s[0]);
      a.href = './#last-ned';
      a.appendChild(el('small', null, 'Last ned i'));
      a.appendChild(el('span', null, s[1]));
      wrap.appendChild(a);
    });
    wrap.appendChild(el('p', 'soon', 'Den kommer snart til iPhone, iPad og Android.'));
    return wrap;
  }

  function message(title, body, linkText) {
    root.textContent = '';
    root.appendChild(el('h1', null, title));
    root.appendChild(el('p', 'recipe__desc', body));
    var a = el('a', 'btn btn--gulrot', linkText);
    a.href = './';
    var actions = el('p');
    actions.appendChild(a);
    root.appendChild(actions);
    document.title = title + ' – Matboka';
  }

  function render(recipe, data) {
    root.textContent = '';

    var by = str(recipe.by);
    if (by) root.appendChild(el('p', 'recipe__by', by + ' delte denne oppskriften med deg'));
    root.appendChild(el('h1', null, str(recipe.t)));
    var desc = str(recipe.d);
    if (desc) root.appendChild(el('p', 'recipe__desc', desc));

    var groups = ingredientGroups(recipe.i);
    var steps = (Array.isArray(recipe.st) ? recipe.st : []).map(cleanStep).filter(Boolean);
    var facts = [];
    if (num(recipe.s)) facts.push(servings(num(recipe.s), str(recipe.sl)));
    var total = num(recipe.tt) || num(recipe.p) + num(recipe.c);
    if (total) facts.push(duration(total));
    var count = groups.reduce(function (sum, g) { return sum + g.items.length; }, 0);
    if (count) facts.push(count + (count === 1 ? ' ingrediens' : ' ingredienser'));
    if (steps.length) facts.push(steps.length + ' steg');
    if (facts.length) {
      var list = el('ul', 'facts');
      list.setAttribute('aria-label', 'Om oppskriften');
      facts.forEach(function (f) { list.appendChild(el('li', null, f)); });
      root.appendChild(list);
    }

    var source = safeUrl(str(recipe.su));
    var author = str(recipe.sa);
    if (source || author) {
      var line = el('p', 'recipe__source', 'Kilde: ');
      if (author) line.appendChild(document.createTextNode(author + (source ? ', ' : '')));
      if (source) {
        var a = el('a', null, source.hostname.replace(/^www\./, ''));
        a.href = source.href;
        a.rel = 'noopener noreferrer nofollow ugc';
        line.appendChild(a);
      }
      root.appendChild(line);
    }

    var save = el('section', 'save');
    save.setAttribute('aria-labelledby', 'lagre-tittel');
    var saveTitle = el('h2', null, 'Lagre den i Matboka');
    saveTitle.id = 'lagre-tittel';
    save.appendChild(saveTitle);
    save.appendChild(el('p', null, 'Da har du oppskriften i boka di, også uten nett.'));
    var open = el('a', 'btn btn--sjokolade', 'Åpne i Matboka');
    open.href = appLink(data);
    save.appendChild(open);
    save.appendChild(el('p', null, 'Har du ikke appen?'));
    save.appendChild(storeButtons());
    root.appendChild(save);

    if (groups.length) {
      root.appendChild(el('h2', 'section', 'Ingredienser'));
      groups.forEach(function (g) {
        if (g.title) root.appendChild(el('h3', 'group', g.title));
        var ul = el('ul', 'ingredients');
        ul.setAttribute('role', 'list');
        g.items.forEach(function (item) {
          var li = el('li');
          var label = el('label');
          var box = el('input');
          box.type = 'checkbox';
          label.appendChild(box);
          label.appendChild(el('span', null, item));
          li.appendChild(label);
          ul.appendChild(li);
        });
        root.appendChild(ul);
      });
    }

    if (steps.length) {
      root.appendChild(el('h2', 'section', 'Slik gjør du'));
      var ol = el('ol', 'steps');
      ol.setAttribute('role', 'list');
      steps.forEach(function (s) { ol.appendChild(el('li', null, s)); });
      root.appendChild(ol);
    }

    var notes = str(recipe.n);
    if (notes) {
      root.appendChild(el('h2', 'section', 'Notater'));
      root.appendChild(el('p', 'recipe__notes', notes));
    }

    var tags = (Array.isArray(recipe.g) ? recipe.g : []).map(str).filter(Boolean);
    if (tags.length) {
      var tagList = el('ul', 'tags');
      tagList.setAttribute('aria-label', 'Kategorier');
      tags.forEach(function (t) { tagList.appendChild(el('li', null, t)); });
      root.appendChild(tagList);
    }

    root.appendChild(el('p', 'privacy-note', 'Oppskriften ligger i selve lenken. Den sendes ikke til Matboka eller andre.'));
    document.title = str(recipe.t) + ' – Matboka';
    if (window.matbokaButikker) window.matbokaButikker(root);
  }

  function show() {
    var data = readData();
    if (!data) {
      message('Delte oppskrifter', 'Her åpnes oppskrifter som deles fra Matboka. Lenken du får, inneholder hele oppskriften.', 'Les om Matboka');
      return;
    }
    var recipe = decode(data);
    if (!recipe) {
      message('Lenken virker ikke', 'Den kan være kuttet av. Be om å få den sendt på nytt, eller som fil.', 'Til forsiden');
      return;
    }
    render(recipe, data);
    window.scrollTo(0, 0);
  }

  show();
  window.addEventListener('hashchange', show);
})();
