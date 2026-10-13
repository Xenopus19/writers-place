import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import AppLayout from './AppLayout'
import ArticlePage from './components/ArticlePage'
import ArticlesCatalog from './components/ArticlesCatalog'
import LogIn from './components/LogIn'
import MainPage from './components/MainPage'
import PublishArticle from './components/PublishArticle'
import SignUp from './components/SignUp'
import UserPage from './components/UserPage'

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <MainPage /> },
      { path: '/articles', element: <ArticlesCatalog /> },
      { path: '/articles/:id', element: <ArticlePage /> },
      { path: '/login', element: <LogIn /> },
      { path: '/signup', element: <SignUp /> },
      { path: '/profile', element: <UserPage /> },
      { path: '/publish', element: <PublishArticle /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
