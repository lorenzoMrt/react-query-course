import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import fetchWithError from "../helpers/fetchWithError";
import { IssueItem } from "./IssueItem";

export default function IssuesList({ labels, status, page, setPage }) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, isFetching, isPreviousData } =
    useQuery(
      ["issues", { labels, status, page }],
      async ({ signal }) => {
        const statusValue = status ? `&status=${status}` : "";
        const labelsValue = labels
          .map((label) => `labels[]=${label}`)
          .join("&");
        const pagination = page ? `&page=${page}` : "";
        const results = await fetchWithError(
          `/api/issues?${labelsValue}${statusValue}${pagination}`,
          {
            signal,
          }
        );
        results.forEach((issue) => {
          queryClient.setQueryData(["issues", issue.number.toString()], issue);
        });
        return results;
      },
      { keepPreviousData: true }
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
        <>
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
          <div className="pagination">
            <button
              onClick={() => {
                page - 1 > 0 && setPage(page - 1);
              }}
              disabled={page === 1}
            >
              Previous
            </button>
            <p>
              Page {page} {isFetching ? "..." : ""}
            </p>
            <button
              disabled={data?.length === 0 || isPreviousData}
              onClick={() => {
                if (data?.length !== 0 && !isPreviousData) setPage(page + 1);
              }}
            >
              Next
            </button>
          </div>
        </>
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
