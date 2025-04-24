import Link from "next/link";
import styles from "@/styles/breadcrumb.module.css";

const Breadcrumb = ({ items }) => {
  return (
    <nav aria-label="breadcrumb" className="py-4">
      <ol className={styles.breadcrumb}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={index}
              className={`${styles.breadcrumbItem} ${
                isLast ? styles.active : ""
              }`}
              aria-current={isLast ? "page" : ""}
            >
              {item.href && !isLast ? (
                <Link href={item.href}>{item.label}</Link> // Only render Link if href is present
              ) : (
                <span>{item.label}</span> // Non-clickable breadcrumb (No Link or last item)
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
