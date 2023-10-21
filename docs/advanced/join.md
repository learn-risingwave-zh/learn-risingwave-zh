---
sidebar_position: 2
---

# 关联关系（join）

在本文我们聊聊如何在 RisingWave 内对数据流做关联关系。

在使用传统数据库时，用户可以在：
* 表（`table`）与表
* 表与物化视图
* 物化视图与物化视图

之间做随机关联关系查询。与传统数据库相比，RisingWave 不仅支持这类随机查询，
而且还支持连续流计算。而由于 RisingWave 还支持 `source`，用户实际可以在表、物化视图、`source`三者之间做关联关系。

举个例子。假设我们有以下定义：

```sql
create table t1 with (...);
create table t2 with (...);
create source s1 with (...);
create source s2 with (...);
create materialized view mv1 as select ...;
create materialized view mv2 as select ...;
```

那我们可以做以下随机查询：
```sql
select ... from t1, t2 where ...;
select ... from t1, mv1 where ...;
...
```

而以下查询不被允许：
```sql
select ... from t1, s1 where ...;
select ... from s1, mv1 where ...;
```

原因很简单，正如我们在[之前章节](../basics/ingestion)所提到的，RisingWave 的 `source` 不会持久化数据，因此不能被用户直接进行随机查询。

以下连续流计算均可被支持：
```sql
create materialized view m1 as 
	select ... from t1, t2 where ...;
create materialized view m2 as 
	select ... from t1, mv1 where ...;
create materialized view m3 as 
	select ... from t1, s1 where ...;
create materialized view m4 as 
	select ... from s1, mv1 where ...;
```

有了这些基本概念，我们开始探究一下 RisingWave 所支持的关联关系种类。

## 常用关联关系

在 PostgreSQL 中，最常用的关联关系包括：

* Inner join
* Left join
* Right join
* Full outer join
* Natural Join
* Cross Join
* Self Join

RisingWave 支持对所有这些关联关系进行随机查询，但并不支持对部分关联关系进行连续查询。为什么？
原因是，在流计算中，带有 nested loop join 的查询复杂度过高，导致性能过差，且较少真实使用场景，因此不能支持。


|  | 支持随机查询<br />（select 语句） | 支持连续查询<br />（create materialized view 语句） |
| :: | :: | :: |
|  Inner join   | 是       | `join` 条件必须为等于 |
|  Left join  | 是        | `join` 条件必须为等于 |
|  Right join  | 是        | `join` 条件必须为等于 |
|  Full outer join  | 是        | `join` 条件必须为等于 |
|  Natural join  | 是        | 是 |
|  Corss join  | 是        | 否 |
|  Self join  | 是        | `join` 条件必须为等于 |

如果用户的确想在流计算查询中使用非等于关联关系，则可以考虑使用[动态过滤（dynamic filtering）](https://docs.risingwave.com/docs/current/sql-pattern-dynamic-filters/)。


<!-- ## 代码示例 -->
