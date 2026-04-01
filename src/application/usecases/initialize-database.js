import { DatabaseInitError } from '../../domain/errors.js';

export class InitializeDatabaseUseCase {
  constructor({ databasePort }) {
    this.databasePort = databasePort;
  }

  async execute() {
    try {
      await this.databasePort.initialize();
    } catch (cause) {
      throw new DatabaseInitError(cause);
    }
  }
}
