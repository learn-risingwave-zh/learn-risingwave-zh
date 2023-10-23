---
sidebar_position: 6
---

# 时间过滤器（temporal filter）

RisingWave 处理的数据流是无限的。但在不少情况下，用户只对最近一段时间（比如过去1小时、1天、1周）内的数据感兴趣，此时存储和处理不需要的过期数据往往不必要，并且浪费了很多资源。在其他一些系统中往往允许用户定义生存时间 (TTL，Time-To-Live) 来淘汰过期数据，但定义较为模糊，淘汰的具体时间不明确，用户也很难精准指明需要淘汰的目标状态。RisingWave 在 SQL 中提供了 temporal filter 的语法来帮助用户淘汰过期数据。

temporal filter 在 SQL 中表示为一个的谓词过滤条件，条件中包含`now()`和源表中的一个时间列的不等关系。

例如如果只想处理一周内的数据，可以这样写：
```sql
CREATE MATERIALIZED VIEW MV AS
SELECT * FROM sales 
WHERE sale_date > NOW() - INTERVAL '1 week';
...