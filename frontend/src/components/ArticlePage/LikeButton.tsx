import { useNavigate } from 'react-router-dom';
import { cn } from 'cn';
import useArticleLike from '../../hooks/useArticleLike';
import { useUser } from '../UserContext';
import { Button } from '../ui/button';

interface LikeButtonProps {
  articleId: string;
  likesCount: number;
  liked: boolean;
}

const LikeButton = ({ articleId, likesCount, liked }: LikeButtonProps) => {
  const user = useUser();
  const navigate = useNavigate();
  const mutation = useArticleLike(articleId);

  const toggleLike = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    mutation.mutate(!liked);
  };

  return (
    <Button
      type="button"
      variant="outline"
      aria-pressed={liked}
      disabled={mutation.isPending}
      focusableWhenDisabled
      onClick={toggleLike}
      className={cn(
        'h-auto gap-2 rounded-full border-[#dedfd3] px-6 py-3 text-sm font-semibold transition-colors',
        liked
          ? 'border-[#454d3b] bg-[#454d3b] text-white hover:bg-[#363d2e] hover:text-white'
          : 'bg-[#fffefa] text-[#454d3b] hover:border-[#454d3b] hover:bg-[#454d3b] hover:text-white',
      )}
    >
      <span aria-hidden="true">{liked ? '♥' : '♡'}</span>
      {liked ? 'Liked' : 'Like story'} ({likesCount})
    </Button>
  );
};

export default LikeButton;
