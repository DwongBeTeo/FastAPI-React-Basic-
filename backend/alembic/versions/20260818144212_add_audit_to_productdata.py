"""add audit to productData

Revision ID: be45ff191461
Revises: 20260818132559
Create Date: 2026-08-18 14:42:12.530600

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20260818144212'
down_revision: Union[str, Sequence[str], None] = '20260818132559'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


TABLE_NAME = "product_data"


def upgrade() -> None:
    """Kích hoạt Audit Triggers (FOR EACH STATEMENT) cho bảng."""
    op.execute(f"""
        CREATE TRIGGER audit_trigger_insert
        AFTER INSERT ON {TABLE_NAME}
        REFERENCING NEW TABLE AS new_table
        FOR EACH STATEMENT EXECUTE PROCEDURE create_activity();

        CREATE TRIGGER audit_trigger_update
        AFTER UPDATE ON {TABLE_NAME}
        REFERENCING OLD TABLE AS old_table NEW TABLE AS new_table
        FOR EACH STATEMENT EXECUTE PROCEDURE create_activity();

        CREATE TRIGGER audit_trigger_delete
        AFTER DELETE ON {TABLE_NAME}
        REFERENCING OLD TABLE AS old_table
        FOR EACH STATEMENT EXECUTE PROCEDURE create_activity();
    """)


def downgrade() -> None:
    """Gỡ bỏ Audit Triggers khi rollback."""
    op.execute(f"DROP TRIGGER IF EXISTS audit_trigger_insert ON {TABLE_NAME};")
    op.execute(f"DROP TRIGGER IF EXISTS audit_trigger_update ON {TABLE_NAME};")
    op.execute(f"DROP TRIGGER IF EXISTS audit_trigger_delete ON {TABLE_NAME};")