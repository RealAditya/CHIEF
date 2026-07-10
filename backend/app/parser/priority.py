"""
Priority detection for Smart Add parser.
"""

import re
from backend.app.config.parser_defaults import PRIORITY_KEYWORDS


def detect_priority(text: str) -> tuple[str, list[str]]:
    """
    Detect priority from text keywords.
    
    Returns: (priority, warnings)
    
    Priority levels: high, normal, low
    Default is 'normal'.
    """
    warnings = []
    
    if not text:
        return 'normal', warnings
    
    text_lower = text.lower()
    
    # Check for high priority keywords
    for keyword in PRIORITY_KEYWORDS.get('high', []):
        if re.search(rf'\b{keyword}\b', text_lower):
            warnings.append('priority_high_inferred')
            return 'high', warnings
    
    # Check for low priority keywords
    for keyword in PRIORITY_KEYWORDS.get('low', []):
        if re.search(rf'\b{keyword}\b', text_lower):
            warnings.append('priority_low_inferred')
            return 'low', warnings
    
    # Default to normal
    return 'normal', warnings
