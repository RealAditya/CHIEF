"""
Duration parsing for Smart Add parser.
"""

import re
from datetime import timedelta


def parse_duration(text: str) -> tuple[timedelta | None, list[str]]:
    """
    Parse duration from text.
    
    Returns: (duration_as_timedelta, warnings)
    
    Handles:
    - for 2 hours, 2 hrs, 2hr
    - 90 mins, 90 min, 90m
    - 30 minutes, 30min, 30m
    - half hour, half-hour
    - 45 min
    """
    warnings = []
    
    if not text:
        return None, warnings
    
    text_lower = text.lower()
    
    # "half hour" or "half-hour" or "0.5 hours"
    if re.search(r'\bhalf\s*-?hour\b', text_lower):
        return timedelta(minutes=30), warnings
    
    # Pattern: NUMBER (UNIT)
    # Units: hours/hrs/hr, minutes/mins/min/m
    
    # Hours
    m = re.search(r'(\d+(?:\.\d+)?)\s*(hours?|hrs?|h)\b', text_lower)
    if m:
        hours = float(m.group(1))
        return timedelta(hours=hours), warnings
    
    # Minutes
    m = re.search(r'(\d+(?:\.\d+)?)\s*(minutes?|mins?|m)\b', text_lower)
    if m:
        minutes = float(m.group(1))
        return timedelta(minutes=minutes), warnings
    
    # Days (for completeness)
    m = re.search(r'(\d+(?:\.\d+)?)\s*(days?|d)\b', text_lower)
    if m:
        days = float(m.group(1))
        return timedelta(days=days), warnings
    
    return None, warnings
