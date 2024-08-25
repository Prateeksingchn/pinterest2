var express = require('express');
var router = express.Router();
const userModel = require("./models/users");
const postModel = require("./models/post");
const boardModel = require("./models/board");
const passport = require('passport');
const localStrategy = require('passport-local');
const upload = require('./multer');

passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function(req, res, next) {
  res.render('index', {nav: false});
});

router.get('/register', function(req, res, next) {
  res.render('register', {nav: false});
});

router.get('/profile', isLoggedIn, async function(req, res, next) {
  try {
    const user = await userModel
      .findOne({username: req.session.passport.user})
      .populate("posts")
      .populate("boards");
    res.render('profile', {user, nav: true});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/show/posts', isLoggedIn, async function(req, res, next) {
  const user = 
  await userModel
        .findOne({username: req.session.passport.user})
        .populate("posts")
  res.render('show', {user, nav: true});
});

router.get('/open/posts/:postid', isLoggedIn, async function(req, res, next) {
  try {
    const user = await userModel
      .findOne({ username: req.session.passport.user })
      .populate("posts");

    let post = await postModel.findOne({_id: req.params.postid});
      
    if (!post) {
      const error = new Error('Post not found');
      error.status = 404;
      throw error;
    }

    res.render('open', { user, post, nav: true });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).render('error', { message: error.message, error, nav: true });
  }
});

router.get('/feed', isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user});
  const posts = await postModel.find().populate("user");
  res.render('feed', {user, posts, nav: true});
});

router.get('/add', isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render('add', {user, nav: true});
});

router.post('/createpost', isLoggedIn, upload.single("postimage"), async function(req, res, next) {
  try {
    const user = await userModel.findOne({username: req.session.passport.user});
    
    if (!user) {
      return res.status(404).send("User not found");
    }

    const post = await postModel.create({
      user: user._id,
      title: req.body.title,
      description: req.body.description,
      image: req.file.filename
    });

    if (!post) {
      return res.status(500).send("Failed to create post");
    }

    user.posts.push(post._id);
    await user.save();

    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post('/fileupload', isLoggedIn, upload.single("image"), async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user});
  user.profileImage = req.file.filename;
  await user.save();  
  res.redirect("/profile");
}); 

router.post('/register', function(req, res, next) {
  const data = new userModel({
    username: req.body.username,
    email: req.body.email,
    fullname: req.body.fullname,
    contact: req.body.contact
  })

  userModel.register(data, req.body.password)
  .then(function(){
    passport.authenticate("local")(req, res, function(){
      res.redirect("/profile");
    })
  })
});

router.post('/login', passport.authenticate("local", {
  failureRedirect: "/",
  successRedirect: "/profile",
}), function(req, res, next) {
});

router.get("/logout", function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

// Board routes
router.get('/create-board', isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render('create-board', {user, nav: true});
});

router.post('/create-board', isLoggedIn, async function(req, res, next) {
  try {
    const user = await userModel.findOne({username: req.session.passport.user});
    
    if (!user) {
      return res.status(404).send("User not found");
    }

    const board = await boardModel.create({
      user: user._id,
      name: req.body.name,
      description: req.body.description
    });

    if (!board) {
      return res.status(500).send("Failed to create board");
    }

    user.boards.push(board._id);
    await user.save();

    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/boards', isLoggedIn, async function(req, res, next) {
  try {
    const user = await userModel.findOne({username: req.session.passport.user}).populate("boards");
    res.render('boards', {user, nav: true});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/board/:boardId', isLoggedIn, async function(req, res, next) {
  try {
    const board = await boardModel.findById(req.params.boardId).populate("posts");
    if (!board) {
      return res.status(404).send("Board not found");
    }
    res.render('board', {board, nav: true});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/");
}

module.exports = router;