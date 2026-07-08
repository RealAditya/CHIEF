from __future__ import annotations

import importlib
from pathlib import Path
from typing import Any, Dict, List

from backend.app.core.logging import get_logger


class ModuleLoader:
    """Simple, explicit module discovery and registry.

    - Scans a directory for subpackages that contain an __init__.py
    - Imports each package as "backend.app.modules.<name>"
    - Reads a MODULE dict from the package and stores it in memory

    This loader is intentionally small and dependency-free to keep the
    sprint scope minimal.
    """

    def __init__(self, modules_path: Path | str) -> None:
        self._modules_path = Path(modules_path)
        self._logger = get_logger("chief.module_loader")
        self._registry: List[Dict[str, Any]] = []

    def discover(self) -> None:
        """Discover modules on disk and import their metadata.

        This method is idempotent for a process lifetime: repeated calls will
        clear and repopulate the in-memory registry.
        """
        self._registry.clear()

        if not self._modules_path.exists():
            self._logger.info("modules path does not exist: %s", self._modules_path)
            return

        for entry in sorted(self._modules_path.iterdir()):
            if not entry.is_dir():
                continue

            init_py = entry / "__init__.py"
            if not init_py.exists():
                # not a python package
                continue

            module_pkg = f"backend.app.modules.{entry.name}"
            try:
                mod = importlib.import_module(module_pkg)
            except Exception as exc:
                self._logger.exception("Failed to import module %s: %s", entry.name, exc)
                continue

            meta = getattr(mod, "MODULE", None)
            if isinstance(meta, dict):
                # keep a shallow copy to avoid accidental mutation by modules
                self._registry.append(dict(meta))
                # Log discovery as required by the sprint
                self._logger.info("Discovered module: %s", meta.get("name", entry.name))
            else:
                self._logger.warning("Module %s did not expose a MODULE dict", entry.name)

    def get_modules(self) -> List[Dict[str, Any]]:
        """Return the list of discovered module metadata.

        A shallow copy is returned to ensure callers cannot mutate the
        internal registry.
        """
        return list(self._registry)


# Create a module-level loader instance that other parts of the app can import.
DEFAULT_MODULES_PATH = Path(__file__).parent.parent / "modules"
loader = ModuleLoader(DEFAULT_MODULES_PATH)
