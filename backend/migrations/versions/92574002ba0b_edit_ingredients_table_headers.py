"""edit ingredients table headers

Revision ID: 92574002ba0b
Revises: 05ddafa0a00c
Create Date: 2024-04-09 22:06:31.065139

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '92574002ba0b'
down_revision = '05ddafa0a00c'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('recipe_ingredient', sa.Column('ingredient_quantity', sa.Float(), nullable=True))
    op.add_column('recipe_ingredient', sa.Column('ingredient_unit', sa.String(), nullable=True))
    op.drop_column('recipe_ingredient', 'ingredient_value')
    op.drop_column('recipe_ingredient', 'inredient_unit')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('recipe_ingredient', sa.Column('inredient_unit', sa.VARCHAR(), nullable=True))
    op.add_column('recipe_ingredient', sa.Column('ingredient_value', sa.FLOAT(), nullable=True))
    op.drop_column('recipe_ingredient', 'ingredient_unit')
    op.drop_column('recipe_ingredient', 'ingredient_quantity')
    # ### end Alembic commands ###