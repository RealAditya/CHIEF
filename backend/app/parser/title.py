"""
Title inference for Smart Add parser.
"""

import re
from backend.app.config.parser_defaults import (
    WEEKDAYS, MONTHS, TIME_DEFAULTS, ORDINALS, PRIORITY_KEYWORDS
)
from backend.app.parser.normalizer import normalize


def infer_title(text: str, parsed_date=None, parsed_time=None) -> tuple[str, list[str]]:
    """
    Infer title from text by removing date/time/duration tokens.
    
    Returns: (title, warnings)
    
    Strategy:
    1. Normalize the text and remove known date/time/duration keywords.
    2. Remove recurrence keywords and priority qualifiers.
    3. Remove any remaining numeric date/time tokens.
    4. Collapse whitespace and return remaining text.
    
    If nothing remains, return original text up to 255 chars.
    """
    warnings = []
    
    if not text:
        return '', warnings
    
    cleaned = normalize(text)
    
    # Remove relative date keywords and weekday references
    cleaned = re.sub(r'\b(today|tomorrow|tonight|tdy|tmrw|tom)\b', '', cleaned)
    cleaned = re.sub(r'\b(next|this|last)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekend)\b', '', cleaned)
    cleaned = re.sub(r'\b(every)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekday|weekend|day)\b', '', cleaned)
    cleaned = re.sub(r'\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekday|weekend)\b', '', cleaned)
    
    # Remove month keywords and numeric dates
    for month in MONTHS.keys():
        cleaned = re.sub(rf'\b{re.escape(month)}\b', '', cleaned)
    for ordinal in ORDINALS.keys():
        cleaned = re.sub(rf'\b{re.escape(ordinal)}\b', '', cleaned)
    cleaned = re.sub(r'\b\d{1,2}(?:[\/\-.]\d{1,2}(?:[\/\-.]\d{2,4})?)?\b', '', cleaned)
    
    # Remove time keywords and explicit time patterns
    cleaned = re.sub(r'\bnoon\b|\bmidnight\b|\blate evening\b', '', cleaned)
    for time_keyword in TIME_DEFAULTS.keys():
        cleaned = re.sub(rf'\b{re.escape(time_keyword)}\b', '', cleaned)
    cleaned = re.sub(r'\b\d{1,2}[:\.]\d{2}(?:\s*(?:am|pm))?\b', '', cleaned)
    cleaned = re.sub(r'\b\d{1,2}\s*(?:am|pm)\b', '', cleaned)
    cleaned = re.sub(r'\b\d{1,2}\s*(?:-|to|–|—)\s*\d{1,2}(?:\s*(?:am|pm))?\b', '', cleaned)
    cleaned = re.sub(r'\b\d{3,4}\b', '', cleaned)
    cleaned = re.sub(r'\b\d{1,2}\b', '', cleaned)
    
    # Remove duration expressions
    cleaned = re.sub(r'\b(?:for|in|starting|start|starts|beginning)\s+\d+(?:\.\d+)?\s*(?:hours?|hrs?|h|minutes?|mins?|m|days?|d)\b', '', cleaned)
    cleaned = re.sub(r'\bhalf\s*-?hour\b', '', cleaned)
    cleaned = re.sub(r'\bstarting\s+at\b', '', cleaned)
    
    # Remove recurrence and priority keywords
    cleaned = re.sub(r'\b(every|daily|weekly|monthly|yearly|annually|alternate|other)\b', '', cleaned)
    for keyword in PRIORITY_KEYWORDS.get('high', []) + PRIORITY_KEYWORDS.get('low', []):
        cleaned = re.sub(rf'\b{re.escape(keyword)}\b', '', cleaned)
    cleaned = re.sub(r'\bpriority\b', '', cleaned)
    
    # Remove common prepositions
    cleaned = re.sub(r'\b(at|on|from|to|for|during|before|after|around|the|a|an|with|and)\b', '', cleaned)

    # Remove common timeframe/location phrases that don't belong in titles
    cleaned = re.sub(r'\b(after\s+office|after\s+work|office|workplace|office hours)\b', '', cleaned)
    
    # Collapse whitespace and clean punctuation
    cleaned = re.sub(r'\s+', ' ', cleaned)
    cleaned = re.sub(r'\s+([,;:])\s*', r'\1 ', cleaned)
    cleaned = re.sub(r'^[,;:]\s*', '', cleaned)
    cleaned = re.sub(r'\s*[,;:]$', '', cleaned)
    cleaned = cleaned.strip()
    
    if cleaned and len(cleaned) > 2:
        # Capitalize each word for display
        title = cleaned.strip()
        title = ' '.join([w.capitalize() for w in title.split()])
        return title[:255], warnings
    
    title = normalize(text).strip()[:255]
    if not title:
        title = 'Event'
        warnings.append('no_title_inferred')

    title = ' '.join([w.capitalize() for w in title.split()])
    return title, warnings
