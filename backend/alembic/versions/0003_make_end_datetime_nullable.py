"""make end_datetime nullable

Revision ID: 0003_make_end_datetime_nullable
Revises: 0002_add_event_category_priority_completed
Create Date: 2026-07-10 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0003_make_end_datetime_nullable'
down_revision = '0002_add_event_category_priority_completed'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        'events',
        'end_datetime',
        existing_type=sa.DateTime(),
        nullable=True,
    )


def downgrade():
    op.alter_column(
        'events',
        'end_datetime',
        existing_type=sa.DateTime(),
        nullable=False,
    )
