import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { signOut, useSession } from 'next-auth/react';

const ManagementLayout = ({children}) => {
  const session = useSession();
  const role = session?.data?.user?.role || null;
  const name = session?.data?.user?.name || null;
  
  const router = useRouter();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const checkActive = (path) =>{
    return router.pathname.startsWith(path);
  }

  return (
    <>
    <header >
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <Link className="navbar-brand" href="/">Digicase</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link active" aria-current="page" href="/management/dashboard">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/management/organizations">Organizations</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    </header>
    <div className="container-fluid">
      {children}
    </div> 
    </>
  )
}


export default ManagementLayout