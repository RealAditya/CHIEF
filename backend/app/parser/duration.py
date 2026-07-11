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

    # Explicit time range patterns: 7-9pm, 7pm-9pm, 7 to 9, 10-12
    m = re.search(r'\b(\d{1,2}(?:[:\.]\d{2})?)\s*(am|pm)?\s*(?:-|to|–|—)\s*(\d{1,2}(?:[:\.]\d{2})?)\s*(am|pm)?\b', text_lower)
    if m:
        def parse_clock(token: str, ampm: str | None) -> tuple[int, int] | None:
            if ':' in token or '.' in token:
                parts = re.split(r'[:.]', token)
                hour = int(parts[0])
                minute = int(parts[1])
            else:
                hour = int(token)
                minute = 0
            if ampm:
                ampm = ampm.lower()
                if ampm == 'pm' and hour < 12:
                    hour += 12
                elif ampm == 'am' and hour == 12:
                    hour = 0
            elif 1 <= hour <= 5:
                hour += 12
            elif 7 <= hour <= 9 and not ampm:
                hour += 12
            return hour, minute

        start_token, start_ampm, end_token, end_ampm = m.group(1), m.group(2), m.group(3), m.group(4)
        start_hour, start_minute = parse_clock(start_token, start_ampm)
        end_hour, end_minute = parse_clock(end_token, end_ampm)

        start_total = timedelta(hours=start_hour, minutes=start_minute)
        end_total = timedelta(hours=end_hour, minutes=end_minute)
        if end_total <= start_total:
            end_total += timedelta(days=1)
        return end_total - start_total, warnings

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
