// Router.configure({
//   layoutTemplate: 'BaseLayout'
// });

Router.route('/', function () {
  this.render('login');
});

Router.route('/home', function () {
  this.render('home');
});