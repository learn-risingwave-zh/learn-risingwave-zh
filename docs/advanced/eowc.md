---
sidebar_position: 5
---

# 窗口闭合时触发（EMIT ON WINDOW CLOSE）

在流计算中，由于输入流是无界的，流计算引擎可以有不同的计算触发策略来决定何时计算并输出结果。目前，RisingWave 在在创建物化视图和 Sink 等流计算任务时支持指定两种不同的触发策略：

* **更新时触发（EMIT ON UPDATE）：**  每当上游表变更，就会计算对应结果的变更，这也是不指定触发策略时的默认行为。
* **窗口闭合时触发（EMIT ON WINDOW CLOSE）：** 对于一些带有[时间窗口](./window.md)的查询，如果时间列上有[水位线](./watermark.md)，计算引擎可以通过水位线获知一些时间窗口内的数据在未来不会发生变更，即这些窗口被关闭。`EMIT ON WINDOW CLOSE` 就是只有当窗口关闭时才去计算这些不可变更的数据，由此可以输出 append-only 的结果。

## 代码示例

举例来说，以下 SQL 创建了一个带有 5 秒超时水位线的表，并在表上创建了一个计算每分钟计数的流计算查询，在语句最后的 `EMIT ON WINDOW CLOSE` 就是指定物化视图窗口闭合时触发计算。

```SQL
CREATE TABLE t (
    v1 int,
    v2 int,
    time TIMESTAMP,
    WATERMARK FOR time AS time - INTERVAL '5' SECOND
) APPEND ONLY;

CREATE MATERIALIZED VIEW window_count AS
SELECT 
    window_start, COUNT(*)
FROM TUMBLE(events, event_time, INTERVAL '1' MINUTE)
GROUP BY window_start
EMIT ON WINDOW CLOSE;
```

当表 `t` 新增了一条 `22:01:06` 的数据时，会发出一个值为 `22:01:01` 的水位线信息，在之后表中 `time <= 22:01:01` 的数据都不会再发生改变。此时，会计算 `(21:59:00, 22:00:00)`、`(22:00:00, 22:01:00)` 等 `window_end <= 22:01:00` 的结果。

## 窗口闭合时触发的优势

那么，应当再什么情况下选择窗口闭合时触发呢？主要的应用场景有两个。
* **下游系统要求 append-only：** 一些仅支持追加写的下游系统，比如 Kafka、S3 等不支持删除和更新，此时再创建 Sink 时可以选择窗口闭合时触发来避免删除和更新。
* **更好的性能：** 对于窗口函数、百分位数等一些计算，增量维护往往比较低效，此时使用窗口闭合时触发能够让 RisingWave 在内部进行攒批或把其转换为有界计算。目前针对 SQL 中的 OVER 窗口函数、时间窗口聚合等场景下，使用窗口闭合时触发都可以获得更好的性能。

时间窗口聚合示例:
```SQL
CREATE MATERIALIZED VIEW mv AS
SELECT
    window_start, MAX(v1), SUM(v2)
FROM TUMBLE(events, time, INTERVAL '1 hour')
GROUP BY window_start
EMIT ON WINDOW CLOSE;
```
OVER 窗口函数示例:
```SQL
CREATE MATERIALIZED VIEW mv2 AS
SELECT
    time, v1, v2,
    LEAD(v1, 1) OVER (PARTITION BY v2 ORDER BY time) AS l1,
    LEAD(v1, 3) OVER (PARTITION BY v2 ORDER BY time) AS l2
FROM events
EMIT ON WINDOW CLOSE;
```