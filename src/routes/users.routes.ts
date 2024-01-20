import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
    })

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    const { name, email } = createUserBodySchema.parse(request.body)

    const userAlreadyExists = await knex('users').where({ email }).first()

    if (userAlreadyExists) {
      return reply.status(409).send({
        message: 'User already registered',
      })
    }

    await knex('users').insert({
      name,
      email,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
