import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export default function AddIssue() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const addIssue = useMutation(
    (issueBody) =>
      fetch("/api/issues", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(issueBody),
      }).then((res) => res.json()),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["issues"], { exact: true });
        queryClient.setQueryData(["issues", data.number.toString()], data);
        navigate(`/issue/${data.number}`);
      },
    }
  );
  return (
    <div className="add-issue">
      <h2>Add Issue</h2>
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          if (addIssue.isLoading) return;
          addIssue.mutate({
            comment: ev.target.comment.value,
            title: ev.target.title.value,
          });
        }}
      >
        <label htmlFor="title">Title</label>
        <input type="text" id="title" placeholder="Title" name="title" />
        <label htmlFor="comment">Comment</label>
        <textarea placeholder="Comment" id="Comment" name="comment" />
        <button type="submit" disabled={addIssue.isLoading}>
          {addIssue.isLoading ? "Adding issue..." : "Add issue"}
        </button>
      </form>
    </div>
  );
}
