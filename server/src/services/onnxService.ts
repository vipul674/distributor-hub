import fs from "node:fs";
import path from "node:path";
import * as ort from "onnxruntime-node";
import { ForecastInput } from "../types.js";

function extractNumbers(tensor: ort.Tensor): number[] {
  const values = Array.from(tensor.data as ArrayLike<number | bigint>);
  return values.map((value) => (typeof value === "bigint" ? Number(value) : Number(value)));
}

function reshape2D(flat: number[], columns: number): number[][] {
  if (columns <= 0 || flat.length % columns !== 0) {
    throw new Error(`Cannot reshape array of length ${flat.length} into columns=${columns}`);
  }

  const rows: number[][] = [];
  for (let index = 0; index < flat.length; index += columns) {
    rows.push(flat.slice(index, index + columns));
  }
  return rows;
}

export class OnnxService {
  private readonly modelDir: string;
  private demandSession: ort.InferenceSession | null = null;
  private trendScalerSession: ort.InferenceSession | null = null;
  private trendKmeansSession: ort.InferenceSession | null = null;

  constructor(modelDir: string) {
    this.modelDir = modelDir;
  }

  public async initialize(): Promise<void> {
    const demandPath = path.join(this.modelDir, "demand_forecast_rf.onnx");
    const trendScalerPath = path.join(this.modelDir, "trend_scaler.onnx");
    const trendKmeansPath = path.join(this.modelDir, "trend_kmeans.onnx");

    [demandPath, trendScalerPath, trendKmeansPath].forEach((filePath) => {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing model file: ${filePath}`);
      }
    });

    this.demandSession = await ort.InferenceSession.create(demandPath);
    this.trendScalerSession = await ort.InferenceSession.create(trendScalerPath);
    this.trendKmeansSession = await ort.InferenceSession.create(trendKmeansPath);
  }

  public async predictDemand(inputs: ForecastInput[]): Promise<number[]> {
    if (!this.demandSession) throw new Error("Demand model is not initialized");
    if (inputs.length === 0) return [];

    const matrix = inputs.map((input) => [input.year, input.month, input.lag1, input.lag2, input.rollingMean3]);
    const flat = new Float32Array(matrix.flat());
    const tensor = new ort.Tensor("float32", flat, [inputs.length, 5]);

    const feeds: Record<string, ort.Tensor> = {
      [this.demandSession.inputNames[0]]: tensor,
    };

    const result = await this.demandSession.run(feeds);
    const output = result[this.demandSession.outputNames[0]];

    if (!output) {
      throw new Error("Demand model returned empty output");
    }

    return extractNumbers(output).map((value) => Number(value.toFixed(3)));
  }

  public async classifyTrend(features: Array<{ avgQuantity: number; volatility: number }>): Promise<number[]> {
    if (!this.trendScalerSession || !this.trendKmeansSession) {
      throw new Error("Trend models are not initialized");
    }

    if (features.length === 0) return [];

    const featureTensor = new ort.Tensor(
      "float32",
      Float32Array.from(features.flatMap((feature) => [feature.avgQuantity, feature.volatility])),
      [features.length, 2]
    );

    const scalerFeeds: Record<string, ort.Tensor> = {
      [this.trendScalerSession.inputNames[0]]: featureTensor,
    };

    const scalerResult = await this.trendScalerSession.run(scalerFeeds);
    const scaledOutput = scalerResult[this.trendScalerSession.outputNames[0]];

    if (!scaledOutput) {
      throw new Error("Trend scaler returned empty output");
    }

    const scaledMatrix = reshape2D(extractNumbers(scaledOutput), 2);
    const kmeansInput = new ort.Tensor("float32", Float32Array.from(scaledMatrix.flat()), [features.length, 2]);

    const kmeansFeeds: Record<string, ort.Tensor> = {
      [this.trendKmeansSession.inputNames[0]]: kmeansInput,
    };

    const kmeansResult = await this.trendKmeansSession.run(kmeansFeeds);
    const labelsOutput = kmeansResult[this.trendKmeansSession.outputNames[0]];

    if (!labelsOutput) {
      throw new Error("Trend kmeans returned empty output");
    }

    return extractNumbers(labelsOutput).map((value) => Math.round(value));
  }
}
