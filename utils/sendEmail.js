const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
exports.sendEmail = async (emailData) => {
  
  let transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 25,
    auth: {
      user: 'f83f36c6f9a75f', 
      pass:'84f7361cdeda44'
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  let info = await transporter.sendMail({
    from: '"Anas Khan" <Bookify@example.com>', // sender address
    to: "bar@example.com, baz@example.com", // list of receivers
    subject: "Password Reset", // Subject line
    text:  `You Forget the Password Dear. Click on the link: /api/v1/users/forgetPassword/${emailData}`, // plain text body
    html: "<b>Hello world?</b>", // html body
  });


}

