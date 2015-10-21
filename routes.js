// Router.configure({
//   layoutTemplate: 'BaseLayout'
// });

Router.route('/login', function () {
  if (Meteor.user())
  	this.redirect('/');
  else
  	this.render('login');
});

Router.route('/create', function () {
    if (Meteor.user())
        this.render('create');
    else
        this.redirect('/login');
});

Router.route('/', function () {
  if (Meteor.user()){
    this.layout('BaseLayout');
  	this.render('home');
  }else {
  	this.redirect('/login');
  }

});