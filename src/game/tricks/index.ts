/**
 * Trick system: contract, constants, and all trick implementations.
 */
export { Trick, type TrickResult } from './Trick';

// Side-effect imports ensure tricks self-register when this barrel is loaded.
import './OfAKind';
import './Ascending';
import './Primes';
