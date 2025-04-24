import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import { toast } from 'react-toastify';
import formStyle from  "@/styles/loginPage.module.css";
import {Court8, Lock, LoginBtn} from "@/utils/icons";

const LoginPage = () => {
    const { register, formState:{errors}, handleSubmit } = useForm();
    const [isLoading,setIsLoading] = useState(false)
    const router = useRouter();

     

    const handleLogin = async(data) =>{
    if(isLoading) return null;
    const {userName:email,password} = data;
    setIsLoading(true);
      try{
        const res = await signIn("credentials",{email,password, redirect:false})
        if(res.error){
          return toast.warn("Invalid credentials.");
        }
        toast.success("Logged in successfully.")
        return router.replace("/management/dashboard");
      }
      catch(error){
        toast.warn("Invalid credentials.");
      }
      finally{
        setIsLoading(false);
      }
    }
    return (
        <>
           
            <section className={formStyle.formbackground}>
      <div className='container'>
        <div className='row'>
          <div className='col-lg-5 mx-auto'>
     <>
     < div className={formStyle.formbox}>
       <form onSubmit={handleSubmit(handleLogin)}>
        <span className={formStyle.formLogo}>
            <img src="/assets/images/digicaseLogo.jpeg" alt="" className="img-fluid"/>
          </span>
          <div className={formStyle.formUser}>
          <span className={formStyle.formIcon}> 
              <Court8 color="white"/>
            </span>
              <input
              type="text"
              placeholder="Username"
              className={formStyle.formGroup}
              {...register("userName",{
                required:"This field is required"
              })}
              />
              
          </div>
          {errors.userName && <div className='text-danger mt-2'>{errors.userName.message}</div>}
          <div className={formStyle.formUser}>
          <span className={formStyle.formIcon}> 
            <Lock color="white"/>
            </span>
            <input type="password"
              placeholder="Password"
              className={formStyle.formGroup}
              {...register("password",{
                required:"This field is required",
              })}
            />
            
            </div>
            {errors.password && <div className='text-danger mt-2'>{errors.password.message}</div>}
            <div className={`form-group remember-me ${formStyle.formRember}`}>
                <input type="checkbox" className={formStyle.formcheck}
                />
                <label>Remember me</label>
            </div>

            <div className={`text-center pt-1 mb-5 pb-1${formStyle.formButn}`}>
            <button type="submit" className="commonButton btn mt-4" disabled={isLoading ? true : false}>{isLoading ? "Please wait.." : "Login"}
            <span className={formStyle.formBTN}>
              <LoginBtn/>
            </span>
            </button>
            </div>
        </form>
      </div>
     </>
    </div>
    </div>
    </div>
    </section>
        </>
    )
}  

export async function getServerSideProps(context) {
    const session = await getServerSession(context.req, context.res, authOptions)
  
    if (!session) {
      return {
        props: {
          session,
        },
      }
    }
  
    return {
      redirect: {
        destination: "/management/dashboard",
        permanent: false,
      },
    }
  }

export default LoginPage