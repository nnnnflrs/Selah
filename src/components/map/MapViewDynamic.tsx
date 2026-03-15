"use client";

import dynamic from "next/dynamic";
import styles from "./MapViewDynamic.module.css";

const MapViewDynamic = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingText}>
        Loading globe...
      </div>
    </div>
  ),
});

export default MapViewDynamic;
