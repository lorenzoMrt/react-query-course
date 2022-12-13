import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { StatusSelect } from "../pages/StatusSelect";

export const IssueStatus = ({ status, issueNumber }) => {
  const queryClient = useQueryClient();
  const setStatus = useMutation(
    () => {
      fetch(`/api/issues/${issueNumber}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(status),
      }).then((res) => res.json());
    },
    {
      onMutate: (status) => {
        const ultStatus = queryClient.getQueryData([
          "issues",
          issueNumber,
        ]).status;
        queryClient.setQueryData(["issues", issueNumber], (data) => ({
          ...data,
          status,
        }));

        return function rollback() {
          queryClient.setQueryData(["issues", issueNumber], (data) => ({
            ...data,
            ultStatus,
          }));
        };
      },
      onError: (error, variables, rollback) => {
        rollback();
      },
      onSettled: () => {
        queryClient.invalidateQueries(["issues", issueNumber], { exact: true });
      },
    }
  );
  return (
    <div className="issue-options">
      <div>
        <span>Status</span>
        <StatusSelect
          noEmptyOption
          value={status}
          onChange={(ev) => {
            setStatus.mutate(ev.target.value);
          }}
        />
      </div>
    </div>
  );
};
