import { Link, Route, Routes, useMatch } from "react-router-dom";
import FetchingIndicator from "./components/FetchingIndicator";
import AddIssue from "./pages/AddIssue";
import Issue from "./pages/Issue";
import Issues from "./pages/Issues";

function App() {
  const isRootPath = useMatch({ path: "/", end: true });
  return (
    <div className="App">
      {!isRootPath ? (
        <Link to="/">Back to Issues List</Link>
      ) : (
        <span>&nbsp;</span>
      )}
      <h1>Issue Tracker</h1>
      <Routes>
        <Route path="/" element={<Issues />} />
        <Route path="/add" element={<AddIssue />} />
        <Route path="/issue/:number" element={<Issue />} />
      </Routes>
      <FetchingIndicator />
    </div>
  );
}

export default App;
