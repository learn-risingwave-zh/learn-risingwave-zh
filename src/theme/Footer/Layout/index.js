import React from "react";
import clsx from "clsx";
import assistantCode from "@site/static/img/assistant_code.jpeg";
import publicCode from "@site/static/img/public_code.jpeg";

import styles from "./styles.module.css";

export default function FooterLayout({ style, links, logo, copyright }) {
  return (
    <footer
      className={clsx("footer", {
        "footer--dark": style === "dark",
      })}
    >
      <div className="container container-fluid">
        <div className={clsx(styles["links-wrapper"])}>
          {links}
          <div className={clsx(styles["qr-code"])}>
            <div>
              <img src={publicCode} alt="wx-group" />
              <p> RisingWave 微信订阅号</p>
            </div>
            <div>
              <img src={assistantCode} alt="wx-group" />
              <p> 社区用户微信交流群</p>
            </div>
          </div>
        </div>

        {(logo || copyright) && (
          <div className="footer__bottom text--center">
            {logo && <div className="margin-bottom--sm">{logo}</div>}
            {copyright}
          </div>
        )}
      </div>
    </footer>
  );
}
