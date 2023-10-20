---
sidebar_position: 4
---

# 数据更新与删除

与传统数据库一样，RisingWave 支持表内数据更新与删除。同时，当表内数据更改或删除时，建立在该表上的
物化视图也会随之被更新。

几个细节值得注意：

* `table` 上的数据可以被更新或者删除，即便这个 `table` 是通过 `create table ... with ...` 语句创建的。当然，由于 RisingWave 不支持事务，用户需要格外小心数据正确性；

* `source` 不存放任何数据，因此用户也不能对 `source` 进行任何更新或者删除操作；

* 物化视图上的数据不可被用户直接更新或删除，这与传统数据库的设计一样。

## 代码示例

我们来快速验证一下 RisingWave 中物化视图如何处理上游删除或修改操作。

我们首先创建一个表 `t` 以及一个物化视图 `mv`：

```sql
CREATE TABLE t (v1 int, v2 int);
insert into t values (1,10), (2,20), (3,30);
CREATE MATERIALIZED VIEW mv as select sum(v1) as v1_sum, sum(v2) as v2_sum from t;
```

这时候我们看一下物化视图中的结果是多少：
```sql
select * from mv;
```

我们得到以下结果：
```sql
 v1_sum | v2_sum
--------+--------
      6 |     60
(1 row)
```

我们再增加两行数据：
```sql
insert into t values (4,40), (5,50);
```

再来看一下物化视图结果：
```sql
select * from mv;
```

应该得到结果：
```sql
 v1_sum | v2_sum
--------+--------
     15 |    150
(1 row)
```

删除三行数据：
```sql
delete from t where v1 <= 3;
```

查看物化视图结果：
```sql
select * from mv;
```

应该得到结果：
```sql
dev=> select * from mv;
 v1_sum | v2_sum
--------+--------
      9 |     90
(1 row)
```
