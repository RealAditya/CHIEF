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
    
    # Check each category's keywords
    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if re.search(rf'\b{keyword}\b', text_lower):
                warnings.append(f'category_inferred_from_{keyword}')
                return category, warnings
    
    # No match found
    return 'general', warnings + ['category_not_inferred']
