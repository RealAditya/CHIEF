from backend.app.parser import parse_text
from datetime import datetime


def test_today_parses():
    p = parse_text('today meeting at 5pm', reference=datetime(2026,7,10,10,0))
    assert p.start_datetime is not None
    assert 'meeting' in p.title.lower()
    assert p.confidence >= 0.5


def test_tomorrow_parses():
    p = parse_text('tomorrow 9am gym', reference=datetime(2026,7,10,10,0))
    dt = datetime.fromisoformat(p.start_datetime)
    assert dt.date().day == 11
    assert p.category == 'health'


def test_weekday_parses():
    p = parse_text('next monday 2pm sync', reference=datetime(2026,7,10,10,0))
    assert not p.recurrence
    dt = datetime.fromisoformat(p.start_datetime)
    assert dt.weekday() == 0  # Monday


def test_time_only_infers_date():
    p = parse_text('5pm dinner', reference=datetime(2026,7,10,18,0))
    # 5pm on same day already passed so should move to next day
    dt = datetime.fromisoformat(p.start_datetime)
    assert dt.date().day == 11


def test_recurring_detected():
    p = parse_text('every monday standup', reference=datetime(2026,7,10,10,0))
    assert p.recurrence
    assert 'standup' in p.title.lower()


def test_date_formats():
    p = parse_text('Dec 25 5pm christmas party', reference=datetime(2026,7,10,10,0))
    dt = datetime.fromisoformat(p.start_datetime)
    assert dt.month == 12
    assert dt.day == 25


def test_conversational_inputs():
    cases = [
        ('tom 6 gym', 'Gym', 'health'),
        ('tom 7-9 football', 'Football', 'sports'),
        ('next fri dinner', 'Dinner', None),
        ('movie tonight', None, 'entertainment'),
        ('shopping tomorrow', None, 'shopping'),
        ('passport office monday', None, 'government'),
        ('doctor 14 aug 3pm', 'Doctor', 'health'),
        ('pay rent', None, 'finance'),
        ('buy groceries', None, 'shopping'),
        ('gym after office', 'Gym', 'health'),
        ('every weekday 9 office', None, 'work'),
        ('every sunday cricket', None, 'sports'),
    ]

    from datetime import datetime as dt
    for text, expect_title, expect_cat in cases:
        p = parse_text(text, reference=dt(2026,7,10,10,0))
        if expect_title:
            assert expect_title.lower() in p.title.lower()
        if expect_cat:
            assert p.category == expect_cat
        # For range inputs ensure end > start when both present
        if '-' in text or ' to ' in text:
            assert p.start_datetime is not None and p.end_datetime is not None
            s = datetime.fromisoformat(p.start_datetime)
            e = datetime.fromisoformat(p.end_datetime)
            assert e > s

