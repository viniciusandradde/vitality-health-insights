import { useRecordContext, TextField } from "react-admin";

interface JsonFieldProps {
  source: string;
  label?: string;
}

export const JsonField = ({ source, label }: JsonFieldProps) => {
  const record = useRecordContext();
  if (!record) return null;

  const value = record[source];
  if (value == null) return null;

  let jsonString: string;
  try {
    jsonString =
      typeof value === "string" ? JSON.stringify(JSON.parse(value), null, 2) : JSON.stringify(value, null, 2);
  } catch {
    jsonString = String(value);
  }

  return (
    <div style={{ marginBottom: "1rem" }}>
      {label && (
        <div style={{ marginBottom: "0.5rem", fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.6)" }}>
          {label}
        </div>
      )}
      <pre
        style={{
          backgroundColor: "#f5f5f5",
          padding: "16px",
          borderRadius: "4px",
          overflow: "auto",
          fontFamily: "monospace",
          fontSize: "0.875rem",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          margin: 0,
          border: "1px solid #e0e0e0",
        }}
      >
        {jsonString}
      </pre>
    </div>
  );
};
