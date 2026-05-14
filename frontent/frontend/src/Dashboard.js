// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import './Upload.css';

// function Dashboard() {

//   const [packets, setPackets] = useState([]);

//   const fetchData = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/packets");
//       console.log("Fetched Data:", res.data);
//       setPackets(res.data);
//     } catch (error) {
//       console.error("Fetch Error:", error);
//     }
//   };

//   useEffect(() => {

//     fetchData();

//     const interval = setInterval(() => {
//       fetchData();
//     }, 2000);

//     return () => clearInterval(interval);

//   }, []);

//   return (

//     <div style={{ padding: "20px" }}>

//       <h2>DPI Packet Dashboard</h2>

//       {packets.length === 0 ? (

//         <p>No Packet Data Found</p>

//       ) : (

//         <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>

//           <thead style={{ background: "#eee" }}>
//             <tr>
//               <th>Protocol</th>
//               <th>Source IP</th>
//               <th>Destination IP</th>
//               <th>Src Port</th>
//               <th>Dest Port</th>
//               <th>Length</th>
//               <th>Suspicious</th>
//             </tr>
//           </thead>

//           <tbody>

//             {packets.map((p) => (
//               <tr key={p._id}>
//                 <td>{p.protocol}</td>
//                 <td>{p.srcIP}</td>
//                 <td>{p.destIP}</td>
//                 <td>{p.srcPort || "-"}</td>
//                 <td>{p.destPort || "-"}</td>
//                 <td>{p.length}</td>
//                 <td>
//                   {p.suspicious ?
//                     <span style={{ color: "red", fontWeight: "bold" }}>🚨 YES</span>
//                     : "NO"}
//                 </td>
//               </tr>
//             ))}

//           </tbody>

//         </table>

//       )}

//     </div>
//   );
// }

// export default Dashboard;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Upload.css';

function Dashboard() {

  const [packets, setPackets] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/packets`);
      setPackets(res.data);
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  useEffect(() => {

    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 2000);

    return () => clearInterval(interval);

  }, []);

  // Protocol Counts
  const tcpCount = packets.filter(p => p.protocol === "TCP").length;
  const udpCount = packets.filter(p => p.protocol === "UDP").length;
  const icmpCount = packets.filter(p => p.protocol === "ICMP").length;

  // File Name
  const uploadedFile = packets.length > 0 ? packets[0].filename : "No File";

  // Port Service Name Function
  const getServiceName = (port) => {
    switch (port) {
      case 80: return "HTTP";
      case 443: return "HTTPS";
      case 21: return "FTP";
      case 22: return "SSH";
      case 25: return "SMTP";
      case 53: return "DNS";
      case 19: return "CHARGEN";
      case 23: return "TELNET";
      default: return "-";
    }
  };

  return (

    <div style={{ padding: " 1px 20px" }}>

<h2 className="dashboard-title">DPI Packet Dashboard</h2>

     
<div className="summary-cards">
    <div className="card"><strong>Total Packets:</strong> {packets.length}</div>
    <div className="card"><strong>TCP:</strong> {tcpCount}</div>
    <div className="card"><strong>UDP:</strong> {udpCount}</div>
    <div className="card"><strong>ICMP:</strong> {icmpCount}</div>
    <div className="card"><strong>Uploaded File:</strong> {uploadedFile}</div>
</div>

    

      {packets.length === 0 ? (

        <p>No Packet Data Found</p>

      ) : (

        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>

          <thead style={{ background: "#eee" }}>
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
                <td>{getServiceName(p.destPort)}</td>
                <td>{p.length}</td>
                <td>
                  {p.suspicious ?
                    <span style={{ color: "red", fontWeight: "bold" }}>🚨 YES</span>
                    : "NO"}
                </td>
              </tr>
            ))}

          </tbody>

        </table>

      )}

    </div>
  );
}

export default Dashboard;