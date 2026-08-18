"""Add audit trigger to products table

Revision ID: 6f5c2806ce84
Revises: 20260818112046
Create Date: 2026-08-18 13:25:59.267190

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20260818132559'
down_revision: Union[str, Sequence[str], None] = '20260818112046'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("DROP TRIGGER IF EXISTS audit_trigger_row ON products;")
    op.execute("DROP TRIGGER IF EXISTS audit_trigger_stm ON products;")
    
    # 2. Tạo lại 3 Trigger chuẩn của postgresql-audit (Sử dụng Transition Tables)
    op.execute("""
        CREATE TRIGGER audit_trigger_insert
        AFTER INSERT ON products
        REFERENCING NEW TABLE AS new_table
        FOR EACH STATEMENT EXECUTE PROCEDURE create_activity();

        CREATE TRIGGER audit_trigger_update
        AFTER UPDATE ON products
        REFERENCING OLD TABLE AS old_table NEW TABLE AS new_table
        FOR EACH STATEMENT EXECUTE PROCEDURE create_activity();

        CREATE TRIGGER audit_trigger_delete
        AFTER DELETE ON products
        REFERENCING OLD TABLE AS old_table
        FOR EACH STATEMENT EXECUTE PROCEDURE create_activity();
    """)


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP TRIGGER IF EXISTS audit_trigger_insert ON products;")
    op.execute("DROP TRIGGER IF EXISTS audit_trigger_update ON products;")
    op.execute("DROP TRIGGER IF EXISTS audit_trigger_delete ON products;")
