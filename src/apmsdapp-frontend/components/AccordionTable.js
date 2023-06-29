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
import { useUser } from "@auth0/nextjs-auth0/client";
import { connectWallet } from "../Common/WalletConnection";
import { deletePaper } from "../Common/AuthorInstructions";
import { getPaperStatus } from "../Common/GetPapers";
import { getConference } from "../Common/GetConferences";
import DownloadButton from "./DownloadButton";
import Expander from "./Expander";
import PaymentExpander from "./PaymentExpander";
import ReviewExpander from "./ReviewExpander";

export default function AccordionTable({
  props,
  conference,
  walletAddress,
  action,
}) {
  const { user } = useUser();
  const router = useRouter();
  const [filedata, setFileData] = useState(JSON.parse(props));
  const [activeIndexes, setActiveIndexes] = useState([]);
  const [tpc, setTpc] = useState([]);

  let num = 0;
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

  const getPaidOutStatus = (status) => {
    if (status == 1) return "Completed";
    return "Pending Payout";
  };
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
            <thead className="text-center">
              <tr>
                <th style={{ width: "1%" }}> </th>
                <th style={{ width: "10%" }}>ID</th>
                <th style={{ width: "20%" }}>Paper Title</th>
                <th style={{ width: "30%" }}>Paper Abstract</th>
                <th style={{ width: "10%" }}>Version</th>
                <th style={{ width: "15%" }}>Paper Status</th>
                <th style={{ width: "20%" }}>Action</th>
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
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {item.paperId}
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {item.paperTitle}
                    </td>
                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                     <div className = "paragraph-container">{item.paperAbstract}</div> 
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      <small>{item.version}</small>
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {getPaperStatus(item.paperStatus)}
                    </td>

                    <td className="accordion-title align-middle text-center">
                      {item.paperStatus == 0 ? (
                        <Button
                          className="btn-danger mb-3"
                          type="button"
                          onClick={() =>
                            deletePaper(
                              conference.conferencePDA,
                              conference.conferenceId,
                              item.paperHash,
                              item.paperName
                            )
                          }
                        >
                          DELETE SUBMISSION
                        </Button>
                      ) : null}
                      {item.reviewer.find(
                        (r) => r.approval > 0 || item.version > 1
                      ) ? null : (
                        <AssignReviewerModal
                          walletAddress={walletAddress}
                          connectWallet={connectWallet}
                          tpc={tpc}
                          conference={conference}
                          paperId={item.paperHash}
                          paper={item}
                        />
                      )}
                    </td>
                  </tr>
                  {activeIndexes.includes(index) && (
                    <>
                      <tr>
                        <td
                          colSpan="7"
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
                          {item.version > 1 && (
                            <p>
                              Response Letter: {item.responseLetterName}{" "}
                              <DownloadButton
                                conferencePDA={conference.conferencePDA}
                                conferenceId={conference.conferenceId}
                                paperHash={item.responseLetterHash}
                                paperName={item.responseLetterName}
                              />
                            </p>
                          )}
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
                                  <th
                                    style={{
                                      width: "15%",
                                    }}
                                  >
                                    Reviewer
                                  </th>
                                  <th
                                    style={{
                                      width: "25%",
                                    }}
                                  >
                                    Approval
                                  </th>
                                  <th
                                    style={{
                                      width: "35%",
                                    }}
                                  >
                                    Feedback
                                  </th>
                                  <th
                                    style={{
                                      width: "25%",
                                    }}
                                  >
                                    Submitted On
                                  </th>
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
                                    <td>{name.feedbackSubmittedDatetime}</td>
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
                                    <th
                                      style={{
                                        width: "15%",
                                      }}
                                    >
                                      Chair
                                    </th>
                                    <th
                                      style={{
                                        width: "25%",
                                      }}
                                    >
                                      Approval
                                    </th>
                                    <th
                                      style={{
                                        width: "35%",
                                      }}
                                    >
                                      Feedback
                                    </th>
                                    <th
                                      style={{
                                        width: "25%",
                                      }}
                                    >
                                      Submitted On
                                    </th>
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
                                    <td>
                                      {
                                        item.paperChair
                                          .feedbackSubmittedDatetime
                                      }
                                    </td>
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
            <thead className="text-center">
              <tr>
                <th style={{ width: "1%" }}> </th>
                <th style={{ width: "25%" }}>Conference</th>
                <th style={{ width: "25%" }}>Paper Title</th>
                <th style={{ width: "25%" }}>Abstract</th>
                <th style={{ width: "10%" }}>Review Deadline</th>
                <th style={{ width: "10%" }}>Action</th>
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

                    <td className="accordion-title align-middle text-center">
                      <a
                        className="link-info"
                        href={`/conferences/${item.pk.toString()}?conferenceId=${item.conferenceId.toString()}`}
                      >
                        {item.conferenceName}{" "}
                      </a>
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {item.paperTitle}
                    </td>
                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      <div className = "paragraph-container">{item.paperAbstract}</div> 
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {
                        item.reviewer.find((r) => r.tpcEmail == user.email)
                          .reviewDeadline
                      }
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      <ReviewExpander
                        role="reviewer"
                        conferencePDA={item.pk}
                        conferenceId={item.conferenceId}
                        paperHash={item.paperHash}
                        walletAddress={walletAddress}
                        paper = {item}
                      />
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

                          {item.version > 1 && (
                            <p>
                              Response Letter: {item.responseLetterName}{" "}
                              <DownloadButton
                                conferencePDA={item.pk}
                                conferenceId={item.conferenceId}
                                paperHash={item.responseLetterHash}
                                paperName={item.responseLetterName}
                              />
                            </p>
                          )}

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
            <thead className="text-center">
              <tr>
                <th style={{ width: "1%" }}> </th>
                <th style={{ width: "25%" }}>Conference</th>
                <th style={{ width: "25%" }}>Paper Title</th>
                <th style={{ width: "25%" }}>Abstract</th>
                <th style={{ width: "10%" }}>Review Deadline</th>
                <th style={{ width: "10%" }}>Action</th>
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

                    <td className="accordion-title align-middle text-center">
                      <a
                        className="link-info"
                        href={`/conferences/${item.pk.toString()}?conferenceId=${item.conferenceId.toString()}`}
                      >
                        {item.conferenceName}{" "}
                      </a>
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {item.paperTitle}
                    </td>
                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      <div className = "paragraph-container">{item.paperAbstract}</div> 
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {item.paperChair.reviewDeadline}
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {item.reviewer.find((r) => r.approval == 0) ? (
                        <Button
                          className="secondary"
                          onClick={() =>
                            alert(
                              "Please wait for other reviewers to review first"
                            )
                          }
                        >
                          Review
                        </Button>
                      ) : (
                        <ReviewExpander
                          role="chair"
                          conferencePDA={item.pk}
                          conferenceId={item.conferenceId}
                          paperHash={item.paperHash}
                          walletAddress={walletAddress}
                          paper = {item}
                        />
                      )}
                    </td>
                  </tr>
                  {activeIndexes.includes(index) && (
                    <>
                      <tr>
                        <td
                          colSpan="6"
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

                          {item.version > 1 && (
                            <p>
                              Response Letter: {item.responseLetterName}{" "}
                              <DownloadButton
                                conferencePDA={item.pk}
                                conferenceId={item.conferenceId}
                                paperHash={item.responseLetterHash}
                                paperName={item.responseLetterName}
                              />
                            </p>
                          )}

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

                          <p>
                            Reviewers:{" "}
                            {item.reviewer.length > 0 ? (
                              <Table bordered={true}>
                                <thead>
                                  <tr>
                                    <th
                                      style={{
                                        width: "15%",
                                      }}
                                    >
                                      Reviewer
                                    </th>
                                    <th
                                      style={{
                                        width: "25%",
                                      }}
                                    >
                                      Approval
                                    </th>
                                    <th
                                      style={{
                                        width: "35%",
                                      }}
                                    >
                                      Feedback
                                    </th>
                                    <th
                                      style={{
                                        width: "25%",
                                      }}
                                    >
                                      Submitted On
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.reviewer.map((name, num) => (
                                    <tr>
                                      <td> Reviewer {num + 1}</td>
                                      {getPaperStatus(name.approval) ==
                                      "Submitted" ? (
                                        <td>Pending Review</td>
                                      ) : (
                                        <td>{getPaperStatus(name.approval)}</td>
                                      )}
                                      <td>{name.feedback}</td>
                                      <td>{name.feedbackSubmittedDatetime}</td>
                                    </tr>
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
                                    <th
                                      style={{
                                        width: "15%",
                                      }}
                                    >
                                      Chair
                                    </th>
                                    <th
                                      style={{
                                        width: "25%",
                                      }}
                                    >
                                      Approval
                                    </th>
                                    <th
                                      style={{
                                        width: "35%",
                                      }}
                                    >
                                      Feedback
                                    </th>
                                    <th
                                      style={{
                                        width: "25%",
                                      }}
                                    >
                                      Submitted On
                                    </th>
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
                                    <td>
                                      {
                                        item.paperChair
                                          .feedbackSubmittedDatetime
                                      }
                                    </td>
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

      case "authorViewPaperSubmittedHistory":
        return (
          <Table responsive={true}>
            <thead className="text-center">
              <tr>
                <th style={{ width: "1%" }}> </th>
                <th style={{ width: "15%" }}>Conference</th>
                <th style={{ width: "10%" }}>Paper ID</th>
                <th style={{ width: "30%" }}>Paper Title</th>
                <th style={{ width: "5%" }}>Version</th>
                <th style={{ width: "15%" }}>Status</th>
                <th style={{ width: "25%" }}>Action</th>
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

                    <td className="accordion-title align-middle text-center">
                      <a
                        className="link-info"
                        href={`/conferences/${item.pk.toString()}?conferenceId=${item.conferenceId.toString()}`}
                      >
                        {item.conferenceName}{" "}
                      </a>
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {item.paperId}
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {item.paperTitle}
                    </td>

                    <td
                      className="accordion-title align-middle text-center "
                      onClick={() => toggleActive(index)}
                    >
                      {item.version}
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {getPaperStatus(item.paperStatus)}
                    </td>

                    <td className="accordion-title align-middle text-center">
                      {item.reviewer.length == 0 && (
                        <Button
                          className="btn-danger"
                          type="button"
                          onClick={() =>
                            deletePaper(
                              item.pk,
                              item.conferenceId,
                              item.paperHash,
                              item.paperName
                            )
                          }
                        >
                          DELETE SUBMISSION
                        </Button>
                      )}

                      {item.paperStatus == 2 && (
                        <PaymentExpander
                          paper={item}
                          conferencePDA={item.pk}
                          conferenceId={item.conferenceId}
                          paperHash={item.paperHash}
                          walletAddress={walletAddress}
                        />
                      )}

                      {[1, 5, 6, 7, 8].includes(item.paperStatus) && (
                        <p>No action required</p>
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
                          colSpan="7"
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
                          {item.version > 1 && (
                            <p>
                              Response Letter: {item.responseLetterName}{" "}
                              <DownloadButton
                                conferencePDA={item.pk}
                                conferenceId={item.conferenceId}
                                paperHash={item.responseLetterHash}
                                paperName={item.responseLetterName}
                              />
                            </p>
                          )}
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
                                <thead className="text-center">
                                  <tr>
                                    <th
                                      style={{
                                        width: "15%",
                                      }}
                                    >
                                      Reviewer
                                    </th>
                                    <th
                                      style={{
                                        width: "25%",
                                      }}
                                    >
                                      Approval
                                    </th>
                                    <th
                                      style={{
                                        width: "35%",
                                      }}
                                    >
                                      Feedback
                                    </th>
                                    <th
                                      style={{
                                        width: "25%",
                                      }}
                                    >
                                      Submitted On
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.reviewer.map((name, num) => (
                                    <tr>
                                      <td> Reviewer {num + 1}</td>
                                      {getPaperStatus(name.approval) ==
                                      "Submitted" ? (
                                        <td>Pending Review</td>
                                      ) : (
                                        <td>{getPaperStatus(name.approval)}</td>
                                      )}
                                      <td>{name.feedback}</td>
                                      <td>{name.feedbackSubmittedDatetime}</td>
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
                                <thead className="text-center">
                                  <tr>
                                    <th
                                      style={{
                                        width: "15%",
                                      }}
                                    >
                                      Chair
                                    </th>
                                    <th
                                      style={{
                                        width: "25%",
                                      }}
                                    >
                                      Approval
                                    </th>
                                    <th
                                      style={{
                                        width: "35%",
                                      }}
                                    >
                                      Feedback
                                    </th>
                                    <th
                                      style={{
                                        width: "25%",
                                      }}
                                    >
                                      Submitted On
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>Chair 1 </td>
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
                                    <td>
                                      {
                                        item.paperChair
                                          .feedbackSubmittedDatetime
                                      }
                                    </td>
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
            <thead className="text-center">
              <tr>
                <th style={{ width: "1%" }}> </th>
                <th style={{ width: "15%" }}>Conference</th>
                <th style={{ width: "10%" }}>Paper ID</th>
                <th style={{ width: "30%" }}>Paper Title</th>
                <th style={{ width: "5%" }}>Version</th>
                <th style={{ width: "15%" }}>Status</th>
                <th style={{ width: "25%" }}>Action</th>
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

                    <td className="accordion-title align-middle text-center">
                      <a
                        className="link-info"
                        href={`/conferences/${item.pk.toString()}?conferenceId=${item.conferenceId.toString()}`}
                      >
                        {item.conferenceName}{" "}
                      </a>
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {item.paperId}
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {item.paperTitle}
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {item.version}
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {getPaperStatus(item.paperStatus)}
                    </td>

                    <td className="accordion-title align-middle text-center ">
                      {item.reviewer.length == 0 && (
                        <Button
                          className="btn-danger"
                          type="button"
                          onClick={() =>
                            deletePaper(
                              item.pk,
                              item.conferenceId,
                              item.paperHash,
                              item.paperName
                            )
                          }
                        >
                          DELETE SUBMISSION
                        </Button>
                      )}

                      {item.paperStatus == 2 ? (
                        <PaymentExpander
                          paper={item}
                          conferencePDA={item.pk}
                          conferenceId={item.conferenceId}
                          paperHash={item.paperHash}
                          walletAddress={walletAddress}
                        />
                      ) : null}
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
                          colSpan="7"
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
                          {item.version > 1 && (
                            <p>
                              Response Letter: {item.responseLetterName}{" "}
                              <DownloadButton
                                conferencePDA={item.pk}
                                conferenceId={item.conferenceId}
                                paperHash={item.responseLetterHash}
                                paperName={item.responseLetterName}
                              />
                            </p>
                          )}
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
                              <thead className="text-center">
                                <tr>
                                  <th
                                    style={{
                                      width: "15%",
                                    }}
                                  >
                                    Reviewer
                                  </th>
                                  <th
                                    style={{
                                      width: "25%",
                                    }}
                                  >
                                    Approval
                                  </th>
                                  <th
                                    style={{
                                      width: "35%",
                                    }}
                                  >
                                    Feedback
                                  </th>
                                  <th
                                    style={{
                                      width: "25%",
                                    }}
                                  >
                                    Submitted On
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.reviewer.map((name, num) => (
                                  <tr>
                                    <td>Reviewer {num + 1}</td>
                                    {getPaperStatus(name.approval) ==
                                    "Submitted" ? (
                                      <td>Pending Review</td>
                                    ) : (
                                      <td>{getPaperStatus(name.approval)}</td>
                                    )}
                                    <td>{name.feedback}</td>
                                    <td>{name.feedbackSubmittedDatetime}</td>
                                  </tr>
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
                                <thead className="text-center">
                                  <tr>
                                    <th
                                      style={{
                                        width: "15%",
                                      }}
                                    >
                                      Chair
                                    </th>
                                    <th
                                      style={{
                                        width: "25%",
                                      }}
                                    >
                                      Approval
                                    </th>
                                    <th
                                      style={{
                                        width: "35%",
                                      }}
                                    >
                                      Feedback
                                    </th>
                                    <th
                                      style={{
                                        width: "25%",
                                      }}
                                    >
                                      Submitted On
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>Chair 1</td>
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
                                    <td>
                                      {
                                        item.paperChair
                                          .feedbackSubmittedDatetime
                                      }
                                    </td>
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
            <thead className="text-center">
              <tr>
                <th style={{ width: "1%" }}> </th>
                <th style={{ width: "25%" }}>Conference</th>
                <th style={{ width: "10%" }}>Paper ID</th>
                <th style={{ width: "25%" }}>Paper Title</th>
                <th style={{ width: "20%" }}>Status</th>
                <th style={{ width: "20%" }}>Action</th>
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

                    <td className="accordion-title align-middle text-center">
                      <a
                        className="link-info"
                        href={`/conferences/${item.pk.toString()}?conferenceId=${item.conferenceId.toString()}`}
                      >
                        {item.conferenceName}{" "}
                      </a>
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {item.paperId}
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {item.paperTitle}
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {getPaperStatus(item.paperStatus)}
                    </td>

                    <td className="accordion-title align-middle text-center">
                      {item.reviewer.length == 0 && (
                        <Button
                          className="btn-danger"
                          type="button"
                          onClick={() =>
                            deletePaper(
                              item.pk,
                              item.conferenceId,
                              item.paperHash,
                              item.paperName
                            )
                          }
                        >
                          DELETE SUBMISSION
                        </Button>
                      )}

                      {item.paperStatus == 2 ? (
                        <PaymentExpander
                          // role="reviewer"
                          conferencePDA={item.pk}
                          conferenceId={item.conferenceId}
                          paperHash={item.paperHash}
                        />
                      ) : null}
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
                          colSpan="6"
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
                          {item.version > 1 && (
                            <p>
                              Response Letter: {item.responseLetterName}{" "}
                              <DownloadButton
                                conferencePDA={item.pk}
                                conferenceId={item.conferenceId}
                                paperHash={item.responseLetterHash}
                                paperName={item.responseLetterName}
                              />
                            </p>
                          )}
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
                                <thead className="text-center">
                                  <tr>
                                    <th
                                      style={{
                                        width: "15%",
                                      }}
                                    >
                                      Reviewer
                                    </th>
                                    <th
                                      style={{
                                        width: "25%",
                                      }}
                                    >
                                      Approval
                                    </th>
                                    <th
                                      style={{
                                        width: "35%",
                                      }}
                                    >
                                      Feedback
                                    </th>
                                    <th
                                      style={{
                                        width: "25%",
                                      }}
                                    >
                                      Submitted On
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.reviewer.map((name, num) => (
                                    <tr>
                                      <td> Reviewer {num + 1}</td>
                                      {getPaperStatus(name.approval) ==
                                      "Submitted" ? (
                                        <td>Pending Review</td>
                                      ) : (
                                        <td>{getPaperStatus(name.approval)}</td>
                                      )}
                                      <td>{name.feedback}</td>
                                      <td>{name.feedbackSubmittedDatetime}</td>
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
                                <thead className="text-center">
                                  <tr>
                                    <th
                                      style={{
                                        width: "15%",
                                      }}
                                    >
                                      Chair
                                    </th>
                                    <th
                                      style={{
                                        width: "25%",
                                      }}
                                    >
                                      Approval
                                    </th>
                                    <th
                                      style={{
                                        width: "35%",
                                      }}
                                    >
                                      Feedback
                                    </th>
                                    <th
                                      style={{
                                        width: "25%",
                                      }}
                                    >
                                      Submitted On
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td> Chair 1</td>
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
                                    <td>
                                      {
                                        item.paperChair
                                          .feedbackSubmittedDatetime
                                      }
                                    </td>
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
            <thead className="text-center">
              <tr>
                <th style={{ width: "1%" }}> </th>
                <th style={{ width: "15%" }}>Conference</th>
                <th style={{ width: "10%" }}>Paper ID</th>
                <th style={{ width: "30%" }}>Paper Title</th>
                <th style={{ width: "5%" }}>Version</th>
                <th style={{ width: "15%" }}>Approval</th>
                <th style={{ width: "25%" }}>Feedback</th>
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
                      className="accordion-title align-middle pr-0 mr-0 "
                      onClick={() => toggleActive(index)}
                    >
                      <RiArrowDownSLine
                        className="accordion-arrow "
                        size={25}
                      />
                    </td>

                    <td className="accordion-title align-middle text-center">
                      <a
                        className="link-info"
                        href={`/conferences/${item.pk.toString()}?conferenceId=${item.conferenceId.toString()}`}
                      >
                        {item.conferenceName}{" "}
                      </a>
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {item.paperId}
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {item.paperTitle}
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {item.version}
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {getPaperStatus(
                        item.reviewer.find(
                          (r) => r.tpcWallet.toString() === walletAddress
                        ).approval
                      )}
                    </td>

                    <td className="accordion-title align-middle text-center">
                      {
                        item.reviewer.find(
                          (r) => r.tpcWallet.toString() === walletAddress
                        ).feedback
                      }
                    </td>
                  </tr>
                  {activeIndexes.includes(index) && (
                    <>
                      <tr>
                        <td
                          colSpan="7"
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

                          {item.version > 1 && (
                            <p>
                              Response Letter: {item.responseLetterName}{" "}
                              <DownloadButton
                                conferencePDA={item.pk}
                                conferenceId={item.conferenceId}
                                paperHash={item.responseLetterHash}
                                paperName={item.responseLetterName}
                              />
                            </p>
                          )}

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
                            Approval:{" "}
                            {getPaperStatus(
                              item.reviewer.find(
                                (r) => r.tpcWallet.toString() === walletAddress
                              ).approval
                            )}
                          </p>
                          <p>
                            Feedback:{" "}
                            {
                              item.reviewer.find(
                                (r) => r.tpcWallet.toString() === walletAddress
                              ).feedback
                            }
                          </p>

                          <p>
                            Feedback Submitted On:{" "}
                            {
                              item.reviewer.find(
                                (r) => r.tpcWallet.toString() === walletAddress
                              ).feedbackSubmittedDatetime
                            }
                          </p>

                          <p>
                            Payout by the Organiser :{" "}
                            {getPaidOutStatus(
                              item.reviewer.find(
                                (r) => r.tpcWallet.toString() === walletAddress
                              ).paidout
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

      case "chairViewPaperReviewedHistory":
        return (
          <Table responsive={true}>
            <thead className="text-center">
              <tr>
                <th style={{ width: "1%" }}> </th>
                <th style={{ width: "15%" }}>Conference</th>
                <th style={{ width: "10%" }}>Paper ID</th>
                <th style={{ width: "30%" }}>Paper Title</th>
                <th style={{ width: "5%" }}>Version</th>
                <th style={{ width: "15%" }}>Approval</th>
                <th style={{ width: "25%" }}>Feedback</th>
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
                      className="accordion-title align-middle pr-0 mr-0 "
                      onClick={() => toggleActive(index)}
                    >
                      <RiArrowDownSLine
                        className="accordion-arrow "
                        size={25}
                      />
                    </td>

                    <td className="accordion-title align-middle text-center">
                      <a
                        className="link-info"
                        href={`/conferences/${item.pk.toString()}?conferenceId=${item.conferenceId.toString()}`}
                      >
                        {item.conferenceName}{" "}
                      </a>
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {item.paperId}
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {item.paperTitle}
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {item.version}
                    </td>

                    <td
                      className="accordion-title align-middle text-center"
                      onClick={() => toggleActive(index)}
                    >
                      {getPaperStatus(item.paperChair.approval)}
                    </td>

                    <td className="accordion-title align-middle text-center">
                      {item.paperChair.feedback}
                    </td>
                  </tr>
                  {activeIndexes.includes(index) && (
                    <>
                      <tr>
                        <td
                          colSpan="7"
                          className="text-monospace accordion-content "
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

                          {item.version > 1 && (
                            <p>
                              Response Letter: {item.responseLetterName}{" "}
                              <DownloadButton
                                conferencePDA={item.pk}
                                conferenceId={item.conferenceId}
                                paperHash={item.responseLetterHash}
                                paperName={item.responseLetterName}
                              />
                            </p>
                          )}

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
                            Approval: {getPaperStatus(item.paperChair.approval)}
                          </p>
                          <p>Feedback: {item.paperChair.feedback}</p>
                          <p>
                            Feedback Submitted On:{" "}
                            {item.paperChair.feedbackSubmittedDatetime}
                          </p>

                          <p>
                            Payout by the Organiser :{" "}
                            {getPaidOutStatus(item.paperChair.paidout)}
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
    }
  };

  return <>{tableToDisplay()}</>;
}