from typing import List, Dict, Any

from fastapi import APIRouter

from backend.app.core.module_loader import loader

router = APIRouter()


@router.get("/modules")
def list_modules() -> List[Dict[str, Any]]:
    """Return metadata for all discovered modules.

    The data is the same dictionary that each module exposes as MODULE.
    """
    return loader.get_modules()
