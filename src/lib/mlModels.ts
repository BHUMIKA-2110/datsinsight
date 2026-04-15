import { SimpleLinearRegression } from 'ml-regression-simple-linear';
import MLR from 'ml-regression-multivariate-linear';
import { DecisionTreeClassifier } from 'ml-cart';
import type { DataRow } from './dataProcessing';

export type ModelType = 'linear-regression' | 'logistic-regression' | 'decision-tree';

export interface ModelResult {
  modelType: ModelType;
  targetColumn: string;
  featureColumns: string[];
  metrics: Record<string, number>;
  predictions: number[];
  actuals: number[];
  coefficients?: number[];
  intercept?: number;
}

function splitData(data: DataRow[], ratio = 0.8): { train: DataRow[]; test: DataRow[] } {
  const shuffled = [...data].sort(() => Math.random() - 0.5);
  const split = Math.floor(shuffled.length * ratio);
  return { train: shuffled.slice(0, split), test: shuffled.slice(split) };
}

function extractNumeric(data: DataRow[], cols: string[]): number[][] {
  return data.map(row => cols.map(c => Number(row[c]) || 0));
}

function rmse(predicted: number[], actual: number[]): number {
  const mse = predicted.reduce((s, p, i) => s + (p - actual[i]) ** 2, 0) / predicted.length;
  return Math.sqrt(mse);
}

function r2Score(predicted: number[], actual: number[]): number {
  const mean = actual.reduce((s, v) => s + v, 0) / actual.length;
  const ssRes = predicted.reduce((s, p, i) => s + (actual[i] - p) ** 2, 0);
  const ssTot = actual.reduce((s, v) => s + (v - mean) ** 2, 0);
  return ssTot === 0 ? 0 : 1 - ssRes / ssTot;
}

function accuracy(predicted: number[], actual: number[]): number {
  const correct = predicted.filter((p, i) => Math.round(p) === actual[i]).length;
  return correct / predicted.length;
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function trainModel(
  data: DataRow[],
  targetCol: string,
  featureCols: string[],
  modelType: ModelType,
  testRatio = 0.2
): ModelResult {
  const { train, test } = splitData(data, 1 - testRatio);
  const testActual = test.map(r => Number(r[targetCol]) || 0);

  if (modelType === 'linear-regression') {
    if (featureCols.length === 1) {
      const x = train.map(r => Number(r[featureCols[0]]) || 0);
      const y = train.map(r => Number(r[targetCol]) || 0);
      const model = new SimpleLinearRegression(x, y);
      const predictions = test.map(r => model.predict(Number(r[featureCols[0]]) || 0));
      return {
        modelType, targetColumn: targetCol, featureColumns: featureCols,
        predictions, actuals: testActual,
        coefficients: [model.slope], intercept: model.intercept,
        metrics: { RMSE: rmse(predictions, testActual), R2: r2Score(predictions, testActual), MAE: predictions.reduce((s, p, i) => s + Math.abs(p - testActual[i]), 0) / predictions.length },
      };
    }
    const X = extractNumeric(train, featureCols);
    const Y = train.map(r => [Number(r[targetCol]) || 0]);
    const model = new MLR(X, Y);
    const predictions = extractNumeric(test, featureCols).map(x => model.predict(x)[0]);
    return {
      modelType, targetColumn: targetCol, featureColumns: featureCols,
      predictions, actuals: testActual,
      metrics: { RMSE: rmse(predictions, testActual), R2: r2Score(predictions, testActual) },
    };
  }

  if (modelType === 'logistic-regression') {
    // Simple gradient descent logistic regression
    const X = extractNumeric(train, featureCols);
    const y = train.map(r => Number(r[targetCol]) || 0);
    const nFeatures = featureCols.length;
    const weights = new Array(nFeatures).fill(0);
    let bias = 0;
    const lr = 0.01;
    const epochs = 100;
    
    for (let e = 0; e < epochs; e++) {
      for (let i = 0; i < X.length; i++) {
        const z = X[i].reduce((s, x, j) => s + x * weights[j], 0) + bias;
        const pred = sigmoid(z);
        const error = pred - y[i];
        for (let j = 0; j < nFeatures; j++) {
          weights[j] -= lr * error * X[i][j];
        }
        bias -= lr * error;
      }
    }
    
    const testX = extractNumeric(test, featureCols);
    const predictions = testX.map(x => sigmoid(x.reduce((s, xi, j) => s + xi * weights[j], 0) + bias));
    const binaryPred = predictions.map(p => Math.round(p));
    return {
      modelType, targetColumn: targetCol, featureColumns: featureCols,
      predictions, actuals: testActual,
      coefficients: weights, intercept: bias,
      metrics: { Accuracy: accuracy(binaryPred, testActual), Precision: 0, Recall: 0 },
    };
  }

  // Decision Tree
  const X = extractNumeric(train, featureCols);
  const y = train.map(r => Number(r[targetCol]) || 0);
  const classifier = new DecisionTreeClassifier({ maxDepth: 5 });
  classifier.train(X, y);
  const testX = extractNumeric(test, featureCols);
  const predictions = testX.map(x => classifier.predict([x])[0]);
  return {
    modelType, targetColumn: targetCol, featureColumns: featureCols,
    predictions: predictions as number[], actuals: testActual,
    metrics: { Accuracy: accuracy(predictions as number[], testActual) },
  };
}
