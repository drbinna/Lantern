/* "The gap this closes": a live race between Lantern and ground response.
   One shared clock runs sped up; every bar grows at the same rate and locks in
   when that responder arrives. React 18 (UMD), no build step. */
(function () {
  var root = document.getElementById('gap-race');
  if (!root || !window.React || !window.ReactDOM) return;

  var h = React.createElement;
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef;

  var MAX = 12;          // minutes on the axis
  var DURATION = 8000;   // ms of real time to play all 12 minutes (90x)
  var SPEED = Math.round(MAX * 60000 / DURATION);

  var ROWS = [
    { label: 'Lantern overhead', sub: 'design target, nearest dock', min: 1.5, fast: true },
    { label: 'First patrol car', sub: 'on a good day', min: 8 },
    { label: 'First patrol car', sub: 'across campus, during class change', min: 12 }
  ];

  function clock(m) {
    var s = Math.round(m * 60);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }
  function words(m) {
    var s = Math.round(m * 60), mm = Math.floor(s / 60), ss = s % 60;
    if (!mm) return ss + ' s';
    return ss ? mm + ' min ' + ss + ' s' : mm + ' min';
  }

  function caption(t) {
    if (t <= 0) return 'Scroll to start the clock.';
    if (t < 1.5) return 'An alert comes in. Everyone starts moving.';
    if (t < 8) return 'Lantern is overhead and streaming video. The first patrol car is still on its way.';
    if (t < 12) return 'On a good day, the first car arrives ' + words(8 - 1.5) + ' after Lantern. During class change, it takes longer.';
    return 'By the time the last car arrives, security has already had eyes on the scene for ' + words(12 - 1.5) + '.';
  }

  function Row(props) {
    var r = props.row, t = props.t;
    var shown = Math.min(t, r.min);
    var pct = shown / MAX * 100;
    var arrived = t >= r.min;
    var inside = pct > 22;
    var cls = 'fill' + (r.fast ? '' : ' slow') + (arrived ? ' arrived' : '') + (t > 0 && !arrived ? ' moving' : '');
    var labelText = arrived ? words(r.min) : clock(shown);
    var remaining = !arrived && t > 1.5 && !r.fast ? h('em', { className: 'eta' }, clock(r.min - t) + ' out') : null;
    return h('div', { className: 'row' + (arrived ? ' is-arrived' : '') },
      h('div', { className: 'label' }, r.label, h('small', null, r.sub)),
      h('div', { className: 'track', role: 'img', 'aria-label': r.label + ' (' + r.sub + '): ' + words(r.min) },
        h('div', { className: cls, style: { width: pct + '%' } },
          inside ? h('span', { className: 'val' }, arrived ? h('b', { className: 'tick', 'aria-hidden': 'true' }, '✓') : null, labelText) : null,
          h('i', { className: 'head', 'aria-hidden': 'true' })
        ),
        !inside ? h('span', { className: 'val out' + (r.fast ? '' : ' dim'), style: { left: 'calc(' + pct + '% + 10px)' } },
          arrived ? h('b', { className: 'tick', 'aria-hidden': 'true' }, '✓') : null, labelText) : null,
        remaining
      )
    );
  }

  function Race() {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var st = useState(reduce ? MAX : 0), t = st[0], setT = st[1];
    var run = useState(0), runId = run[0], setRun = run[1];
    var box = useRef(null), raf = useRef(0), started = useRef(false);

    function play() {
      cancelAnimationFrame(raf.current);
      var t0 = performance.now();
      function step(now) {
        var v = Math.min(MAX, (now - t0) / DURATION * MAX);
        setT(v);
        if (v < MAX) raf.current = requestAnimationFrame(step);
      }
      raf.current = requestAnimationFrame(step);
    }

    useEffect(function () {
      if (reduce) return;
      var io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting && !started.current) { started.current = true; play(); io.disconnect(); }
      }, { threshold: 0.45 });
      io.observe(box.current);
      return function () { io.disconnect(); cancelAnimationFrame(raf.current); };
    }, []);

    useEffect(function () { if (runId) play(); }, [runId]);

    var done = t >= MAX;
    return h('div', { ref: box, className: 'race' + (done ? ' done' : '') },
      h('div', { className: 'race-bar' },
        h('div', { className: 'race-clock', 'aria-hidden': 'true' },
          h('span', { className: 'dot' + (t > 0 && !done ? ' live' : '') }),
          'Elapsed ', h('b', null, clock(t)),
          h('span', { className: 'speed' }, ' · shown ' + SPEED + '× faster')
        ),
        h('button', { type: 'button', className: 'replay', onClick: function () { started.current = true; setT(0); setRun(runId + 1); }, disabled: t > 0 && !done },
          h('span', { 'aria-hidden': 'true' }, '↻ '), done || t === 0 ? 'Replay' : 'Playing…')
      ),
      h('div', { className: 'tl' }, ROWS.map(function (r, i) { return h(Row, { key: i, row: r, t: t }); })),
      h('div', { className: 'axis', 'aria-hidden': 'true' }, h('div'),
        h('div', { className: 'ticks' }, [0, 3, 6, 9, 12].map(function (n) { return h('span', { key: n, className: t >= n && t > 0 ? 'hit' : '' }, n === 12 ? '12 min' : n); }))),
      h('p', { className: 'race-caption', 'aria-live': 'polite' }, caption(t))
    );
  }

  ReactDOM.createRoot(root).render(h(Race));
})();
