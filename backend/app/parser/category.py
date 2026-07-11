"""
Category detection for Smart Add parser.
"""

import re
from backend.app.config.parser_defaults import CATEGORY_KEYWORDS


def detect_category(text: str) -> tuple[str, list[str]]:
    """
    Detect category from text keywords.
    
    Returns: (category, warnings)
    
    Default category is 'general' if no keywords match.
    """
    warnings = []
    
    if not text:
        return 'general', warnings + ['no_text']
    
    text_lower = text.lower()
    
    # Collect all candidate matches with their positions to prefer earlier/stronger matches
    candidates: list[tuple[int, int, str, str]] = []  # (start_index, -keyword_len, category, keyword)
    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            m = re.search(rf'\b{re.escape(keyword)}\b', text_lower)
            if m:
                start = m.start()
                candidates.append((start, -len(keyword), category, keyword))

    if candidates:
        # Prefer the earliest match in text; break ties by longer keyword
        candidates.sort()
        best = candidates[0]
        _, _, category, keyword = best
        warnings.append(f'category_inferred_from_{keyword}')
        return category, warnings

    # No match found
    return 'general', warnings + ['category_not_inferred']
