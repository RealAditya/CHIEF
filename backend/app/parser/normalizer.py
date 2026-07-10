"""
Text normalizer for Smart Add parser.

Expands common abbreviations and normalizes input text.
"""

import re

# Abbreviation mappings
ABBREV_MAP = {
    # Days
    'tom': 'tomorrow',
    'tmr': 'tomorrow',
    'tmrw': 'tomorrow',
    'tdy': 'today',
    'nxt': 'next',
    
    # Time periods
    'eve': 'evening',
    'morn': 'morning',
    'aft': 'afternoon',
    'ngt': 'night',
    
    # Weekdays
    'mon': 'monday',
    'tue': 'tuesday',
    'wed': 'wednesday',
    'thu': 'thursday',
    'fri': 'friday',
    'sat': 'saturday',
    'sun': 'sunday',
    
    # Months
    'jan': 'january',
    'feb': 'february',
    'mar': 'march',
    'apr': 'april',
    'jun': 'june',
    'jul': 'july',
    'aug': 'august',
    'sep': 'september',
    'oct': 'october',
    'nov': 'november',
    'dec': 'december',
    
    # Time units
    'min': 'minute',
    'mins': 'minutes',
    'hr': 'hour',
    'hrs': 'hours',
    'wk': 'week',
    'wks': 'weeks',
    'mo': 'month',
    'mos': 'months',
    'yr': 'year',
    'yrs': 'years',
}


def normalize(text: str) -> str:
    """
    Normalize input text.
    
    - Expand abbreviations
    - Normalize capitalization
    - Remove excessive whitespace
    - Clean punctuation where it doesn't matter
    """
    if not text or not isinstance(text, str):
        return ""
    
    text = text.strip()
    
    # Convert to lowercase for processing
    text_lower = text.lower()
    
    # Expand abbreviations (word boundaries)
    for abbrev, expanded in ABBREV_MAP.items():
        # Use word boundaries to avoid replacing parts of words
        pattern = rf'\b{re.escape(abbrev)}\b'
        text_lower = re.sub(pattern, expanded, text_lower, flags=re.IGNORECASE)
    
    # Normalize "tonight" -> "today evening"
    text_lower = re.sub(r'\btonight\b', 'today evening', text_lower)
    
    # Normalize spacing around slashes and hyphens
    text_lower = re.sub(r'\s+([/-])\s+', r'\1', text_lower)
    
    # Collapse multiple spaces
    text_lower = re.sub(r'\s+', ' ', text_lower)
    
    return text_lower.strip()
