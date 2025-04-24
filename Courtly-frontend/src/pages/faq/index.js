import React from 'react'
import ManagementLayout from "@/layouts/management";
const FaqPage = () => {
  return (
    <>
      <section>
        <div className="container pt-5">
            <div className="row">
                <div className="col-md-8 mx-auto">
                <div class="accordion" id="accordionPanelsStayOpenExample">
  <div class="accordion-item mb-3">
    <h2 class="accordion-header">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
      1. What is the procedure to get the reply/response of Notice or Order on digikase.com?
      </button>
    </h2>
    <div id="panelsStayOpen-collapseOne" class="accordion-collapse collapse">
      <div class="accordion-body">
      "Sign up and log into digikase.com, then upload the document under the proper category. Our experienced tax professionals will analyze your submission and work on a timely response, leveraging their expertise in digikase law to assist you effectively."
      </div>
    </div>
  </div>
  <div class="accordion-item mb-3">
    <h2 class="accordion-header">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTwo" aria-expanded="false" aria-controls="panelsStayOpen-collapseTwo">
      2.What if a person do not not know about the given catgories of type of letter/notice/order?
      </button>
    </h2>
    <div id="panelsStayOpen-collapseTwo" class="accordion-collapse collapse">
      <div class="accordion-body">
      "Sign up and log into digikase.com, then upload the document under the proper category. Our experienced tax professionals will analyze your submission and work on a timely response, leveraging their expertise in digikase law to assist you effectively."
      </div>
    </div>
  </div>
  <div class="accordion-item mb-3">
    <h2 class="accordion-header">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseThree" aria-expanded="false" aria-controls="panelsStayOpen-collapseThree">
      3. What happens after uploading the letter/notice/order ?
      </button>
    </h2>
    <div id="panelsStayOpen-collapseThree" class="accordion-collapse collapse">
      <div class="accordion-body">
      "Upon upload, our skilled team reviews your documents and calculates the required fees. With expertise in digikase litigation, we'll inform you of additional steps or documents needed to formulate an authoritative response."
      </div>
    </div>
  </div>
  <div class="accordion-item mb-3">
    <h2 class="accordion-header">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapsefour" aria-expanded="false" aria-controls="panelsStayOpen-collapsefour">
      4.How many days do one need to wait for response?
      </button>
    </h2>
    <div id="panelsStayOpen-collapsefour" class="accordion-collapse collapse">
      <div class="accordion-body">
      "The response time is typically within seven days following payment and all document submission, as our team of trusted experts diligently works to provide you with an accurate and reliable resolution."
      </div>
    </div>
  </div>
  <div class="accordion-item ">
    <h2 class="accordion-header">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseFive" aria-expanded="false" aria-controls="panelsStayOpen-collapseFive">
      5.What to do after getting reply ?
      </button>
    </h2>
    <div id="panelsStayOpen-collapseFive" class="accordion-collapse collapse">
      <div class="accordion-body">
      "Once you receive the expert-crafted reply, you should upload it to the GSTN portal or file it manually as required. Rest assured, our guidance is grounded in expertise, and we're committed to providing trustworthy support throughout the process."
      </div>
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

FaqPage.getLayout = (page) => <ManagementLayout>{page}</ManagementLayout>;

export default FaqPage
