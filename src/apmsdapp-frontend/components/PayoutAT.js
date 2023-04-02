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
import { payoutReviewers } from "../Common/AdminInstructions";

export default function PayoutAT({ props, conference, walletAddress }) {
  const router = useRouter();
  const [filedata, setFileData] = useState(props);
  const [tpc, setTpc] = useState([]);


  // console.log(conference)
  useEffect(() => {
    setFileData(props);
    getTpcList();
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

  const payout = async(conferenceId, conferencePDA, reviewerWalletAddress, amount) => {
    try {
      console.log(conferenceId, conferencePDA, reviewerWalletAddress, amount)
      const res = await payoutReviewers(conferenceId, conferencePDA, reviewerWalletAddress, amount)

      if (res) {
        alert(`payout success with transaction number ${res}`);
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    }
  }

  function PayoutTable(reviewerMap) {
    return (
      <Table responsive={true}>
        <thead className="text-center">
          <tr>
            <th>Reviewer & Wallet Address</th>
            <th>Papers Reviewed</th>
            <th>Rewards</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {[...reviewerMap].map(([key, value]) => (
            <tr key={key}>
              <td >
                {key.split('^').slice(0,3).map(k=> (<>{k}<br/></>))}
              </td>
              <td className="text-center">
                {value.map((val) => (
                  <p>{val}</p>
                ))}
              </td>
              <td className="text-center">{value.length} SOL</td>
              <td className="text-center">
              {!walletAddress && (
                <Button color="success" onClick={connectWallet}>
                  Connect wallet to proceed
                </Button>
              )}
                {key.split('^')[3] == 0 && <Button type="button" className="btn-primary" onClick={()=>payout(conference.conferenceId, conference.conferencePDA, key.split('^')[0], value.length)}>
                  Payout
                </Button>}
                {key.split('^')[3] == 1 && <Button disabled={true} type="button" className="btn-primary" >
                  Payout Completed
                </Button>}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }

  return <>{PayoutTable(filedata)}</>;
}
