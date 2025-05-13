export class KaleidoError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'KaleidoError';
  }
}

export class NetworkError extends KaleidoError {
  constructor(message: string, statusCode?: number, response?: any) {
    super(message, statusCode, response);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends KaleidoError {
  constructor(message: string, statusCode?: number, response?: any) {
    super(message, statusCode, response);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends KaleidoError {
  constructor(message: string, statusCode?: number, response?: any) {
    super(message, statusCode, response);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends KaleidoError {
  constructor(message: string, statusCode?: number, response?: any) {
    super(message, statusCode, response);
    this.name = 'ValidationError';
  }
}

export class SwapError extends KaleidoError {
  constructor(message: string, statusCode?: number, response?: any) {
    super(message, statusCode, response);
    this.name = 'SwapError';
  }
}

export class TimeoutError extends KaleidoError {
  constructor(message: string, statusCode?: number, response?: any) {
    super(message, statusCode, response);
    this.name = 'TimeoutError';
  }
}

export class WebSocketError extends KaleidoError {
  constructor(message: string, statusCode?: number, response?: any) {
    super(message, statusCode, response);
    this.name = 'WebSocketError';
  }
}

export class AssetError extends KaleidoError {
  constructor(message: string, statusCode?: number, response?: any) {
    super(message, statusCode, response);
    this.name = 'AssetError';
  }
}

export class PairError extends KaleidoError {
  constructor(message: string, statusCode?: number, response?: any) {
    super(message, statusCode, response);
    this.name = 'PairError';
  }
}

export class QuoteError extends KaleidoError {
  constructor(message: string, statusCode?: number, response?: any) {
    super(message, statusCode, response);
    this.name = 'QuoteError';
  }
}

export class NodeError extends KaleidoError {
  constructor(message: string, statusCode?: number, response?: any) {
    super(message, statusCode, response);
    this.name = 'NodeError';
  }
} 