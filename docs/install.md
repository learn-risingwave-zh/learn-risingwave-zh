---
sidebar_position: 2
---

# 安装与启动

## 安装模式

RisingWave 有以下几种安装模式：

- **单机试玩模式（[官方文档](https://docs.risingwave.com/docs/current/risingwave-trial/?method=overview)）**：如果你只是想学如何使用 RisingWave，那么单机试玩模式应该能够满足基本需求。但是单机试玩模式并不支持一些复杂功能，如 Change Data Capture (CDC) 等，且不可用于生产环境；

- **单机 Docker Compose 部署模式（[官方文档](https://docs.risingwave.com/docs/current/risingwave-trial/?method=docker-compose)）**：单机 Docker 部署模式功能齐全，但如果希望在生产环境使用，仍需要三思。毕竟，如果物理机器宕机，会直接导致系统不可用或数据丢失；

- **集群 Kubernetes 部署模式（[官方文档](https://docs.risingwave.com/docs/dev/risingwave-kubernetes/)）**：集群 Kubernetes 部署是最为推荐的生产环境部署模式。

|  | 耗时 | 功能集 | 生产环境使用？ |
| :: | :: | :: | :: |
|  [单机试玩模式](https://docs.risingwave.com/docs/current/risingwave-trial/?method=overview)   |  5 分钟      | 局限 | 否 |
|  [单机 Docker Compose 部署模式](https://docs.risingwave.com/docs/current/risingwave-trial/?method=docker-compose)  | 10-20 分钟        | 完整 | 是，但请三思 |
|  [集群 Kubernetes 部署模式](https://docs.risingwave.com/docs/dev/risingwave-kubernetes/)  | 不定        | 完整 | 是，推荐 |

## 安装方法

由于本教程的目的是让大家了解并使用 RisingWave，因此我们选用 **单机试玩模式**。整个安装验证过程**仅需 5 分钟**。注意，单机试玩版本为纯内存模式，在闲置30分钟后会自动停止。


### 下载安装
**Docker 环境**
```shell
docker run -it --pull=always -p 4566:4566 -p 5691:5691 risingwavelabs/risingwave:latest playground
```

**Mac 环境**
```shell
brew tap risingwavelabs/risingwave
brew install risingwave
risingwave playground
```

**Ubuntu 环境**
```shell
wget https://github.com/risingwavelabs/risingwave/releases/download/v1.3.0/risingwave-v1.3.0-x86_64-unknown-linux.tar.gz
tar xvf risingwave-v1.3.0-x86_64-unknown-linux.tar.gz
./risingwave playground
```

到此，RisingWave 已经安装并启动运行了。

### 使用 `psql` 连接
```shell
psql -h localhost -p 4566 -d dev -U root
```

`psql` 为 PostgreSQL 官方命令行客户端。可以使用以下命令安装：
```shell
sudo apt update
sudo apt install postgresql-client
```

### 快速验证
我们创建一个表格与一个物化视图，看看 RisingWave 是否正常运行。
```sql
create table t(v1 int, v2 int);
insert into t values(1,10),(2,20),(3,30);
create materialized view mv as select sum(v1) from t;
```

此时我们查询创建的物化视图：
```sql
select * from mv;
```

应该能看到结果：
```sql
 sum
-----
   6
(1 row)
```

再向表格中插入两行数据：
```sql
insert into t values(4,40),(5,50);
```

再查询物化视图：
```sql
select * from mv;
```

结果应该已经被更新：
```sql
 sum
-----
  15
(1 row)
```

以上就是最简单的程序，来验证 RisingWave 是否可以正确运行。用户应该可以在物化视图内永远看到最新的、有一致性保证的结果。
