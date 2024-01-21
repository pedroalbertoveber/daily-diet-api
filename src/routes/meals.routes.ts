import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { checkSession } from '../middlewares/check-session.middleware'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: [checkSession] }, async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string().min(2),
      description: z.string(),
      datetime: z.string(),
      isOnDiet: z.boolean(),
    })

    const body = createMealBodySchema.parse(request.body)

    try {
      await knex('meals').insert({
        id: randomUUID(),
        user_id: request.user?.id,
        name: body.name,
        description: body.description,
        datetime: new Date(body.datetime).getSeconds(),
        is_on_diet: body.isOnDiet,
      })

      return reply.status(201).send()
    } catch (error: any) {
      throw new Error(error).message
    }
  })

  app.get('/', { preHandler: [checkSession] }, async (request, reply) => {
    const userId = request.user?.id

    try {
      const meals = await knex('meals').where({ user_id: userId })
      return reply.status(200).send({
        data: meals,
      })
    } catch (error: any) {
      throw new Error(error).message
    }
  })

  app.get(
    '/:mealId',
    { preHandler: [checkSession] },
    async (request, reply) => {
      const paramsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const params = paramsSchema.parse(request.params)
      const userId = request.user?.id

      try {
        const meal = await knex('meals')
          .where({ id: params.mealId, user_id: userId })
          .first()

        if (!meal) {
          return reply.status(404).send({
            message: 'Meal not found',
          })
        }

        return reply.status(200).send({
          data: meal,
        })
      } catch (error: any) {
        throw new Error(error.message)
      }
    },
  )

  app.put(
    '/:mealId',
    { preHandler: [checkSession] },
    async (request, reply) => {
      const paramsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const params = paramsSchema.parse(request.params)

      const createMealBodySchema = z.object({
        name: z.string().min(2),
        description: z.string(),
        datetime: z.string(),
        isOnDiet: z.boolean(),
      })

      const body = createMealBodySchema.parse(request.body)

      const userId = request.user?.id

      try {
        const meal = await knex('meals')
          .where({ id: params.mealId, user_id: userId })
          .first()

        if (!meal) {
          return reply.status(404).send({
            message: 'Meal not found',
          })
        }

        await knex('meals')
          .where({ id: params.mealId, user_id: userId })
          .update({
            name: body.name,
            description: body.description,
            datetime: new Date(body.datetime).getSeconds(),
            is_on_diet: body.isOnDiet,
          })

        return reply.status(200).send()
      } catch (error: any) {
        throw new Error(error.message)
      }
    },
  )

  app.delete(
    '/:mealId',
    { preHandler: [checkSession] },
    async (request, reply) => {
      const paramsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const params = paramsSchema.parse(request.params)
      const userId = request.user?.id

      try {
        const meal = await knex('meals')
          .where({ id: params.mealId, user_id: userId })
          .first()

        if (!meal) {
          return reply.status(404).send({
            message: 'Meal not found',
          })
        }

        await knex('meals')
          .where({ id: params.mealId, user_id: userId })
          .delete()

        return reply.status(200).send()
      } catch (error: any) {
        throw new Error(error.message)
      }
    },
  )
}
