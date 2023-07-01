import Database from '@ioc:Adonis/Lucid/Database'
import { UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'
import Hash from '@ioc:Adonis/Core/Hash'

const BaseUrl = `http://${process.env.HOST}:${process.env.PORT}`

/* 
  {
    "users": {
      "id:": number,
      "email": string,
      "username": string,
      "password": string,
      "avatar": string,
    }
  }
*/

test.group('User', (group) => {
  test('it should create an user', async (assert) => {
    const userPayload = {
      email: 'teste@teste.com',
      username: 'teste',
      password: '123456',
      avatar: 'https://www.images.com/image/1',
    }

    const { body } = await supertest(BaseUrl).post('/users').send(userPayload).expect(201)

    assert.exists(body.user, 'Property user not exists')
    assert.exists(body.user.id, 'Property id not exists')
    assert.equal(body.user.email, userPayload.email)
    assert.equal(body.user.username, userPayload.username)
    assert.notExists(body.user.password, 'Property password exists')
  })

  test('it should return an error 409 when try to create an user with an email already exists', async (assert) => {
    const { email } = await UserFactory.create()

    const { body } = await supertest(BaseUrl)
      .post('/users')
      .send({
        email,
        username: 'teste',
        password: '123456',
      })
      .expect(409)

    assert.exists(body.message)
    assert.exists(body.code)
    assert.exists(body.status)
    assert.include(body.message, 'email')
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)
  })

  test('it should return an error 409 when try to create an user with an username already exists', async (assert) => {
    const { username } = await UserFactory.create()

    const { body } = await supertest(BaseUrl)
      .post('/users')
      .send({
        username,
        email: 'teste@teste.com',
        password: '123456',
      })
      .expect(409)

    assert.exists(body.message)
    assert.exists(body.code)
    assert.exists(body.status)
    assert.include(body.message, 'username')
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)
  })

  test('it should return 422 required data is not provided', async (assert) => {
    const { body } = await supertest(BaseUrl).post('/users').send({}).expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should return 422 when try to create an user with invalid email', async (assert) => {
    const { body } = await supertest(BaseUrl)
      .post('/users')
      .send({
        email: 'invalid_email',
        username: 'teste',
        password: '123456',
      })
      .expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should return 422 when try to create with invalid password  ', async (assert) => {
    const { body } = await supertest(BaseUrl)
      .post('/users')
      .send({
        email: 'teste@teste.com',
        password: '123',
        username: 'teste',
      })
      .expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should update an user', async (assert) => {
    const { id, password } = await UserFactory.create()
    const email = 'teste@teste.com'
    const avatar = 'https://github.com/jarilton.png'

    const { body } = await supertest(BaseUrl)
      .put(`/users/${id}`)
      .send({ email, avatar, password })
      .expect(200)

    assert.exists(body.user, 'Property user not exists')
    assert.equal(body.user.email, email)
    assert.equal(body.user.avatar, avatar)
    assert.equal(body.user.id, id)
  })

  test.only('it should update the password of the user', async (assert) => {
    const user = await UserFactory.create()
    const password = '123456'

    const { body } = await supertest(BaseUrl)
      .put(`/users/${user.id}`)
      .send({ email: user.email, avatar: user.avatar, password })
      .expect(200)

    assert.exists(body.user, 'Property user not exists')
    assert.equal(body.user.id, user.id)

    await user.refresh()
    assert.isTrue(await Hash.verify(user.password, password))
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })
  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
