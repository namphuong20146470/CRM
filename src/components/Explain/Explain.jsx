import { useState } from "react";
import * as pdfjs from "pdfjs-dist";
import "./Explain.css";
import { PDFJS_WORKER_SRC, VERSION_REGEX } from './constants';
import { filterLatestVersions } from './fileUtils';
import { processDocxFile, processExcelFile, processPdfFile } from './fileProcessors';

// Initialize pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC.replace('VERSION', pdfjs.version);

// Main component that handles file reading and display
export default function FileReaderApp() {
  const [total, setTotal] = useState(0);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [skippedFiles, setSkippedFiles] = useState([]);

  const handleFileUpload = async (event) => {
    const uploadedFiles = Array.from(event.target.files);
    setError("");
    setSkippedFiles([]);

    // Filter valid file types
    const validFiles = uploadedFiles.filter(file => {
      const name = file.name.toLowerCase();
      return name.endsWith('.docx') ||
        name.endsWith('.xlsx') ||
        name.endsWith('.xls') ||
        name.endsWith('.pdf');
    });

    if (uploadedFiles.length !== validFiles.length) {
      setError("Lưu ý: Chỉ các file DOCX, XLSX, XLS và PDF được xử lý.");
    }

    if (validFiles.length === 0) {
      setError("Không có file hợp lệ nào được chọn.");
      return;
    }

    // Filter to keep only the latest versions of each file
    const { latestVersions, skipped } = filterLatestVersions(validFiles, VERSION_REGEX);
    setSkippedFiles(skipped);

    if (skipped.length > 0) {
      setError(prev => {
        const msg = "Lưu ý: Một số file cũ hơn bị bỏ qua vì có phiên bản mới hơn.";
        return prev ? `${prev}\n${msg}` : msg;
      });
    }

    // Initialize files with no values yet
    const filesWithNoValues = latestVersions.map(file => ({
      file: { name: file.name },
      value: null,
      originalFile: file
    }));
    setFiles(filesWithNoValues);

    const promises = latestVersions.map((file, index) => {
      const name = file.name.toLowerCase();
      if (name.endsWith('.docx')) {
        return processDocxFile(file, index);
      } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
        return processExcelFile(file, index);
      } else if (name.endsWith('.pdf')) {
        return processPdfFile(file, index);
      }
      return Promise.reject({ file, error: "Unsupported file type", index });
    });

    // Process all files and handle results
    Promise.allSettled(promises).then(results => {
      let newTotal = 0;
      const newFiles = [...filesWithNoValues];

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          const { file, value, index } = result.value;
          if (!isNaN(value)) {
            newTotal += value;

            // Check if value is zero or suspiciously low (less than 100 VND)
            const isSuspiciouslyLow = value > 0 && value < 100;
            const isZero = value === 0;

            newFiles[index] = {
              file: { name: file.name },
              value,
              suspiciouslyLow: isSuspiciouslyLow,
              isZero: isZero, // Add a specific flag for zero values
              originalFile: file
            };
          }
        } else if (result.reason) {
          const { file, index } = result.reason;
          if (file && index !== undefined) {
            setError(prev => prev ? `${prev}\nLỗi khi đọc file: ${file.name}` : `Lỗi khi đọc file: ${file.name}`);
            newFiles[index] = {
              file: { name: file.name },
              error: true,
              originalFile: file
            };
          }
        }
      });

      setTotal(newTotal);
      setFiles(newFiles);
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-blue-800">Tính Tổng Từ File DOCX, Excel và PDF</h1>
      <input
        type="file"
        multiple
        accept=".docx,.xlsx,.xls,.pdf"
        onChange={handleFileUpload}
        className="border p-3 rounded w-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {error && <p className="text-red-500 mt-3 whitespace-pre-line">{error}</p>}
      <p className="mt-4 text-lg font-semibold">
        Tổng số tiền: <span className="text-green-600 font-bold">{total.toLocaleString()} VND</span>
      </p>

      {files.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold text-lg mb-3 text-gray-700">Danh Sách File Đã Xử Lý ({files.length}):</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="py-3 px-4 text-left text-sm font-semibold">STT</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Tên File</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Giá Trị (VND)</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {files.map((fileObj, index) => (
                  <tr
                    key={index}
                    className={`border-b ${
                      fileObj.error || fileObj.isZero || fileObj.suspiciouslyLow
                        ? 'bg-red-50 text-red-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="py-2 px-4 text-sm">{index + 1}</td>
                    <td className="py-2 px-4 text-sm">{fileObj.file?.name || "Unknown file"}</td>
                    <td className="py-2 px-4 text-sm">
                      {fileObj.value !== null ? fileObj.value.toLocaleString() : "N/A"}
                    </td>
                    <td className="py-2 px-4 text-sm">
                      {fileObj.error ? (
                        <span className="font-semibold">Lỗi đọc file</span>
                      ) : fileObj.isZero ? (
                        <span className="font-semibold">0 VND - Không tìm thấy giá trị</span>
                      ) : fileObj.suspiciouslyLow ? (
                        <span className="font-semibold">Giá trị quá nhỏ, có thể sai</span>
                      ) : (
                        <span className="text-green-600 font-semibold">Hợp lệ</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {skippedFiles.length > 0 && (
        <div className="mt-6 p-4 bg-gray-200 rounded-lg shadow-sm">
          <h2 className="font-semibold text-lg mb-3 text-gray-700">
            File Phiên Bản Cũ Bị Bỏ Qua ({skippedFiles.length}):
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-600 text-white">
                  <th className="py-3 px-4 text-left text-sm font-semibold">STT</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Tên File</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Phiên Bản Mới Hơn</th>
                </tr>
              </thead>
              <tbody>
                {skippedFiles.map((file, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 text-sm">{index + 1}</td>
                    <td className="py-2 px-4 text-sm">{file.name}</td>
                    <td className="py-2 px-4 text-sm">{file.newerVersion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}