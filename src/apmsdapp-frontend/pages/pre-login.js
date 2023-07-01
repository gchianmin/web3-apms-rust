import React from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";

export default function PreLogin() {
  return (
    <>
      <Header props={`ConfMan - What's it?`} />
      <div className="text-center pt-5">
        <Image src="/confman.png" alt="Logo" width={400} height={300} priority />

        <p className="lead hero pb-5 pt-4">
          ConfMan - an academic conference management system is a web3 dApp built on Solana
          blockchain.
        </p>

        <div className="d-flex justify-content-center d-grid col-4 mx-auto">
          <Link
            className="btn btn-block btn-primary mr-4 btn-alignment"
            href="/main"
            role="button"
          >
            View Conferences
          </Link>
          <Link
            className="btn btn-block btn-info mt-0 btn-alignment"
            href="/api/auth/login"
            role="button"
          >
            Login
          </Link>
        </div>
      </div>
    </>
  );
}
