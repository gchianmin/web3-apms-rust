import React from "react";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import CardComponent from "../components/CardComponent";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { getAllConferences } from "../Common/GetConferences";

export default function Main() {
  const [conferences, setConferences] = useState([]);
  const { user } = useUser();

  // if conferences list != null
  const renderConferencesContainer = () => (
    <>
      <br />
      {Object.keys(conferences).map((key) =>
        [key, conferences[key].account][1].conferences.map((conf) => (
          <>
            <CardComponent
              props={conf}
              pk={conferences[key].publicKey}
              page="main"
            />
            <br />
          </>
        ))
      )}
    </>
  );
  // if conferences list == null
  const renderEmptyContainer = () => (
    <>
      <div className="pl-5 pb-3 font-italic text-muted text-mono">
        <p>No upcoming conferences at the moment. Please check back later!</p>
      </div>
    </>
  );

  useEffect(() => {
    getAllConferences().then((res) => setConferences(res));
    
  }, []);

  return (
    <>
      <Header props={`APMS - Home`} />
      <div className="pl-5 pt-4 pb-3">
        <h2>Upcoming Conferences</h2>
        {user && (
          <Link className="my-4 font-italic text-success" href="/my-conference">
            <br /> → View Conferences Organised by me ←<br />
          </Link>
        )}
        {(conferences.find((c)=> c.account.count != 0)) && renderConferencesContainer()}
      </div>
      {(conferences.filter((c)=> c.account.count == 0).length == conferences.length) && renderEmptyContainer()}
    </>
  );
}
