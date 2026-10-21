import { useUser } from '../UserContext';

const UserPage = () => {
  const user = useUser();
  if(!user) {
    return null;
  }
  return (
    <div>
      <h1>User Page</h1>
      <img src={user.avatarUrl} alt={user.username} />
      <p>Username: {user.username}</p>
      <p>Name: {user.name}</p>
      <p>About: {user.about}</p>
    </div>
  )
}

export default UserPage