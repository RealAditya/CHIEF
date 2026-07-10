"""
Recurrence detection for Smart Add parser.

Does NOT implement recurring events.
Only detects recurrence phrases and returns flags.
"""

import re
from backend.app.config.parser_defaults import WEEKDAYS, RECURRENCE_PATTERNS


def parse_recurrence(text: str) -> tuple[str | None, list[str]]:
    """
    Detect recurrence patterns in text.
    
    Returns: (recurrence_pattern, warnings)
    
    Recurrence patterns detected:
    - daily, everyday
    - weekly
    - biweekly
    - monthly
    - yearly, annually
    - every monday, every mon wed fri, etc.
    - every weekday, every weekend
    
    Note: Recurrence is DETECTED but not IMPLEMENTED.
    Only returns the pattern string for future use.
    """
    warnings = []
    
    if not text:
        return None, warnings
    
    text_lower = text.lower()
    
    # Check for simple recurrence keywords
    for pattern, recur_type in RECURRENCE_PATTERNS.items():
        if re.search(rf'\b{pattern}\b', text_lower):
            return recur_type, warnings
    
    # Check for "every WEEKDAY" patterns
    # "every monday", "every mon wed fri", "every weekday", "every weekend"
    
    if re.search(r'\bevery\s+weekday\b', text_lower):
        return 'weekdays', warnings
    
    if re.search(r'\bevery\s+weekend\b', text_lower):
        return 'weekends', warnings
    
    # Extract weekdays after "every"
    # Match "every monday wednesday friday" etc.
    m = re.search(r'\bevery\s+([a-z\s,]+?)(?:\s+(?:at|on|from|for)\b|$)', text_lower)
    if m:
        weekday_part = m.group(1).strip()
        found_days = []
        for day_name in WEEKDAYS.keys():
            if re.search(rf'\b{day_name}\b', weekday_part):
                found_days.append(day_name)
        
        if found_days:
            return f'weekly_on_{",".join(found_days[:3])}', warnings
    
    return None, warnings
