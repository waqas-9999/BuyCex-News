import Home from '../views/Home';
import AdminArticles from '../views/AdminArticles';


let routes = [

	{
		path: '/',
		component: Home,
		layout: 'main',
	},
	{
		path: '/admin/articles',
		component: AdminArticles,
		layout: 'main',
	},
	
];
export default routes;