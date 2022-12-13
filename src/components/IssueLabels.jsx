import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { GoGear } from "react-icons/go";
import { useLabelsData } from "../helpers/useLabelsData";

export const IssueLabels = ({ labels, issueNumber }) => {
  const labelsQuery = useLabelsData();
  const [menuOpen, setMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const setLabel = useMutation(
    (labelid) => {
      const newLabels = labels.includes(labelid)
        ? labels.filter((label) => label !== labelid)
        : labels.concat(labelid);
      return fetch(`/api/issues/${issueNumber}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ labels: newLabels }),
      }).then((res) => res.json());
    },
    {
      onMutate: (labelId) => {
        const oldLabels = queryClient.getQueryData([
          "issues",
          issueNumber,
        ]).labels;
        const newLabels = labels.includes(labelId)
          ? labels.filter((label) => label !== labelId)
          : labels.concat(labelId);
        queryClient.setQueryData(["issues", issueNumber], (data) => ({
          ...data,
          labels: newLabels,
        }));

        return function rollback() {
          queryClient.setQueryData(["issues", issueNumber], (data) => {
            const rollbackLabels = oldLabels.includes(labelId)
              ? data.labels.concat(labelId)
              : data.labels.filter((label) => label !== labelId);
            return {
              ...data,
              labels: rollbackLabels,
            };
          });
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
  console.log(labelsQuery.data);
  return (
    <div className="issue-options">
      <div>
        <span>Labels</span>
        {labelsQuery.isLoading
          ? null
          : labels.map((label) => {
              const labelObj = labelsQuery.data.find(
                (queryLabel) => queryLabel.id === label
              );
              if (!labelObj) return null;
              return (
                <span key={label} className={`label ${labelObj.color}`}>
                  {labelObj.name}
                </span>
              );
            })}
      </div>
      <GoGear
        onClick={() => !labelsQuery.isLoading && setMenuOpen((open) => !open)}
      />
      {menuOpen && (
        <div className="picker-menu labels">
          {labelsQuery.data.map((label) => {
            const selected = labels.includes(label.id);
            return (
              <div
                key={label.id}
                className={selected ? "selected" : ""}
                onClick={() => setLabel.mutate(label.id)}
              >
                <span
                  className="label-dot"
                  style={{ backgroundColor: label.color }}
                ></span>
                {label.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
