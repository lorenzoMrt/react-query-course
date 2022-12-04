import { useQuery } from "react-query";
import { IssueItem } from "./IssueItem";

export default function IssuesList({ labels, status }) {
  const { data, isLoading } = useQuery(["issues", { labels, status }], () => {
    const statusValue = status ? `&status=${status}` : "";
    const labelsValue = labels.map((label) => `labels[]=${label}`).join("&");
    return fetch(`/api/issues?${labelsValue}${statusValue}`).then((res) =>
      res.json()
    );
  });
  return (
    <div>
      <h2>Issues List</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul className="issues-list">
          {data.map((issue) => (
            <IssueItem
              key={issue.id}
              title={issue.title}
              number={issue.number}
              assignee={issue.assignee}
              commentCount={issue.comments.length}
              createdBy={issue.createdBy}
              createdDate={issue.createdDate}
              labels={issue.labels}
              issue={issue.status}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
