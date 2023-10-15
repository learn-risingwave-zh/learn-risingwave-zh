---
sidebar_position: 1
---

# 集群部署

如果希望将 RisingWave 部署在生产环境中，我们**强烈建议**使用 Kubernetes 模式部署。

尽管使用 Docker Compose 方式也能部署完整功能的 RisingWave，但是在生产环境中，大家一般强调系统高可用、水平扩展等功能。
使用 Docker Compose 方式部署并不能够满足这些需求。

当然，如果你所需要的就是单机版 RisingWave，并且理解单机宕机以及资源不足的风险，那么仍然可以使用 Docker Compose 方式。

由于集群部署涉及知识较为专业，请读者参考最新版官方 [Kubernetes](https://docs.risingwave.com/docs/current/risingwave-kubernetes/) 与 [Docker Compose](https://docs.risingwave.com/docs/current/risingwave-trial?method=docker-compose) 部署文档。