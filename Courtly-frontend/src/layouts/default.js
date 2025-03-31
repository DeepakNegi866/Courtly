import Footer from '@/components/footer'
import Header from '@/components/header'
import React from 'react'

const DefaultLayout = ({children}) => {
  return (
    <>
    <Header/>
    {children}
    <Footer/>
    </>
  )
}

export default DefaultLayout