import test from 'japa'
import supertest from 'supertest'

const BaseUrl = `http://${process.env.HOST}:${process.env.PORT}`

test.group('User', () => {
  test.only('it should create an user', async () => {
    const userPayload = {
      email: 'teste@teste.com',
      username: 'teste',
      password: '123456',
    }

    await supertest(BaseUrl).post('/users').send(userPayload).expect(201)
  })
})
