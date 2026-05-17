import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaFileAlt,
  FaLayerGroup,
  FaProjectDiagram,
  FaDatabase,
  FaHeartbeat,
  FaListAlt
} from "react-icons/fa";

import "./Dashboard.css";

function Dashboard() {
  const [packets, setPackets] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/packets`
      );
      setPackets(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const tcpCount = packets.filter(
    (p) => p.protocol === "TCP"
  ).length;

  const udpCount = packets.filter(
    (p) => p.protocol === "UDP"
  ).length;

  const icmpCount = packets.filter(
    (p) => p.protocol === "ICMP"
  ).length;

  const uploadedFile =
    packets.length > 0
      ? packets[0].filename
      : "No File";

  const getServiceName = (port) => {
    switch (port) {
      case 80: return "HTTP";
      case 443: return "HTTPS";
      case 21: return "FTP";
      case 22: return "SSH";
      case 25: return "SMTP";
      case 53: return "DNS";
      default: return "-";
    }
  };

  return (
    <div className="dashboard">

      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Packet Analysis Dashboard</h1>
          <p>
            Deep Packet Inspection &
            Real-time Analysis
          </p>
        </div>

        <button
          className="home-btn"
          onClick={() => navigate("/")}
        >
          <FaHome /> Home
        </button>
      </div>

      {/* Cards */}
      <div className="stats-container">

        <div className="stat-card blue">
          <FaFileAlt className="card-icon" />
          <h3>Uploaded File</h3>
          <p>{uploadedFile}</p>
          <span>PCAP File</span>
        </div>

        <div className="stat-card sky">
          <FaLayerGroup className="card-icon" />
          <h3>Total Packets</h3>
          <p>{packets.length}</p>
          <span>Captured Packets</span>
        </div>

        <div className="stat-card green">
          <FaProjectDiagram className="card-icon" />
          <h3>TCP Packets</h3>
          <p>{tcpCount}</p>
          <span>Transmission Control</span>
        </div>

        <div className="stat-card purple">
          <FaDatabase className="card-icon" />
          <h3>UDP Packets</h3>
          <p>{udpCount}</p>
          <span>User Datagram</span>
        </div>

        <div className="stat-card red">
          <FaHeartbeat className="card-icon" />
          <h3>ICMP Packets</h3>
          <p>{icmpCount}</p>
          <span>Internet Control</span>
        </div>

      </div>

      {/* Table */}
      <div className="table-container">

        <div className="table-title">
          <FaListAlt /> Packet Details
        </div>

        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Protocol</th>
              <th>Source IP</th>
              <th>Destination IP</th>
              <th>Src Port</th>
              <th>Dest Port</th>
              <th>Service</th>
              <th>Length</th>
              <th>Suspicious</th>
            </tr>
          </thead>

          <tbody>
            {packets.map((p, index) => (
              <tr key={p._id}>
                <td>{index + 1}</td>
                <td>{p.protocol}</td>
                <td>{p.srcIP}</td>
                <td>{p.destIP}</td>
                <td>{p.srcPort || "-"}</td>
                <td>{p.destPort || "-"}</td>
                <td>
                  {getServiceName(
                    p.destPort
                  )}
                </td>
                <td>{p.length}</td>
                <td>
                  <span
                    className={
                      p.suspicious
                        ? "danger"
                        : "safe"
                    }
                  >
                    {p.suspicious
                      ? "YES"
                      : "NO"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

      <div className="dashboard-footer">
        © 2025 DPI Analyzer
      </div>

    </div>
  );
}

export default Dashboard;