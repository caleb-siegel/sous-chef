"""add ingredient note

Revision ID: c1ac4073fa45
Revises: 92574002ba0b
Create Date: 2024-04-11 11:42:03.505941

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c1ac4073fa45'
down_revision = '92574002ba0b'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('recipe_ingredient', sa.Column('ingredient_note', sa.String(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('recipe_ingredient', 'ingredient_note')
    # ### end Alembic commands ###
