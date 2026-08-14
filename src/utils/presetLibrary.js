export const PRESETS = [
  {
    id: 'trig-harmonic',
    category: 'Trigonometry & Harmonics',
    name: 'Superposed Wave Harmonics',
    type: '2D',
    expression: 'sin(a * x) + 0.5 * sin(3 * a * x) + 0.25 * sin(5 * a * x)',
    params: { a: 1 },
    description: 'Fourier square wave synthesis approximation.'
  },
  {
    id: 'damped-osc',
    category: 'Physics & Signals',
    name: 'Damped Harmonic Oscillator',
    type: '2D',
    expression: 'exp(-0.2 * abs(x)) * cos(a * x)',
    params: { a: 4 },
    description: 'Physical representation of decaying oscillatory motion.'
  },
  {
    id: 'rational-chaos',
    category: 'Algebraic Curves',
    name: 'Rational Function Asymptotes',
    type: '2D',
    expression: '(x^3 - 4*x) / (x^2 + a)',
    params: { a: 1 },
    description: 'Rational curve with vertical/slant asymptotes.'
  },
  {
    id: 'polar-rose',
    category: 'Polar Geometry',
    name: '8-Petal Polar Rose',
    type: 'Polar',
    expression: 'cos(a * theta)',
    params: { a: 4 },
    description: 'Polar rose curve r = cos(k * theta).'
  },
  {
    id: 'polar-cardioid',
    category: 'Polar Geometry',
    name: 'Cardioid & Limaçon',
    type: 'Polar',
    expression: '1 + a * cos(theta)',
    params: { a: 1 },
    description: 'Heart-shaped polar limaçon curve.'
  },
  {
    id: 'parametric-butterfly',
    category: 'Parametric Art',
    name: 'Fay\'s Butterfly Curve',
    type: 'Parametric',
    exprX: 'sin(t) * (exp(cos(t)) - 2*cos(4*t) - sin(t/12)^5)',
    exprY: 'cos(t) * (exp(cos(t)) - 2*cos(4*t) - sin(t/12)^5)',
    tRange: [0, 37.7], // 12 * pi
    description: 'Famous transcendental butterfly parametric curve.'
  },
  {
    id: 'parametric-lissajous',
    category: 'Parametric Art',
    name: 'Lissajous Resonance',
    type: 'Parametric',
    exprX: '3 * sin(a * t)',
    exprY: '3 * sin(b * t + pi/4)',
    params: { a: 3, b: 2 },
    description: 'Lissajous figure representing harmonic ratio 3:2.'
  },
  {
    id: '3d-ripple',
    category: '3D WebGL Surfaces',
    name: 'Rippling Concentric Wave',
    type: '3D',
    expression: 'sin(sqrt(x^2 + y^2) * a) / (sqrt(x^2 + y^2) + 0.5)',
    params: { a: 2 },
    description: 'Damped 3D radial water drop surface wave.'
  },
  {
    id: '3d-saddle',
    category: '3D WebGL Surfaces',
    name: 'Hyperbolic Paraboloid (Saddle)',
    type: '3D',
    expression: '(x^2 - y^2) / a',
    params: { a: 4 },
    description: 'Classic 3D saddle surface z = (x^2 - y^2)/k.'
  },
  {
    id: '3d-egg-carton',
    category: '3D WebGL Surfaces',
    name: 'Quantum Grid (Egg Carton)',
    type: '3D',
    expression: 'sin(a * x) * cos(a * y)',
    params: { a: 1 },
    description: 'Bi-periodic wave potential landscape.'
  }
];
