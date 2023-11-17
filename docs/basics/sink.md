---
sidebar_position: 5
---

# 数据导出

一些用户希望使用 RisingWave 做流计算，然后将计算后的结果导出到下游系统中去。这是常见的流式 ETL 场景。

在 RisingWave 中，用户可以直接使用 [`CREATE SINK` 语句](https://docs.risingwave.com/docs/current/sql-create-sink/)实现数据导出。

## 代码示例

我们现在快速验证一下 RisingWave 导出数据的能力。简单起见，这里我们选用 Apache Kafka 作为导出数据的下游。

### 导出数据

我们首先创建一个 `table` ，并使用 `datagen` 工具导入数据：

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
```

我们来验证一下创建是否成功：

```sql
SHOW TABLES;
```

得到：

```
 Name
------
 t1
(1 row)
```

在创建 `t1` 一段时间后，我们用 `select` 语句查询一下 `t1` ：

```sql
SELECT count(*) FROM t1;
```

### 直接导出数据

首先我们在本地 localhost 启动 Apache Kafka 监听9092端口（Apache Kafka 的本地部署可以通过 Docker Compose 实现，具体步骤这里先略过）， 接下来我们可以通过创建 `sink` 直接把 table 的数据导出到下游：

```sql
CREATE SINK test_sink
FROM t1 
WITH (
        properties.bootstrap.server = 'localhost:9092',
        topic = 'test_sink_topic',
        connector = 'kafka',
				primary_key = 'v1'
)
FORMAT UPSERT ENCODE JSON;
```

这里我们指定了 FORMAT UPSERT ENCODE JSON 来表达 RisingWave 使用 UPSERT 的方式将 JSON 格式的消息输出到下游 Kafka。其中 `primary_key` 里指定了 `v1` 作为下游 Kafka 消息的 key。更多用法详情可以移步 进阶部分

验证一下 sink 是否创建成功：

```sql
SHOW SINKS;
```

得到结果（具体得到的数字可能完全不一样）：

```
Name 
------
 test_sink
(1 rows)
```

在 console 使用工具查询一下 kafka `test_sink_topic` 的内容：

```sql
> kafkacat -b localhost:9092 -C -t test_sink_topic -J                                                                                                                                                                                                                                                      
```

得到结果（数据会持续生产到kafka直到datagen结束）：

```
{"topic":"test_sink_topic","partition":0,"offset":0,"tstype":"create","ts":1700201806289,"broker":-1,"key":"{\"v1\":1}","payload":"{\"v1\":1,\"v2\":7}"}
{"topic":"test_sink_topic","partition":0,"offset":1,"tstype":"create","ts":1700201806289,"broker":-1,"key":"{\"v1\":2}","payload":"{\"v1\":2,\"v2\":5}"}
...

```

当然 RisingWave 也支持将流计算后的结果导出到下游系统，我们可以通过 `CREATE SINK FROM <materialized view>` 或者 `CREATE SINK AS <query>` 来实现。


## 继续阅读

- [连接器 - Sink](/docs/basics/connector.md#sink)：详细了解数据导出格式和导出方法