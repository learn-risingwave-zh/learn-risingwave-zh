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

Inner Join
Left Join
Right Join
Full Outer Join
Natural Join
Cross Join
Self Join

