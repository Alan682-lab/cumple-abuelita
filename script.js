(() => {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pantallas = {};
  document.querySelectorAll('.pantalla').forEach((el) => { pantallas[el.id] = el; });

  let actual = 'bienvenida';
  let ocupado = false;

  /* ---------- Navegación ---------- */
  function irA(destino) {
    const origen = pantallas[actual];
    const siguiente = pantallas[destino];
    if (ocupado || !origen || !siguiente || destino === actual) return;
    ocupado = true;
    origen.classList.remove('activa');

    window.setTimeout(() => {
      origen.hidden = true;
      if (actual === 'ramo') Ramo.detener();
      siguiente.hidden = false;
      siguiente.scrollTop = 0;
      void siguiente.offsetWidth; // reinicia la transición
      siguiente.classList.add('activa');
      actual = destino;
      if (destino === 'ramo') Ramo.iniciar();
      ocupado = false;
    }, reducirMovimiento.matches ? 60 : 500);
  }

  /* ---------- Confeti (una sola vez por pulsación) ---------- */
  const Confeti = {
    contenedor: document.getElementById('confeti'),
    colores: ['#f4a6c0', '#f6d460', '#9db89a', '#fffdf7', '#e8a0bb', '#c9a24a'],
    lanzar() {
      if (!this.contenedor || reducirMovimiento.matches) return;
      const fragmento = document.createDocumentFragment();
      for (let i = 0; i < 40; i++) {
        const pieza = document.createElement('span');
        pieza.style.setProperty('--x', Math.random() * 100 + '%');
        pieza.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
        pieza.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
        pieza.style.setProperty('--t', (1.6 + Math.random() * 1.2) + 's');
        pieza.style.setProperty('--c', this.colores[i % this.colores.length]);
        fragmento.appendChild(pieza);
      }
      this.contenedor.appendChild(fragmento);
      window.setTimeout(() => { this.contenedor.textContent = ''; }, 3200);
    }
  };

  /* ---------- Ramo ---------- */
  const Ramo = {
    svg: document.getElementById('ramo-svg'),
    temporizadores: [],
    secuencia: [
      [100, 's-escenario'], [500, 's-tallos'], [1800, 's-hojas'], [2800, 's-tulipanes'],
      [4400, 's-girasoles'], [7000, 's-conjunto'], [8000, 's-destellos'], [8600, 's-fin']
    ],
    construido: false,

    construir() {
      if (this.construido || !this.svg) return;
      this.construido = true;
      this.svg.querySelectorAll('.sun').forEach((grupo) => {
        [[27, 7, 16, '#f8d04a', 0], [23, 6, 14, '#f0b92c', 1]].forEach(([cy, rx, ry, color, anillo]) => {
          const n = 14;
          for (let i = 0; i < n; i++) {
            const p = document.createElementNS(SVG_NS, 'ellipse');
            p.setAttribute('cy', -cy);
            p.setAttribute('rx', rx);
            p.setAttribute('ry', ry);
            p.setAttribute('fill', color);
            p.setAttribute('transform', `rotate(${(i * 360) / n + anillo * (180 / n)})`);
            grupo.appendChild(p);
          }
        });
        const centro = document.createElementNS(SVG_NS, 'circle');
        centro.setAttribute('r', 15);
        centro.setAttribute('fill', '#6b4423');
        grupo.appendChild(centro);
        for (let i = 1; i <= 34; i++) {
          const a = i * 137.5 * (Math.PI / 180);
          const r = 2.4 * Math.sqrt(i);
          const s = document.createElementNS(SVG_NS, 'circle');
          s.setAttribute('cx', (Math.cos(a) * r).toFixed(2));
          s.setAttribute('cy', (Math.sin(a) * r).toFixed(2));
          s.setAttribute('r', 1);
          s.setAttribute('fill', i % 3 ? '#3b2410' : '#a8743a');
          grupo.appendChild(s);
        }
      });
      const chispas = this.svg.querySelector('#chispas');
      const posiciones = [[40, 70], [262, 80], [24, 190], [278, 200], [150, 28], [95, 40], [210, 38], [60, 130], [245, 140]];
      posiciones.forEach(([x, y], i) => {
        const e = document.createElementNS(SVG_NS, 'path');
        e.setAttribute('class', 'chispa');
        e.setAttribute('d', 'M0-9L2.5-2.5L9 0L2.5 2.5L0 9L-2.5 2.5L-9 0L-2.5-2.5Z');
        e.setAttribute('transform', `translate(${x} ${y}) scale(${i % 2 ? 0.8 : 1.1})`);
        e.style.setProperty('--d', (i * 0.25) + 's');
        chispas.appendChild(e);
      });
    },

    iniciar() {
      if (!this.svg) return;
      this.construir();
      this.detener();
      if (reducirMovimiento.matches) {
        this.secuencia.forEach(([, clase]) => this.svg.classList.add(clase));
        document.getElementById('dedicatoria').classList.add('s-fin');
        return;
      }
      this.secuencia.forEach(([retardo, clase]) => {
        this.temporizadores.push(window.setTimeout(() => {
          if (clase === 's-fin') document.getElementById('dedicatoria').classList.add('s-fin');
          else this.svg.classList.add(clase);
        }, retardo));
      });
    },

    detener() {
      this.temporizadores.forEach(window.clearTimeout);
      this.temporizadores = [];
      if (!this.svg) return;
      this.secuencia.forEach(([, clase]) => this.svg.classList.remove(clase));
      const ded = document.getElementById('dedicatoria');
      if (ded) ded.classList.remove('s-fin');
    }
  };

  /* ---------- Eventos ---------- */
  document.querySelectorAll('[data-ir]').forEach((boton) => {
    boton.addEventListener('click', () => {
      if (ocupado) return;
      if (boton.hasAttribute('data-confeti')) Confeti.lanzar();
      irA(boton.getAttribute('data-ir'));
    });
  });
})();
