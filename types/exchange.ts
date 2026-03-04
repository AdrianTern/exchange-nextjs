export type CurrencyMap = Record<string, string>;

export type TrendDirection = 'UP' | 'DOWN' | 'STABLE';

export interface RateConversion {
  from: string;
  to: string;
  amount: number;
  rate: number;
  convertedAmount: number;
  date: string;
}

export interface HistoricalRate {
  date: string;
  rate: number;
}

export interface RateComparison {
  from: string;
  to: string;
  currentRate: number;
  previousRate: number;
  absoluteChange: number;
  percentageChange: number;
  trend: TrendDirection;
  date: string;
  history: HistoricalRate[];
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
  path: string;
}
