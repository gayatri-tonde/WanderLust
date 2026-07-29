const User = require("../models/userModel");

module.exports.renderSignupForm = (req, res) => {
  res.render("../views/listings/user/signup.ejs");
};

module.exports.Signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newuser = new User({ username, email });
    const registeredUser = await User.register(newuser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    console.log(e);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("../views/listings/user/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome to Wanderlust!!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged Out!");
    res.redirect("/listings");
  });
};
