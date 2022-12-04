import { useLabelsData } from "../helpers/useLabelsData";

export function Label({ label }) {
  const { data, isLoading } = useLabelsData();
  if (isLoading) {
    return null;
  }
  const labelObj = data.find((l) => l.id === label);
  if (!labelObj) return null;
  return <span className={`label ${labelObj.color}`}>{labelObj.name}</span>;
}
