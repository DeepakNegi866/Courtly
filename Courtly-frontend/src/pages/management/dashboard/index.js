import React from 'react'
import ManagementLayout from "@/layouts/management";

const Dashboard = () => {
  return (
    <div>Dashboard</div>
  )
}

export default Dashboard

Dashboard.getLayout = (page) => <ManagementLayout>{page}</ManagementLayout>;