import { InitializeDatabaseUseCase } from '../application/usecases/initialize-database.js';
import { AddPlayerUseCase } from '../application/usecases/add-player.js';
import { DrawQuestionUseCase } from '../application/usecases/draw-question.js';
import { RemovePlayerUseCase } from '../application/usecases/remove-player.js';
import { GetImpostorWordUseCase } from '../application/usecases/get-impostor-word.js';
import {
  SqlJsDatabaseAdapter,
  SqlJsQuestionRepositoryAdapter,
  SqlJsPlayerRepositoryAdapter,
  QuestionsDatabaseAdapter,
  PlayersDatabaseAdapter,
} from '../infrastructure/sqlite-adapter.js';
import { PreferencesStore } from './preferences-store.js';
import { TextToSpeech } from '../shared/text-to-speech.js';

export function createDependencies() {
  const questionsDb = new QuestionsDatabaseAdapter();
  const playersDb = new PlayersDatabaseAdapter();
  const databasePort = new SqlJsDatabaseAdapter(questionsDb, playersDb);
  const questionRepositoryPort = new SqlJsQuestionRepositoryAdapter(questionsDb);
  const playerRepositoryPort = new SqlJsPlayerRepositoryAdapter(playersDb);
  const preferencesStore = new PreferencesStore();

  const addPlayerUseCase = new AddPlayerUseCase({ playerRepositoryPort });
  const removePlayerUseCase = new RemovePlayerUseCase({ playerRepositoryPort });
  const textToSpeech = new TextToSpeech();

  return {
    databasePort,
    questionRepositoryPort,
    playerRepositoryPort,
    preferencesStore,
    initializeDatabaseUseCase: new InitializeDatabaseUseCase({ databasePort }),
    addPlayerUseCase,
    removePlayerUseCase,
    drawQuestionUseCase: new DrawQuestionUseCase({ playerRepositoryPort, questionRepositoryPort }),
    getImpostorWordUseCase: new GetImpostorWordUseCase({ questionRepositoryPort }),
    textToSpeech,
  };
}
