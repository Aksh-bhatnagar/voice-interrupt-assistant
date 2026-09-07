import asyncio
from typing import Optional


class TurnManager:
    def __init__(self):
        self.active_turn_id: Optional[str] = None
        self.active_task: Optional[asyncio.Task] = None

    def start_turn(self, turn_id: str, task: asyncio.Task):
        # Cancel any previous turn first
        if self.active_task and not self.active_task.done():
            self.active_task.cancel()
            print(f"[TURN] Previous turn cancelled: {self.active_turn_id}")

        self.active_turn_id = turn_id
        self.active_task = task

        print(f"[TURN] Started: {turn_id}")

    async def cancel_turn(self, turn_id: str) -> bool:
        if turn_id != self.active_turn_id:
            print(f"[TURN] Ignored cancellation for stale turn: {turn_id}")
            return False

        if self.active_task and not self.active_task.done():
            self.active_task.cancel()

            try:
                await self.active_task
            except asyncio.CancelledError:
                pass

            print(f"[TURN] Cancelled: {turn_id}")

        self.active_turn_id = None
        self.active_task = None

        return True


turn_manager = TurnManager()