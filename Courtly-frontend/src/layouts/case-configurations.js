import React from "react";
import managementStyle from "@/styles/management.module.css";
import Link from "next/link";
import ManagementLayout from "./management";
import { Court1, Court2 } from "@/utils/icons";
import { useRouter } from "next/router";

const CaseConfigurationsLayout = ({ children }) => {
  const router = useRouter();
  const checkActive = (route) => {
    return router.pathname === route;
  };
  return (
    <ManagementLayout>
      <section className={managementStyle.commonSidebar}>
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-3">
              <ul className={managementStyle.sideBarMenu}>
                <li
                  className={
                    checkActive("/management/case-configurations/high_courts")
                      ? managementStyle.active
                      : ""
                  }
                >
                  <Link
                    href={"/management/case-configurations/high_courts"}
                    className={managementStyle.sideBarLink}
                  >
                    <Court1 />
                    High Courts
                  </Link>
                </li>

                <li
                  className={
                    checkActive("/management/case-configurations/states")
                      ? managementStyle.active
                      : ""
                  }
                >
                  <Link
                    href={"/management/case-configurations/states"}
                    className={managementStyle.sideBarLink}
                  >
                    <Court2 />
                    States
                  </Link>
                </li>

                <li
                  className={
                    checkActive("/management/case-configurations/districts")
                      ? managementStyle.active
                      : ""
                  }
                >
                  <Link
                    href={"/management/case-configurations/districts"}
                    className={managementStyle.sideBarLink}
                  >
                    <Court2 />
                    Districts
                  </Link>
                </li>
                <li
                  className={
                    checkActive(
                      "/management/case-configurations/high_court_benches"
                    )
                      ? managementStyle.active
                      : ""
                  }
                >
                  <Link
                    href={"/management/case-configurations/high_court_benches"}
                    className={managementStyle.sideBarLink}
                  >
                    <Court2 />
                    High Court Benches
                  </Link>
                </li>

                <li
                  className={
                    checkActive(
                      "/management/case-configurations/district_courts"
                    )
                      ? managementStyle.active
                      : ""
                  }
                >
                  <Link
                    href={"/management/case-configurations/district_courts"}
                    className={managementStyle.sideBarLink}
                  >
                    <Court2 />
                    District Courts
                  </Link>
                </li>

                {/* <li
                  className={
                    checkActive("/management/case-configurations/commissions") ? managementStyle.active : ""
                  }
                >
                  <Link href={"/management/case-configurations/commissions"} className={managementStyle.sideBarLink}>
                    <Court2 />
                    Commissions
                  </Link>
                </li> */}

                <li
                  className={
                    checkActive(
                      "/management/case-configurations/commission_states"
                    )
                      ? managementStyle.active
                      : ""
                  }
                >
                  <Link
                    href={"/management/case-configurations/commission_states"}
                    className={managementStyle.sideBarLink}
                  >
                    <Court2 />
                    Commission States
                  </Link>
                </li>

                <li
                  className={
                    checkActive(
                      "/management/case-configurations/commission_districts"
                    )
                      ? managementStyle.active
                      : ""
                  }
                >
                  <Link
                    href={
                      "/management/case-configurations/commission_districts"
                    }
                    className={managementStyle.sideBarLink}
                  >
                    <Court2 />
                    Commission Districts
                  </Link>
                </li>

                <li
                  className={
                    checkActive(
                      "/management/case-configurations/commission_benches"
                    )
                      ? managementStyle.active
                      : ""
                  }
                >
                  <Link
                    href={"/management/case-configurations/commission_benches"}
                    className={managementStyle.sideBarLink}
                  >
                    <Court2 />
                    Commission Benches
                  </Link>
                </li>

                <li
                  className={
                    checkActive(
                      "/management/case-configurations/tribunals_and_authorities"
                    )
                      ? managementStyle.active
                      : ""
                  }
                >
                  <Link
                    href={
                      "/management/case-configurations/tribunals_and_authorities"
                    }
                    className={managementStyle.sideBarLink}
                  >
                    <Court2 />
                    Tribunal And Authorities
                  </Link>
                </li>

                <li
                  className={
                    checkActive(
                      "/management/case-configurations/revenue_courts"
                    )
                      ? managementStyle.active
                      : ""
                  }
                >
                  <Link
                    href={"/management/case-configurations/revenue_courts"}
                    className={managementStyle.sideBarLink}
                  >
                    <Court2 />
                    Revenue Courts
                  </Link>
                </li>

                <li
                  className={
                    checkActive(
                      "/management/case-configurations/commissionerate_authorities"
                    )
                      ? managementStyle.active
                      : ""
                  }
                >
                  <Link
                    href={
                      "/management/case-configurations/commissionerate_authorities"
                    }
                    className={managementStyle.sideBarLink}
                  >
                    <Court2 />
                    Commissionerate Authorities
                  </Link>
                </li>

                <li
                  className={
                    checkActive("/management/case-configurations/department")
                      ? managementStyle.active
                      : ""
                  }
                >
                  <Link
                    href={"/management/case-configurations/department"}
                    className={managementStyle.sideBarLink}
                  >
                    <Court2 />
                    Departments
                  </Link>
                </li>

                <li
                  className={
                    checkActive(
                      "/management/case-configurations/department_authorities"
                    )
                      ? managementStyle.active
                      : ""
                  }
                >
                  <Link
                    href={
                      "/management/case-configurations/department_authorities"
                    }
                    className={managementStyle.sideBarLink}
                  >
                    <Court2 />
                    Department Authorities
                  </Link>
                </li>

                <li
                  className={
                    checkActive("/management/case-configurations/lokadalat")
                      ? managementStyle.active
                      : ""
                  }
                >
                  <Link
                    href={"/management/case-configurations/lokadalat"}
                    className={managementStyle.sideBarLink}
                  >
                    <Court2 />
                    Lok Adalat
                  </Link>
                </li>

                <li
                  className={
                    checkActive("/management/case-configurations/case_types")
                      ? managementStyle.active
                      : ""
                  }
                >
                  <Link
                    href={"/management/case-configurations/case_types"}
                    className={managementStyle.sideBarLink}
                  >
                    <Court2 />
                    Case Types
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-lg-9">
              <div className={managementStyle.configurationCard}>
                {children}
              </div>
            </div>
          </div>
        </div>
      </section>
    </ManagementLayout>
  );
};

export default CaseConfigurationsLayout;
