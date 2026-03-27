export interface Trade {
  symbol: string;
  entry: number;
  exit: number;
  volume: number;
}

export interface TradeResult extends Trade {
  profit: number;
}