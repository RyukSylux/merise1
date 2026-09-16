export interface IUnitOfWork {
  executeInTransaction<T>(operation: () => Promise<T>): Promise<T>;
}
