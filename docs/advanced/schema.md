---
sidebar_position: 5
---

# 表结构变更（schema change）

**【建设中】**

表结构变更（schema change）在数据库中尤为重要。在生产环境中，我们每几周或者每几个月就可能会经历一次表结构变更。由于流处理系统经常被作为数据库系统的下游系统来使用，因此如何响应上游数据库的表结构变更，对于流处理系统来说是个常见问题。

RisingWave 本身是个流处理系统，也是个数据库，因此其不仅要考虑如何处理上游数据库的表结构变更，也需要考虑自己的表结构如何变更。

为了更好的理解 RisingWave 如何处理表结构变更，我们假设一个 RisingWave 实例上游为一个 PostgreSQL 数据库。 RisingWave 通过 CDC 方式连接同步了 PostgreSQL 数据库上的一张表。该表在 PostgreSQL 中名为 `table_pg`，在 RisingWave 中名为 `table_rw`。我们再在 `table_rw` 上创建了一个物化视图 `mv_rw`。我们讨论以下几种情况：

* 用户在 `table_pg` 中添加了一个列


* 用户在 `table_pg` 中删除了一个列
** 该列会影响物化视图

** 该列不会影响任何物化视图
