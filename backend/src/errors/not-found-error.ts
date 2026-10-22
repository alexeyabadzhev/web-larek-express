class NotFoundError extends Error {
  public statusCode: number;

  constructor(error: string) {
    super(error);
    this.statusCode = 404;
  }
}

export default NotFoundError;
