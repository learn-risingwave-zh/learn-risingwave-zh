---
sidebar_position: 7
---

# 表结构变更（schema change）

表结构变更（schema change）在数据库中尤为重要。在生产环境中，我们每几周或者每几个月就可能会经历一次表结构变更。由于流处理系统经常被作为数据库系统的下游系统来使用，因此如何响应上游数据库的表结构变更，对于流处理系统来说是个常见问题。

RisingWave 本身是个流处理系统，也是个数据库，因此其不仅要考虑如何处理上游数据库的表结构变更，也需要考虑自己的表结构如何变更。作为下游系统，RisingWave 在同步上游系统的表时允许用户手动指定所需的列，因此并不会自动同步上游系统的表结构变更，需要手动通过 [`ALTER TABLE`](https://docs.risingwave.com/docs/dev/sql-alter-table/) 语法进行变更。

为了更好的理解 RisingWave 如何处理表结构变更，我们假设一个 RisingWave 实例上游为一个 PostgreSQL 数据库。 RisingWave 通过 CDC 方式连接同步了 PostgreSQL 数据库上的一张表。该表在 PostgreSQL 中名为 `table_pg`，在 RisingWave 中名为 `table_rw`。我们再在 `table_rw` 上创建了一个物化视图 `mv_rw`。

### 添加列（add column）

为避免该新增列出现数据丢失，用户需要**首先**在 `table_rw` 中添加该列，并可选地为所有的历史数据设置它的默认值。然后，在 `table_pg` 中添加该列后，即可导入新数据。

RisingWave 中现有的物化视图（例如 `mv_rw`）等流任务**不会**自动变更并引用这一新增的列。用户必须创建新的物化视图等流任务来引用它。在未来，RisingWave 将支持物化视图的在线查询变更，用户将有机会避免重建这些流任务。

### 删除列（drop column）

用户可以按任意顺序从 `table_rw` 与 `table_pg` 中删除该列。

如果该列被某物化视图（如 `mv_rw`）等流任务引用，则从 `table_rw` 删除列的请求将被拒绝。用户需要删除所有引用该列的流任务，方可从 `table_rw` 删除该列。另一个选择是不在 `table_rw` 中删除该列，则此后所有的记录中该列将被自动填 NULL，不影响现有物化视图等流任务的运行。
