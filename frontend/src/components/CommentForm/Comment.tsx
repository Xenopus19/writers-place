import type { Comment as CommentType } from '../../types'

const Comment = ({ comment }: { comment: CommentType }) => {
  return (
    <div style={{ borderBottom: '1px solid #ccc', padding: 4 }}>
      <small>User {comment.userId} | {comment.createdAt}</small>
      <p>{comment.text}</p>
    </div>
  )
}

export default Comment