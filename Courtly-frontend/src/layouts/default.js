import React from 'react';
import styles from "@/styles/defaultLayout.module.css";
import { LoginBtn, FacebookIcons, TwitterIcon, InstagramIcons, LinkdinIcons, YoutubeIcons, PhoneIcons, EmailIcons, LocationIcons, Dropdown } from '@/utils/icons';

const DefaultLayout = ({children}) => {
  return (
    <>
    <header className={styles.home}>
      <nav className="navbar navbar-expand-lg">

          <div className="container">
            
          <img src="/assets/images/digicaseLogo.jpeg" alt="" className={`img-fluid ${styles.headerLogo}`}/>
           <div>
            <div className={`collapse navbar-collapse ${styles.headerNav}`} id="navbarSupportedContent">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className={`nav-item dropdown ${styles.headerLi}`}>
                    <a className={`nav-link  ${styles.headerLi}`}  href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                     Features
                    <Dropdown color="#000000A6"/>

                    </a>
                <ul className="dropdown-menu">
                 <li><a  className={`dropdown-item ${styles.headerLi}`}  href="#"></a></li>
                 <li><a  className={`dropdown-item ${styles.headerLi}`} href="#"></a></li>
                </ul>
                  </li>
                  <li className="nav-item"> 
                    <a className={`nav-link ${styles.headerLi}`} href="#">Testimonials</a>
                  </li>               
                  <li className="nav-item"> 
                   <a className={`nav-link ${styles.headerLi}`} aria-current="page" href="#">Case Studies</a>
                  </li>
                  <li className="nav-item"> 
                    <a className={`nav-link ${styles.headerLi}`} href="#">Blog</a>
                   </li>
                   <li className="nav-item"> 
                     <a className={`nav-link ${styles.headerLi}`} aria-current="page" href="#">About us</a>
                    </li>
                    <li className="nav-item"> 
                      <a className={`nav-link ${styles.headerLi}`} aria-current="page" href="#">Contact us</a>
                    </li>
                </ul>
                <button type="button" className={`btn ${styles.headerButton}`} >Sign in
                  <span className="ms-2">
                   <LoginBtn/>
                  </span>
                </button>
            </div>
           </div>
        </div>
      </nav>
      </header>
    <hr className='mt-0'/>
    {children}



  <footer className={styles.homeFooter}>      
    <div className='container'>
      <div className='row'>
        <div className='col-lg-4'>
        <div className={styles.homePageWrapperDigicase}>
        <h2 className={styles.homeFooterHeading}>
          Digikase 
        </h2>
        <div className={styles.homeGraidentHeadingNext}></div>
      </div>
        </div>
      </div>
      <div className='row'>
        <div className='col-lg-2'>
          <h2 className={styles.homePageFooter}>
            Features
            </h2> 
            <ul className={styles.homePageUl}>          
              <li className={styles.homePageLi}>
              <a className={styles.homeFeatWrapper} href="#"> Feature 1</a></li>
              <li className={styles.homePageLi}>
              <a className={styles.homeFeatWrapper} href="#"> Feature 2</a></li>
              <li className={styles.homePageLi}>
              <a className={styles.homeFeatWrapper} href="#">Feature 3</a></li>
              <li className={styles.homePageLi}>
              <a className={styles.homeFeatWrapper} href="#">Feature 4</a></li>
              <li className={styles.homePageLi}>
              <a className={styles.homeFeatWrapper} href="#">Feature 5</a></li>
              </ul>
        </div>
        <div className='col-lg-2'>
        <h2 className={styles.homePageFooter}>
           Quick Links
        </h2>
        <ul className={styles.homePageUl}>
              <li className={styles.homePageLi}>
              <a className={styles.homeFeatWrapper} href="#">Testimonials</a></li>
              <li className={styles.homePageLi}>
              <a className={styles.homeFeatWrapper} href="#"> Case Studies</a></li>
              <li className={styles.homePageLi}>
              <a className={styles.homeFeatWrapper} href="#">Blog</a></li>
              <li className={styles.homePageLi}>
              <a className={styles.homeFeatWrapper} href="#">About us</a></li>
              <li className={styles.homePageLi}>
              <a className={styles.homeFeatWrapper} href="#">Contact us</a></li>
              </ul>
        </div>

        <div className='col-lg-5'>
          <h2 className={styles.homePageFooter}>
            Digikase
          </h2>
          <p className={styles.homeFeatWrapper}>We are on a mission to help lawyers, law firms, coporates & legal departments,
           Lorem ipsum dolor sit amet consectetur. Turpis egestas phasellus enim arcu. Sed nunc cras nisl ac. 
          Id pellentesque cursus consequat at aliquet eleifend risus. Vitae ultrices scelerisque.</p>
          <p className={styles.homeIcons}>
          <a href="#"><FacebookIcons/></a>
          <a href="#"> <TwitterIcon/></a>
          <a href="#"><InstagramIcons/></a>
          <a href="#"><LinkdinIcons/></a>
          <a href="#"> <YoutubeIcons/></a>
          </p>
        </div>

        <div className='col-lg-3'>
          <h2 className={styles.homePageFooter}>
            Connect with us
          </h2>
          <div className={styles.homeWrapperIcon}>
            <LocationIcons/>
          <p className={styles.homePageFeatWrapper}>
            Lorem ipsum dolor sit amet consectetur. Nunc arcu eu scelerisque pellentesque.
          </p>
          </div>
          <div  className={styles.homePhoneWrapperIcon}>
            <PhoneIcons/>
          <a className={styles.homePageFeatWrapper} href="#">+91  1234567890</a>
          <a className={styles.homePageNumWrapper} href="#">+91  1234567890</a>
          </div>
          <div  className={styles.homeWrapperIcon}>
            <EmailIcons/>    
          <a className={styles.homePageFeatWrapper} href="#">digikase@gmail.com </a>
          </div>
        </div>
      </div>
      </div>
      <hr className={styles.homePageHrWrapper}/>
      <div className='container-fluid'>
        <div className='row'>
      <div className='col-lg-4 text-start' >
        <div className={styles.homePageWrapperCopyleft}>
       <p>© Copyright Digikase, 2024.All Rights Reserved.</p>
        </div>
      </div>
      <div className='col-lg-4 text-center'>
        <div className={styles.homePageWrapperCopycenter}>
        <p>Designed & Developed by <a className={styles.homePageFeatures} href='' >GIKS India PVT LTD</a></p>
        </div>
      </div>
      <div className="col-lg-4 text-end">
        <div className={styles.homePageWrapperCopyright}>
        <p><a className={styles.homePageFeatures} href='' >Privacy Policy</a> </p>
        <p> <a className={styles.homePageFeatures} href='' >Terms & Conditions</a></p>
        </div>
        
      </div>
    </div>
      </div>
    </footer>
    </>
  )
}

export default DefaultLayout