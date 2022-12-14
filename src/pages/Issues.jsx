import { useState } from "react";
import { Link } from "react-router-dom";
import IssuesList from "../components/IssuesList";
import LabelList from "../components/LabelList";
import { StatusSelect } from "./StatusSelect";

export default function Issues() {
  const [labels, setLabels] = useState([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  return (
    <div>
      <main>
        <section>
          <h1>Issues</h1>
          <IssuesList
            labels={labels}
            status={status}
            page={page}
            setPage={setPage}
          />
        </section>
        <aside>
          <LabelList
            selected={labels}
            toggle={(label) => {
              setLabels((currentLabels) =>
                currentLabels.includes(label)
                  ? currentLabels.filter(
                      (currentLabel) => currentLabel !== label
                    )
                  : currentLabels.concat(label)
              );
              setPage(1);
            }}
          />
          <h3>Status</h3>
          <StatusSelect
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          />
          <hr />
          <Link className="button" to="/add">
            Add Issue
          </Link>
        </aside>
      </main>
    </div>
  );
}
