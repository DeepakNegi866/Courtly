import { signOut } from 'next-auth/react'
import React from 'react'
import styles from '@/styles/403.module.css'

const UnAuthorized = () => {
  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/" }); // Ensure signOut redirects properly
    } catch (err) {
      router.push("/"); // If signOut fails, manually redirect
    }
  };
    
  return (
    <>
    
    <div className={`container ${styles.sesssionexpiredSection} d-flex flex-column align-items-center justify-content-center`}>
  <img src="/assets/images/Screenshot 2024-12-09 112718.png" alt="" className="img-fluid" />
  <h1 className={styles.sessionExpireheading}>You are not authorized</h1>
  <p className={styles.sessionexpirePara}>
    Your session has expired. Please log in again to continue.
  </p>
  <div className="d-flex justify-content-center">
    <button type="button" className="commonButton" onClick={handleSignOut}>
      Sign Out
    </button>
  </div>
</div>

   
    </>
  )
}

export default UnAuthorized