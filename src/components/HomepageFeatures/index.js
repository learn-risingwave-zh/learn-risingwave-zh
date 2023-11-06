import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

const LeftImage = () => {
  return (
    <img
      style={{ height: "200px" }}
      src={require("../../../static/img/ease-of-use.png").default}
      alt="left"
    />
  );
};

const MidImage = () => {
  return (
    <img
      style={{ height: "200px", padding: "20px" }}
      src={require("../../../static/img/efficient.png").default}
      alt="mid"
    />
  );
};

const RightImage = () => {
  return (
    <img
      style={{ height: "200px" }}
      src={require("../../../static/img/open.png").default}
      alt="right"
    />
  );
};

const FeatureList = [
  {
    title: "易用",
    Image: <LeftImage />,
    description: (
      <>
        RisingWave 让用户以使用 PostgreSQL 的方式来进行流处理，
        大幅降低学习门槛，以及开发、运维负担。
      </>
    ),
  },
  {
    title: "高效",
    Image: <MidImage />,
    description: (
      <>
        RisingWave
        让不同流计算任务充分共享资源，并采用存算分离架构管理中间状态，
        使得复杂流计算高效、稳定、有保障。
      </>
    ),
  },
  {
    title: "开放",
    Image: <RightImage />,
    description: (
      <>
        RisingWave 采用 Apache 2.0 协议开源， 并与云生态以及 PostgreSQL
        生态拥有丰富集成， 让用户轻松建设现代实时数据栈。
      </>
    ),
  },
];

function Feature({ Image, title, description }) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">{Image}</div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
