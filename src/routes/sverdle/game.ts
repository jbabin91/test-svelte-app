import { allowed, words } from './words.server';

export class Game {
  index: number;
  guesses: string[];
  answers: string[];
  answer: string;

  /**
   * Create a game object from the player's cookie, or initialise a new game
   */
  constructor(serialized?: string | undefined) {
    if (serialized) {
      const [index, guesses, answers] = serialized.split('-');

      this.index = +index;
      this.guesses = guesses ? guesses.split(' ') : [];
      this.answers = answers ? answers.split(' ') : [];
    } else {
      this.index = Math.floor(Math.random() * words.length);
      this.guesses = ['', '', '', '', '', ''];
      this.answers = [];
    }

    this.answer = words[this.index];
  }

  /**
   * Update game state based on a guess of a five-letter word. Returns
   * true if the guess was valid, false otherwise
   */
  enter(letters: string[]) {
    const word = letters.join('');
    const valid = allowed.has(word);

    if (!valid) return false;

    this.guesses[this.answers.length] = word;

    const available = [...this.answer];
    const answer = Array.from({ length: 5 }).fill('_');

    // first, find exact matches
    for (let index = 0; index < 5; index += 1) {
      if (letters[index] === available[index]) {
        answer[index] = 'x';
        available[index] = ' ';
      }
    }

    // then find close matches (this has to happen
    // in a second step, otherwise an early close
    // match can prevent a later exact match)
    for (let index_ = 0; index_ < 5; index_ += 1) {
      if (answer[index_] === '_') {
        const index = available.indexOf(letters[index_]);
        if (index !== -1) {
          answer[index_] = 'c';
          available[index] = ' ';
        }
      }
    }

    this.answers.push(answer.join(''));

    return true;
  }

  /**
   * Serialize game state so it can be set as a cookie
   */
  toString() {
    return `${this.index}-${this.guesses.join(' ')}-${this.answers.join(' ')}`;
  }
}
