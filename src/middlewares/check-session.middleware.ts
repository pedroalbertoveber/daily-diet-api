import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

export async function checkSession(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  console.log('chegou aqui')
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }

  const user = await knex('users').where({ session_id: sessionId }).first()

  if (!user) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }

  console.log('user', user)

  request.user = user
}
