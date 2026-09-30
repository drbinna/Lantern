/* "The fleet": one airframe per market, shown as a synced accordion + image tabs.
   Layout ported from a shadcn FeatureShowcase (tabs, accordion, stat chips, CTAs)
   to React 18 UMD + plain CSS, no build step. Selecting a drone in either the
   list or the pill tabs updates both. */
(function () {
  var root = document.getElementById('drone-gallery');
  if (!root || !window.React || !window.ReactDOM) return;

  var h = React.createElement;
  var useState = React.useState, useRef = React.useRef;

  var DRONES = [
    {
      id: 'sentinel', name: 'Sentinel', tab: 'Campus & police',
      market: 'Campus security, police departments',
      img: 'assets/drone-sentinel.webp',
      alt: 'Concept render of Lantern Sentinel: a white shelled quadcopter with prop guards, a cobalt accent band and a camera gimbal under the nose',
      note: 'Concept render',
      lede: 'Our X650 prototype in a proper shell. It lives in the rooftop dock, launches on an alert and is overhead in about 90 seconds.',
      specs: [
        ['Airframe', 'Quadcopter, 650 mm wheelbase, guarded props'],
        ['Sensors', 'RGB + thermal gimbal'],
        ['Safety', 'Parachute, ADS-B In, geofenced no-fly zones'],
        ['Brain', 'Pixhawk / PX4 + Jetson Orin NX']
      ]
    },
    {
      id: 'quiver', name: 'Quiver', tab: 'Agriculture',
      market: 'Farms and ranches',
      img: 'assets/drone-quiver.webp',
      alt: 'Render of Arrow Air Project Quiver: a large open-source carbon-fiber quadcopter with folding arms and payload mounts',
      note: 'Render from Arrow Air’s open CAD',
      credit: { text: 'Project Quiver by Arrow Air, CERN-OHL-S-2.0', href: 'https://github.com/Arrow-air/project-quiver' },
      lede: 'An open-source heavy-lift platform from Arrow Air. It carries enough payload for multispectral mapping and can fly long perimeter patrols over fields and livestock.',
      specs: [
        ['Airframe', 'Quadcopter, 25 kg max takeoff weight'],
        ['Payload', '5–8 kg across 3 hot-swap mounts'],
        ['Endurance', '25–31 min hover'],
        ['Navigation', 'Dual RTK GNSS, ArduPilot']
      ]
    },
    {
      id: 'ranger', name: 'Ranger', tab: 'Mining',
      market: 'Mines and large industrial sites',
      img: 'assets/drone-ranger.webp',
      alt: 'Concept render of Lantern Ranger: a white fixed-wing VTOL aircraft with four lift rotors on twin booms, an H-tail and a pusher propeller',
      note: 'Concept render',
      lede: 'A winged VTOL for sites measured in miles. It takes off straight up from the dock, then cruises on the wing to reach a remote haul road or tailings dam.',
      specs: [
        ['Airframe', 'Quadplane, 2.4 m wingspan, H-tail'],
        ['Propulsion', '4 lift rotors + rear pusher for cruise'],
        ['Sensors', 'RGB + thermal nose gimbal'],
        ['Operations', 'Beyond visual line of sight, needs FAA waiver']
      ]
    }
  ];

  var STATS = ['3 airframes', '1 dock network', 'Thermal on every drone'];

  function Chevron() {
    return h('svg', { className: 'chev', viewBox: '0 0 16 16', width: 16, height: 16, 'aria-hidden': 'true' },
      h('path', { d: 'M4 6l4 4 4-4', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }));
  }

  function Item(props) {
    var d = props.d, open = props.open;
    return h('div', { className: 'acc-item' + (open ? ' is-open' : '') },
      h('h3', { className: 'acc-h' },
        h('button', {
          type: 'button', className: 'acc-btn', id: 'acc-' + d.id,
          'aria-expanded': open, 'aria-controls': 'accp-' + d.id,
          onClick: props.onPick
        },
          h('span', { className: 'acc-name' }, d.name),
          h('span', { className: 'acc-market' }, d.market),
          h(Chevron)
        )
      ),
      h('div', { className: 'acc-panel', id: 'accp-' + d.id, role: 'region', 'aria-labelledby': 'acc-' + d.id, hidden: !open },
        h('p', { className: 'acc-lede' }, d.lede),
        h('dl', { className: 'acc-specs' }, d.specs.map(function (s) {
          return h('div', { key: s[0] }, h('dt', null, s[0]), h('dd', null, s[1]));
        }))
      )
    );
  }

  function Gallery() {
    var st = useState(0), active = st[0], setActive = st[1];
    var tabs = useRef([]), touch = useRef(null);
    var n = DRONES.length;

    function pick(i) { setActive((i + n) % n); }

    function onTabKey(e) {
      var i = active;
      if (e.key === 'ArrowRight') i = active + 1;
      else if (e.key === 'ArrowLeft') i = active - 1;
      else if (e.key === 'Home') i = 0;
      else if (e.key === 'End') i = n - 1;
      else return;
      e.preventDefault();
      i = (i + n) % n; setActive(i);
      if (tabs.current[i]) tabs.current[i].focus();
    }

    function onTouchStart(e) { touch.current = e.touches[0].clientX; }
    function onTouchEnd(e) {
      if (touch.current == null) return;
      var dx = e.changedTouches[0].clientX - touch.current; touch.current = null;
      if (Math.abs(dx) > 40) pick(active + (dx < 0 ? 1 : -1));
    }

    var cur = DRONES[active];

    return h('div', { className: 'fleet-grid' },
      h('div', { className: 'fleet-head' },
        h('h2', { id: 'fleet-title', className: 'big' }, 'One system. A drone for every site.'),
        h('p', { className: 'fleet-desc' }, 'Every Lantern drone runs the same software, answers the same camera alerts and returns to the same dock. The airframe is chosen to fit the site: guarded rotors over a campus, heavy lift over a farm, wings over a mine.'),
        h('ul', { className: 'chips', 'aria-label': 'Fleet at a glance' }, STATS.map(function (s) { return h('li', { key: s }, s); }))
      ),

      h('div', { className: 'fleet-media' },
        h('div', {
          className: 'stage', onTouchStart: onTouchStart, onTouchEnd: onTouchEnd,
          role: 'tabpanel', id: 'fleet-panel', 'aria-labelledby': 'fleet-tab-' + cur.id
        },
          DRONES.map(function (d, i) {
            return h('img', {
              key: d.id, src: d.img, alt: i === active ? d.alt : '', 'aria-hidden': i === active ? null : 'true',
              className: i === active ? 'on' : '', width: 1100, height: 1100,
              loading: i === 0 ? 'eager' : 'lazy', decoding: 'async', draggable: false
            });
          }),
          h('div', { className: 'stage-top' },
            h('span', { className: 'stage-name' }, cur.name, h('small', null, cur.tab)),
            h('span', { className: 'stage-note' }, cur.note)
          ),
          h('div', { className: 'pills', role: 'tablist', 'aria-label': 'Choose a drone', onKeyDown: onTabKey },
            DRONES.map(function (d, i) {
              var on = i === active;
              return h('button', {
                key: d.id, type: 'button', role: 'tab', id: 'fleet-tab-' + d.id,
                'aria-selected': on, 'aria-controls': 'fleet-panel', tabIndex: on ? 0 : -1,
                className: on ? 'on' : '', ref: function (el) { tabs.current[i] = el; },
                onClick: function () { pick(i); }
              }, d.tab);
            })
          )
        ),
        cur.credit
          ? h('p', { className: 'stage-credit' }, h('a', { href: cur.credit.href, target: '_blank', rel: 'noopener' }, cur.credit.text))
          : null
      ),

      h('div', { className: 'fleet-list' },
        h('div', { className: 'acc' }, DRONES.map(function (d, i) {
          return h(Item, { key: d.id, d: d, open: i === active, onPick: function () { pick(i); } });
        })),
        h('div', { className: 'fleet-cta' },
          h('a', { className: 'btn primary', href: 'mailto:obi@lanternaero.com?subject=Lantern%20pilot' }, 'Set up a pilot'),
          h('a', { className: 'btn', href: '#how' }, 'See how a response works')
        ),
        h('p', { className: 'fleet-trust' }, 'Whatever flies, the rules stay the same. Each site publishes a flight log of what triggered each flight and how long it lasted, and footage is deleted after 30 days.')
      )
    );
  }

  ReactDOM.createRoot(root).render(h(Gallery));
})();
