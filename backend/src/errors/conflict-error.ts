class ConflictError extends Error {
  public statusCode: number;

  constructor(error: string) {
    super(error);
    this.statusCode = 409;
  }
}

export default ConflictError;
