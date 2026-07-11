"""
Parser configuration defaults.

These values are used by the parser to interpret natural language inputs.
They are configurable here instead of hardcoded in parser logic.
"""

# Time-of-day defaults (hour, minute) for common keywords
TIME_DEFAULTS = {
    'morning': (9, 0),      # 9 AM
    'morn': (9, 0),
    'afternoon': (14, 0),   # 2 PM
    'aft': (14, 0),
    'evening': (18, 0),     # 6 PM
    'eve': (18, 0),
    'night': (20, 0),       # 8 PM
    'tonight': (18, 0),
    'noon': (12, 0),
    'midday': (12, 0),
    'midnight': (0, 0),
    'lunch': (12, 30),
    'dinner': (19, 0),
}

# Duration defaults (in minutes) for common shorthand
DURATION_DEFAULTS = {
    'short': 30,
    'standard': 60,
    'long': 120,
    'meeting': 60,
}

# Category mappings based on keywords found in text
CATEGORY_KEYWORDS = {
    'work': [
        'meeting', 'sync', 'standup', 'review', 'client', 'project',
        'office', 'call', 'presentation', 'interview', 'conference',
        'team', 'client', 'agenda', 'strategy',
    ],
    'health': [
        'gym', 'workout', 'exercise', 'doctor', 'dentist', 'hospital',
        'medical', 'appointment', 'therapy', 'physio', 'health',
        'wellness', 'yoga', 'fitness', 'run', 'running',
    ],
    'sports': [
        'badminton', 'tennis', 'table tennis', 'cricket', 'football',
        'basketball', 'f1', 'soccer', 'swimming', 'cycling',
    ],
    'personal': [
        'birthday', 'party', 'wedding', 'anniversary', 'celebration',
        'family', 'friend', 'dinner', 'lunch', 'gathering', 'event',
        'mom', 'dad', 'parents', 'household', 'family',
    ],
    'finance': [
        'bill', 'payment', 'invoice', 'emi', 'electricity', 'water',
        'tax', 'bank', 'accounting', 'finance', 'budget', 'expense',
        'rent', 'loan', 'salary', 'mortgage',
    ],
    'admin': [
        'passport', 'government', 'aadhaar', 'pan', 'license', 'visa',
        'renewal', 'document', 'registration', 'id', 'license',
    ],
    'government': [
        'passport', 'visa', 'registration', 'census', 'government', 'dmv', 'passport office',
    ],
    'shopping': [
        'shopping', 'buy', 'groceries', 'milk', 'eggs', 'amazon',
        'flipkart', 'store', 'order', 'deliver', 'purchase',
    ],
    'errands': [
        'package', 'pickup', 'dropoff', 'post', 'mail', 'post office',
    ],
    'education': [
        'study', 'exam', 'assignment', 'homework', 'class', 'course',
        'learning', 'training', 'lecture', 'tutorial', 'school',
        'os', 'cn',
    ],
    'travel': [
        'flight', 'airport', 'train', 'bus', 'travel', 'trip', 'journey',
        'booking', 'hotel', 'taxi', 'commute', 'drive',
    ],
    'entertainment': [
        'movie', 'cinema', 'netflix', 'film', 'concert', 'show',
        'tv', 'streaming', 'theater',
    ],
}

# Priority keywords
PRIORITY_KEYWORDS = {
    'high': ['urgent', 'asap', 'important', 'critical', 'deadline', 'emergency', 'rush', 'high priority'],
    'normal': [],  # default
    'low': ['someday', 'whenever', 'optional', 'casual'],
}

# Weekday abbreviations and full names
WEEKDAYS = {
    'monday': 0, 'mon': 0,
    'tuesday': 1, 'tue': 1, 'tues': 1,
    'wednesday': 2, 'wed': 2,
    'thursday': 3, 'thu': 3, 'thurs': 3,
    'friday': 4, 'fri': 4,
    'saturday': 5, 'sat': 5,
    'sunday': 6, 'sun': 6,
}

# Month abbreviations and full names
MONTHS = {
    'january': 1, 'jan': 1,
    'february': 2, 'feb': 2,
    'march': 3, 'mar': 3,
    'april': 4, 'apr': 4,
    'may': 5,
    'june': 6, 'jun': 6,
    'july': 7, 'jul': 7,
    'august': 8, 'aug': 8,
    'september': 9, 'sep': 9, 'sept': 9,
    'october': 10, 'oct': 10,
    'november': 11, 'nov': 11,
    'december': 12, 'dec': 12,
}

# Ordinal suffixes
ORDINALS = {
    '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, '5th': 5,
    '6th': 6, '7th': 7, '8th': 8, '9th': 9, '10th': 10,
    '11th': 11, '12th': 12, '13th': 13, '14th': 14, '15th': 15,
    '16th': 16, '17th': 17, '18th': 18, '19th': 19, '20th': 20,
    '21st': 21, '22nd': 22, '23rd': 23, '24th': 24, '25th': 25,
    '26th': 26, '27th': 27, '28th': 28, '29th': 29, '30th': 30,
    '31st': 31,
}

# Recurrence patterns
RECURRENCE_PATTERNS = {
    'daily': 'daily',
    'every day': 'daily',
    'everyday': 'daily',
    'everyday': 'daily',
    'weekly': 'weekly',
    'every week': 'weekly',
    'monthly': 'monthly',
    'every month': 'monthly',
    'yearly': 'yearly',
    'every year': 'yearly',
    'annually': 'yearly',
    'biweekly': 'biweekly',
    'every 2 weeks': 'biweekly',
    'every two weeks': 'biweekly',
    'every alternate day': 'every_other_day',
    'every other day': 'every_other_day',
    'every weekday': 'weekdays',
    'every weekend': 'weekends',
}

# Default values when not specified
DEFAULTS = {
    'all_day': False,
    'category': 'general',
    'priority': 'normal',
    'duration_minutes': 60,  # Default event duration if only date is given with no end time
}
