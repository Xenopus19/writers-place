import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import AppLayout from './AppLayout'
import ArticlePage from './components/ArticlePage'
import ArticlesCatalog from './components/ArticlesCatalog'
import LogIn from './components/Login'
import MainPage from './components/MainPage'
import PublishArticle from './components/PublishArticle'
import ProtectedPage from './components/ProtectedPage'
import SignUp from './components/SignUp'
import UserPage from './components/UserPage'
import { UserProvider } from './components/UserContext'

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <MainPage /> },
      { path: '/articles', element: <ArticlesCatalog /> },
      { path: '/articles/:id', element: <ArticlePage /> },
      { path: '/login', element: <LogIn /> },
      { path: '/signup', element: <SignUp /> },
      {
        path: '/profile',
        element: (
          <ProtectedPage>
            <UserPage />
          </ProtectedPage>
        ),
      },
      {
        path: '/publish',
        element: (
          <ProtectedPage>
            <PublishArticle />
          </ProtectedPage>
        ),
      },
    ],
  },
])

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </QueryClientProvider>
  )
}

export default App
