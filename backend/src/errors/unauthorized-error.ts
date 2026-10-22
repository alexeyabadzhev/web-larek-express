class UnauthorizedError extends Error {
  public statusCode: number;

  constructor(error: string) {
    super(error);
    this.statusCode = 401;
  }
}

export default UnauthorizedError;
