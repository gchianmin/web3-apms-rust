import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { RiDeleteBin6Line, RiDownload2Fill, RiInformationLine} from "react-icons/ri";
import AccordionComponent from "./AccordionComponent";

export default function PaperList({ props, conference, deletePaper }) {
  const [modal, setModal] = useState(false);
//   const [id, setId] = useState(null);
//   const [sc, setSc] = useState(null);
//   const toggle = () => setModal(!modal);
  const [filedata, setFileData] = useState(JSON.parse(props));
  console.log(conference);

  const DownloadButton = (paperId, paperName) => {
    const handleDownload = (event) => {
      event.preventDefault();
      const fileUrl = `/files/${conference.conferenceList}/${conference.conferencePDA}/${paperId}/${paperName}`;
      console.log(fileUrl)
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = paperName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
  
    return (
        <RiDownload2Fill type="button" color="green"
        size={30} onClick={handleDownload}/>
    );
  }

  useEffect(() => {
    setFileData(JSON.parse(props));
  }, [props]);

  const items = filedata

  const data = filedata.map((paper) => {
    return (
      <tr key={paper.paperId}>
        <td>{paper.paperName}</td>
        <td>{paper.version}</td>
        <td>{JSON.stringify(paper.paperAuthors)}</td>
        <td>{paper.dateSubmitted}</td>
        {/* <td>{paper.prevVersion}</td> */}
        <td>{paper.reviewer}</td>
        <td>{paper.paperStatus == 0 ? "Under Review" : "others"}</td>
        <td>
          <RiDeleteBin6Line
            // className="my-auto align-items-centre"
            type="button"
            color="red"
            size={30}
            onClick={()=>deletePaper(paper.paperId)}
          />
          {DownloadButton(paper.paperId, paper.paperName)}
          <RiInformationLine 
            type="button"
            color="blue"
            size={30}
             />
        </td>
        {/* <td>{paper.paperId}</td>
                    <td>{paper.paperId}</td> */}
        {/* <td>{paper.createdOn}</td> */}
        {/* <td>{paper.expiryDate ? paper.expiryDate : "-"}</td>
                    <td>
                        {paper.shortcut ?
                            <a href={"/files/" + info.shortcut} > {info.shortcut} </a> :
                            <Button color="primary" onClick={async () => { await generateShortcut(info.fileId); refreshData() }}>
                                Generate
                            </Button>}
                    </td>
                    <td>
                        <Button outline color="none" ><RiDeleteBin6Line color="red" size={30} onClick={() => { toggle(); setId(info.fileId); setSc(info.shortcut) }} /></Button>
                        <Modal isOpen={modal} toggle={toggle} backdrop={false} >
                            <ModalHeader toggle={toggle}>Delete</ModalHeader>
                            <ModalBody>
                                Delete shortcut ot file?
                            </ModalBody>
                            <ModalFooter>
                                {sc? <Button color="warning" onClick={async () => { toggle(); await expireShortcut(id); refreshData() }}>
                                    Shortcut
                                </Button>:<Button color="warning" disabled={true}>
                                    Shortcut
                                </Button>}
                                <Button color="danger" onClick={async () => { toggle(); await deleteFile(id); refreshData() }}>
                                    File
                                </Button>{' '}
                                <Button color="secondary" onClick={toggle}>
                                    Cancel
                                </Button>
                            </ModalFooter>
                        </Modal> */}
        {/* </td> */}
      </tr>
    );
  });

  const paperData = filedata.map((paper) => {
    return (
      <tr key={paper.paperId}>

        <td><AccordionComponent items={[paper]}/></td>
        {/* <td>{paper.version}</td>
        <td>{JSON.stringify(paper.paperAuthors)}</td>
        <td>{paper.dateSubmitted}</td> */}
        {/* <td>{paper.prevVersion}</td> */}
        {/* <td>{paper.reviewer}</td> */}
        <td>{paper.paperStatus == 0 ? "Under Review" : "others"}</td>
        <td>
          <RiDeleteBin6Line
            // className="my-auto align-items-centre"
            type="button"
            color="red"
            size={30}
            onClick={()=>deletePaper(paper.paperId)}
          />
          {DownloadButton(paper.paperId, paper.paperName)}
          <RiInformationLine 
            type="button"
            color="blue"
            size={30}
             />
        </td>
       
      </tr>
    );
  });
  return (
    <>
    <Table hover responsive={true} >
      <thead>
        <tr>
          <th>Paper Name</th>
          <th>Version</th>
          <th>Authors</th>
          <th>Submitted On</th>
          {/* <th>Previous Version</th> */}
          <th>Reviewers</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>{data}</tbody>
    </Table>


    <div>
        <h2>accordion display</h2>
      <AccordionComponent items={items} />
    </div>


    </>
     
  );
}
