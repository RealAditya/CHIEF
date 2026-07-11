"""
Time parsing for Smart Add parser.
"""

import re
from datetime import time
from backend.app.config.parser_defaults import TIME_DEFAULTS


def parse_time(text: str) -> tuple[time | None, list[str]]:
    """
    Parse time from text.
    
    Returns: (parsed_time, warnings)
    
    Handles:
    - 5, 5pm, 5 pm, 5:30, 5:30pm, 17:30, 1730
    - noon, midnight
    - morning, afternoon, evening, night (uses defaults)
    - lunch, dinner (uses defaults)
    """
    warnings = []
    
    if not text:
        return None, warnings
    
    text_lower = text.lower()
    
    # NOTE: Prefer explicit numeric patterns first; keyword defaults are
    # used only when no explicit time is found.
    
    # Explicit time patterns
    # HH:MM, HH.MM or HH:MM AM/PM
    m = re.search(r'\b(\d{1,2})[:\.](\d{2})\s*(am|pm)?\b', text_lower)
    if m:
        hour = int(m.group(1))
        minute = int(m.group(2))
        ampm = m.group(3)
        
        if ampm:
            ampm = ampm.lower()
            if ampm == 'pm' and hour < 12:
                hour += 12
            elif ampm == 'am' and hour == 12:
                hour = 0
        
        if 0 <= hour <= 23 and 0 <= minute <= 59:
            return time(hour, minute), warnings
        else:
            warnings.append('invalid_time')
            return None, warnings
    
    # Compact format: 1730 (24-hour) or 530 (assumed PM if < 1200, else 24h)
    m = re.search(r'\b(\d{3,4})\b', text_lower)
    if m:
        time_str = m.group(1)
        if len(time_str) == 4:
            hour = int(time_str[:2])
            minute = int(time_str[2:])
        else:
            # 530 could be 5:30
            hour = int(time_str[0])
            minute = int(time_str[1:])
        
        if 0 <= hour <= 23 and 0 <= minute <= 59:
            return time(hour, minute), warnings
        else:
            warnings.append('invalid_time')
            return None, warnings
    
    # Hour only: "5", "5pm", "5 pm" (without minutes)
    m = re.search(r'\b(\d{1,2})\s*(am|pm)?\b', text_lower)
    if m:
        hour = int(m.group(1))
        ampm = m.group(2)
        
        if ampm:
            ampm = ampm.lower()
            if ampm == 'pm' and hour < 12:
                hour += 12
            elif ampm == 'am' and hour == 12:
                hour = 0
        else:
            # No AM/PM specified: heuristic
            # If 1-5, assume PM (afternoon/evening)
            # If 6-11, already PM in 24h format
            # If 12, noon
            # If 13-23, already PM in 24h format
            if 1 <= hour <= 5:
                hour += 12
        
        if 0 <= hour <= 23:
            return time(hour, 0), warnings
        else:
            warnings.append('invalid_time')
            return None, warnings

    # Keyword-based times (fallbacks like 'dinner', 'lunch', 'morning')
    for keyword, (hour, minute) in TIME_DEFAULTS.items():
        if re.search(rf'\b{re.escape(keyword)}\b', text_lower):
            return time(hour, minute), warnings

    return None, warnings
