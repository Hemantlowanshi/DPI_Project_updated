import React, { useState } from 'react';
import axios from 'axios';
import './Upload.css';
function Upload() {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    await axios.post(`${process.env.REACT_APP_API_URL}/upload`, formData);
   alert("File Processed Successfully");
window.location.reload();
  };

  return (
    <div>
      <h2>DPI File Upload</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])}/>
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

export default Upload;

