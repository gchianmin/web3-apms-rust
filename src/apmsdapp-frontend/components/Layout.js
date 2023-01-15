import React from 'react';
import { Container } from 'reactstrap';
import Head from 'next/head';
import NavBar from './NavBar';

export default function Layout({ children })
{
  return (
    <>
      <main className="d-flex flex-column h-100">
        <NavBar />
        <Container className="flex-grow-1 mt-5">{children}</Container>
      </main>
    </>
  )
}