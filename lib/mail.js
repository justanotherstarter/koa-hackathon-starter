require('dotenv').config()
const { MailService } = require('@sendgrid/mail')

const config = {
  from: 'angadsingh567890@gmail.com'
}

module.exports = async (to, subject, html) => {
  const mail = new MailService()
  mail.setApiKey(process.env.SG_KEY)

  try {
    return await new Promise((resolve, reject) => {
      mail.send(
        {
          to,
          subject,
          html,
          text: html.replace(/<\/?[^>]+\/?>/g, '').trim(),
          ...config
        },
        (err, data) => {
          if (err) reject(err)
          resolve(data)
        }
      )
    })
  } catch (error) {
    throw error
  }
}
