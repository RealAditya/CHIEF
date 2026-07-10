"""
Main Smart Add parser orchestrator.

Combines all parsing modules to create a structured event preview.
Does not create events; only returns structured data for preview.
"""

from __future__ import annotations

from dataclasses import dataclass, asdict, field
from datetime import datetime, time, timedelta
from typing import Optional, Any

from backend.app.parser.normalizer import normalize
from backend.app.parser.dates import parse_date
from backend.app.parser.time import parse_time
from backend.app.parser.duration import parse_duration
from backend.app.parser.recurrence import parse_recurrence
from backend.app.parser.category import detect_category
from backend.app.parser.priority import detect_priority
from backend.app.parser.title import infer_title
from backend.app.parser.confidence import compute_confidence
from backend.app.config.parser_defaults import DEFAULTS


@dataclass
class ParsedEvent:
    """Structured output from the parser."""
    title: str = ''
    description: Optional[str] = None
    start_datetime: Optional[str] = None  # ISO 8601 string
    end_datetime: Optional[str] = None    # ISO 8601 string
    category: str = field(default_factory=lambda: DEFAULTS['category'])
    priority: str = field(default_factory=lambda: DEFAULTS['priority'])
    all_day: bool = field(default_factory=lambda: DEFAULTS['all_day'])
    recurrence: Optional[str] = None
    confidence: float = 0.0
    warnings: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return asdict(self)


def parse_text(text: str, reference: Optional[datetime] = None) -> ParsedEvent:
    """
    Parse natural language text into a structured event.
    
    Args:
        text: Natural language input (e.g., "Tomorrow 5pm Table Tennis")
        reference: Reference datetime for relative dates. Defaults to now.
    
    Returns:
        ParsedEvent with all parsed fields and confidence score.
    """
    if reference is None:
        reference = datetime.now()
    
    # Step 1: Normalize input
    normalized = normalize(text)
    
    if not normalized:
        return ParsedEvent(warnings=['empty_input'])
    
    # Step 2: Parse components (each returns (result, warnings))
    parsed_date, date_warnings = parse_date(normalized, reference)
    parsed_time, time_warnings = parse_time(normalized)
    parsed_duration, duration_warnings = parse_duration(normalized)
    parsed_recurrence, recurrence_warnings = parse_recurrence(normalized)
    parsed_category, category_warnings = detect_category(normalized)
    parsed_priority, priority_warnings = detect_priority(normalized)
    parsed_title, title_warnings = infer_title(normalized, parsed_date, parsed_time)
    
    # Step 3: Build start_datetime
    start_dt = None
    if parsed_date:
        if parsed_time:
            start_dt = datetime.combine(parsed_date, parsed_time)
        else:
            # Date only, use defaults
            default_time = time(9, 0)  # 9 AM default
            start_dt = datetime.combine(parsed_date, default_time)
            date_warnings.append('time_not_found')
    elif parsed_time:
        # Time only, assume today or next occurrence if time has passed
        today = reference.date()
        candidate_dt = datetime.combine(today, parsed_time)
        if candidate_dt <= reference:
            candidate_dt = datetime.combine(today + timedelta(days=1), parsed_time)
        start_dt = candidate_dt
        date_warnings.append('date_not_found')
    
    # Step 4: Build end_datetime
    end_dt = None
    if start_dt:
        if parsed_duration:
            end_dt = start_dt + parsed_duration
        else:
            # Default 1 hour duration
            end_dt = start_dt + timedelta(hours=1)
    
    # Step 5: Serialize datetimes to ISO 8601
    start_dt_str = start_dt.isoformat() if start_dt else None
    end_dt_str = end_dt.isoformat() if end_dt else None
    
    # Step 6: Compute confidence
    confidence, all_warnings = compute_confidence(
        has_date=parsed_date is not None,
        has_time=parsed_time is not None,
        has_duration=parsed_duration is not None,
        has_title=bool(parsed_title and len(parsed_title) > 2),
        date_warnings=date_warnings,
        time_warnings=time_warnings,
        duration_warnings=duration_warnings,
        category_warnings=category_warnings,
        priority_warnings=priority_warnings,
        title_warnings=title_warnings,
    )
    
    # Step 7: Build result
    result = ParsedEvent(
        title=parsed_title,
        description=None,
        start_datetime=start_dt_str,
        end_datetime=end_dt_str,
        category=parsed_category,
        priority=parsed_priority,
        all_day=False,
        recurrence=parsed_recurrence,
        confidence=confidence,
        warnings=all_warnings,
    )
    
    return result
