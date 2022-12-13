import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import fetchWithError from "../helpers/fetchWithError";
import { IssueItem } from "./IssueItem";

export default function IssuesList({ labels, status }) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery(
    ["issues", { labels, status }],
    async ({ signal }) => {
      const statusValue = status ? `&status=${status}` : "";
      const labelsValue = labels.map((label) => `labels[]=${label}`).join("&");
      const results = await fetchWithError(
        `/api/issues?${labelsValue}${statusValue}`,
        {
          signal,
        }
      );
      results.forEach((issue) => {
        queryClient.setQueryData(["issues", issue.number.toString()], issue);
      });
      return results;
    }
  );

  const [searchValue, setSearchValue] = useState("");

  const searchQuery = useQuery(
    ["issues", "search", searchValue],
    ({ signal }) =>
      fetch(`/api/search/issues?q=${searchValue}`, { signal }).then((res) =>
        res.json()
      ),
    {
      enabled: searchValue.length > 0,
    }
  );

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSearchValue(event.target.elements.search.value);
        }}
      >
        <label htmlFor="search"> Search Issues</label>
        <input
          type="search"
          placeholder="search"
          name="search"
          id="search"
          onChange={(ev) => {
            if (ev.target.value.length === 0) {
              setSearchValue("");
            }
          }}
        ></input>
      </form>
      <h2>Issues List</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : isError ? (
        <p>{error.message}</p>
      ) : searchQuery.fetchStatus === "idle" &&
        searchQuery.isLoading === true ? (
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
      ) : (
        <>
          <h2>Search results</h2>
          {searchQuery.isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <p>{searchQuery.data.count} Results</p>
              <ul className="issues-list">
                {searchQuery.data.items.map((issue) => (
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
            </>
          )}
        </>
      )}
    </div>
  );
}
