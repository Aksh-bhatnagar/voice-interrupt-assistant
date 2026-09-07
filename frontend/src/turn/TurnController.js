import { TURN_STATES } from "./turnState";
import { sendTurn, cancelTurn } from "../api/backend";
import { stopSpeaking } from "../audio/tts";

class TurnController {
  constructor() {
    this.state = TURN_STATES.IDLE;
    this.activeTurnId = null;
    this.abortController = null;
  }

  createTurnId() {
    return crypto.randomUUID();
  }

  setState(state) {
    this.state = state;
    console.log(`[TURN] State: ${state}`);
  }

  async startTurn(message) {
    // Kill any previous turn first
    if (this.activeTurnId) {
      await this.interrupt(this.activeTurnId);
    }

    const turnId = this.createTurnId();

    this.activeTurnId = turnId;
    this.abortController = new AbortController();

    this.setState(TURN_STATES.THINKING);

    console.log(`[TURN] Started: ${turnId}`);

    try {
      const response = await sendTurn(
        turnId,
        message,
        this.abortController.signal
      );

      // Stale response protection
      if (response.turn_id !== this.activeTurnId) {
        console.log(
          `[TURN] Stale response ignored: ${response.turn_id}`
        );

        return null;
      }

      if (response.answer === "Turn cancelled") {
        console.log(`[TURN] Cancelled response ignored: ${turnId}`);
        return null;
      }

      this.setState(TURN_STATES.SPEAKING);

      return response;

    } catch (error) {
      if (error.name === "AbortError") {
        console.log(`[TURN] Fetch aborted: ${turnId}`);
        return null;
      }

      console.error(`[TURN] Error: ${turnId}`, error);
      throw error;

    } finally {
      if (this.activeTurnId === turnId) {
        this.activeTurnId = null;
        this.abortController = null;
      }
    }
  }

  async interrupt(turnId = this.activeTurnId) {
    if (!turnId) {
      return;
    }

    if (turnId !== this.activeTurnId) {
      console.log(`[TURN] Ignoring stale interrupt: ${turnId}`);
      return;
    }

    console.log(`[TURN] Interrupting: ${turnId}`);

    this.setState(TURN_STATES.INTERRUPTED);

    // Invalidate immediately
    this.activeTurnId = null;

    // STOP TTS immediately
    stopSpeaking();

    // Abort browser fetch immediately
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    // Tell backend to cancel its task
    try {
      const result = await cancelTurn(turnId);

      console.log(
        `[TURN] Backend cancellation:`,
        result
      );

    } catch (error) {
      console.error(
        `[TURN] Cancel request failed: ${turnId}`,
        error
      );
    }

    this.setState(TURN_STATES.LISTENING);

    console.log(`[TURN] Interrupted: ${turnId}`);
  }

  reset() {
    stopSpeaking();

    this.activeTurnId = null;
    this.abortController = null;

    this.setState(TURN_STATES.IDLE);
  }
}

export default TurnController;