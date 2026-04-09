import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import styles from "./styles/Compose.module.css";
import API from "../../API/api";

function Compose() {
  const [numbers, setNumbers] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);

  const fileInputRef = useRef(null);

  const cleanNumbers = (value) => {
    return value.replace(/[^\d\n, ]/g, "");
  };

  const normalizeNumber = (num) => {
    return num.replace(/\D/g, "");
  };

  const formatNumbers = () => {
    return numbers
      .split(/[\n, ]+/)
      .map(normalizeNumber)
      .filter(Boolean);
  };

  const numberList = formatNumbers();

  // 📁 CSV / Excel upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const extracted = [];

      json.forEach((row) => {
        row.forEach((cell) => {
          if (!cell) return;
          const num = normalizeNumber(String(cell));
          if (num.length >= 10) extracted.push(num);
        });
      });

      setNumbers((prev) => prev + "\n" + extracted.join("\n"));
    };

    reader.readAsArrayBuffer(file);
  };

  // 📎 MULTI FILE SELECT
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length > 5) {
      return alert("Max 5 files allowed");
    }

    for (const f of selectedFiles) {
      if (f.size > 100 * 1024 * 1024) {
        return alert(`File too large: ${f.name}`);
      }
    }

    setFiles(selectedFiles);
  };

  const handleSend = async () => {
    if (
      !numberList.length ||
      (!(message && message.trim()) && files.length === 0)
    ) {
      return alert("Add numbers + message or file");
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("to", JSON.stringify(numberList));
      formData.append("message", message);

      files.forEach((file) => {
        formData.append("files", file);
      });

      const res = await API.post("/compose/send", formData);

      const sent = res.data.results.filter((r) => r.status === "sent").length;
      const failed = res.data.results.filter(
        (r) => r.status === "failed",
      ).length;

      alert(`✅ Sent: ${sent} | ❌ Failed: ${failed}`);

      setNumbers("");
      setMessage("");
      setFiles([]);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h2>Recipients</h2>

        <div className={styles.section}>
          <label>Upload CSV / Excel</label>
          <input
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={handleFileUpload}
          />
        </div>

        <div className={styles.section}>
          <label>Numbers</label>
          <textarea
            value={numbers}
            onChange={(e) => setNumbers(cleanNumbers(e.target.value))}
          />
        </div>

        <div className={styles.count}>{numberList.length} recipients</div>
      </div>

      <div className={styles.chat}>
        <div className={styles.header}>
          <h2>Compose Message</h2>
          <span>{numberList.length} selected</span>
        </div>

        <div className={styles.inputBar}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
          />

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
          />

          {files.length > 0 && (
            <div style={{ fontSize: "12px" }}>
              📎 {files.length} files selected
            </div>
          )}

          <button onClick={handleSend} disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Compose;
