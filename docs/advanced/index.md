---
sidebar_position: 1
---


# 索引（index）

在数据库中，用户可以对表创建索引，以此来加速查询。RisingWave 中的索引基本与传统数据库中的索引一样，是为了加速随机查询。用户可以在**表与物化视图**上构建索引。



## 创建索引语法:

```sql
CREATE INDEX index_name ON object_name ( index_column [ ASC | DESC ], [, ...] )
[ INCLUDE ( include_column [, ...] ) ]
[ DISTRIBUTED BY ( distributed_column [, ...] ) ];
```

## 代码示例

假定我们有一张客户表和一张订单表,表结构定义如下

```sql
CREATE TABLE customers (
    c_custkey INTEGER,
    c_name VARCHAR,
    c_address VARCHAR,
    c_nationkey INTEGER,
    c_phone VARCHAR,
    c_acctbal NUMERIC,
    c_mktsegment VARCHAR,
    c_comment VARCHAR,
    PRIMARY KEY (c_custkey)
);

CREATE TABLE orders (
    o_orderkey BIGINT,
    o_custkey INTEGER,
    o_orderstatus VARCHAR,
    o_totalprice NUMERIC,
    o_orderdate DATE,
    o_orderpriority VARCHAR,
    o_clerk VARCHAR,
    o_shippriority INTEGER,
    o_comment VARCHAR,
    PRIMARY KEY (o_orderkey)
);
```

如果我们希望通过用户的手机号来查询用户订单,我们可以通过在`c_phone`列上建立索引,来加速查询。

```sql
CREATE INDEX idx_c_phone on customers(c_phone);

SELECT * FROM customers where c_phone = '123456789';

SELECT * FROM customers where c_phone in ('123456789', '987654321');
```


亦或者我们希望通过手机号查询某个用户的所有订单,我们可以在 orders表的 o_custkey 列上建立索引加速join查询。

```sql
CREATE INDEX idx_o_custkey ON orders(o_custkey);

SELECT * FROM customers JOIN orders ON c_custkey = o_custkey 
WHERE c_phone = '123456789';
```

此外RisingWave还支持更复杂的表达式索引,可以方便地使用在Json列或其他包含表达式的场景上,例如:

```sql
CREATE INDEX people_names ON people ((first_name || ' ' || last_name));

SELECT * FROM people WHERE (first_name || ' ' || last_name) = 'John Smith';
```


## 如何选择INCLUDE列

默认情况下，如果您省略 INCLUDE 子句，RisingWave 会创建一个包含表或物化视图所有列的索引，这与标准的 PostgreSQL 有所不同。为什么呢？RisingWave 作为云原生流式数据库的设计，包含与 PostgreSQL 不同的几个关键之处，包括使用对象存储进行更具成本效益的存储，以及希望使索引的创建对于那些不熟悉数据库系统的用户尽可能简单。通过包含所有列，RisingWave 确保索引将覆盖查询所涉及的所有列，并消除了需要在主表中进行查找的需求，这在云环境中由于网络通信而可能较慢。然而，对于希望这样做的用户，RisingWave 仍然提供了使用 INCLUDE 子句仅包含特定列的选项。

例如：

如果您的查询只涉及某些列，您可以创建一个仅包含这些列的索引。RisingWave 优化器将自动为您的查询选择适当的索引。


```sql
-- 创建只包含特定列的索引
CREATE INDEX idx_c_phone1 ON customers(c_phone) INCLUDE (c_name, c_address);

-- RisingWave会自动选择idx_c_phone1索引如果只有特定列在SQL中被使用了
SELECT c_name, c_address FROM customers WHERE c_phone = '123456789';
```

## 如何选择DISTRIBUTED列

如果您省略 DISTRIBUTED BY 子句，RisingWave将默认使用第一个索引列作为分布式列。RisingWave将数据分布在多个节点上，并使用分布式列来确定基于索引如何分布数据。之所以使用索引的第一列作为Distributed列是为了满足前缀查询的需求。但默认的第一列有可能Cardinality值比较小,这有可能会造成数据不均匀,因此你可以选择指定特定的前缀作为DISTRIBUTED列

```sql
-- 创建带有指定前缀的DISTRIBUTED列索引
CREATE INDEX idx_c_phone2 ON customers(c_name, c_nationkey) DISTRIBUTED BY (c_name);

SELECT * FROM customers WHERE c_name = 'Alice';
```
