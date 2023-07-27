import {
  AttentionBlockClass,
  DeEmbedBlockClass,
  EmbedBlockClass,
  FastMatMulBlockClass,
  GeluBlockClass,
  LayerNormBlockClass,
  ResidualBlockClass,
  SoftmaxBlockClass,
} from "./instructions";

export const FastMatMulBlock = new FastMatMulBlockClass();
export const AttentionBlock = new AttentionBlockClass();
export const ResidualBlock = new ResidualBlockClass();
export const EmbedBlock = new EmbedBlockClass();
export const DeEmbedBlock = new DeEmbedBlockClass();
export const GeluBlock = new GeluBlockClass();
export const LayerNormBlock = new LayerNormBlockClass();
export const SoftmaxBlock = new SoftmaxBlockClass();

// Needed for deletion.
let operations = [
  FastMatMulBlock,
  AttentionBlock,
  ResidualBlock,
  EmbedBlock,
  DeEmbedBlock,
  GeluBlock,
  LayerNormBlock,
  SoftmaxBlock,
];

export function initializeOperations(device: GPUDevice) {
  for (const operation of operations) operation.initialize(device);
}

function destroyOperationBuffers() {
  for (const operation of operations) operation.destroyBuffers();
}

export function clearOperationCache() {
  for (const operation of operations) operation.clearBufferCache();
}

function destroyOperations() {
  for (const operation of operations) operation.destroy();
}

export const bufferUsageDict = {
  copy_from: GPUBufferUsage.COPY_SRC,
  copy_to: GPUBufferUsage.COPY_DST,
  storage: GPUBufferUsage.STORAGE,
  uniform: GPUBufferUsage.UNIFORM,
  map_read: GPUBufferUsage.MAP_READ,
};
