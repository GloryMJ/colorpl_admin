"""2nd

Revision ID: f7c858aae7a0
Revises: 475ec85850d2
Create Date: 2024-07-25 13:32:06.464359

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f7c858aae7a0'
down_revision: Union[str, None] = '475ec85850d2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
