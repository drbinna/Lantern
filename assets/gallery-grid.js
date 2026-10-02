/* Gallery grid with lightbox, used twice in "Three parts. One system.":
   once for the three drones and once for the three docks.
   Ported from a shadcn GalleryGridBlock (cards with a hover overlay, click to
   open a lightbox with previous/next) to React 18 UMD + plain CSS, no build
   step. The source's heading and category filter are left out: each gallery
   sits inside a product card and holds three images.
   Mount point: <div class="gal" data-gallery="drones|docks">. */
(function () {
  if (!window.React || !window.ReactDOM) return;

  var h = React.createElement;
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef;

  var SETS = {
    drones: {
      label: 'Lantern drones',
      items: [
        {
          id: 'sentinel', title: 'Sentinel', tag: 'Campus & police', img: 'assets/drone-sentinel.webp',
          alt: 'Concept render of Lantern Sentinel: a white shelled quadcopter with prop guards, a cobalt accent band and a camera gimbal under the nose'
        },
        {
          id: 'quiver', title: 'Quiver', tag: 'Agriculture', img: 'assets/drone-quiver.webp',
          alt: 'Render of Arrow Air Project Quiver: a large open-source carbon-fiber quadcopter with folding arms and payload mounts',
          credit: { text: 'Project Quiver by Arrow Air, CERN-OHL-S-2.0', href: 'https://github.com/Arrow-air/project-quiver' }
        },
        {
          id: 'ranger', title: 'Ranger', tag: 'Mining', img: 'assets/drone-ranger.webp',
          alt: 'Concept render of Lantern Ranger: a white fixed-wing VTOL aircraft with four lift rotors on twin booms, an H-tail and a pusher propeller'
        }
      ]
    },
    docks: {
      label: 'Lantern docks',
      items: [
        {
          id: 'dock-sentinel', title: 'Sentinel dock', tag: 'Rooftop', img: 'assets/dock-sentinel.webp',
          alt: 'Concept render of the Sentinel dock: a compact white box with its roof doors folded down and the quadcopter standing on a raised landing pad'
        },
        {
          id: 'dock-quiver', title: 'Quiver dock', tag: 'Field', img: 'assets/dock-quiver.webp',
          alt: 'Concept render of the Quiver dock: a white shell slid apart in two halves on rails, with the heavy-lift quadcopter on the landing pad between them'
        },
        {
          id: 'dock-ranger', title: 'Ranger dock', tag: 'Remote site', img: 'assets/dock-ranger.webp',
          alt: 'Concept render of the Ranger dock: a long white shell slid apart in two halves on rails, with the winged VTOL aircraft on the landing pad between them'
        }
      ]
    }
  };

  function Icon(props) {
    return h('svg', { viewBox: '0 0 24 24', width: props.size || 24, height: props.size || 24, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
      props.paths.map(function (d, i) { return h('path', { key: i, d: d }); }));
  }
  var ZOOM = ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'M21 21l-4.3-4.3', 'M11 8v6', 'M8 11h6'];
  var LEFT = ['M15 18l-6-6 6-6'], RIGHT = ['M9 18l6-6-6-6'], CLOSE = ['M18 6L6 18', 'M6 6l12 12'];

  function Lightbox(props) {
    var items = props.items, i = props.index, cur = items[i];
    var closeRef = useRef(null);

    useEffect(function () {
      var prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      if (closeRef.current) closeRef.current.focus();
      function onKey(e) {
        if (e.key === 'Escape') props.onClose();
        else if (e.key === 'ArrowRight') props.onStep(1);
        else if (e.key === 'ArrowLeft') props.onStep(-1);
      }
      document.addEventListener('keydown', onKey);
      return function () { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
    }, []);

    function stop(fn) { return function (e) { e.stopPropagation(); fn(); }; }

    return ReactDOM.createPortal(
      h('div', { className: 'gal-lb', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'gal-lb-title', onClick: props.onClose },
        h('button', { type: 'button', className: 'gal-lb-btn gal-lb-close', 'aria-label': 'Close', ref: closeRef, onClick: stop(props.onClose) }, h(Icon, { paths: CLOSE })),
        h('button', { type: 'button', className: 'gal-lb-btn gal-lb-prev', 'aria-label': 'Previous image', onClick: stop(function () { props.onStep(-1); }) }, h(Icon, { paths: LEFT, size: 30 })),
        h('button', { type: 'button', className: 'gal-lb-btn gal-lb-next', 'aria-label': 'Next image', onClick: stop(function () { props.onStep(1); }) }, h(Icon, { paths: RIGHT, size: 30 })),
        h('figure', { className: 'gal-lb-fig', onClick: function (e) { e.stopPropagation(); } },
          h('img', { key: cur.id, src: cur.img, alt: cur.alt, width: 1100, height: 1100 }),
          h('figcaption', null,
            h('span', { className: 'gal-lb-title', id: 'gal-lb-title' }, cur.title),
            h('span', { className: 'gal-badge' }, cur.tag),
            h('span', { className: 'gal-lb-count' }, (i + 1) + ' / ' + items.length),
            cur.credit ? h('a', { className: 'gal-lb-credit', href: cur.credit.href, target: '_blank', rel: 'noopener' }, cur.credit.text) : null
          )
        )
      ),
      document.body
    );
  }

  function GalleryGrid(props) {
    var set = props.set, items = set.items, n = items.length;
    var st = useState(null), open = st[0], setOpen = st[1];
    var cards = useRef([]), last = useRef(null);

    function show(i) { last.current = i; setOpen(i); }
    function close() {
      setOpen(null);
      var el = cards.current[last.current];
      if (el) el.focus();
    }
    function step(d) { setOpen(function (i) { var j = (i + d + n) % n; last.current = j; return j; }); }

    return h(React.Fragment, null,
      h('ul', { className: 'gal-grid', 'aria-label': set.label },
        items.map(function (it, i) {
          return h('li', { key: it.id },
            h('button', {
              type: 'button', className: 'gal-card', 'aria-label': 'View ' + it.title + ' larger',
              ref: function (el) { cards.current[i] = el; }, onClick: function () { show(i); }
            },
              h('img', { src: it.img, alt: it.alt, width: 1100, height: 1100, loading: 'lazy', decoding: 'async', draggable: false }),
              h('span', { className: 'gal-name' }, it.title),
              h('span', { className: 'gal-over', 'aria-hidden': 'true' },
                h(Icon, { paths: ZOOM, size: 28 }),
                h('span', { className: 'gal-over-title' }, it.title),
                h('span', { className: 'gal-badge' }, it.tag)
              )
            )
          );
        })
      ),
      open !== null ? h(Lightbox, { items: items, index: open, onClose: close, onStep: step }) : null
    );
  }

  var mounts = document.querySelectorAll('[data-gallery]');
  for (var k = 0; k < mounts.length; k++) {
    var set = SETS[mounts[k].getAttribute('data-gallery')];
    if (set) ReactDOM.createRoot(mounts[k]).render(h(GalleryGrid, { set: set }));
  }
})();
