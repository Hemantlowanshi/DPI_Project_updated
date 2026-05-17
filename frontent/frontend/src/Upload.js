import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUpload,
  FaLock,
  FaShieldAlt,
  FaChartBar,
  FaExclamationTriangle,
  FaTachometerAlt,
  FaGlobe,
  FaBullseye,
  FaClock
} from "react-icons/fa";

import "./Upload.css";

function Upload() {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) {
      alert("Choose file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/upload`,
        formData
      );

      alert("File Processed Successfully");
      navigate("/dashboard");

    } catch (error) {
      alert("Upload Failed");
      console.log(error);
    }
  };

  return (
    <div className="upload-page">

      <div className="hero">
        <FaShieldAlt className="shield-icon" />

        <h1>DPI Network Analyzer</h1>
        <p>Analyze Network Traffic & Detect Suspicious Packets</p>

        <div className="file-box">
          <input
            type="file"
            id="fileUpload"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <label htmlFor="fileUpload">
            {file ? file.name : "Choose File"}
          </label>
        </div>

        <button className="upload-btn" onClick={handleUpload}>
          <FaUpload /> Upload & Analyze
        </button>

        <div className="secure-text">
          <FaLock /> Your files are secure and only used for analysis
        </div>
      </div>

      {/* Cards */}
      <div className="features">

        <div className="card">
          <FaGlobe />
          <h3>Protocol Detection</h3>
          <p>Detect TCP, UDP, ICMP and more protocols</p>
        </div>

        <div className="card">
          <FaChartBar />
          <h3>Traffic Analysis</h3>
          <p>Deep packet inspection and traffic insights</p>
        </div>

        <div className="card">
          <FaExclamationTriangle />
          <h3>Threat Detection</h3>
          <p>Identify suspicious packets and threats</p>
        </div>

        <div className="card">
          <FaTachometerAlt />
          <h3>Real-time Dashboard</h3>
          <p>Live analysis dashboard view</p>
        </div>

      </div>

      {/* Bottom Stats */}
      <div className="stats">

        <div>
          <FaGlobe />
          <h4>Protocols Supported</h4>
          <p>TCP | UDP | ICMP</p>
        </div>

        <div>
          <FaBullseye />
          <h4>Detection Accuracy</h4>
          <p>High</p>
        </div>

        <div>
          <FaClock />
          <h4>Analysis Speed</h4>
          <p>Real-Time</p>
        </div>

      </div>

      <footer>
        © 2025 DPI Network Analyzer. All rights reserved
      </footer>

    </div>
  );
}

export default Upload;