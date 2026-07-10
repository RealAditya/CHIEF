from __future__ import annotations

import re
from dataclasses import dataclass, asdict
from datetime import datetime, date, time, timedelta
from typing import Optional, List, Dict, Any

WEEKDAYS = {
    'sunday': 6, 'sun': 6,
    'monday': 0, 'mon': 0,
    'tuesday': 1, 'tue': 1, 'tues': 1,
    'wednesday': 2, 'wed': 2,
    'thursday': 3, 'thu': 3, 'thurs': 3,
    'friday': 4, 'fri': 4,
    'saturday': 5, 'sat': 5,
}

MONTHS = {m.lower(): i+1 for i, m in enumerate(['January','February','March','April','May','June','July','August','September','October','November','December'])}

CATEGORY_KEYWORDS = {
    'work': ['meeting','project','call','sync','review','client','work'],
    'personal': ['birthday','dinner','lunch','family','personal','anniversary'],
    'health': ['doctor','gym','workout','exercise','health','medicine'],
    'finance': ['pay','invoice','bill','payment','tax','finance'],
    'travel': ['flight','travel','trip','airport','train','booking'],
}

RECURRENCE_RE = re.compile(r'\b(every|each)\s+(mon|tue|wednes|thurs|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday)\w*', re.I)

TIME_RE = re.compile(r"\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b", re.I)
DATE_RE1 = re.compile(r"\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b")
DATE_RE2 = re.compile(r"\b(" + '|'.join(MONTHS.keys()) + r")\s+(\d{1,2})(?:,?\s*(\d{4}))?\b", re.I)
REL_DAY_RE = re.compile(r"\b(today|tomorrow|tonight|this\s+week|next\s+week|next\s+\w+)\b", re.I)
NOON_RE = re.compile(r"\bnoon\b", re.I)
MIDNIGHT_RE = re.compile(r"\bmidnight\b", re.I)
ALL_DAY_RE = re.compile(r"\ball[- ]?day\b", re.I)

@dataclass
class ParsedEvent:
    title: str = ''
    description: Optional[str] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    category: str = 'other'
    priority: str = 'normal'
    all_day: bool = False
    confidence: float = 0.0
    warnings: List[str] = None
    recurrenceDetected: bool = False

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        # serialize datetimes to ISO if present
        if self.start_datetime:
            d['start_datetime'] = self.start_datetime.isoformat()
        if self.end_datetime:
            d['end_datetime'] = self.end_datetime.isoformat()
        return d


def _parse_time_part(text: str, ref_date: date) -> Optional[time]:
    # noon/midnight
    if NOON_RE.search(text):
        return time(12, 0)
    if MIDNIGHT_RE.search(text):
        return time(0, 0)

    m = TIME_RE.search(text)
    if not m:
        return None
    hour = int(m.group(1))
    minute = int(m.group(2) or 0)
    ampm = m.group(3)
    if ampm:
        ampm = ampm.lower()
        if ampm == 'pm' and hour < 12:
            hour = hour + 12
        if ampm == 'am' and hour == 12:
            hour = 0
    else:
        # heuristics: if hour between 6 and 23 assume 24h else default to afternoon
        if 1 <= hour <= 5:
            # ambiguous, keep as-is (early morning)
            pass
        elif hour <= 23:
            pass
    try:
        return time(hour % 24, minute)
    except Exception:
        return None


def _parse_date_part(text: str, ref_date: date) -> Optional[date]:
    # relative keywords
    t = text.lower()
    if 'today' in t:
        return ref_date
    if 'tomorrow' in t:
        return ref_date + timedelta(days=1)

    # next monday, this friday, next friday
    m = re.search(r"\b(next|this)\s+(%s)\b" % '|'.join(WEEKDAYS.keys()), text, re.I)
    if m:
        which = m.group(1).lower()
        wd = m.group(2).lower()
        target_wd = WEEKDAYS.get(wd[:3], None)
        if target_wd is not None:
            current_wd = ref_date.weekday()  # Monday=0
            # map our WEEKDAYS to Monday=0 already used, but our mapping had Monday=0 etc; ensure
            # compute days ahead
            days_ahead = (target_wd - current_wd) % 7
            if which == 'next':
                if days_ahead == 0:
                    days_ahead = 7
            return ref_date + timedelta(days=days_ahead)

    # explicit mm/dd/yyyy or dd/mm etc
    m1 = DATE_RE1.search(text)
    if m1:
        a = int(m1.group(1))
        b = int(m1.group(2))
        c = m1.group(3)
        if c:
            year = int(c) if len(c) == 4 else 2000 + int(c)
            # guess ordering: assume month/day if first >12 then swap
            if 1 <= a <= 12 and 1 <= b <= 31:
                month = a; day = b
            else:
                month = b; day = a
        else:
            # no year provided — guess current year
            month = a; day = b
            year = ref_date.year
        try:
            return date(year, month, day)
        except Exception:
            pass

    # Month name formats
    m2 = DATE_RE2.search(text)
    if m2:
        mon = m2.group(1).lower()
        day = int(m2.group(2))
        y = m2.group(3)
        year = int(y) if y else ref_date.year
        month = MONTHS.get(mon)
        try:
            return date(year, month, day)
        except Exception:
            pass

    return None


