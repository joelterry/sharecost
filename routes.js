// Router.configure({
//   layoutTemplate: 'BaseLayout'
// });

Router.route('/', function () {
  this.render('login');
});

Router.route('/home', function () {
  this.layout('BaseLayout');
  this.render('home');
});

Router.route('/create', function () {
    this.render('create');
});