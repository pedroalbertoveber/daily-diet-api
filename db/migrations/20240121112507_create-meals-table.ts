import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.string('user_id').references('id').inTable('users').notNullable()
    table.string('name').notNullable()
    table.string('description')
    table.string('datetime').notNullable()
    table.boolean('is_on_diet').notNullable()
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('meals')
}
