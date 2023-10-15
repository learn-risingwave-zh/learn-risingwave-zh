---
sidebar_position: 5
---

# 数据导出

一些用户希望使用 RisingWave 做流计算，然后将计算后的结果导出到下游系统中去。这是常见的流式 ETL 场景。
在 RisingWave 中，用户可以直接使用 [`create sink` 语句](https://docs.risingwave.com/docs/current/sql-create-sink/)实现数据导出。