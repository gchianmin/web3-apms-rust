import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  UncontrolledCollapse,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Col,
  Input,
} from "reactstrap";
import {
  RiDeleteBin6Line,
  RiDownload2Fill,
  RiInformationLine,
  RiArrowDownSLine,
  RiTeamLine,
} from "react-icons/ri";
import AssignReviewerModal from "./AssignReviewerModal";
import { useRouter } from "next/router";
import { connectWallet } from "../Common/WalletConnection";
import { deletePaper } from "../Common/AuthorInstructions";
import { getPaperStatus } from "../Common/GetPapers";
import { getConference } from "../Common/GetConferences";
import DownloadButton from "./DownloadButton";
import Expander from "./Expander";

export default function AccordionTable({
  props,
  conference,
  walletAddress,
  action,
}) {
  const router = useRouter();
  const [filedata, setFileData] = useState(JSON.parse(props));
  const [activeIndexes, setActiveIndexes] = useState([]);
  const [tpc, setTpc] = useState([]);
  console.log(filedata);
  function toggleActive(index) {
    if (activeIndexes.includes(index)) {
      setActiveIndexes(activeIndexes.filter((i) => i !== index));
    } else {
      setActiveIndexes([...activeIndexes, index]);
    }
  }

  useEffect(() => {
    setFileData(JSON.parse(props));
    if (action == "organiserViewAllPapersSubmitted") {
      getTpcList();
    }
  }, [props]);

  const getTpcList = async () => {
    try {
      const getConf = await getConference(
        conference.conferencePDA,
        conference.conferenceId
      );
      setTpc(getConf.technicalProgramsCommittees);
    } catch (error) {
      console.log("Error getting tpc: ", error);
    }
  };

  const sendProps = (href, conferencePDA, conferenceId, conferenceName) => {
    router.push({
      pathname: href,
      query: {
        conferencePDA,
        conferenceId,
        conferenceName,
      },
    });
  };
  const navigateToConference = (href, conferenceId, router) => {
    router.push({
      pathname: href,
      query: {
        conferenceId,
      },
    });
  };
  const tableToDisplay = () => {
    if (action == "organiserViewAllPapersSubmitted") {
      return (
        <Table responsive={true} borderless>
          <thead>
            <tr>
              <th> </th>
              <th>ID</th>
              <th>Paper</th>
              <th>Abstract</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filedata.map((item, index) => (
              <React.Fragment key={item.paperId}>
                <tr
                  className={`accordion-item ${
                    activeIndexes.includes(index) ? "active" : ""
                  }`}
                >
                  <td
                    className="accordion-title align-middle pr-0 mr-0"
                    onClick={() => toggleActive(index)}
                  >
                    <RiArrowDownSLine className="accordion-arrow " size={25} />
                  </td>

                  <td
                    className="accordion-title align-middle"
                    onClick={() => toggleActive(index)}
                  >
                    {item.paperId}
                  </td>

                  <td
                    className="accordion-title align-middle"
                    onClick={() => toggleActive(index)}
                  >
                    {item.paperTitle}
                  </td>
                  <td
                    className="accordion-title align-middle"
                    onClick={() => toggleActive(index)}
                  >
                    <small>{item.paperAbstract}</small>
                  </td>

                  <td
                    className="accordion-title align-middle"
                    onClick={() => toggleActive(index)}
                  >
                    {getPaperStatus(item.paperStatus)}
                  </td>

                  <td className="accordion-title align-middle">
                    <Button
                      className="btn-danger"
                      type="button"
                      onClick={() =>
                        deletePaper(
                          conference.conferencePDA,
                          conference.conferenceId,
                          item.paperHash
                        )
                      }
                    >
                      DELETE SUBMISSION
                    </Button>
                    {/* <RiDeleteBin6Line
                        type="button"
                        color="red"
                        size={30}
                        onClick={() =>
                          deletePaper(item.paperHash, item.paperName)
                        }
                        className="mr-3"
                      /> */}

                    {/* {DownloadButton(item.paperHash, item.paperName)} */}
                    <AssignReviewerModal
                      walletAddress={walletAddress}
                      connectWallet={connectWallet}
                      tpc={tpc}
                      conference={conference}
                      paperId={item.paperHash}
                    />
                    <Button
                      className="btn-primary"
                      type="button"
                      onClick={() =>
                        sendProps(
                          `/papers/${item.paperHash}`,
                          conference.conferencePDA,
                          conference.conferenceId,
                          conference.conferenceName
                        )
                      }
                    >
                      View more
                    </Button>
                    {/* <RiInformationLine
                        type="button"
                        color="blue"
                        size={30}
                        className="mr-0"
                        onClick={() =>
                          sendProps(`/papers/${item.paperHash}`, conference.conferenceList, conference.conferencePDA, conference.conferenceName)
                        }
                      /> */}
                  </td>
                </tr>
                {activeIndexes.includes(index) && (
                  <>
                    <tr>
                      <td
                        colSpan="5"
                        className="text-monospace accordion-content"
                      >
                        Paper Name: {item.paperName}{" "}
                        <DownloadButton
                          conference={conference}
                          paperHash={item.paperHash}
                          paperName={item.paperName}
                        />
                      </td>
                    </tr>

                    <tr>
                      <td
                        colSpan="5"
                        className="text-monospace accordion-content"
                      >
                        Abstract: {item.paperAbstract}
                      </td>
                    </tr>

                    <tr>
                      <td
                        colSpan="5"
                        className="text-monospace accordion-content"
                      >
                        Version: {item.version}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="5" className="text-monospace">
                        Date Submitted: {item.dateSubmitted}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="5" className="text-monospace">
                        Authors:{" "}
                        {item.paperAuthors.map((author) => (
                          <p key={author.authorEmail}>
                            {author.authorName} - {author.authorEmail} [
                            {author.authorAffiliation}]
                          </p>
                        ))}
                      </td>
                    </tr>

                    <tr>
                      <td colSpan="5" className="text-monospace">
                        Reviewers:{" "}
                        {item.reviewer.length > 0 ? (
                          item.reviewer.map((name) => (
                            <>
                              <p>{name.tpcName}</p>
                            </>
                          ))
                        ) : (
                          <p>No reviewers assigned yet</p>
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td colSpan="5" className="text-monospace">
                        Paper Chair:{" "}
                        {item.paperChair.tpcName.length === 0 ? (
                          <p>No chair assigned yet</p>
                        ) : (
                          <p>{item.paperChair.tpcName}</p>
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td colSpan="6" className="text-monospace">
                        <Expander
                          props={conference}
                          paperHash={item.paperHash}
                        />
                      </td>
                    </tr>
                  </>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      );
    } else if (action == "reviewerViewPaperPendingReviewed") {
      return (
        <Table responsive={true} borderless>
          <thead>
            <tr>
              <th> </th>
              <th>Conference</th>
              <th>Paper Title</th>
              <th>Abstract</th>
              {/* <th>Status</th> */}
              {/* <th>Action</th> */}
            </tr>
          </thead>
          <tbody>
            {filedata.map((item, index) => (
              <React.Fragment key={item.paperId}>
                <tr
                  className={`accordion-item ${
                    activeIndexes.includes(index) ? "active" : ""
                  }`}
                >
                  <td
                    className="accordion-title align-middle pr-0 mr-0"
                    onClick={() => toggleActive(index)}
                  >
                    <RiArrowDownSLine className="accordion-arrow " size={25} />
                  </td>

                  <td
                    className="accordion-title align-middle"
                    // onClick={() => toggleActive(index)}
                  >
                    <a
                      className="link-info"
                      href={`/conferences/${item.pk.toString()}?conferenceId=${item.conferenceId.toString()}`}
                      //   onClick={() =>
                      //     navigateToConference(
                      //       `/conferences/${item.pk.toString()}`,
                      //       item.conferenceId.toString(),
                      //       router
                      //     )
                      //   }
                      //   type="button"
                    >
                      {item.conferenceName}{" "}
                    </a>
                    {/* {item.conferenceName} */}
                  </td>

                  <td
                    className="accordion-title align-middle"
                    onClick={() => toggleActive(index)}
                  >
                    {item.paperTitle}
                  </td>
                  <td
                    className="accordion-title align-middle"
                    onClick={() => toggleActive(index)}
                  >
                    <small>{item.paperAbstract}</small>
                  </td>

                  {/* <td
                    className="accordion-title align-middle"
                    onClick={() => toggleActive(index)}
                  >
                    {getPaperStatus(item.paperStatus)}
                  </td> */}

                  <td className="accordion-title align-middle">
                    {/* <Button
                      className="btn-danger"
                      type="button"
                      onClick={() =>
                        deletePaper(
                          conference.conferencePDA,
                          conference.conferenceId,
                          item.paperHash
                        )
                      }
                    >
                      DELETE SUBMISSION
                    </Button> */}
                    {/* <RiDeleteBin6Line
                          type="button"
                          color="red"
                          size={30}
                          onClick={() =>
                            deletePaper(item.paperHash, item.paperName)
                          }
                          className="mr-3"
                        /> */}

                    {/* {DownloadButton(item.paperHash, item.paperName)} */}
                    {/* <AssignReviewerModal
                      walletAddress={walletAddress}
                      connectWallet={connectWallet}
                      tpc={tpc}
                      conference={conference}
                      paperId={item.paperHash}
                    /> */}
                    {/* <Button
                      className="btn-primary"
                      type="button"
                      onClick={() =>
                        sendProps(
                          `/papers/${item.paperHash}`,
                          item.pk,
                          item.conferenceId,
                          item.conferenceName
                        )
                      }
                    >
                      View more
                    </Button> */}
                    {/* <RiInformationLine
                          type="button"
                          color="blue"
                          size={30}
                          className="mr-0"
                          onClick={() =>
                            sendProps(`/papers/${item.paperHash}`, conference.conferenceList, conference.conferencePDA, conference.conferenceName)
                          }
                        /> */}
                  </td>
                </tr>
                {activeIndexes.includes(index) && (
                  <>
                    <tr>
                      <td
                        colSpan="5"
                        className="text-monospace accordion-content"
                      >
                        Paper Name: {item.paperName}{" "}
                        <DownloadButton
                          conference={conference}
                          paperHash={item.paperHash}
                          paperName={item.paperName}
                        />
                      </td>
                    </tr>

                    <tr>
                      <td
                        colSpan="5"
                        className="text-monospace accordion-content"
                      >
                        Abstract: {item.paperAbstract}
                      </td>
                    </tr>

                    <tr>
                      <td
                        colSpan="5"
                        className="text-monospace accordion-content"
                      >
                        Version: {item.version}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="5" className="text-monospace">
                        Date Submitted: {item.dateSubmitted}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="5" className="text-monospace">
                        Authors:{" "}
                        {item.paperAuthors.map((author) => (
                          <p key={author.authorEmail}>
                            {author.authorName} - {author.authorEmail} [
                            {author.authorAffiliation}]
                          </p>
                        ))}
                      </td>
                    </tr>

                    {/* <tr>
                      <td colSpan="5" className="text-monospace">
                        Reviewers:{" "}
                        {item.reviewer.length > 0 ? (
                          item.reviewer.map((name) => (
                            <>
                              <p>{name.tpcName}</p>
                            </>
                          ))
                        ) : (
                          <p>No reviewers assigned yet</p>
                        )}
                      </td>
                    </tr> */}

                    {/* <tr>
                      <td colSpan="5" className="text-monospace">
                        Paper Chair:{" "}
                        {item.paperChair.tpcName.length === 0 ? (
                          <p>No chair assigned yet</p>
                        ) : (
                          <p>{item.paperChair.tpcName}</p>
                        )}
                      </td>
                    </tr> */}

                    <tr>
                      <td colSpan="6" className="text-monospace">
                        <Expander
                          props={conference}
                          paperHash={item.paperHash}
                        />
                      </td>
                    </tr>
                  </>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      );
    }
  };

  return (
    <>
      {tableToDisplay()}
      {/* {filedata.length > 0 ? (
        tableToDisplay()
      ) : (
        <p className="text-muted font-italic">No papers submitted so far...</p>
      )} */}
    </>
  );
}
