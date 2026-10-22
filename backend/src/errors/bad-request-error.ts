class BadRequestError extends Error {
  public statusCode: number;

  constructor(error: string) {
    super(error);
    this.statusCode = 400;
  }
}

export default BadRequestError;
