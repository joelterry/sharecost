// Router.configure({
//   layoutTemplate: 'BaseLayout'
// });

Router.route('/', function () {
  this.render('login');
});

Router.route('/index', function () {
  this.render('index');
});