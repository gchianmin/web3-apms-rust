import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import {
  RiDeleteBin6Line,
  RiDownload2Fill,
  RiInformationLine,
  RiArrowDownSLine,
  RiTeamLine,
} from "react-icons/ri";

export default function AccordionTable({
  data,
  props,
  conference,
  deletePaper,
}) {
  //   const [activeIndex, setActiveIndex] = useState(null);
  const [filedata, setFileData] = useState(JSON.parse(props));
  const [activeIndexes, setActiveIndexes] = useState([]);

  function toggleActive(index) {
    if (activeIndexes.includes(index)) {
      setActiveIndexes(activeIndexes.filter((i) => i !== index));
    } else {
      setActiveIndexes([...activeIndexes, index]);
    }
  }
//   console.log(data);

  //   function toggleActive(index) {
  //     setActiveIndex(activeIndex === index ? null : index);
  //   }
  const getStatus = (status) => {
    const statusMap = {
      0: "Submitted",
      1: "Under Review",
      2: "Accepted",
      3: "Accepted with Minor Revision",
      4: "Accepted with Major Revision",
    };
  
    return statusMap[status] || "Unknown status";
  };


  useEffect(() => {
    setFileData(JSON.parse(props));
  }, [props]);

  const DownloadButton = (paperId, paperName) => {
    const handleDownload = (event) => {
      event.preventDefault();
      const fileUrl = `/files/${conference.conferenceList}/${conference.conferencePDA}/${paperId}/${paperName}`;
      console.log(fileUrl);
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = paperName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    return (
      <RiDownload2Fill
        type="button"
        color="green"
        size={30}
        onClick={handleDownload}
        className="mr-3"
      />
    );
  };

  return (
    <>
    {filedata.length>0? <Table responsive={true} borderless >
        <thead >
          <tr>
            <th>Paper</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filedata.map((item, index) => (
            <React.Fragment key={item.paperId}>
              <tr
                onClick={() => toggleActive(index)}
                className={`accordion-item ${
                  activeIndexes.includes(index) ? "active" : ""
                }`}
              >
                <td className="accordion-title">
                  {" "}
                  <RiArrowDownSLine className="accordion-arrow" size={28} />
                  {item.paperName}
                </td>

                <td className="accordion-title">{getStatus(item.paperStatus)}</td>

                <td className="accordion-title ">
                  <RiDeleteBin6Line
                    type="button"
                    color="red"
                    size={30}
                    onClick={() => deletePaper(item.paperId)}
                    className="mr-3"
                  />

                  {DownloadButton(item.paperId, item.paperName)}

                  <RiTeamLine type="button" size={30} className="mr-3"/>

                  <RiInformationLine type="button" color="blue" size={30} className="mr-0"/>

                  
                </td>

              </tr>
              {activeIndexes.includes(index) && (
                <>
                <tr >
                <td colSpan="3" className="text-monospace accordion-content">Version: {item.version}</td>
                </tr>
                <tr >
                <td colSpan="3" className="text-monospace">Date Submitted: {item.dateSubmitted}</td>
                </tr>
                <tr>
                <td colSpan="3" className="text-monospace">Authors: {item.paperAuthors.map(author => (
                <p>{author.authorName} [{author.authorEmail}]</p>))}</td>
                </tr>

                <tr>
                <td colSpan="3" className="text-monospace">Reviewers: {item.reviewer.length > 0 ? <p>Have</p> : <p>No reviewers assigned yet</p>}</td>
                </tr>
                </>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </Table> : <p className="text-muted font-italic">No papers submitted so far...</p>}
      
    </>
  );
}
