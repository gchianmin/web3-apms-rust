import "../styles/globals.css";
import React from "react";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import NavBar from "../components/NavBar";

export default function App({ Component, pageProps }) {
  return (
      <UserProvider>
        <NavBar />
        <Component {...pageProps} />
      </UserProvider>
  );
}
