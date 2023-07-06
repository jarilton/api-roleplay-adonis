import Mail from '@ioc:Adonis/Addons/Mail'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class PasswordsController {
  public async forgotPassword({ request, response }: HttpContextContract) {
    const { email, resetPasswordUrl } = request.only(['email', 'resetPasswordUrl'])
    const user = await User.findByOrFail('email', email)

    await Mail.send((message) => {
      message
        .from('no-reply@roleplay.com')
        .to(email)
        .subject('Recuperação de senha')
        .htmlView('email/forgot-password', {
          productName: 'Roleplay',
          name: user.username,
          resetPasswordUrl,
        })
    })
    return response.noContent()
  }
}
