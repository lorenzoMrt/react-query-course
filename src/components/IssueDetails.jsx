import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { relativeDate } from "../helpers/relativeDate";
import { useUserData } from "../helpers/useUserData";
import { IssueAssignment } from "./IssueAssignment";
import { IssueHeader } from "./IssueHeader";
import { IssueStatus } from "./IssueStatus";

function useIssueData(issueId) {
  return useQuery(["issues", issueId], ({ signal }) => {
    return fetch(`/api/issues/${issueId}`, { signal }).then((res) =>
      res.json()
    );
  });
}

function useIssueComments(issueId) {
  return useQuery(["issues", issueId, "comments"], ({ signal }) =>
    fetch(`/api/issues/${issueId}/comments`, { signal }).then((res) =>
      res.json()
    )
  );
}

function Comment({ comment, createdBy, createdDate }) {
  const userQuery = useUserData(createdBy);
  if (userQuery.isLoading)
    return (
      <div className="comment">
        <>
          <div className="comment-header">Loading...</div>
        </>
      </div>
    );
  return (
    <div className="comment">
      <img src={userQuery.data.profilePictureUrl} alt="Commenter avatar"></img>
      <div className="comment-header">
        <span>{userQuery.data.name}</span> commented{" "}
        <span>{relativeDate(createdDate)}</span>
      </div>
      <div className="comment-body">{comment}</div>
    </div>
  );
}

export default function IssueDetails() {
  const { number } = useParams();
  const issueQuery = useIssueData(number);
  const commentsQuery = useIssueComments(number);
  return (
    <div className="issue-details">
      {issueQuery.isLoading ? (
        <p>Loading issue...</p>
      ) : (
        <div>
          <IssueHeader {...issueQuery.data} />

          <main>
            <section>
              {commentsQuery.isLoading ? (
                <p>Loading...</p>
              ) : (
                commentsQuery.data?.map((comment) => (
                  <Comment key={comment.id} {...comment} />
                ))
              )}
            </section>
            <aside>
              <IssueStatus
                status={issueQuery.data.status}
                issueNumber={issueQuery.data.number.toString()}
              />
              <IssueAssignment
                assignee={issueQuery.data.assignee}
                issueNumber={issueQuery.data.number.toString()}
              />
            </aside>
          </main>
        </div>
      )}
    </div>
  );
}
