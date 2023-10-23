---
sidebar_position: 4
---

# 水位线（watermark）

水位线是流处理系统中非常核心的概念之一。数据流是无限的，而水位线给用于给无限的数据流加以限制，引导系统系统更高效的处理数据。水位线消息夹杂在数据流中，每一个 `watermark` 都带有一个时间戳，代表该时间戳之前的数据都全部到达。
RisingWave 允许用户在 `source` 和 `append only table` 的时间列上定义水位线策略，RisingWave 会根据表达式定义在流中注入水位线。对于后续低于水位线迟到的数据，RisingWave 会过滤丢弃掉。

举例来说，如下的 SQL 定义的表，在 `time` 列上定义了水位线策略，每当表中插入 `time = t` 的数据，就会注入时间为 `t - INTERVAL '5' SECOND` 的水位线，后续 `time` 大于该值的记录都会被丢弃。

```SQL
CREATE TABLE t (
    v int,
    time TIMESTAMP,
    WATERMARK FOR time AS time - INTERVAL '5' SECOND
) APPEND ONLY;
```

那么 RisingWave 是利用水位线的呢？

一方面，RisingWave 的流处理引擎在一些查询中可以借助水位线进行状态清理，控制内部计算状态的大小，避免内部状态的无限制的增长而导致性能下降。不过注意到，这里所说的状态清理仅限于计算引擎内部的状态，不会影响物化视图内部的数据。关于物化视图内数据的清理请看[`temporal filter`](./temporal_filter.md).

另一方面，RisingWave 在 Watermark 和时间窗口的基础上定义了 [`EMIT ON WINDOW CLOES`(EOWC)](./eowc.md) 的语义。借助 watermark，计算引擎确保窗口内的数据不会再发生变更，在此时触发计算并输出结果能够获得更好的性能，并输出仅追加（append only）的结果流。

<!-- ## 代码示例 -->