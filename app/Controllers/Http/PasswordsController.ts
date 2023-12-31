import Mail from '@ioc:Adonis/Addons/Mail'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { promisify } from 'util'
import { randomBytes } from 'crypto'
import ForgotPasswordValidator from 'App/Validators/ForgotPasswordValidator'
import ResetPasswordValidator from 'App/Validators/ResetPasswordValidator'
import TokenExpiredException from 'App/Exceptions/TokenExpiredException'

export default class PasswordsController {
  public async forgotPassword({ request, response }: HttpContextContract) {
    const { email, resetPasswordUrl } = await request.validate(ForgotPasswordValidator)
    const user = await User.findByOrFail('email', email)

    const random = await promisify(randomBytes)(24)
    const token = random.toString('hex')
    await user.related('tokens').updateOrCreate(
      { userId: user.id },
      {
        token,
      }
    )

    const resetPasswordUrlWithToken = `${resetPasswordUrl}?token=${token}`

    await Mail.send((message) => {
      message
        .from('no-reply@roleplay.com')
        .to(email)
        .subject('Recuperação de senha')
        .htmlView('email/forgot-password', {
          productName: 'Roleplay',
          name: user.username,
          resetPasswordUrl: resetPasswordUrlWithToken,
        })
    })
    return response.noContent()
  }

  public async resetPassword({ request, response }: HttpContextContract) {
    const { token, password } = await request.validate(ResetPasswordValidator)

    const userToken = await User.query()
      .whereHas('tokens', (query) => {
        query.where('token', token)
      })
      .preload('tokens')
      .firstOrFail()

    const tokenAge = Math.abs(userToken.tokens[0].createdAt.diffNow('hours').hours)

    if (tokenAge > 2) {
      throw new TokenExpiredException()
    }

    userToken.password = password
    await userToken.save()
    await userToken.related('tokens').query().delete()

    return response.noContent()
  }
}
