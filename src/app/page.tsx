"use client";
import Head from "next/head";
import Blog from "./blog/page";
import Header from "@/components/Header";
import { useEffect, useState } from "react";

export default function Home() {
  return (
    <>
      <Head>
        <title key="pagetitle">Blog Page</title>
        <meta
          name="description"
          content="Blog page - Blog talk about every things "
          key="metadescription"
        />
        {/* <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
          integrity="sha512-srxX+QO+VXUwYSG+tRre+cA5/YyXNxoIG4xFAdGTHamgeHJ8gEzWjZZTrTB85CPf2+Yw1PPjtSGiARZh5A6zJg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        /> */}
      </Head>
      <p>hello</p>
      <Header />
    </>
  );
}
