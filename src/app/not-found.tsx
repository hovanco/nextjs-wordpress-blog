"use client";
import Head from "next/head";
import Link from "next/link";
const NotFound = () => {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
        <meta name="googlebot" content="noindex" />
        <title>404 - Page Not Found</title>
      </Head>
      <main id="page-not-found">
        <div className="container">
          <div className="not-found-content">
            <h1 className="text-title">Uh-Oh...</h1>
            <p className="text-content">
              The page you are looking for may have been moved,
              <br />
              deleted, or possibly never existed.
            </p>
            <p className="text-404">404</p>
            <Link className="btn-home" href="/">
              Go To Home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};
export default NotFound;
