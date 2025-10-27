import Home from '../views/Home';
import AdminArticles from '../views/AdminArticles';
import AnalyticsDashboard from '../views/AnalyticsDashboard';
import ArticleDetail from '../views/ArticleDetail';


let routes = [

	{
		path: '/',
		component: Home,
		layout: 'main',
	},
	{
		path: '/article/:slug',
		component: ArticleDetail,
		layout: 'main',
	},
	{
		path: '/admin/articles',
		component: AdminArticles,
		layout: 'main',
	},
	{
		path: '/admin/analytics',
		component: AnalyticsDashboard,
		layout: 'main',
	},
	
];
export default routes;