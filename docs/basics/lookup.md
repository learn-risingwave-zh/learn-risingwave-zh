---
sidebar_position: 3
---

# 数据查询与可视化

RisingWave 与传统数据库一样，可以存储数据，并允许用户对数据进行随机查询。 不过需要特别注意的是，RisingWave 的 `source` 不会持久化数据，也不能被用户直接进行随机查询（基于 Kafka 的 `source` 除外）。主要原因还是数据所有权相关的数据一致性与性能问题。
有兴趣的读者可以查阅[之前章节](../basics/ingestion)的讨论。

| 功能 | `table` | `source` | 物化视图 |
| :: | :: | :: | :: |
| 支持随机查询<br />（select 语句）    | 是       | **否** | 是|
| 支持连续查询<br />（create materialized view 语句）   | 是        | 是 | 是|

在生产环境中，RisingWave 被广泛应用到实时报表中。用户可以使用各种报表工具，如 [Apache Superset](https://docs.risingwave.com/docs/current/superset-integration/)、[Grafana](https://docs.risingwave.com/docs/current/grafana-integration/) 等，与 RisingWave 对接。

如果你所使用的报表工具并没有列在 RisingWave 官方文档中，也可以直接尝试 PostgreSQL 协议来连接到 RisingWave。这是因为 RisingWave 与 PostgreSQL 协议兼容，因此 PostgreSQL 生态中的系统大多能够与 RisingWave 直接联通。
