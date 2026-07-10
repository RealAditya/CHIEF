"""
Date parsing for Smart Add parser.
"""

import re
from datetime import datetime, date, timedelta
from backend.app.config.parser_defaults import WEEKDAYS, MONTHS, ORDINALS


def parse_date(text: str, reference: datetime) -> tuple[date | None, list[str]]:
    """
    Parse date from text.
    
    Returns: (parsed_date, warnings)
    
    Handles:
    - today, tomorrow
    - next monday, this friday, monday (without modifier)
    - last friday
    - 25 december, dec 25, 25/12, 25-12
    - 1st, 2nd, 3rd, etc
    - end of month, beginning of month
    - weekend (next weekend)
    """
    warnings = []
    ref_date = reference.date()
    
    if not text:
        return None, warnings
    
    text_lower = text.lower()
    
    # Relative keywords
    if 'today' in text_lower:
        return ref_date, warnings
    
    if 'tomorrow' in text_lower:
        return ref_date + timedelta(days=1), warnings
    
    # Check for "end of month" or "beginning of month"
    if 'end of month' in text_lower or 'eom' in text_lower:
        # Last day of current month
        if ref_date.month == 12:
            return date(ref_date.year + 1, 1, 1) - timedelta(days=1), warnings
        else:
            return date(ref_date.year, ref_date.month + 1, 1) - timedelta(days=1), warnings
    
    if 'beginning of month' in text_lower or 'bom' in text_lower:
        return date(ref_date.year, ref_date.month, 1), warnings
    
    # Check for "next weekend" or "this weekend"
    if 'weekend' in text_lower:
        current_dow = ref_date.weekday()  # Monday=0, Sunday=6
        # Find next Saturday
        days_until_saturday = (5 - current_dow) % 7
        if days_until_saturday == 0:
            days_until_saturday = 7
        return ref_date + timedelta(days=days_until_saturday), warnings
    
    # Weekday patterns: "next monday", "this friday", "last friday", or just "monday"
    for dow_name, dow_num in WEEKDAYS.items():
        # Look for "next/this/last WEEKDAY"
        m = re.search(rf'\b(next|this|last)\s+{dow_name}\b', text_lower)
        if m:
            modifier = m.group(1)
            current_dow = ref_date.weekday()
            
            if modifier == 'next':
                days_ahead = (dow_num - current_dow) % 7
                if days_ahead == 0:
                    days_ahead = 7
            elif modifier == 'this':
                days_ahead = (dow_num - current_dow) % 7
                if days_ahead < 0:
                    days_ahead = days_ahead + 7
            else:  # last
                days_back = (current_dow - dow_num) % 7
                if days_back == 0:
                    days_back = 7
                days_ahead = -days_back
            
            return ref_date + timedelta(days=days_ahead), warnings
        
        # Look for standalone weekday (assume next occurrence)
        if re.search(rf'\b{dow_name}\b', text_lower):
            current_dow = ref_date.weekday()
            days_ahead = (dow_num - current_dow) % 7
            if days_ahead == 0:  # Today is this weekday, get next week
                days_ahead = 7
            return ref_date + timedelta(days=days_ahead), warnings
    
    # Ordinal dates (1st, 2nd, etc.) — assume current or next month
    for ordinal_str, day_num in ORDINALS.items():
        if ordinal_str in text_lower:
            # Check if month is also specified
            month_num = None
            for month_name, m_num in MONTHS.items():
                if month_name in text_lower:
                    month_num = m_num
                    # Check for year too
                    year_match = re.search(r'\b(202\d|20\d\d|2\d{3})\b', text_lower)
                    year_num = int(year_match.group(1)) if year_match else ref_date.year
                    try:
                        return date(year_num, month_num, day_num), warnings
                    except ValueError:
                        warnings.append('invalid_date')
                        return None, warnings
            
            # No month specified, use current or next month
            if day_num >= ref_date.day:
                month_num = ref_date.month
                year_num = ref_date.year
            else:
                # Wrap to next month
                if ref_date.month == 12:
                    month_num = 1
                    year_num = ref_date.year + 1
                else:
                    month_num = ref_date.month + 1
                    year_num = ref_date.year
            
            try:
                return date(year_num, month_num, day_num), warnings
            except ValueError:
                warnings.append('invalid_date')
                return None, warnings
    
    # Explicit date formats: "25 december", "dec 25", "25/12", "25-12"
    # Format: DAY MONTH YEAR or MONTH DAY YEAR (with various separators)
    
    # "25 december" or "december 25"
    for month_name, month_num in MONTHS.items():
        m = re.search(rf'(\d{{1,2}})\s+{month_name}(?:\s+(\d{{4}}))?', text_lower)
        if m:
            day_num = int(m.group(1))
            year_num = int(m.group(2)) if m.group(2) else ref_date.year
            try:
                return date(year_num, month_num, day_num), warnings
            except ValueError:
                warnings.append('invalid_date')
                return None, warnings
        
        # "december 25" format
        m = re.search(rf'{month_name}\s+(\d{{1,2}})(?:\s+(\d{{4}}))?', text_lower)
        if m:
            day_num = int(m.group(1))
            year_num = int(m.group(2)) if m.group(2) else ref_date.year
            try:
                return date(year_num, month_num, day_num), warnings
            except ValueError:
                warnings.append('invalid_date')
                return None, warnings
    
    # Numeric formats: 25/12, 25-12, 25.12, or 12/25 US format
    m = re.search(r'(\d{1,2})[/-.](\d{1,2})(?:[/-.](\d{2,4}))?', text_lower)
    if m:
        a = int(m.group(1))
        b = int(m.group(2))
        c = m.group(3)
        year_num = int(c) if c else ref_date.year
        if len(c or '') == 2:
            year_num = 2000 + year_num
        
        # Guess format: if first > 12, assume DD/MM, else MM/DD
        if a > 12 and b <= 12:
            day_num, month_num = a, b
        elif b > 12 and a <= 12:
            month_num, day_num = a, b
        else:
            # Ambiguous; assume DD/MM (more common globally)
            day_num, month_num = a, b
        
        try:
            parsed = date(year_num, month_num, day_num)
            # If date is in past, assume next year
            if parsed < ref_date:
                parsed = date(year_num + 1, month_num, day_num)
            return parsed, warnings
        except ValueError:
            warnings.append('invalid_date')
            return None, warnings
    
    return None, warnings
