"""add category, priority, completed to events

Revision ID: 0002_add_event_category_priority_completed
Revises: 0001_create_events_table
Create Date: 2026-07-09 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0002_add_event_category_priority_completed'
down_revision = '0001_create_events_table'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('events', sa.Column('category', sa.String(length=50), nullable=False, server_default='other'))
    op.add_column('events', sa.Column('priority', sa.String(length=50), nullable=False, server_default='normal'))
    op.add_column('events', sa.Column('completed', sa.Boolean(), nullable=False, server_default=sa.text('false')))


def downgrade():
    op.drop_column('events', 'completed')
    op.drop_column('events', 'priority')
    op.drop_column('events', 'category')
