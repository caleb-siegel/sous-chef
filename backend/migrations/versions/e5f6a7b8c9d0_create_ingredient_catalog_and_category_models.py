"""create ingredient catalog and category models

Revision ID: e5f6a7b8c9d0
Revises: d539c05476a8
Create Date: 2026-11-15 10:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e5f6a7b8c9d0'
down_revision = 'd539c05476a8'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Create ingredient_category table
    op.create_table(
        'ingredient_category',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_ingredient_category')),
        sa.UniqueConstraint('name', name=op.f('uq_ingredient_category_name'))
    )

    # 2. Create canonical ingredient table
    op.create_table(
        'ingredient',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=True),
        sa.Column('default_unit', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['ingredient_category.id'], name=op.f('fk_ingredient_category_id_ingredient_category')),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_ingredient')),
        sa.UniqueConstraint('name', name=op.f('uq_ingredient_name'))
    )

    # 3. Add ingredient_id and preparation to recipe_ingredient join table
    with op.batch_alter_table('recipe_ingredient', schema=None) as batch_op:
        batch_op.add_column(sa.Column('ingredient_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('preparation', sa.String(), nullable=True))
        batch_op.create_foreign_key(
            batch_op.f('fk_recipe_ingredient_ingredient_id_ingredient'),
            'ingredient',
            ['ingredient_id'],
            ['id']
        )

    # 4. Seed initial standard supermarket categories
    ingredient_category_table = sa.table(
        'ingredient_category',
        sa.column('name', sa.String),
        sa.column('sort_order', sa.Integer)
    )

    default_categories = [
        {'name': 'Produce', 'sort_order': 1},
        {'name': 'Meat & Poultry', 'sort_order': 2},
        {'name': 'Seafood', 'sort_order': 3},
        {'name': 'Dairy & Eggs', 'sort_order': 4},
        {'name': 'Bakery & Bread', 'sort_order': 5},
        {'name': 'Deli & Prepared', 'sort_order': 6},
        {'name': 'Pantry & Dry Goods', 'sort_order': 7},
        {'name': 'Canned & Jarred Goods', 'sort_order': 8},
        {'name': 'Spices & Seasonings', 'sort_order': 9},
        {'name': 'Oils, Vinegars & Condiments', 'sort_order': 10},
        {'name': 'Baking Needs', 'sort_order': 11},
        {'name': 'Frozen Foods', 'sort_order': 12},
        {'name': 'Beverages', 'sort_order': 13},
        {'name': 'Household & Other', 'sort_order': 14},
    ]

    op.bulk_insert(ingredient_category_table, default_categories)


def downgrade():
    with op.batch_alter_table('recipe_ingredient', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('fk_recipe_ingredient_ingredient_id_ingredient'), type_='foreignkey')
        batch_op.drop_column('preparation')
        batch_op.drop_column('ingredient_id')

    op.drop_table('ingredient')
    op.drop_table('ingredient_category')
