// ---------------- Helper Functions ----------------

export function wgSize(dim: number, size: number) {
  return Math.min(Math.ceil(dim / size), Infinity);
}

export function sampleFromDistribution(probs: number[]) {
  const rand = Math.random();
  let cumulativeProb = 0;
  for (let i = 0; i < probs.length; i++) {
    cumulativeProb += probs[i];
    if (rand < cumulativeProb) {
      return i;
    }
  }
  return probs.length - 1;
}

export function cpuSoftmax(logits: number[], temperature = 1.0) {
  const maxLogit = Math.max(...logits);
  const expLogits = logits.map((logit) =>
    Math.exp((logit - maxLogit) / temperature),
  );
  const sumExpLogits = expLogits.reduce((a, b) => a + b, 0);
  return expLogits.map((expLogit) => expLogit / sumExpLogits);
}

export function selectTopK(probs: ArrayLike<number>, top_k: number) {
  const sortedIndices = Array.from(probs)
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value)
    .map(({ index }) => index);
  const topKIndices = sortedIndices.slice(0, top_k);
  const topKProbs = topKIndices.map((index) => probs[index]);
  return { topKIndices, topKProbs };
}

// ----------------------- Matrix Operations -----------------------

export const zeros = (dim: number) => new Float32Array(dim).fill(0);

export function transpose(
  array: ArrayLike<number>,
  input_rows: number,
  input_cols: number,
) {
  if (array.length !== input_rows * input_cols) {
    // console.log(array.length, input_rows, input_cols);
    throw new Error("Transpose dims failed");
  }

  const transpose: number[] = [];
  for (let col = 0; col < input_cols; col++) {
    for (let row = 0; row < input_rows; row++) {
      transpose.push(array[row * input_cols + col]);
    }
  }

  return new Float32Array(transpose);
}

function leastPrimeFactor(n: number, start = 2) {
  for (let i = start; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return i;
  }
  return n;
}

function formatAsMatrix(floatArray: Float32Array, dimA: number, dimB: number) {
  const resultMatrix = [];
  for (let i = 0; i < dimA; i++) {
    resultMatrix.push(floatArray.slice(i * dimB, (i + 1) * dimB));
  }
  return resultMatrix;
}
