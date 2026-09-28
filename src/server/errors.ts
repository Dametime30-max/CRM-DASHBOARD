/** Expected, user-facing errors thrown by services. */
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export class NotFoundError extends DomainError {
  constructor(what: string) {
    super(`${what} not found`);
    this.name = "NotFoundError";
  }
}
