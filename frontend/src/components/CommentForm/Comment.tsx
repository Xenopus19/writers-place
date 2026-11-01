interface CommentProps {
  comment: {
    id: string | number;
    author?: string;
    username?: string;
    createdAt?: string;
    text: string;
  };
}

const Comment = ({ comment }: CommentProps) => {
  return (
    <div className="comment-item">
      <div className="comment-header">
        <span className="comment-author">{comment.author || comment.username || 'User'}</span>
        <span className="comment-date">{comment.createdAt || '2026-01-02'}</span>
      </div>
      <p className="comment-text">{comment.text}</p>
    </div>
  );
};

export default Comment;