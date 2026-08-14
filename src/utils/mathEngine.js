import * as math from 'mathjs';

// Pre-configured custom math scope and safe evaluation helper
export function evaluateExpression(expr, scope = {}) {
  try {
    if (!expr || expr.trim() === '') return { result: null, error: null };
    
    // Replace standard UI symbols with mathjs symbols if needed
    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'pi')
      .replace(/√\(([^)]+)\)/g, 'sqrt($1)')
      .replace(/√/g, 'sqrt');

    const compiled = math.compile(sanitized);
    const res = compiled.evaluate(scope);
    return { result: res, error: null };
  } catch (err) {
    return { result: null, error: err.message || 'Invalid Expression' };
  }
}

// Evaluate f(x) over a range for 2D Plotting
export function evaluateFunction2D(expr, xVal, parameters = {}) {
  try {
    const scope = { x: xVal, ...parameters, pi: Math.PI, e: Math.E };
    const { result, error } = evaluateExpression(expr, scope);
    if (error || result === undefined || result === null || typeof result === 'object' && !result.isBigNumber) {
      if (typeof result === 'number' && !isNaN(result)) return result;
      return NaN;
    }
    return typeof result === 'number' ? result : Number(result);
  } catch {
    return NaN;
  }
}

// Evaluate f(x, y) for 3D Plotting
export function evaluateFunction3D(expr, xVal, yVal, parameters = {}) {
  try {
    const scope = { x: xVal, y: yVal, ...parameters, pi: Math.PI, e: Math.E };
    const { result, error } = evaluateExpression(expr, scope);
    if (error || typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
      return NaN;
    }
    return result;
  } catch {
    return NaN;
  }
}

// Evaluate Polar r(theta)
export function evaluatePolar(expr, thetaVal, parameters = {}) {
  try {
    const scope = { theta: thetaVal, t: thetaVal, ...parameters, pi: Math.PI, e: Math.E };
    const { result, error } = evaluateExpression(expr, scope);
    if (error || typeof result !== 'number' || isNaN(result)) return NaN;
    return result;
  } catch {
    return NaN;
  }
}

// Evaluate Parametric x(t), y(t)
export function evaluateParametric(exprX, exprY, tVal, parameters = {}) {
  try {
    const scope = { t: tVal, ...parameters, pi: Math.PI, e: Math.E };
    const resX = evaluateExpression(exprX, scope).result;
    const resY = evaluateExpression(exprY, scope).result;
    if (typeof resX !== 'number' || typeof resY !== 'number' || isNaN(resX) || isNaN(resY)) {
      return { x: NaN, y: NaN };
    }
    return { x: resX, y: resY };
  } catch {
    return { x: NaN, y: NaN };
  }
}

// Numerical Derivative f'(x) via Central Difference
export function numericalDerivative(expr, xVal, parameters = {}, h = 1e-5) {
  const yPlus = evaluateFunction2D(expr, xVal + h, parameters);
  const yMinus = evaluateFunction2D(expr, xVal - h, parameters);
  if (isNaN(yPlus) || isNaN(yMinus)) return NaN;
  return (yPlus - yMinus) / (2 * h);
}

// Numerical Definite Integral via Simpson's 1/3 Rule
export function numericalIntegral(expr, a, b, parameters = {}, n = 200) {
  if (a >= b) return 0;
  if (n % 2 !== 0) n += 1;
  const h = (b - a) / n;
  let sum = evaluateFunction2D(expr, a, parameters) + evaluateFunction2D(expr, b, parameters);

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const y = evaluateFunction2D(expr, x, parameters);
    if (!isNaN(y)) {
      sum += (i % 2 === 0 ? 2 : 4) * y;
    }
  }

  return (h / 3) * sum;
}

// Find Zeros / Roots in range [minX, maxX]
export function findRoots(expr, minX = -10, maxX = 10, step = 0.2, parameters = {}) {
  const roots = [];
  let prevX = minX;
  let prevY = evaluateFunction2D(expr, prevX, parameters);

  for (let x = minX + step; x <= maxX; x += step) {
    const y = evaluateFunction2D(expr, x, parameters);
    if (!isNaN(prevY) && !isNaN(y) && prevY * y <= 0) {
      // Bisection refinement
      let low = prevX;
      let high = x;
      for (let k = 0; k < 20; k++) {
        const mid = (low + high) / 2;
        const yMid = evaluateFunction2D(expr, mid, parameters);
        if (Math.abs(yMid) < 1e-7) {
          low = mid;
          break;
        }
        if (evaluateFunction2D(expr, low, parameters) * yMid <= 0) {
          high = mid;
        } else {
          low = mid;
        }
      }
      const rootVal = (low + high) / 2;
      if (!roots.some(r => Math.abs(r - rootVal) < 0.05)) {
        roots.push(Number(rootVal.toFixed(4)));
      }
    }
    prevX = x;
    prevY = y;
  }
  return roots;
}

// Matrix Operations
export function calculateMatrixOps(matrixA, matrixB = null) {
  try {
    const matA = math.matrix(matrixA);
    const detA = math.det(matA);
    const invA = Math.abs(detA) > 1e-9 ? math.inv(matA).toArray() : 'Non-invertible';
    const transA = math.transpose(matA).toArray();

    let product = null;
    if (matrixB && matrixB.length === matrixA[0].length) {
      const matB = math.matrix(matrixB);
      product = math.multiply(matA, matB).toArray();
    }

    return {
      detA: typeof detA === 'number' ? Number(detA.toFixed(4)) : detA,
      invA,
      transA,
      product,
      error: null
    };
  } catch (err) {
    return { error: err.message || 'Matrix calculation error' };
  }
}

// Statistical Regression (Linear y = mx + c)
export function calculateLinearRegression(points) {
  if (!points || points.length < 2) return null;
  const n = points.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
    sumY2 += p.y * p.y;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (Math.abs(denom) < 1e-12) return null;

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // Correlation R^2
  const numeratorR = (n * sumXY - sumX * sumY);
  const denominatorR = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  const rSquare = denominatorR !== 0 ? Math.pow(numeratorR / denominatorR, 2) : 0;

  return {
    slope: Number(slope.toFixed(4)),
    intercept: Number(intercept.toFixed(4)),
    rSquare: Number(rSquare.toFixed(4)),
    equation: `y = ${slope.toFixed(3)}x ${intercept >= 0 ? '+' : '-'} ${Math.abs(intercept).toFixed(3)}`
  };
}
