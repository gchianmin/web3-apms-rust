import React, { useState, useEffect } from "react";
import { Table, Button } from "reactstrap";
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

  const sendPropsWithHash = (
    href,
    conferencePDA,
    conferenceId,
    conferenceName,
    paperHash
  ) => {
    router.push({
      pathname: href,
      query: {
        conferencePDA,
        conferenceId,
        conferenceName,
        paperHash,
      },
    });
  };

  const tableToDisplay = () => {
    switch (action) {
      case "organiserViewAllPapersSubmitted":
        return (
          <Table responsive={true}>
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
                      <RiArrowDownSLine
                        className="accordion-arrow "
                        size={25}
                      />
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
                        className="btn-danger mb-3"
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
                      {item.reviewer.find(
                        (r) => r.approval > 0 || item.version > 1
                      ) ? null : (
                        <AssignReviewerModal
                          walletAddress={walletAddress}
                          connectWallet={connectWallet}
                          tpc={tpc}
                          conference={conference}
                          paperId={item.paperHash}
                        />
                      )}
                    </td>
                  </tr>
                  {activeIndexes.includes(index) && (
                    <>
                      <tr>
                        <td
                          colSpan="5"
                          className="text-monospace accordion-content"
                        >
                          <p>
                            Paper Name: {item.paperName}{" "}
                            <DownloadButton
                              conferencePDA={conference.conferencePDA}
                              conferenceId={conference.conferenceId}
                              paperHash={item.paperHash}
                              paperName={item.paperName}
                            />
                          </p>
                          <p>Abstract: {item.paperAbstract}</p>
                          <p>Version: {item.version}</p>
                          {item.version > 1 && (
                            <p>
                              Previous Version:{" "}
                              <a
                                className="font-italic text-info"
                                //   href="/my-conference"
                                type="button"
                                onClick={() =>
                                  sendProps(
                                    `/papers/${item.prevVersion}`,
                                    conference.conferencePDA,
                                    conference.conferenceId,
                                    conference.conferenceName
                                  )
                                }
                              >
                                View previous version
                              </a>
                            </p>
                          )}
                          <p>Date Submitted: {item.dateSubmitted}</p>
                          Authors:{" "}
                          {item.paperAuthors.map((author) => (
                            <p key={author.authorEmail}>
                              {author.authorName} - {author.authorEmail} [
                              {author.authorAffiliation}]
                            </p>
                          ))}
                          Reviewers:{" "}
                          {item.reviewer.length > 0 ? (
                            <Table bordered={true}>
                              <thead>
                                <tr>
                                  <th>Reviewer</th>
                                  <th>Approval</th>
                                  <th>Feedback</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.reviewer.map((name) => (
                                  <tr>
                                    <td>{name.tpcName}</td>
                                    {getPaperStatus(name.approval) ==
                                    "Submitted" ? (
                                      <td>Pending Review</td>
                                    ) : (
                                      <td>{getPaperStatus(name.approval)}</td>
                                    )}
                                    <td>{name.feedback}</td>
                                  </tr>
                                  // </>
                                ))}
                              </tbody>
                            </Table>
                          ) : (
                            <p>No reviewers assigned yet</p>
                          )}
                          <p>
                            Paper Chair:{" "}
                            {item.paperChair.tpcName.length > 0 ? (
                              <Table bordered={true}>
                                <thead>
                                  <tr>
                                    <th>Chair</th>
                                    <th>Approval</th>
                                    <th>Feedback</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>{item.paperChair.tpcName}</td>
                                    {getPaperStatus(item.paperChair.approval) ==
                                    "Submitted" ? (
                                      <td>Pending Review</td>
                                    ) : (
                                      <td>
                                        {getPaperStatus(
                                          item.paperChair.approval
                                        )}
                                      </td>
                                    )}
                                    <td>{item.paperChair.feedback}</td>
                                  </tr>
                                </tbody>
                              </Table>
                            ) : (
                              <p>No chair assigned yet</p>
                            )}
                          </p>
                        </td>
                      </tr>
                    </>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        );

      case "reviewerViewPaperPendingReviewed":
        return (
          <Table responsive={true}>
            <thead>
              <tr>
                <th> </th>
                <th>Conference</th>
                <th>Paper Title</th>
                <th>Abstract</th>
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
                      <RiArrowDownSLine
                        className="accordion-arrow "
                        size={25}
                      />
                    </td>

                    <td className="accordion-title align-middle">
                      <a
                        className="link-info"
                        href={`/conferences/${item.pk.toString()}?conferenceId=${item.conferenceId.toString()}`}
                      >
                        {item.conferenceName}{" "}
                      </a>
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
                  </tr>
                  {activeIndexes.includes(index) && (
                    <>
                      <tr>
                        <td
                          colSpan="5"
                          className="text-monospace accordion-content"
                        >
                          <p>
                            Paper Name: {item.paperName}{" "}
                            <DownloadButton
                              conferencePDA={item.pk}
                              conferenceId={item.conferenceId}
                              paperHash={item.paperHash}
                              paperName={item.paperName}
                            />
                          </p>

                          <p>Abstract: {item.paperAbstract}</p>

                          <p>Version: {item.version}</p>

                          {item.version > 1 && (
                            <p>
                              Previous Version:{" "}
                              <a
                                className="font-italic text-info"
                                type="button"
                                onClick={() =>
                                  sendProps(
                                    `/papers/${item.prevVersion}`,
                                    item.pk,
                                    item.conferenceId,
                                    item.conferenceName
                                  )
                                }
                              >
                                View previous version
                              </a>
                            </p>
                          )}

                          <p>Date Submitted: {item.dateSubmitted}</p>

                          <Expander
                            role="reviewer"
                            conferencePDA={item.pk}
                            conferenceId={item.conferenceId}
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

      case "chairViewPaperPendingReviewed":
        return (
          <Table responsive={true}>
            <thead>
              <tr>
                <th> </th>
                <th>Conference</th>
                <th>Paper Title</th>
                <th>Abstract</th>
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
                      <RiArrowDownSLine
                        className="accordion-arrow "
                        size={25}
                      />
                    </td>

                    <td className="accordion-title align-middle">
                      <a
                        className="link-info"
                        href={`/conferences/${item.pk.toString()}?conferenceId=${item.conferenceId.toString()}`}
                      >
                        {item.conferenceName}{" "}
                      </a>
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
                  </tr>
                  {activeIndexes.includes(index) && (
                    <>
                      <tr>
                        <td
                          colSpan="5"
                          className="text-monospace accordion-content"
                        >
                          <p>
                            Paper Name: {item.paperName}{" "}
                            <DownloadButton
                              conferencePDA={item.pk}
                              conferenceId={item.conferenceId}
                              paperHash={item.paperHash}
                              paperName={item.paperName}
                            />
                          </p>

                          <p>Abstract: {item.paperAbstract}</p>

                          <p>Version: {item.version}</p>

                          {item.version > 1 && (
                            <p>
                              Previous Version:{" "}
                              <a
                                className="font-italic text-info"
                                //   href="/my-conference"
                                type="button"
                                onClick={() =>
                                  sendProps(
                                    `/papers/${item.prevVersion}`,
                                    item.pk,
                                    item.conferenceId,
                                    item.conferenceName
                                  )
                                }
                              >
                                View previous version
                              </a>
                            </p>
                          )}

                          <p>Date Submitted: {item.dateSubmitted}</p>

                          <p>
                            Reviewers:{" "}
                            {item.reviewer.length > 0 ? (
                              <Table bordered={true}>
                                <thead>
                                  <tr>
                                    <th>Reviewer</th>
                                    <th>Approval</th>
                                    <th>Feedback</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.reviewer.map((name) => (
                                    <tr>
                                      <td>{name.tpcName}</td>
                                      {getPaperStatus(name.approval) ==
                                      "Submitted" ? (
                                        <td>Pending Review</td>
                                      ) : (
                                        <td>{getPaperStatus(name.approval)}</td>
                                      )}
                                      <td>{name.feedback}</td>
                                    </tr>
                                    // </>
                                  ))}
                                </tbody>
                              </Table>
                            ) : (
                              <p>No reviewers assigned yet</p>
                            )}
                          </p>

                          <p>
                            Paper Chair:{" "}
                            {item.paperChair.tpcName.length > 0 ? (
                              <Table bordered={true}>
                                <thead>
                                  <tr>
                                    <th>Chair</th>
                                    <th>Approval</th>
                                    <th>Feedback</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>{item.paperChair.tpcName}</td>
                                    {getPaperStatus(item.paperChair.approval) ==
                                    "Submitted" ? (
                                      <td>Pending Review</td>
                                    ) : (
                                      <td>
                                        {getPaperStatus(
                                          item.paperChair.approval
                                        )}
                                      </td>
                                    )}
                                    <td>{item.paperChair.feedback}</td>
                                  </tr>
                                </tbody>
                              </Table>
                            ) : (
                              <p>No chair assigned yet</p>
                            )}
                          </p>
                          {item.reviewer.find((r) => r.approval == 0) ? (
                            <Button
                              style={{
                                marginBottom: "1rem",
                              }}
                              disabled
                              onClick={() =>
                                alert(
                                  "Please wait for other reviewers to review first"
                                )
                              }
                            >
                              Review
                            </Button>
                          ) : (
                            <Expander
                              role="chair"
                              conferencePDA={item.pk}
                              conferenceId={item.conferenceId}
                              paperHash={item.paperHash}
                            />
                          )}
                        </td>
                      </tr>
                    </>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        );

      case "authorViewPaperSubmittedHistory":
        return (
          <Table responsive={true}>
            <thead>
              <tr>
                <th> </th>
                <th>Conference</th>
                <th>Paper ID</th>
                <th>Paper Title</th>
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
                      <RiArrowDownSLine
                        className="accordion-arrow "
                        size={25}
                      />
                    </td>

                    <td className="accordion-title align-middle">
                      <a
                        className="link-info"
                        href={`/conferences/${item.pk.toString()}?conferenceId=${item.conferenceId.toString()}`}
                      >
                        {item.conferenceName}{" "}
                      </a>
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
                      {getPaperStatus(item.paperStatus)}
                    </td>

                    <td className="accordion-title align-middle ">
                      {item.reviewer.length == 0 && (
                        <Button
                          className="btn-danger"
                          type="button"
                          onClick={() =>
                            deletePaper(
                              item.pk,
                              item.conferenceId,
                              item.paperHash
                            )
                          }
                        >
                          DELETE SUBMISSION
                        </Button>
                      )}
                      {item.paperStatus == 2 && (
                        <>
                          <Button
                            className="btn-primary"
                            type="button"
                            // onClick={() =>
                            //   sendProps(
                            //     "/submit-paper",
                            //     item.pk.toString(),
                            //     item.conferenceId.toString(),
                            //     item.conferenceName
                            //   )
                            // }
                          >
                            Make payment
                          </Button>
                        </>
                      )}
                      {(item.paperStatus == 3 || item.paperStatus == 4) && (
                        <>
                          <Button
                            className="btn-info"
                            type="button"
                            onClick={() =>
                              sendPropsWithHash(
                                "/revise-paper",
                                item.pk.toString(),
                                item.conferenceId.toString(),
                                item.conferenceName,
                                item.paperHash
                              )
                            }
                          >
                            Submit a Revised Paper
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                  {activeIndexes.includes(index) && (
                    <>
                      <tr>
                        <td
                          colSpan="5"
                          className="text-monospace accordion-content"
                        >
                          <p>
                            Paper Name: {item.paperName}{" "}
                            <DownloadButton
                              conferencePDA={item.pk}
                              conferenceId={item.conferenceId}
                              paperHash={item.paperHash}
                              paperName={item.paperName}
                            />
                          </p>
                          <p>Abstract: {item.paperAbstract}</p>
                          <p>Version: {item.version}</p>
                          {item.version > 1 && (
                            <p>
                              Previous Version:{" "}
                              <a
                                className="font-italic text-info"
                                //   href="/my-conference"
                                type="button"
                                onClick={() =>
                                  sendProps(
                                    `/papers/${item.prevVersion}`,
                                    item.pk,
                                    item.conferenceId,
                                    item.conferenceName
                                  )
                                }
                              >
                                View previous version
                              </a>
                            </p>
                          )}
                          <p>Date Submitted: {item.dateSubmitted}</p>
                          Authors:{" "}
                          {item.paperAuthors.map((author) => (
                            <p key={author.authorEmail}>
                              {author.authorName} - {author.authorEmail} [
                              {author.authorAffiliation}]
                            </p>
                          ))}
                          <p>
                            Reviewers:{" "}
                            {item.reviewer.length > 0 ? (
                              <Table bordered={true}>
                                <thead>
                                  <tr>
                                    <th>Reviewer</th>
                                    <th>Approval</th>
                                    <th>Feedback</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.reviewer.map((name) => (
                                    <tr>
                                      <td>Anonymous Reviewer</td>
                                      {getPaperStatus(name.approval) ==
                                      "Submitted" ? (
                                        <td>Pending Review</td>
                                      ) : (
                                        <td>{getPaperStatus(name.approval)}</td>
                                      )}
                                      <td>{name.feedback}</td>
                                    </tr>
                                    // </>
                                  ))}
                                </tbody>
                              </Table>
                            ) : (
                              <p>No reviewers assigned yet</p>
                            )}
                          </p>
                          <p>
                            Paper Chair:{" "}
                            {item.paperChair.tpcName.length > 0 ? (
                              <Table bordered={true}>
                                <thead>
                                  <tr>
                                    <th>Chair</th>
                                    <th>Approval</th>
                                    <th>Feedback</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>Anonymous Chair</td>
                                    {getPaperStatus(item.paperChair.approval) ==
                                    "Submitted" ? (
                                      <td>Pending Review</td>
                                    ) : (
                                      <td>
                                        {getPaperStatus(
                                          item.paperChair.approval
                                        )}
                                      </td>
                                    )}
                                    <td>{item.paperChair.feedback}</td>
                                  </tr>
                                </tbody>
                              </Table>
                            ) : (
                              <p>No chair assigned yet</p>
                            )}
                          </p>
                        </td>
                      </tr>
                    </>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        );

      case "authorViewPaperPendingPayment":
        return (
          <Table responsive={true}>
            <thead>
              <tr>
                <th> </th>
                <th>Conference</th>
                <th>Paper ID</th>
                <th>Paper Title</th>
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
                      <RiArrowDownSLine
                        className="accordion-arrow "
                        size={25}
                      />
                    </td>

                    <td className="accordion-title align-middle">
                      <a
                        className="link-info"
                        href={`/conferences/${item.pk.toString()}?conferenceId=${item.conferenceId.toString()}`}
                      >
                        {item.conferenceName}{" "}
                      </a>
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
                      {getPaperStatus(item.paperStatus)}
                    </td>

                    <td className="accordion-title align-middle ">
                      {item.reviewer.length == 0 && (
                        <Button
                          className="btn-danger"
                          type="button"
                          onClick={() =>
                            deletePaper(
                              item.pk,
                              item.conferenceId,
                              item.paperHash
                            )
                          }
                        >
                          DELETE SUBMISSION
                        </Button>
                      )}
                      {item.paperStatus == 2 && (
                        <>
                          <Button
                            className="btn-primary"
                            type="button"
                            // onClick={() =>
                            //   sendProps(
                            //     "/submit-paper",
                            //     item.pk.toString(),
                            //     item.conferenceId.toString(),
                            //     item.conferenceName
                            //   )
                            // }
                          >
                            Make payment
                          </Button>
                        </>
                      )}
                      {item.paperStatus == 3 ||
                        (item.paperStatus == 4 && (
                          <>
                            <Button
                              className="btn-primary mt-3"
                              type="button"
                              onClick={() =>
                                sendProps(
                                  "/submit-paper",
                                  item.pk.toString(),
                                  item.conferenceId.toString(),
                                  item.conferenceName
                                )
                              }
                            >
                              Submit a Revised Paper
                            </Button>
                          </>
                        ))}
                    </td>
                  </tr>
                  {activeIndexes.includes(index) && (
                    <>
                      <tr>
                        <td
                          colSpan="5"
                          className="text-monospace accordion-content"
                        >
                          <p>
                            Paper Name: {item.paperName}{" "}
                            <DownloadButton
                              conferencePDA={item.pk}
                              conferenceId={item.conferenceId}
                              paperHash={item.paperHash}
                              paperName={item.paperName}
                            />
                          </p>
                          <p>Abstract: {item.paperAbstract}</p>
                          <p>Version: {item.version}</p>
                          {item.version > 1 && (
                            <p>
                              Previous Version:{" "}
                              <a
                                className="font-italic text-info"
                                //   href="/my-conference"
                                type="button"
                                onClick={() =>
                                  sendProps(
                                    `/papers/${item.prevVersion}`,
                                    item.pk,
                                    item.conferenceId,
                                    item.conferenceName
                                  )
                                }
                              >
                                View previous version
                              </a>
                            </p>
                          )}
                          <p>Date Submitted: {item.dateSubmitted}</p>
                          Authors:{" "}
                          {item.paperAuthors.map((author) => (
                            <p key={author.authorEmail}>
                              {author.authorName} - {author.authorEmail} [
                              {author.authorAffiliation}]
                            </p>
                          ))}
                          {/* <p> */}
                            Reviewers:{" "}
                            {item.reviewer.length > 0 ? (
                              <Table bordered={true}>
                                <thead>
                                  <tr>
                                    <th>Reviewer</th>
                                    <th>Approval</th>
                                    <th>Feedback</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.reviewer.map((name) => (
                                    <tr>
                                      <td>Anonymous Reviewer</td>
                                      {getPaperStatus(name.approval) ==
                                      "Submitted" ? (
                                        <td>Pending Review</td>
                                      ) : (
                                        <td>{getPaperStatus(name.approval)}</td>
                                      )}
                                      <td>{name.feedback}</td>
                                    </tr>
                                    // </>
                                  ))}
                                </tbody>
                              </Table>
                            ) : (
                              <p>No reviewers assigned yet</p>
                            )}
                          {/* </p> */}
                          <p>
                            Paper Chair:{" "}
                            {item.paperChair.tpcName.length > 0 ? (
                              <Table bordered={true}>
                                <thead>
                                  <tr>
                                    <th>Chair</th>
                                    <th>Approval</th>
                                    <th>Feedback</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>Anonymous Chair</td>
                                    {getPaperStatus(item.paperChair.approval) ==
                                    "Submitted" ? (
                                      <td>Pending Review</td>
                                    ) : (
                                      <td>
                                        {getPaperStatus(
                                          item.paperChair.approval
                                        )}
                                      </td>
                                    )}
                                    <td>{item.paperChair.feedback}</td>
                                  </tr>
                                </tbody>
                              </Table>
                            ) : (
                              <p>No chair assigned yet</p>
                            )}
                          </p>
                        </td>
                      </tr>
                    </>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        );
      
        case "authorViewPaperPendingRevision":
        return (
          <Table responsive={true}>
            <thead>
              <tr>
                <th> </th>
                <th>Conference</th>
                <th>Paper ID</th>
                <th>Paper Title</th>
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
                      <RiArrowDownSLine
                        className="accordion-arrow "
                        size={25}
                      />
                    </td>

                    <td className="accordion-title align-middle">
                      <a
                        className="link-info"
                        href={`/conferences/${item.pk.toString()}?conferenceId=${item.conferenceId.toString()}`}
                      >
                        {item.conferenceName}{" "}
                      </a>
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
                      {getPaperStatus(item.paperStatus)}
                    </td>

                    <td className="accordion-title align-middle ">
                      {item.reviewer.length == 0 && (
                        <Button
                          className="btn-danger"
                          type="button"
                          onClick={() =>
                            deletePaper(
                              item.pk,
                              item.conferenceId,
                              item.paperHash
                            )
                          }
                        >
                          DELETE SUBMISSION
                        </Button>
                      )}
                      {item.paperStatus == 2 && (
                        <>
                          <Button
                            className="btn-primary"
                            type="button"
                            // onClick={() =>
                            //   sendProps(
                            //     "/submit-paper",
                            //     item.pk.toString(),
                            //     item.conferenceId.toString(),
                            //     item.conferenceName
                            //   )
                            // }
                          >
                            Make payment
                          </Button>
                        </>
                      )}
                      {(item.paperStatus == 3 || item.paperStatus == 4) && (
                        <>
                          <Button
                            className="btn-info"
                            type="button"
                            onClick={() =>
                              sendPropsWithHash(
                                "/revise-paper",
                                item.pk.toString(),
                                item.conferenceId.toString(),
                                item.conferenceName,
                                item.paperHash
                              )
                            }
                          >
                            Submit a Revised Paper
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                  {activeIndexes.includes(index) && (
                    <>
                      <tr>
                        <td
                          colSpan="5"
                          className="text-monospace accordion-content"
                        >
                          <p>
                            Paper Name: {item.paperName}{" "}
                            <DownloadButton
                              conferencePDA={item.pk}
                              conferenceId={item.conferenceId}
                              paperHash={item.paperHash}
                              paperName={item.paperName}
                            />
                          </p>
                          <p>Abstract: {item.paperAbstract}</p>
                          <p>Version: {item.version}</p>
                          {item.version > 1 && (
                            <p>
                              Previous Version:{" "}
                              <a
                                className="font-italic text-info"
                                //   href="/my-conference"
                                type="button"
                                onClick={() =>
                                  sendProps(
                                    `/papers/${item.prevVersion}`,
                                    item.pk,
                                    item.conferenceId,
                                    item.conferenceName
                                  )
                                }
                              >
                                View previous version
                              </a>
                            </p>
                          )}
                          <p>Date Submitted: {item.dateSubmitted}</p>
                          Authors:{" "}
                          {item.paperAuthors.map((author) => (
                            <p key={author.authorEmail}>
                              {author.authorName} - {author.authorEmail} [
                              {author.authorAffiliation}]
                            </p>
                          ))}
                          <p>
                            Reviewers:{" "}
                            {item.reviewer.length > 0 ? (
                              <Table bordered={true}>
                                <thead>
                                  <tr>
                                    <th>Reviewer</th>
                                    <th>Approval</th>
                                    <th>Feedback</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.reviewer.map((name) => (
                                    <tr>
                                      <td>Anonymous Reviewer</td>
                                      {getPaperStatus(name.approval) ==
                                      "Submitted" ? (
                                        <td>Pending Review</td>
                                      ) : (
                                        <td>{getPaperStatus(name.approval)}</td>
                                      )}
                                      <td>{name.feedback}</td>
                                    </tr>
                                    // </>
                                  ))}
                                </tbody>
                              </Table>
                            ) : (
                              <p>No reviewers assigned yet</p>
                            )}
                          </p>
                          <p>
                            Paper Chair:{" "}
                            {item.paperChair.tpcName.length > 0 ? (
                              <Table bordered={true}>
                                <thead>
                                  <tr>
                                    <th>Chair</th>
                                    <th>Approval</th>
                                    <th>Feedback</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>Anonymous Chair</td>
                                    {getPaperStatus(item.paperChair.approval) ==
                                    "Submitted" ? (
                                      <td>Pending Review</td>
                                    ) : (
                                      <td>
                                        {getPaperStatus(
                                          item.paperChair.approval
                                        )}
                                      </td>
                                    )}
                                    <td>{item.paperChair.feedback}</td>
                                  </tr>
                                </tbody>
                              </Table>
                            ) : (
                              <p>No chair assigned yet</p>
                            )}
                          </p>
                        </td>
                      </tr>
                    </>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        );  

      case "reviewerViewPaperReviewedHistory":
        return (
          <Table responsive={true}>
            <thead>
              <tr>
                <th> </th>
                <th>Conference</th>
                <th>Paper ID</th>
                <th>Paper Title</th>
                <th>Approval</th>
                <th>Feedback</th>
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
                      <RiArrowDownSLine
                        className="accordion-arrow "
                        size={25}
                      />
                    </td>

                    <td className="accordion-title align-middle">
                      <a
                        className="link-info"
                        href={`/conferences/${item.pk.toString()}?conferenceId=${item.conferenceId.toString()}`}
                      >
                        {item.conferenceName}{" "}
                      </a>
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
                      {/* {getPaperStatus(
                        item.reviewer.find((r) => r.tpcWallet === walletAddress)
                          .approval
                      )} */}
                    </td>

                    <td className="accordion-title align-middle">
                      {/* {
                        item.reviewer.find((r) => r.tpcWallet === walletAddress)
                          .feedback
                      } */}
                    </td>
                  </tr>
                  {activeIndexes.includes(index) && (
                    <>
                      <tr>
                        <td
                          colSpan="5"
                          className="text-monospace accordion-content"
                        >
                          <p>
                            Paper Name: {item.paperName}{" "}
                            <DownloadButton
                              conferencePDA={item.pk}
                              conferenceId={item.conferenceId}
                              paperHash={item.paperHash}
                              paperName={item.paperName}
                            />
                          </p>
                          <p>Abstract: {item.paperAbstract}</p>
                          <p>Version: {item.version}</p>
                          {item.version > 1 && (
                            <p>
                              Previous Version:{" "}
                              <a
                                className="font-italic text-info"
                                //   href="/my-conference"
                                type="button"
                                onClick={() =>
                                  sendProps(
                                    `/papers/${item.prevVersion}`,
                                    item.pk,
                                    item.conferenceId,
                                    item.conferenceName
                                  )
                                }
                              >
                                View previous version
                              </a>
                            </p>
                          )}
                          <p>Date Submitted: {item.dateSubmitted}</p>
                        </td>
                      </tr>
                    </>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        );

      case "chairViewPaperReviewedHistory":
        return (
          <Table responsive={true}>
            <thead>
              <tr>
                <th> </th>
                <th>Conference</th>
                <th>Paper ID</th>
                <th>Paper Title</th>
                <th>Approval</th>
                <th>Feedback</th>
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
                      <RiArrowDownSLine
                        className="accordion-arrow "
                        size={25}
                      />
                    </td>

                    <td className="accordion-title align-middle">
                      <a
                        className="link-info"
                        href={`/conferences/${item.pk.toString()}?conferenceId=${item.conferenceId.toString()}`}
                      >
                        {item.conferenceName}{" "}
                      </a>
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
                      {getPaperStatus(item.paperChair.approval)}
                    </td>

                    <td className="accordion-title align-middle">
                      {item.paperChair.feedback}
                    </td>
                  </tr>
                  {activeIndexes.includes(index) && (
                    <>
                      <tr>
                        <td
                          colSpan="5"
                          className="text-monospace accordion-content"
                        >
                          <p>
                            Paper Name: {item.paperName}{" "}
                            <DownloadButton
                              conferencePDA={item.pk}
                              conferenceId={item.conferenceId}
                              paperHash={item.paperHash}
                              paperName={item.paperName}
                            />
                          </p>
                          <p>Abstract: {item.paperAbstract}</p>
                          <p>Version: {item.version}</p>
                          {item.version > 1 && (
                            <p>
                              Previous Version:{" "}
                              <a
                                className="font-italic text-info"
                                //   href="/my-conference"
                                type="button"
                                onClick={() =>
                                  sendProps(
                                    `/papers/${item.prevVersion}`,
                                    item.pk,
                                    item.conferenceId,
                                    item.conferenceName
                                  )
                                }
                              >
                                View previous version
                              </a>
                            </p>
                          )}
                          <p>Date Submitted: {item.dateSubmitted}</p>
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

  return <>{tableToDisplay()}</>;
}
