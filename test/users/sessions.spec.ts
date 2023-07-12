import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import { UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'

const BaseUrl = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Session', (group) => {
  group.beforeEach(async () => {
    await User.query().delete()
  })

  test.only('it should authenticate an user', async (assert) => {
    const plainPassword = '123456'
    const { id, email } = await UserFactory.merge({ password: plainPassword }).create()
    const { body } = await supertest(BaseUrl)
      .post('/sessions')
      .send({ email, password: plainPassword })
      .expect(201)

    console.log({ user: body.user })

    assert.isDefined(body.user, 'User should be defined')
    assert.equal(body.user.id, id)
  })
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
