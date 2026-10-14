import { Button } from "../ui/button"


const CommentForm = () => {
  return (
    <form>
      <textarea placeholder="Write a comment" />
      <br />
      <Button type="button">Send</Button>
    </form>
  )
}

export default CommentForm
