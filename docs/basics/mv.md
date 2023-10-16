---
sidebar_position: 2
---

# 物化视图与流计算

RisingWave 的核心功能是流计算，而流计算在流数据库中的呈现方式就是物化视图。
本章节讲解 RisingWave 物化视图的作用以及使用方法。

## RisingWave 物化视图特性

物化视图并非流数据库独有。实际上，传统数据库如 PostgreSQL，数据仓库如 Redshift 与 Snowflake，
实时分析数据库如 ClickHouse 与 Apache Doris 等，都拥有物化视图能力。但 RisingWave 的物化视图与其他数据库的物化视图有以下几个重要特征：

* **实时性**：不少数据库使用异步方式更新物化视图，或者要求用户手动更新物化视图。而 RisingWave 上的物化视图使用同步方式更新，用户永远可以查询到最新鲜的结果。即便是对于带有 join、windowing 等复杂查询，RisingWave 也能够进行高效同步处理，保证物化视图新鲜度；

* **一致性**：一些数据库仅提供最终一致性的物化视图，也就是说，用户看到的物化视图上的结果只是近似结果，或者是带有错误的结果。而 RisingWave 的物化视图是一致性的，用户看到的结果永远是正确的，而不会看到不一致的结果；

* **高可用**：RisingWave 持久化物化视图，并设置高频率检查点保证快速故障恢复。当搭载 RisingWave 的物理节点宕机时, RisingWave 可以实现秒级恢复，并且在秒级将计算结果更新至最新状态；

* **流处理语义**：在流计算领域里，用户可以使用高阶语法，如时间窗口、水位线等，对数据流进行处理。而传统数据库并不带有这些语义，因此往往用户需要依赖外部系统处理这些语义。RisingWave 是流处理系统，自带各种复杂流处理语义，并可以让用户用 SQL 语句来进行操作。

我们也发现，在一些情况下，用户尽管不需要以上特征，也会使用 RisingWave 物化视图功能。其主要原因是：物化视图是连续不断的流计算，会占用到大量计算资源。为避免物化视图计算干扰到其他计算，一些用户会将物化视图功能转移到 RisingWave 这样的独立系统中处理，从而实现资源隔离。

## 不使用物化视图进行流计算

在 RisingWave 中，尽管物化视图是流计算的重要呈现方式，但这并不意味着用户只能创建物化视图才能进行流计算。
事实上，对于简单的 ETL 计算，也就是仅仅使用 RisingWave 做为流处理管道，将上游系统产生的数据经过加工后发送到下游系统，则可以直接不使用物化视图。
用户可以简单的使用 [`create sink` 语句](https://docs.risingwave.com/docs/current/sql-create-sink/)直接进行流计算并将结果导出。


## 代码示例

相信大家应该都比较熟悉如何在 PostgreSQL 中创建物化视图。在这里，我们展示如何在 RisingWave 中创建堆叠物化视图，即在物化视图上叠加物化视图。

我们希望创建 `table` `t1` 与 `t2` 和 `source` `s1` 与 `s2`，然后在 `t1` 与 `s1` 上创建物化视图 `mv1`， 在 `t2` 与 `s2` 上创建物化视图 `mv2`，再在 `mv1` 与 `mv2` 上创建物化视图 `mv`。

首先创建 `t1` `t2` `s1` `s2`：

```sql
CREATE TABLE t1 (v1 int, v2 int) 
WITH (
     connector = 'datagen',

     fields.v1.kind = 'sequence',
     fields.v1.start = '1',
  
     fields.v2.kind = 'random',
     fields.v2.min = '-10',
     fields.v2.max = '10',
     fields.v2.seed = '1',
  
     datagen.rows.per.second = '10'
 ) ROW FORMAT JSON;

CREATE TABLE t2 (v3 int, v4 int) 
WITH (
     connector = 'datagen',

     fields.v3.kind = 'sequence',
     fields.v3.start = '1',
  
     fields.v4.kind = 'random',
     fields.v4.min = '-10',
     fields.v4.max = '10',
     fields.v4.seed = '1',
  
     datagen.rows.per.second = '10'
 ) ROW FORMAT JSON;

CREATE SOURCE s1 (w1 int, w2 int) 
WITH (
     connector = 'datagen',
  
     fields.w1.kind = 'sequence',
     fields.w1.start = '1',
  
     fields.w2.kind = 'random',
     fields.w2.min = '-10',
     fields.w2.max = '10',
     fields.w2.seed = '1',

     datagen.rows.per.second = '10'
 ) ROW FORMAT JSON;


CREATE SOURCE s2 (w3 int, w4 int) 
WITH (
     connector = 'datagen',
  
     fields.w3.kind = 'sequence',
     fields.w3.start = '1',
  
     fields.w4.kind = 'random',
     fields.w4.min = '-10',
     fields.w4.max = '10',
     fields.w4.seed = '1',

     datagen.rows.per.second = '10'
 ) ROW FORMAT JSON;
```

然后创建 `mv1` 与 `mv2`：

```sql
create materialized view mv1 as select v2, w2 from t1, s1 where v1 = w1;
create materialized view mv2 as select v4, w4 from t2, s2 where v3 = w3;
```

最后再创建 `mv`：

```sql
create materialized view mv as select w2, w4 from mv1, mv2 where v2 = v4;
```

我们来验证一下堆叠物化视图是否有被及时更新。我们反复进行以下查询：

```sql
select count(*) from mv;
```

我们应该会看到结果会不断变动。以下为示例结果：

```sql
 count
-------
  8092
(1 row)
```