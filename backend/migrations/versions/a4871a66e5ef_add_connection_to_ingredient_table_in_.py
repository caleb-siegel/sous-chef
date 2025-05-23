"""add connection to ingredient table in shopping list table

Revision ID: a4871a66e5ef
Revises: 437a801df75d
Create Date: 2025-03-30 18:18:11.325998

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'a4871a66e5ef'
down_revision = '437a801df75d'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    # op.alter_column('meal_prep', 'id',
    #            existing_type=sa.BIGINT(),
    #            server_default=None,
    #            type_=sa.Integer(),
    #            existing_nullable=False,
    #            autoincrement=True)
    # op.alter_column('meal_prep', 'user_id',
    #            existing_type=sa.BIGINT(),
    #            type_=sa.Integer(),
    #            existing_nullable=True)
    # op.alter_column('meal_prep', 'recipe_id',
    #            existing_type=sa.BIGINT(),
    #            type_=sa.Integer(),
    #            existing_nullable=True)
    # op.alter_column('meal_prep', 'weekday',
    #            existing_type=sa.TEXT(),
    #            type_=sa.String(),
    #            existing_nullable=True)
    # op.alter_column('meal_prep', 'meal',
    #            existing_type=sa.TEXT(),
    #            type_=sa.String(),
    #            existing_nullable=True)
    # op.alter_column('recipe', 'id',
    #            existing_type=sa.BIGINT(),
    #            server_default=None,
    #            type_=sa.Integer(),
    #            existing_nullable=False,
    #            autoincrement=True)
    # op.alter_column('recipe', 'name',
    #            existing_type=sa.TEXT(),
    #            type_=sa.String(),
    #            existing_nullable=True)
    # op.alter_column('recipe', 'picture',
    #            existing_type=sa.TEXT(),
    #            type_=sa.String(),
    #            existing_nullable=True)
    # op.alter_column('recipe', 'source_category_id',
    #            existing_type=sa.BIGINT(),
    #            type_=sa.Integer(),
    #            existing_nullable=True)
    # op.alter_column('recipe', 'source',
    #            existing_type=sa.TEXT(),
    #            type_=sa.String(),
    #            existing_nullable=True)
    # op.alter_column('recipe', 'reference',
    #            existing_type=sa.TEXT(),
    #            type_=sa.String(),
    #            existing_nullable=True)
    # op.alter_column('recipe', 'instructions',
    #            existing_type=sa.TEXT(),
    #            type_=sa.String(),
    #            existing_nullable=True)
    # op.alter_column('recipe', 'created_by_user_id',
    #            existing_type=sa.BIGINT(),
    #            type_=sa.Integer(),
    #            existing_nullable=True)
    op.create_foreign_key(op.f('fk_recipe_created_by_user_id_user'), 'recipe', 'user', ['created_by_user_id'], ['id'])
    # op.alter_column('recipe_ingredient', 'id',
    #            existing_type=sa.BIGINT(),
    #            server_default=None,
    #            type_=sa.Integer(),
    #            existing_nullable=False,
    #            autoincrement=True)
    # op.alter_column('recipe_ingredient', 'recipe_id',
    #            existing_type=sa.BIGINT(),
    #            type_=sa.Integer(),
    #            existing_nullable=True)
    # op.alter_column('recipe_ingredient', 'ingredient_name',
    #            existing_type=sa.TEXT(),
    #            type_=sa.String(),
    #            existing_nullable=True)
    # op.alter_column('recipe_ingredient', 'ingredient_unit',
    #            existing_type=sa.TEXT(),
    #            type_=sa.String(),
    #            existing_nullable=True)
    # op.alter_column('recipe_ingredient', 'ingredient_note',
    #            existing_type=sa.TEXT(),
    #            type_=sa.String(),
    #            existing_nullable=True)
    # op.alter_column('recipe_tag', 'id',
    #            existing_type=sa.BIGINT(),
    #            server_default=None,
    #            type_=sa.Integer(),
    #            existing_nullable=False,
    #            autoincrement=True)
    # op.alter_column('recipe_tag', 'recipe_id',
    #            existing_type=sa.BIGINT(),
    #            type_=sa.Integer(),
    #            existing_nullable=True)
    # op.alter_column('recipe_tag', 'tag_id',
    #            existing_type=sa.BIGINT(),
    #            type_=sa.Integer(),
    #            existing_nullable=True)
    op.add_column('shopping_list', sa.Column('ingredient_id', sa.Integer(), nullable=True))
    op.create_foreign_key(op.f('fk_shopping_list_ingredient_id_recipe_ingredient'), 'shopping_list', 'recipe_ingredient', ['ingredient_id'], ['id'])
    op.drop_column('shopping_list', 'quantity')
    op.drop_column('shopping_list', 'ingredient')
    op.drop_column('shopping_list', 'note')
    op.drop_column('shopping_list', 'unit')
    # op.alter_column('source_category', 'id',
    #            existing_type=sa.BIGINT(),
    #            server_default=None,
    #            type_=sa.Integer(),
    #            existing_nullable=False,
    #            autoincrement=True)
    # op.alter_column('source_category', 'name',
    #            existing_type=sa.TEXT(),
    #            type_=sa.String(),
    #            existing_nullable=True)
    # op.create_unique_constraint(op.f('uq_source_category_name'), 'source_category', ['name'])
    # op.alter_column('tag', 'id',
    #            existing_type=sa.BIGINT(),
    #            server_default=None,
    #            type_=sa.Integer(),
    #            existing_nullable=False,
    #            autoincrement=True)
    # op.alter_column('tag', 'name',
    #            existing_type=sa.TEXT(),
    #            type_=sa.String(),
    #            existing_nullable=True)
    # op.create_unique_constraint(op.f('uq_tag_name'), 'tag', ['name'])
    # op.alter_column('user', 'id',
    #            existing_type=sa.BIGINT(),
    #            server_default=None,
    #            type_=sa.Integer(),
    #            existing_nullable=False,
    #            autoincrement=True)
    # op.alter_column('user', 'name',
    #            existing_type=sa.TEXT(),
    #            type_=sa.String(),
    #            existing_nullable=True)
    # op.alter_column('user', 'password_hash',
    #            existing_type=sa.TEXT(),
    #            type_=sa.String(),
    #            existing_nullable=True)
    # op.create_unique_constraint(op.f('uq_user_name'), 'user', ['name'])
    # op.alter_column('user_recipe', 'id',
    #            existing_type=sa.BIGINT(),
    #            server_default=None,
    #            type_=sa.Integer(),
    #            existing_nullable=False,
    #            autoincrement=True)
    # op.alter_column('user_recipe', 'user_id',
    #            existing_type=sa.BIGINT(),
    #            type_=sa.Integer(),
    #            existing_nullable=True)
    # op.alter_column('user_recipe', 'recipe_id',
    #            existing_type=sa.BIGINT(),
    #            type_=sa.Integer(),
    #            existing_nullable=True)
    # op.alter_column('user_recipe', 'comments',
    #            existing_type=sa.TEXT(),
    #            type_=sa.String(),
    #            existing_nullable=True)
    op.create_foreign_key(op.f('fk_user_recipe_recipe_id_recipe'), 'user_recipe', 'recipe', ['recipe_id'], ['id'])
    # op.alter_column('user_recipe_tag', 'id',
    #            existing_type=sa.BIGINT(),
    #            server_default=None,
    #            type_=sa.Integer(),
    #            existing_nullable=False,
    #            autoincrement=True)
    # op.alter_column('user_recipe_tag', 'user_id',
    #            existing_type=sa.BIGINT(),
    #            type_=sa.Integer(),
    #            existing_nullable=True)
    # op.alter_column('user_recipe_tag', 'recipe_id',
    #            existing_type=sa.BIGINT(),
    #            type_=sa.Integer(),
    #            existing_nullable=True)
    # op.alter_column('user_recipe_tag', 'user_tag_id',
    #            existing_type=sa.BIGINT(),
    #            type_=sa.Integer(),
    #            existing_nullable=True)
    # op.alter_column('user_tag', 'id',
    #            existing_type=sa.BIGINT(),
    #            server_default=None,
    #            type_=sa.Integer(),
    #            existing_nullable=False,
    #            autoincrement=True)
    # op.alter_column('user_tag', 'name',
    #            existing_type=sa.TEXT(),
    #            type_=sa.String(),
    #            existing_nullable=True)
    # op.create_unique_constraint(op.f('uq_user_tag_name'), 'user_tag', ['name'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    # op.drop_constraint(op.f('uq_user_tag_name'), 'user_tag', type_='unique')
    # op.alter_column('user_tag', 'name',
    #            existing_type=sa.String(),
    #            type_=sa.TEXT(),
    #            existing_nullable=True)
    # op.alter_column('user_tag', 'id',
    #            existing_type=sa.Integer(),
    #            server_default=sa.Identity(always=False, start=1, increment=1, minvalue=1, maxvalue=9223372036854775807, cycle=False, cache=1),
    #            type_=sa.BIGINT(),
    #            existing_nullable=False,
    #            autoincrement=True)
    # op.alter_column('user_recipe_tag', 'user_tag_id',
    #            existing_type=sa.Integer(),
    #            type_=sa.BIGINT(),
    #            existing_nullable=True)
    # op.alter_column('user_recipe_tag', 'recipe_id',
    #            existing_type=sa.Integer(),
    #            type_=sa.BIGINT(),
    #            existing_nullable=True)
    # op.alter_column('user_recipe_tag', 'user_id',
    #            existing_type=sa.Integer(),
    #            type_=sa.BIGINT(),
    #            existing_nullable=True)
    # op.alter_column('user_recipe_tag', 'id',
    #            existing_type=sa.Integer(),
    #            server_default=sa.Identity(always=False, start=1, increment=1, minvalue=1, maxvalue=9223372036854775807, cycle=False, cache=1),
    #            type_=sa.BIGINT(),
    #            existing_nullable=False,
    #            autoincrement=True)
    op.drop_constraint(op.f('fk_user_recipe_recipe_id_recipe'), 'user_recipe', type_='foreignkey')
    # op.alter_column('user_recipe', 'comments',
    #            existing_type=sa.String(),
    #            type_=sa.TEXT(),
    #            existing_nullable=True)
    # op.alter_column('user_recipe', 'recipe_id',
    #            existing_type=sa.Integer(),
    #            type_=sa.BIGINT(),
    #            existing_nullable=True)
    # op.alter_column('user_recipe', 'user_id',
    #            existing_type=sa.Integer(),
    #            type_=sa.BIGINT(),
    #            existing_nullable=True)
    # op.alter_column('user_recipe', 'id',
    #            existing_type=sa.Integer(),
    #            server_default=sa.Identity(always=False, start=1, increment=1, minvalue=1, maxvalue=9223372036854775807, cycle=False, cache=1),
    #            type_=sa.BIGINT(),
    #            existing_nullable=False,
    #            autoincrement=True)
    # op.drop_constraint(op.f('uq_user_name'), 'user', type_='unique')
    # op.alter_column('user', 'password_hash',
    #            existing_type=sa.String(),
    #            type_=sa.TEXT(),
    #            existing_nullable=True)
    # op.alter_column('user', 'name',
    #            existing_type=sa.String(),
    #            type_=sa.TEXT(),
    #            existing_nullable=True)
    # op.alter_column('user', 'id',
    #            existing_type=sa.Integer(),
    #            server_default=sa.Identity(always=False, start=1, increment=1, minvalue=1, maxvalue=9223372036854775807, cycle=False, cache=1),
    #            type_=sa.BIGINT(),
    #            existing_nullable=False,
    #            autoincrement=True)
    # op.drop_constraint(op.f('uq_tag_name'), 'tag', type_='unique')
    # op.alter_column('tag', 'name',
    #            existing_type=sa.String(),
    #            type_=sa.TEXT(),
    #            existing_nullable=True)
    # op.alter_column('tag', 'id',
    #            existing_type=sa.Integer(),
    #            server_default=sa.Identity(always=False, start=1, increment=1, minvalue=1, maxvalue=9223372036854775807, cycle=False, cache=1),
    #            type_=sa.BIGINT(),
    #            existing_nullable=False,
    #            autoincrement=True)
    # op.drop_constraint(op.f('uq_source_category_name'), 'source_category', type_='unique')
    # op.alter_column('source_category', 'name',
    #            existing_type=sa.String(),
    #            type_=sa.TEXT(),
    #            existing_nullable=True)
    # op.alter_column('source_category', 'id',
    #            existing_type=sa.Integer(),
    #            server_default=sa.Identity(always=False, start=1, increment=1, minvalue=1, maxvalue=9223372036854775807, cycle=False, cache=1),
    #            type_=sa.BIGINT(),
    #            existing_nullable=False,
    #            autoincrement=True)
    op.add_column('shopping_list', sa.Column('unit', sa.VARCHAR(), autoincrement=False, nullable=False))
    op.add_column('shopping_list', sa.Column('note', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('shopping_list', sa.Column('ingredient', sa.VARCHAR(), autoincrement=False, nullable=False))
    op.add_column('shopping_list', sa.Column('quantity', postgresql.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=False))
    op.drop_constraint(op.f('fk_shopping_list_ingredient_id_recipe_ingredient'), 'shopping_list', type_='foreignkey')
    op.drop_column('shopping_list', 'ingredient_id')
    # op.alter_column('recipe_tag', 'tag_id',
    #            existing_type=sa.Integer(),
    #            type_=sa.BIGINT(),
    #            existing_nullable=True)
    # op.alter_column('recipe_tag', 'recipe_id',
    #            existing_type=sa.Integer(),
    #            type_=sa.BIGINT(),
    #            existing_nullable=True)
    # op.alter_column('recipe_tag', 'id',
    #            existing_type=sa.Integer(),
    #            server_default=sa.Identity(always=False, start=1, increment=1, minvalue=1, maxvalue=9223372036854775807, cycle=False, cache=1),
    #            type_=sa.BIGINT(),
    #            existing_nullable=False,
    #            autoincrement=True)
    # op.alter_column('recipe_ingredient', 'ingredient_note',
    #            existing_type=sa.String(),
    #            type_=sa.TEXT(),
    #            existing_nullable=True)
    # op.alter_column('recipe_ingredient', 'ingredient_unit',
    #            existing_type=sa.String(),
    #            type_=sa.TEXT(),
    #            existing_nullable=True)
    # op.alter_column('recipe_ingredient', 'ingredient_name',
    #            existing_type=sa.String(),
    #            type_=sa.TEXT(),
    #            existing_nullable=True)
    # op.alter_column('recipe_ingredient', 'recipe_id',
    #            existing_type=sa.Integer(),
    #            type_=sa.BIGINT(),
    #            existing_nullable=True)
    # op.alter_column('recipe_ingredient', 'id',
    #            existing_type=sa.Integer(),
    #            server_default=sa.Identity(always=False, start=1, increment=1, minvalue=1, maxvalue=9223372036854775807, cycle=False, cache=1),
    #            type_=sa.BIGINT(),
    #            existing_nullable=False,
    #            autoincrement=True)
    # op.drop_constraint(op.f('fk_recipe_created_by_user_id_user'), 'recipe', type_='foreignkey')
    # op.alter_column('recipe', 'created_by_user_id',
    #            existing_type=sa.Integer(),
    #            type_=sa.BIGINT(),
    #            existing_nullable=True)
    # op.alter_column('recipe', 'instructions',
    #            existing_type=sa.String(),
    #            type_=sa.TEXT(),
    #            existing_nullable=True)
    # op.alter_column('recipe', 'reference',
    #            existing_type=sa.String(),
    #            type_=sa.TEXT(),
    #            existing_nullable=True)
    # op.alter_column('recipe', 'source',
    #            existing_type=sa.String(),
    #            type_=sa.TEXT(),
    #            existing_nullable=True)
    # op.alter_column('recipe', 'source_category_id',
    #            existing_type=sa.Integer(),
    #            type_=sa.BIGINT(),
    #            existing_nullable=True)
    # op.alter_column('recipe', 'picture',
    #            existing_type=sa.String(),
    #            type_=sa.TEXT(),
    #            existing_nullable=True)
    # op.alter_column('recipe', 'name',
    #            existing_type=sa.String(),
    #            type_=sa.TEXT(),
    #            existing_nullable=True)
    # op.alter_column('recipe', 'id',
    #            existing_type=sa.Integer(),
    #            server_default=sa.Identity(always=False, start=1, increment=1, minvalue=1, maxvalue=9223372036854775807, cycle=False, cache=1),
    #            type_=sa.BIGINT(),
    #            existing_nullable=False,
    #            autoincrement=True)
    # op.alter_column('meal_prep', 'meal',
    #            existing_type=sa.String(),
    #            type_=sa.TEXT(),
    #            existing_nullable=True)
    # op.alter_column('meal_prep', 'weekday',
    #            existing_type=sa.String(),
    #            type_=sa.TEXT(),
    #            existing_nullable=True)
    # op.alter_column('meal_prep', 'recipe_id',
    #            existing_type=sa.Integer(),
    #            type_=sa.BIGINT(),
    #            existing_nullable=True)
    # op.alter_column('meal_prep', 'user_id',
    #            existing_type=sa.Integer(),
    #            type_=sa.BIGINT(),
    #            existing_nullable=True)
    # op.alter_column('meal_prep', 'id',
    #            existing_type=sa.Integer(),
    #            server_default=sa.Identity(always=False, start=1, increment=1, minvalue=1, maxvalue=9223372036854775807, cycle=False, cache=1),
    #            type_=sa.BIGINT(),
    #            existing_nullable=False,
    #            autoincrement=True)
    # ### end Alembic commands ###
