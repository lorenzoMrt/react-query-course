import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { relativeDate } from "../helpers/relativeDate";
import useScrollToBottomAction from "../helpers/useScrollToBottomAction";
import { useUserData } from "../helpers/useUserData";
import { IssueAssignment } from "./IssueAssignment";
import { IssueHeader } from "./IssueHeader";
import { IssueLabels } from "./IssueLabels";
import { IssueStatus } from "./IssueStatus";
import Loader from "./Loader";

function useIssueData(issueId) {
  return useQuery(["issues", issueId], ({ signal }) => {
    return fetch(`/api/issues/${issueId}`, { signal }).then((res) =>
      res.json()
    );
  });
}

function useIssueComments(issueId) {
  return useInfiniteQuery(
    ["issues", issueId, "comments"],
    ({ signal, pageParam = 1 }) => {
      return fetch(`/api/issues/${issueId}/comments?page=${pageParam}`, {
        signal,
      }).then((res) => res.json());
    },
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.length === 0) return undefined;
        return pages.length + 1;
      },
    }
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

  useScrollToBottomAction(document, commentsQuery.fetchNextPage, 100);
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
                commentsQuery.data?.pages?.map((commentPage) =>
                  commentPage.map((comment) => (
                    <Comment key={comment.id} {...comment} />
                  ))
                )
              )}
              {commentsQuery.isFetchingNextPage && <Loader />}
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
              <IssueLabels
                issueNumber={issueQuery.data.number.toString()}
                labels={issueQuery.data.labels}
              />
            </aside>
          </main>
        </div>
      )}
    </div>
  );
}
