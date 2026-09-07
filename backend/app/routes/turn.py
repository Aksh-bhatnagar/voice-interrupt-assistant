import asyncio

from fastapi import APIRouter

from app.models.schemas import (
    TurnRequest,
    TurnResponse,
    CancelTurnRequest,
    CancelTurnResponse,
)
from app.services.turn_manager import turn_manager
from app.services.retrieval import retrieve
from app.services.llm import generate_answer


router = APIRouter(prefix="/api", tags=["turn"])


async def process_turn(turn_id: str, message: str):
    print(f"[TURN] Processing: {turn_id}")

    try:
        # 1. Retrieval
        print(f"[TURN] Retrieval start: {turn_id}")

        results = retrieve(message, top_k=2)

        context = "\n\n".join(
            f"Source: {result['source']}\n{result['text']}"
            for result in results
        )

        print(f"[TURN] Retrieval complete: {turn_id}")

        # 2. LLM
        print(f"[TURN] LLM start: {turn_id}")

        answer = await generate_answer(
            question=message,
            context=context,
        )

        print(f"[TURN] LLM complete: {turn_id}")

        return answer

    except asyncio.CancelledError:
        print(f"[TURN] Processing cancelled: {turn_id}")
        raise

    except Exception as error:
        print(f"[TURN] Error: {turn_id} -> {error}")
        raise


@router.post("/turn", response_model=TurnResponse)
async def create_turn(request: TurnRequest):
    task = asyncio.create_task(
        process_turn(
            request.turn_id,
            request.message,
        )
    )

    turn_manager.start_turn(
        request.turn_id,
        task,
    )

    try:
        answer = await task

        return TurnResponse(
            turn_id=request.turn_id,
            answer=answer,
        )

    except asyncio.CancelledError:
        print(f"[TURN] Request cancelled: {request.turn_id}")

        return TurnResponse(
            turn_id=request.turn_id,
            answer="Turn cancelled",
        )


@router.post("/turn/cancel", response_model=CancelTurnResponse)
async def cancel_turn(request: CancelTurnRequest):
    cancelled = await turn_manager.cancel_turn(
        request.turn_id
    )

    return CancelTurnResponse(
        turn_id=request.turn_id,
        cancelled=cancelled,
    )