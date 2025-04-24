import React, { useRef} from 'react';
import { Rating } from 'react-simple-star-rating';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import homepageStyle from "@/styles/homepageStyle.module.css";
import {ChevronRight, RightArrow,GRGTDET, ChevronLeft, FacebookIcons, TwitterIcon, InstagramIcons, LinkdinIcons, YoutubeIcons, PhoneIcons, EmailIcons, LocationIcons} from "@/utils/icons";
import DefaultLayout from '@/layouts/default'

const HomePage = () => {
  const sliderRef = useRef(null);
  const settings = {
    centerMode: true,
    centerPadding:0,
    centerPadding: '60px',
    slidesToShow: 3,
    arrows:false,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          centerMode:true,
          centerPadding: '40px',
          slidesToShow: 3
        }
      },
      {
        breakpoint: 480,
        settings: {
          arrows: false,
          centerMode: false,
          centerPadding: '40px',
          slidesToShow: 1
        }
      }
    ]}

    return (
  <>
  <section className='container'>
    <div className='row justify-content-between'>
      <div className='col-lg-5'>
        <img src="\assets\images\AnimationLogo.gif" alt="" className="img-fluid"/>
        
         <h1 className={homepageStyle.homeHeading}>Transforming Legal</h1>
         <div className={`d-flex ${homepageStyle.homePageFlex}`}>
         <h1 className={homepageStyle.homeHeading}>Operations</h1>
         <div className={homepageStyle.homeGraidentHeadingLine}></div>
         </div>
          <p className={homepageStyle.homePara}>Harnessing Technology for Enhanced Practice Management Solutions in Law Firms and Legal Teams</p>
           <div className={`mb-5`}>
           <button type="button" className={`btn ${homepageStyle.homePageButton}`}>Read More
                 <span className={homepageStyle.homeSpanButton}><ChevronRight/></span>
              </button>
            </div>
          </div>
      <div className='col-lg-5 p-4'>
          <img src="/assets/images/Lawyer1.png" alt="" className='img-fluid'/>
      </div>
    </div>
</section>

<section className={homepageStyle.homeFeatures}>
  <div className='container'>
     <div className={homepageStyle.homeGraidentHeadingWrapper}>
       <div className={homepageStyle.homeGraidentHeadingPrevLine}></div>
        <h2 className={homepageStyle.homeGraidentHeading}>
          All the features you want
        </h2>
        <div className={homepageStyle.homeGraidentHeadingNextLine}></div>
      </div>      
       <p className={homepageStyle.homeParagraph}>
       Manage My Lawsuits manages cases, legal matter, client relationships and teamwork.
       It empowers you and/or your team to be even more efficient, saves you a lot of time, and enhances team collaboration as well as client and advocate relationships. 
       It can serve as your virtual office, allowing you to allocate work, take notes, check hearing dates and keep tabs on teamwork anywhere, anytime from an internet-enabled device. Here is a look at some of the capabilities of the case management software:
       </p>
       <div className='row'>
        <div className='col-lg-4'>
        <div className={`card ${homepageStyle.homePageCardBord}`}>          
       <div className={homepageStyle.homePageCardPage}>        
          <div className={homepageStyle.homeCard}>
          <img src="\assets\images\Animation1731735974731.gif" alt="" className="img-fluid"/>
          </div>
            <h1 className={homepageStyle.homePageCardHeading}>Case or Matter Management</h1>
            <p className={homepageStyle.homeShortTimeParagraph}>Our case management system has made managing information easier than ever before. Create a case in just a few seconds. The case will create its activity stream as you keep adding information, making updates and attaching documents.
             Everything comes together seamlessly to provide the big picture systematically.</p>
             <div className={`mb-3 ${homepageStyle.homePageCardButton}`}>         
                <button type="button" className={`commonButton btn ${homepageStyle.homePageButton}`}>Read More
                  <span className={homepageStyle.homeSpanButton}><ChevronRight/></span>
                </button>
              </div>        

            </div>
          
        </div>
      </div>
      <div className='col-lg-4'>
      <div className={`card ${homepageStyle.homePageCardBord}`}>          
       <div className={homepageStyle.homePageCardPage}>        
          <div className={homepageStyle.homeCardImg}>
          <img src="\assets\images\Animation - 1731736243422.gif" alt="" className="img-fluid"/>
          </div>
            <h1 className={homepageStyle.homePageCardHeading}> Customized Cause List</h1>
            <p className={homepageStyle.homeShortTimeParagraph}>Generate your High Court cause list in PDF format with just one click. Our legal solutions make creating lists fast and efficient. Easily segregate cases listed in different courts. You can also generate cause lists for your team. 
            Empower everyone to track the schedule of cases to manage their work with utmost efficiency.</p>
             <div className={`mb-3 ${homepageStyle.homeButtonCard}`}>         
                <button type="button" className={`commonButton btn ${homepageStyle.homePageButton}`}>Read More
                  <span className={homepageStyle.homeSpanButton}><ChevronRight/></span>
                </button>
              </div>        

            </div>
          
        </div>
      </div>
      <div className='col-lg-4'>
        <div className={`card ${homepageStyle.homePageCardBord}`}>          
       <div className={homepageStyle.homePageCardPage}>        
          <div className={homepageStyle.homeCard}>
          <img src="\assets\images\Animation1731735974731.gif" alt="" className="img-fluid"/>
          </div>
            <h1 className={homepageStyle.homePageCardHeading}>Case or Matter Management</h1>
            <p className={homepageStyle.homeShortTimeParagraph}>Our case management system has made managing information easier than ever before. Create a case in just a few seconds. The case will create its activity stream as you keep adding information, making updates and attaching documents.
             Everything comes together seamlessly to provide the big picture systematically.</p>
             <div className={`mb-3 ${homepageStyle.homePageCardButton}`}>         
                <button type="button" className={`commonButton btn ${homepageStyle.homePageButton}`}>Read More
                  <span className={homepageStyle.homeSpanButton}><ChevronRight/></span>
                </button>
              </div>        

            </div>
          
        </div>
      </div>
       </div>
    </div>
</section>

<section className='container'>
      <div className={homepageStyle.homeGraidentHeadingWrapper}>
      <div className={homepageStyle.homeGraidentHeadingPrevLine}></div>
      <h2 className={homepageStyle.homeGraidentHeading}>
        Who we are
      </h2>
      <div className={homepageStyle.homeGraidentHeadingNextLine}></div>
      </div>
      <div className='row'>
      <div className='col-lg-4'>
        <img src="\assets\images\Law firm 1.png" alt="" class="img-fluid"/>
      </div>
      <div className='col-lg-8'>
        <div className={homepageStyle.homeShort}>
          <h2 className={homepageStyle.homeShortTime}>
          We’ve Come a Long Way in a Short Time
          </h2>
          <p className={homepageStyle.homeShortTimePara}>
           Manage My Lawsuits (MML) is a product of the digital age, purpose-designed for Indian lawyers, law firms, and legal departments. Our web-based case management software provides solutions to the
           challenges faced in organizing, streamlining, and effectively utilizing the dynamic information that advocates and law firms handle each day.</p>
          <p className={homepageStyle.homeShortTimePara}>
             We have a deep passion for technology and extensive knowledge of the Indian judicial system as well as the administrative and productivity challenges faced by legal professionals.
             MML is our answer to your question, ‘how can I do this in a faster, simpler, and better way?’.</p>
        
        
        <div className={`mb-5`}>         
        <button type="button" className={`btn ${homepageStyle.homePageButton}`}>Read More
                 <span className={homepageStyle.homeSpanButton}><ChevronRight/></span>
              </button>
        </div>
      </div>
      </div>
      </div>
</section>

<section className={homepageStyle.homePadding}>
  <div className='container'>
    <div className={homepageStyle.homeGraidentHeadingWrapper}>
    <div className={homepageStyle.homeGraidentHeadingPrevLine}></div>
      <h2 className={homepageStyle.homeGraidentHeading}>
      Our recent clients
      </h2>
      <div className={homepageStyle.homeGraidentHeadingNextLine}></div>
    </div>

  <div className={homepageStyle.homeMultiCarusel}>
   <div className={homepageStyle.homePhoto}>
    <img src="\assets\images\Seal_of_Maharashtra@2x (1).png" alt="" className="img-fluid"/>
   </div>
   <div className={homepageStyle.homePhoto}>
    <img src="\assets\images\Seal_of_Maharashtra@2xghh.png" alt="" className="img-fluid"/>
   </div>
   <div className={homepageStyle.homePhoto}>
    <img src="\assets\images\gkm-associatesgfhgf.png" alt="" className="img-fluid"/>
   </div>
   <div className={homepageStyle.homePhoto}>
    <img src="\assets\images\m3m-logo@2xjkjk.png" alt="" className="img-fluid"/>
   </div>
   <div className={homepageStyle.homePhoto}>
    <img src="\assets\images\mml-case-02.png" alt="" className="img-fluid"/>
   </div>
   <div className={homepageStyle.homePhoto}>
    <img src="\assets\images\Seal_of_Maharashtra@2x.png" alt="" className="img-fluid"/>
   </div>
  </div>
  </div>
</section>

<section className={homepageStyle.homeFeatures}>
  <div className='container'>
    <div className='row'>
      <div className='col-lg-6'>
        <h2 className={homepageStyle.homeGrowFaster}>
        Grow faster with Digital Case management
        </h2>
        <p className={homepageStyle.homeShortTimePara}>
        Lorem ipsum dolor sit amet consectetur. Turpis egestas phasellus enim arcu. Sed nunc cras nisl ac.
        Id pellentesque cursus consequat at aliquet eleifend risus. Vitae ultrices scelerisque.
        </p>
        <div className={homepageStyle.homeShortArrow}>
          <div className={homepageStyle.homeShortList}>
          <span><RightArrow/></span>
          <p className={homepageStyle.homeShortTimePara}>
          Lorem ipsum dolor sit amet consectetur. Venenatis ut ornare congue.
          </p>
          </div>
          <div className={homepageStyle.homeShortList}>
          <span><RightArrow/></span>
          <p className={homepageStyle.homeShortTimePara}>
          Lorem ipsum dolor sit amet consectetur. Tellus.
          </p>
          </div>
          <div className={homepageStyle.homeShortList}>
          <span><RightArrow/></span>
          <p className={homepageStyle.homeShortTimePara}>
          Lorem ipsum dolor sit amet consectetur. Leo enim donec.
          </p> 
          </div>        
        </div>
        <div className={`mb-5`}>         
        <button type="button" className={`btn ${homepageStyle.homePageButton}`}>Read More
                 <span className={homepageStyle.homeSpanButton}><ChevronRight/></span>
              </button>
        </div>
      </div>
      <div className='col-lg-6'>
      <img src="\assets\images\Generating new leads (1) 1jghj.png" alt="" className="img-fluid"/>
      </div>
      
    </div>
  </div>
  
</section>

<section className='container-fluid'>
  <div className={homepageStyle.homeGraidentHeadingWrapper}>
    <div className={homepageStyle.homeGraidentHeadingPrevLine}></div>
      <h2 className={homepageStyle.homeGraidentHeading}>
       Testimonials
      </h2>
      <div className={homepageStyle.homeGraidentHeadingNextLine}></div>
    </div>
    <h2 className={homepageStyle.homeTestimonials}>
      What our client says
    </h2>
</section>
{/* Carousel */}
<section className={homepageStyle.testimonialCarouselWrapper}>
<Slider {...settings} ref={sliderRef}>
      <div className={homepageStyle.homePageCard}>
      <span className={homepageStyle.homePageHead}>
        <GRGTDET/>
      </span>
          <h2 className={homepageStyle.homeCarouselHeading}>Lorem ipsum 
        dolor sit amet consectetur.</h2>
          <p className={homepageStyle.homeCarouselPara}>Lorem ipsum 
  dolor sit amet consectetur. Turpis egestas phasellus enim arcu. Sed nunc cras nisl ac.</p>
          <hr className={`${homepageStyle.homeHr}`}/>
          <div className={homepageStyle.ratingWrapper}>
            <Rating
            readonly
            initialValue={4}
            size={21}
            allowFraction={true}/>
            <h3 className={homepageStyle.homeJohndoe}>@johndoe</h3>
        </div>
        </div>

        <div className={homepageStyle.homePageCard}>
      <span className={homepageStyle.homePageHead}>
        <GRGTDET/>
      </span>
          <h2 className={homepageStyle.homeCarouselHeading}>Lorem ipsum 
        dolor sit amet consectetur.</h2>
          <p className={homepageStyle.homeCarouselPara}>Lorem ipsum 
  dolor sit amet consectetur. Turpis egestas phasellus enim arcu. Sed nunc cras nisl ac.</p>
          <hr className={`${homepageStyle.homeHr}`}/>
          <div className={homepageStyle.ratingWrapper}>
            <Rating
            readonly
            initialValue={4}
            size={21}
            allowFraction={true}/>
            <h3 className={homepageStyle.homeJohndoe}>@johndoe</h3>
        </div>
        </div>
        
        <div className={homepageStyle.homePageCard}>
      <span className={homepageStyle.homePageHead}>
        <GRGTDET/>
      </span>
          <h2 className={homepageStyle.homeCarouselHeading}>Lorem ipsum 
        dolor sit amet consectetur.</h2>
          <p className={homepageStyle.homeCarouselPara}>Lorem ipsum 
  dolor sit amet consectetur. Turpis egestas phasellus enim arcu. Sed nunc cras nisl ac.</p>
          <hr className={`${homepageStyle.homeHr}`}/>
          <div className={homepageStyle.ratingWrapper}>
            <Rating
            readonly
            initialValue={4}
            size={21}
            allowFraction={true}/>
            <h3 className={homepageStyle.homeJohndoe}>@johndoe</h3>
        </div>
        </div>
  
        <div className={homepageStyle.homePageCard}>
      <span className={homepageStyle.homePageHead}>
        <GRGTDET/>
      </span>
          <h2 className={homepageStyle.homeCarouselHeading}>Lorem ipsum 
        dolor sit amet consectetur.</h2>
          <p className={homepageStyle.homeCarouselPara}>Lorem ipsum 
  dolor sit amet consectetur. Turpis egestas phasellus enim arcu. Sed nunc cras nisl ac.</p>
          <hr className={`${homepageStyle.homeHr}`}/>
          <div className={homepageStyle.ratingWrapper}>
            <Rating
            readonly
            initialValue={4}
            size={21}
            allowFraction={true}/>
            <h3 className={homepageStyle.homeJohndoe}>@johndoe</h3>
        </div>
        </div>

        <div className={homepageStyle.homePageCard}>
      <span className={homepageStyle.homePageHead}>
        <GRGTDET/>
      </span>
          <h2 className={homepageStyle.homeCarouselHeading}>Lorem ipsum 
        dolor sit amet consectetur.</h2>
          <p className={homepageStyle.homeCarouselPara}>Lorem ipsum 
  dolor sit amet consectetur. Turpis egestas phasellus enim arcu. Sed nunc cras nisl ac.</p>
          <hr className={`${homepageStyle.homeHr}`}/>
          <div className={homepageStyle.ratingWrapper}>
            <Rating
            readonly
            initialValue={4}
            size={21}
            allowFraction={true}/>
            <h3 className={homepageStyle.homeJohndoe}>@johndoe</h3>
        </div>
        </div>
        </Slider>
        <div className='container'>
        <div className={homepageStyle.buttonsWrapper}>
        <button id="prevButton"
         className={homepageStyle.carouselButton}
         onClick={() => sliderRef.current.slickPrev()} >
        <ChevronLeft  width="8" height="8"/>
        </button>
        <button id="nextButton"
         className={homepageStyle.carouselButton}
         onClick={() => sliderRef.current.slickNext()} >
        <ChevronRight color="#1D0093" width="8" height="8"/>
        </button>
      </div>
      </div>
      </section>
  

    <section>
      <div className='container'>
        <div className='row'>
          <div className='col-lg-10 mx-auto'>
            <div className='row'>
          <div className={homepageStyle.homeTryDigicase}>
          <div>
          <h2 className={homepageStyle.homeGraidentHeading}>
            Try Digikase Lorem ipsum dolor sit amet
          </h2>
        </div>
        </div>
        <div className='col-lg-6'>    
       <p className={homepageStyle.homeTryParagraph}>
       Lorem ipsum dolor sit amet consectetur. Turpis egestas phasellus enim arcu. Sed nunc cras nisl ac. 
       Id pellentesque cursus consequat at aliquet eleifend risus. Vitae ultrices scelerisque.
       </p>
       </div>
       <div className='col-lg-6'>
       <div className={`input-group mb-3 ${homepageStyle.homeSearch}`}>
        <input className={`form-control ${homepageStyle.homeInput}`} type="text" placeholder="Your email here"/>
          <button type="button" className={`commonButton btn ${homepageStyle.homeButton}`}>Read More
            <ChevronRight/>
          </button>
        </div>        
      </div>
            </div>
          </div>
        </div>
      </div>
    </section>
</>                
 )
}

HomePage.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;

export default HomePage