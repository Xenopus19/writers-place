import { placeholderUser } from '../../placeholders'

const UserPage = () => {
  const user = placeholderUser
  return (
    <div>
      <h1>User Page</h1>
      <img src={user.avatarUrl} alt={user.username} />
      <p>ID: {user.id}</p>
      <p>Username: {user.username}</p>
      <p>Name: {user.name}</p>
      <p>About: {user.about}</p>
    </div>
  )
}

export default UserPage