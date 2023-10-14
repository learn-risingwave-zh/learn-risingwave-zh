---
sidebar_position: 2
---

# 物化视图与流计算

RisingWave 的核心功能是流计算，而流计算在流数据库中的呈现方式就是物化视图。
本章节讲解 RisingWave 物化视图的作用以及使用方法。

## RisingWave 物化视图特性

物化视图并非流数据库独有。实际上，传统数据库如 PostgreSQL，数据仓库如 Redshift 与 Snowflake，
实时分析数据库如 ClickHouse 与 Apache Doris 等，都拥有物化视图能力。

RisingWave 的物化视图与其他数据库的