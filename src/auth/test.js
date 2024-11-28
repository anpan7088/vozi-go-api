import Mailjet from 'node-mailjet';
 
const mailjetClient = Mailjet.apiConnect(
    'c4266a882d0a75b0cd65cb6769f7cad4', // API Key
    'c1701974b2b0e78e90ada7ace47e5b3c'  // Secret Key
);

// const mailjetClient = Mailjet.apiConnect(
//     process.env.API_KEY,
//     process.env.SECRET_KEY
// );

const sendMail = async () => {

    console.log(process.env.APY_KEY,  process.env.SECRET_KEY );

  try {
    const result = await mailjetClient
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: 'support@vozi-go.sman.cloud',
              Name: 'VoziGo Support',
            },
            To: [
              {
                // Email: 'ristepan@yahoo.co.uk',
                Email:  "ristepan@gmail.com",
                Name: 'Rikardo',
              },
            ],
            Subject: 'Password Reset Link xlxlxl',
            TextPart: 'This is your passwords resxxxet link.',
            HTMLPart: '<p>This is your password reset link.</p>',
          },
        ],
      });

    console.log('Email sent successfully:', result.body);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

sendMail();
