import { UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'

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

test.group('User', () => {
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
    assert.equal(body.user.avatar, userPayload.avatar)
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

    assert.exists(body.errors, 'Property errors not exists')
  })
})
