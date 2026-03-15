import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div
          className={styles.dot}
          style={
            {
              "--glow-color": "#00f0ff",
              backgroundColor: "#00f0ff",
              boxShadow: "0 0 12px 4px #00f0ff",
            } as React.CSSProperties
          }
        />
        <span className={styles.loadingText}>Loading...</span>
      </div>
    </div>
  );
}
