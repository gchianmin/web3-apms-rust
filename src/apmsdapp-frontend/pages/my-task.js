import Header from "../components/Header";
import { getPaperPendingReview } from "../Common/GetPapers";
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
import TableList from "../components/TableList";
import AccordionTable from "../components/AccordionTable";
import { useRouter } from "next/router";
import {
  checkIfWalletIsConnected,
  connectWallet,
} from "../Common/WalletConnection";
import { withPageAuthRequired, useUser } from "@auth0/nextjs-auth0/client";

function MyTask() {
  const router = useRouter();
  const { user } = useUser();
  console.log("mytask page");
  const [paperToReview, setPaperToReview] = useState([]);
  const [walletAddress, setWalletAddress] = useState(null);

  const getPapersToBeReviewed = async () => {
    try {
      const res = await getPaperPendingReview(user.email);
      console.log(res);
      setPaperToReview(res);
    } catch (error) {
      console.log("error in my-task page", error);
    }

    // setPaperToReview(res)
  };

  useEffect(() => {
    if (!router.isReady) return;
    checkIfWalletIsConnected().then((res) => setWalletAddress(res));
    getPapersToBeReviewed();
  }, [router.isReady]);

  // const TableList = (list) => {
  //     console.log(typeof(list))

  // const data = list.map(
  //     (info) => {
  //         return (
  //             <tr key={info.name}>
  //                 <td>{info.name}</td>
  //                 {/* <td>{info.createdOn}</td> */}
  //             </tr>
  //         )
  //     }
  // )
  // return(
  //     <Table hover>
  //         <thead>
  //             <tr>
  //                 <th>Conference</th>
  //                 {/* <th>Uploaded On</th> */}
  //                 {/* <th>Expiration Date</th> */}
  //                 {/* <th>Link</th>
  //                 <th>Action</th> */}
  //             </tr>
  //         </thead>
  //         <tbody>
  //             {data}
  //         </tbody>
  //     </Table>
  // )

  // }

  // const displayPapersToBeReviewed = ( myMap ) =>(
  //       <div>
  //         {Array.from(myMap).map(([key, value]) => (
  //         //   <div key={key}>{`${key}: ${JSON.stringify(value)}`}</div>
  //         // value.map(val => <div>{val.name}</div>)
  //         // value.map(val =>
  //         <>
  //         <TableList list={value} key={key}/>
  //         </>
  //         // )

  //         ))}
  //       </div>
  // )

  return (
    <>
      <Header props={`Pending Tasks`} />
      <div className="pl-5 pt-4 pb-3"></div>
      <h2>Tasks pending your action</h2>
      <p>
        This page shows the tasks assigned to you eg pending payment or papers
        pending for your reviews
      </p>
      {/* <button type="button" onClick={getPapersToBeReviewed}>click</button> */}
      {/* <p> Conference that you are a TPC:</p>
         <p>testinig</p>
         {conf && displayPapersToBeReviewed(conf)}
         {console.log(conf)} */}
      {paperToReview && (
        <AccordionTable
          props={JSON.stringify(paperToReview)}
          action="reviewerViewPaperPendingReviewed"
          walletAddress={walletAddress}
        />
      )}
    </>
  );
}

export default withPageAuthRequired(MyTask);
