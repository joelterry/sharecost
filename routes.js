// Router.configure({
//   layoutTemplate: 'BaseLayout'
// });

Router.route('/login', function () {
  if (Meteor.user())
  	this.redirect('/');
  else
  	this.render('login');
});

Router.route('/', function () {
  if (Meteor.user())
  	this.render('home');
  else
  	this.redirect('/login');
});