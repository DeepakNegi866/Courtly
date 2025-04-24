import React, { useState } from "react";
import styles from "@/styles/dashboard.module.css";
import ManagementLayout from "@/layouts/management";
import Breadcrumb from "@/components/breadcrumb";
import ActivityCard from "@/components/activityCard";
import { DangerWhite } from "@/utils/icons";
import { ImportantCases } from "@/utils/icons";
import { RoutineCases } from "@/utils/icons";
import { OtherCases } from "@/utils/icons";
import { NormalCases } from "@/utils/icons";
import Axios from "@/config/axios";
import ApexChart from "@/components/ApexCharts/apexChart";
import Link from "next/link";

const Dashboard = ({ data, caseview }) => {
  const barOption = {
    chart: {
      type: "bar",
      height: "350px",
    },
    plotOptions: {
      bar: {
        borderRadius: 5,
        dataLabels: {
          position: "top",
        },
      },
    },
    xaxis: {
      name: "month",
      categories:
        caseview && Array.isArray(caseview)
          ? caseview.map((item) => item.month)
          : [],
    },
  };

  const barSeries = [
    {
      name: "Cases",
      data:
        caseview && Array.isArray(caseview)
          ? caseview.map((item) => item.count)
          : [],
    },
  ];

  const [options, setOptions] = useState({
    chart: {
      type: "donut",
    },
  });

  const [labels, setLabels] = useState(["A", "B", "C", "D", "E"]);

  const { docs } = data;
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "" },
  ];

  const superCriticalCasesCount =
    data?.supercriticalCases && Array.isArray(data?.supercriticalCases)
      ? data?.supercriticalCases.length
      : 0;

  const criticalCaseCount =
    data?.criticalCases && Array.isArray(data?.criticalCases)
      ? data?.criticalCases.length
      : 0;

  const normalCaseCount =
    data?.normalCases && Array.isArray(data?.normalCases)
      ? data?.normalCases.length
      : 0;

  const pieChartSeries = [
    superCriticalCasesCount,
    criticalCaseCount,
    normalCaseCount,
  ];

  const pieChartHaveData = pieChartSeries.some((num) => num > 0);
  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="activityCardsContainer">
        <div className="row gap-3">
          <div className="col-lg-3 col-xl-3 col-xxl-2 col-md-3 col-sm-6 ">
            <Link
              href="/management/cases?progress=super-critical"
              className="text-decoration-none"
            >
              <ActivityCard
                number={
                  (data?.supercriticalCases &&
                    Array.isArray(data.supercriticalCases) &&
                    data.supercriticalCases.length) ||
                  0
                }
                icon={<DangerWhite />}
                title="Super Critical Cases"
                color="#F11100"
              />
            </Link>
          </div>
          <div className="col-lg-3 col-xl-3 col-xxl-2 col-md-3 col-sm-6">
            <Link
              href="/management/cases?progress=critical"
              className="text-decoration-none"
            >
              <ActivityCard
                number={
                  (data?.criticalCases &&
                    Array.isArray(data.criticalCases) &&
                    data.criticalCases.length) ||
                  0
                }
                icon={<DangerWhite />}
                title="Critical Cases"
                color="#D3BE00"
              />
            </Link>
          </div>
          <div className="col-lg-3 col-xl-3 col-xxl-2 col-md-3 col-sm-6">
            <Link
              href="/management/cases?progress=normal"
              className="text-decoration-none"
            >
              <ActivityCard
                number={
                  (data?.normalCases &&
                    Array.isArray(data.normalCases) &&
                    data.normalCases.length) ||
                  0
                }
                icon={<NormalCases />}
                title="Normal Cases"
                color="#1EB47C"
              />
            </Link>
          </div>
          <div className="col-lg-3 col-xl-3 col-xxl-2 col-md-3 col-sm-6">
          <Link href="/management/cases?progress=archive" className="text-decoration-none">
            <ActivityCard
              number={
                (data?.archiveCases)|| 0
              }
              icon={<NormalCases />}
              title="Archived"
              color="#4287f5"
            />
          </Link>
          </div>
          <div className="col-lg-3 col-xl-3 col-xxl-2 col-md-3 col-sm-6">
          <Link href="/management/cases?progress=close" className="text-decoration-none">
            <ActivityCard
              number={
                (data?.closedCases)|| 0
              }
              icon={<NormalCases />}
              title="Closed"
              color="#1d0093cf"
            />
          </Link>
          </div>

        </div>
      </div>
      <section className={styles.caseDetailStripWrapper}>
        <div className="container-fluid mt-4">
          <div className="row">
            <div className="col-lg-12">
              <div className={styles.caseDetailStripWrapperList}>
                <ul>
                  <li>
                    <span className={styles.caseDetailStripWrapperListHeading}>
                      Running
                    </span>
                    :
                    <span className={styles.caseDetailStripWrapperListValue}>
                      {data?.openCases ? data?.openCases : "00"}
                    </span>
                  </li>
                  <li>
                    <span className={styles.caseDetailStripWrapperListHeading}>
                      Closed
                    </span>
                    :
                    <span className={styles.caseDetailStripWrapperListValue}>
                      {data?.closedCases ? data?.closedCases : "00"}
                    </span>
                  </li>
                  <li>
                    <span className={styles.caseDetailStripWrapperListHeading}>
                      Transferred/Noc
                    </span>
                    :
                    <span className={styles.caseDetailStripWrapperListValue}>
                      00
                    </span>
                  </li>
                  <li>
                    <span className={styles.caseDetailStripWrapperListHeading}>
                      Direction Matters
                    </span>
                    :
                    <span className={styles.caseDetailStripWrapperListValue}>
                      00
                    </span>
                  </li>
                  <li>
                    <span className={styles.caseDetailStripWrapperListHeading}>
                      Order Reserved
                    </span>
                    :
                    <span className={styles.caseDetailStripWrapperListValue}>
                      00
                    </span>
                  </li>
                  <li>
                    <span className={styles.caseDetailStripWrapperListHeading}>
                      Sine Die
                    </span>
                    :
                    <span className={styles.caseDetailStripWrapperListValue}>
                      00
                    </span>
                  </li>
                  <li>
                    <span className={styles.caseDetailStripWrapperListHeading}>
                      Archived
                    </span>
                    :
                    <span className={styles.caseDetailStripWrapperListValue}>
                      00
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.userCaseReview}>
        <div className="container-fluid">
          <div className="row">
            <div className={pieChartHaveData ? "col-md-6" : "col-md-12"}>
              <div className={styles.caseOverview}>
                <h1 className={styles.caseHeading}>Cases Overview Weekly</h1>
                <ApexChart
                  options={barOption}
                  series={barSeries}
                  type="bar"
                  height={360}
                  borderRadius={10}
                />
              </div>
            </div>
            {pieChartHaveData && (
              <div className="col-md-6">
                <div className={styles.CaseStatus}>
                  <h1 className={styles.caseHeading}>Case Status</h1>

                  <ApexChart
                    options={{
                      labels: ["Super Critical", "Critical", "Normal"],
                      colors: ["#F11100", "#D3BE00", "#1EB47C"],
                    }}
                    series={pieChartSeries}
                    type="donut"
                    height={375}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export async function getServerSideProps(context) {
  try {
    const [response, caseview] = await Promise.all([
      Axios.get(`/dashboard/user-dashboard`, {
        authenticated: true,
        context,
      }),
      Axios.get("/dashboard/case-overview", {
        authenticated: true,
        context,
      }),
    ]);
    return {
      props: {
        data: response.data.data,
        caseview: caseview.data.data,
      },
    };
  } catch (error) {
    return {
      props: {
        error: error.message || "Failed to fetch data",
        data: [],
      },
    };
  }
}

Dashboard.getLayout = (page) => <ManagementLayout>{page}</ManagementLayout>;

export default Dashboard;
