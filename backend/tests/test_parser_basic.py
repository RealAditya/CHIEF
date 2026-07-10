from backend.app.parser import parse_text
from datetime import datetime


def test_today_parses():
    p = parse_text('today meeting at 5pm', reference=datetime(2026,7,10,10,0))
    assert p.start_datetime is not None
    assert 'meeting' in p.title.lower()
    assert p.confidence >= 0.5


def test_tomorrow_parses():
    p = parse_text('tomorrow 9am gym', reference=datetime(2026,7,10,10,0))
    assert p.start_datetime.date().day == 11
    assert p.category == 'health'


def test_weekday_parses():
    p = parse_text('next monday 2pm sync', reference=datetime(2026,7,10,10,0))
    assert p.recurrenceDetected is False
    assert p.start_datetime.weekday() == 0  # Monday


def test_time_only_infers_date():
    p = parse_text('5pm dinner', reference=datetime(2026,7,10,18,0))
    # 5pm on same day already passed so should move to next day
    assert p.start_datetime.date().day == 11


def test_recurring_detected():
    p = parse_text('every monday standup', reference=datetime(2026,7,10,10,0))
    assert p.recurrenceDetected is True
    assert 'standup' in p.title.lower()


def test_date_formats():
    p = parse_text('Dec 25 5pm christmas party', reference=datetime(2026,7,10,10,0))
    assert p.start_datetime.date().month == 12
    assert p.start_datetime.date().day == 25

