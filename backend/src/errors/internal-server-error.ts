class InternalServerError extends Error {
  public statusCode: number;

  constructor(error: string) {
    super(error);
    this.statusCode = 500;
  }
}

export default InternalServerError;