def _detect_category(text: str) -> str:
    t = text.lower()
    for cat, keys in CATEGORY_KEYWORDS.items():
        for k in keys:
            if k in t:
                return cat
    return 'other'


def parse_text(text: str, reference: Optional[datetime] = None) -> ParsedEvent:
    """Parse a natural language text into a ParsedEvent.

    This is rule-based and deterministic; no external services are used.
    """
    if reference is None:
        reference = datetime.now()
    ref_date = reference.date()
    out = ParsedEvent(warnings=[], confidence=0.0)

    if not text or not text.strip():
        out.warnings.append('empty_input')
        return out

    original = text.strip()
    t = original

    # detect recurrence
    rec = RECURRENCE_RE.search(t)
    if rec:
        out.recurrenceDetected = True

    # detect date and time
    parsed_date = _parse_date_part(t, ref_date)
    parsed_time = _parse_time_part(t, ref_date)

    # if neither parsed, search for weekday alone
    if not parsed_date:
        wd = None
        for name, idx in WEEKDAYS.items():
            if re.search(rf"\b{name}\b", t, re.I):
                wd = idx
                break
        if wd is not None:
            # compute next occurrence
            current_wd = ref_date.weekday()
            days_ahead = (wd - current_wd) % 7
            if days_ahead == 0:
                days_ahead = 7
            parsed_date = ref_date + timedelta(days=days_ahead)

    # build start datetime
    if parsed_date and parsed_time:
        out.start_datetime = datetime.combine(parsed_date, parsed_time)
        out.all_day = False
    elif parsed_date and not parsed_time:
        # default to 9AM for unspecified times but mark lower confidence
        out.start_datetime = datetime.combine(parsed_date, time(9, 0))
        out.all_day = False
        out.warnings.append('time_inferred')
    elif not parsed_date and parsed_time:
        # time only -> assume today or next occurrence if already passed
        candidate = datetime.combine(ref_date, parsed_time)
        if candidate <= reference:
            candidate = candidate + timedelta(days=1)
        out.start_datetime = candidate
        out.all_day = False
        out.warnings.append('date_inferred')

    # try to parse an explicit end time (e.g. "5-6pm" or "5pm to 6pm")
    m_range = re.search(r"(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)[\s\-to]+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)", t, re.I)
    if m_range and out.start_datetime:
        # parse end time relative to start date
        end_time = _parse_time_part(m_range.group(2), out.start_datetime.date())
        if end_time:
            out.end_datetime = datetime.combine(out.start_datetime.date(), end_time)
            if out.end_datetime <= out.start_datetime:
                out.end_datetime = out.end_datetime + timedelta(days=1)
    # if no explicit end, set default duration 1h for events with time
    if out.start_datetime and not out.end_datetime and not out.all_day:
        out.end_datetime = out.start_datetime + timedelta(hours=1)

    # category and priority
    out.category = _detect_category(t)
    if re.search(r"\burgent\b|\bASAP\b|\bimportant\b", t, re.I):
        out.priority = 'high'

    # title: attempt to remove date/time words and recurrence words, leaving rest as title
    clean = t
    # remove known tokens
    clean = REL_DAY_RE.sub('', clean)
    clean = TIME_RE.sub('', clean)
    clean = DATE_RE1.sub('', clean)
    clean = DATE_RE2.sub('', clean)
    clean = NOON_RE.sub('', clean)
    clean = MIDNIGHT_RE.sub('', clean)
    clean = ALL_DAY_RE.sub('', clean)
    clean = RECURRENCE_RE.sub('', clean)
    # collapse whitespace
    clean = re.sub(r"\s+", ' ', clean).strip(' -,:')
    if clean:
        out.title = clean[:255]
    else:
        # fallback to original text as title
        out.title = original[:255]

    # compute confidence heuristically
    score = 0.0
    if out.start_datetime:
        score += 0.45
    if parsed_time:
        score += 0.35
    if clean and len(clean) >= 3:
        score += 0.2
    # reduce if warnings present
    if out.warnings:
        score -= 0.15 * len(out.warnings)
    out.confidence = max(0.0, min(1.0, round(score, 2)))

    # ensure warnings list
    if not out.warnings:
        out.warnings = []

    return out
