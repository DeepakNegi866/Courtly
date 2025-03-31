import React from 'react'
import ManagementLayout from "@/layouts/management";

const Organizations = () => {
  return (
    <div>Organizations List will be here</div>
  )
}

export default Organizations

Organizations.getLayout = (page) => <ManagementLayout>{page}</ManagementLayout>;