const { sendRegistrationEmail } = require('../services/email-service');

router.post('/register', async (req, res) => {
  try {
    
    const newUser = await User.create({
    });
    
    await sendRegistrationEmail({
      username: req.body.username || newUser.username,
      email: req.body.email || newUser.email
    });
    
    
  } catch (error) {
  }
});
