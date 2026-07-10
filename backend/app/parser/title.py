"""
Title inference for Smart Add parser.
"""

import re
from backend.app.config.parser_defaults import (
    WEEKDAYS, MONTHS, TIME_DEFAULTS, ORDINALS
)


def infer_title(text: str, parsed_date=None, parsed_time=None) -> tuple[str, list[str]]:
    """
    Infer title from text by removing date/time/duration tokens.
    
    Returns: (title, warnings)
    
    Strategy:
    1. Remove date keywords (today, tomorrow, next monday, etc.)
    2. Remove time keywords (5pm, noon, morning, etc.)
    3. Remove duration keywords (for 2 hours, etc.)
    4. Remove recurrence keywords (every monday, etc.)
    5. Collapse whitespace
    6. Return remaining text as title
    
    If nothing remains, return original text up to 255 chars.
    """
    warnings = []
    
    if not text:
        return '', warnings
    
    cleaned = text.lower()
    
    # Remove date keywords
    # Relative dates
    cleaned = re.sub(r'\b(today|tomorrow|tonight|yesterday)\b', '', cleaned)
    cleaned = re.sub(r'\b(next|this|last)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b', '', cleaned)
    cleaned = re.sub(r'\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b', '', cleaned)
    
    # Month keywords
    for month in MONTHS.keys():
        cleaned = re.sub(rf'\b{month}\b', '', cleaned)
    
    # Ordinal keywords
    for ordinal in ORDINALS.keys():
        cleaned = re.sub(rf'\b{ordinal}\b', '', cleaned)
    
    # Special phrases
    cleaned = re.sub(r'\b(end of month|beginning of month|eom|bom|weekend)\b', '', cleaned)
    
    # Remove time keywords
    cleaned = re.sub(r'\bnoon\b|\bmidnight\b', '', cleaned)
    for time_keyword in TIME_DEFAULTS.keys():
        cleaned = re.sub(rf'\b{time_keyword}\b', '', cleaned)
    
    # Remove explicit time patterns
    cleaned = re.sub(r'\b\d{1,2}:\d{2}(?:\s*(?:am|pm))?\b', '', cleaned)
    cleaned = re.sub(r'\b\d{1,2}\s*(?:am|pm)\b', '', cleaned)
    cleaned = re.sub(r'\b\d{3,4}\b', '', cleaned)  # Compact time format
    
    # Remove duration keywords
    cleaned = re.sub(r'\b(for|in)\s+\d+\s*(hours?|hrs?|minutes?|mins?|days?)\b', '', cleaned)
    cleaned = re.sub(r'\bhalf\s*-?hour\b', '', cleaned)
    
    # Remove recurrence keywords
    cleaned = re.sub(r'\b(every|daily|weekly|monthly|yearly|annually|on\s+\w+day)\b', '', cleaned)
    
    # Remove "at" and similar prepositions that often precede times
    cleaned = re.sub(r'\b(at|on|from|to|for|during|before|after|around)\b', '', cleaned)
    
    # Collapse whitespace and clean punctuation
    cleaned = re.sub(r'\s+', ' ', cleaned)
    cleaned = re.sub(r'\s+([,;:])\s*', r'\1 ', cleaned)
    cleaned = re.sub(r'^\s*[,;:]\s*', '', cleaned)  # Remove leading punctuation
    cleaned = re.sub(r'\s*[,;:]\s*$', '', cleaned)  # Remove trailing punctuation
    cleaned = cleaned.strip()
    
    # If we have leftover text, use it
    if cleaned and len(cleaned) > 2:
        title = cleaned[:255]
        return title, warnings
    
    # Fallback to original text if nothing remains
    title = text.strip()[:255]
    if not title:
        title = 'Event'
        warnings.append('no_title_inferred')
    
    return title, warnings
