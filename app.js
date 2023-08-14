

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const errorController = require('./controllers/error');
//const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {
  try {
    const user = await User.findById('64d25d0c18696c1e07280e9b');
    req.user =user;
    next();
  } catch (err) {
    console.error(err);
    next(); 
  }
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect('mongodb+srv://Nirmalya:ZVuBsk9zzZKzjnmU@cluster.gounyfp.mongodb.net/shop?retryWrites=true&w=majority')
.then(result=>{
  User.findOne().then(user=>{
    if(!user)
    {
      const user = new User({
        name:'Nirmalya Sengupta',
        email: 'nir@gmail.com',
        cart:{
          items:[]
        }
      })
      user.save();
    }
  })
  
  app.listen(3000);
})
.catch(err=>{
  console.log(err)
})