import { Link } from 'react-router-dom'

const MainPage = () => {
  return (
    <div>
      <h1>Writers Place</h1>
      <nav>
        <ul>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/articles">Articles</Link></li>
          <li><Link to="/signup">Sign up</Link></li>
          <li><Link to="/publish">Publish</Link></li>
        </ul>
      </nav>
    </div>
  )
}

export default MainPage