import React from 'react'
import ManagementLayout from "@/layouts/management";

const UpdateOrganization = () => {
  return (
    <div>UpdateOrganization</div>
  )
}

export default UpdateOrganization

UpdateOrganization.getLayout = (page) => <ManagementLayout>{page}</ManagementLayout>;