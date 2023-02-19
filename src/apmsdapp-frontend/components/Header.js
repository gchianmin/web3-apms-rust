import React from "react";
import Head from "next/head";

export default function Home({ props }) {
  return (
    <>
      <Head>
        <title>{props}</title>
        <meta name="description" content="Academic Paper Management Systen" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.ico" />
      </Head>
    </>
  );
}
