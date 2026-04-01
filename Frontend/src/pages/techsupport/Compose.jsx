import { useState } from "react";
import * as XLSX from "xlsx";
import styles from "./styles/Compose.module.css";
import API from "../../API/api";

function Compose() {
  const [numbers, setNumbers] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔒 allow only digits, comma, space, newline
  const cleanNumbers = (value) => {
    return value.replace(/[^\d\n, ]/g, "");
  };

  // 🔥 normalize numbers (remove +, spaces, etc.)
  const normalizeNumber = (num) => {
    return num.replace(/\D/g, ""); // keep only digits
  };

  // 🔥 format numbers list
  const formatNumbers = () => {
    return numbers
      .split(/[\n, ]+/)
      .map(normalizeNumber)
      .filter(Boolean);
  };

  const numberList = formatNumbers();

  // 📁 HANDLE FILE UPLOAD
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // 🔥 Extract all cells as numbers
      const extracted = [];

      json.forEach((row) => {
        row.forEach((cell) => {
          if (!cell) return;

          const num = normalizeNumber(String(cell));

          // simple validation (10+ digits)
          if (num.length >= 10) {
            extracted.push(num);
          }
        });
      });

      // merge into textarea
      setNumbers((prev) => prev + "\n" + extracted.join("\n"));
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSend = async () => {
    if (!numberList.length || !message) {
      return alert("Add numbers + message");
    }

    try {
      setLoading(true);

      await API.post("/compose/send", {
        to: numberList,
        message,
      });

      alert(`Sent to ${numberList.length} users ✅`);
      setNumbers("");
      setMessage("");
    } catch {
      alert("Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* SIDEBAR */}
      <div className={styles.sidebar}>
        <h2>Recipients</h2>

        {/* 📁 FILE UPLOAD */}
        <div className={styles.section}>
          <label>Upload CSV / Excel</label>
          <input
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={handleFileUpload}
          />
        </div>

        <div className={styles.section}>
          <label>Numbers (with country code)</label>
          <textarea
            value={numbers}
            onChange={(e) => setNumbers(cleanNumbers(e.target.value))}
            placeholder={`Example:
91949501021
14155552671`}
          />
        </div>

        <div className={styles.count}>{numberList.length} recipients</div>
      </div>

      {/* CHAT */}
      <div className={styles.chat}>
        <div className={styles.header}>
          <h2>Compose Message</h2>
          <span>{numberList.length} selected</span>
        </div>

        <div className={styles.empty}>
          <p>Start typing your message below</p>
        </div>

        <div className={styles.inputBar}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
          />

          <button onClick={handleSend} disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Compose;
