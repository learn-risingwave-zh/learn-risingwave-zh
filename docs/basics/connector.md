---
sidebar_position: 6
---

# 连接器（connector）

在将数据导入或者导出RisingWave时，我们需要使用连接器。数据导入和导出的概览可参考[数据导入](/docs/basics/ingestion.md)以及[数据导出](/docs/basics/sink.md)。

## Source

RisingWave 常见的上游数据源系统包括：

- [**消息队列**](#消息队列)，如 Apache Kafka、Apache Pulsar、Redpanda 等等；
- [**操作型数据库（CDC）**](#change-data-capture-cdc)，如 MySQL、PostgreSQL、MongoDB 等等；
- [**存储系统**](#存储系统)，如 AWS S3 等等。

### 消息队列

RisingWave 支持从 Apache Kafka、Apache Pulsar、Redpanda、AWS Kinesis 等消息队列中导入 Avro、Protobuf、JSON、CVS、Bytes 等格式的数据，完整的列表请移步[官方文档](https://docs.risingwave.com/docs/current/sql-create-source/#supported-sources)。

示例：

```sql
CREATE SOURCE IF NOT EXISTS source_abc (
   column1 varchar,
   column2 integer,
)
WITH (
   connector='kafka',
   topic='demo_topic',
   properties.bootstrap.server='172.10.1.1:9090,172.10.1.2:9090',
   scan.startup.mode='latest',
) FORMAT PLAIN ENCODE JSON;
```

消息队列的配置和消费起始位置通过 WITH 中的配置项制定，不同的 connector 有不同的必要和可选配置项。

FORMAT代表数据的组织格式，可选项为：

- `PLAIN` ：无特定的数据格式，可以通过 `source` 和 `table` 的方式导入该格式数据
- `UPSERT` ：UPSERT格式，MQ中消息消费时会依据主键在RisingWave进行UPSERT。为了保证UPSERT的正确性，UPSERT格式的MQ数据只能通过 `table` 的方式导入RisingWave。
- `DEBEZIUM`, `MAXWELL`, `CANAL` , `DEBEZIUM_MONGO` ： 主流CDC格式，MQ中消息消费时会根据对应CDC格式的spec进行处理导入RisingWave。为了保证CDC的正确性，CDC格式的MQ数据只能通过 `table` 的方式导入RisingWave。

ENCODE 代表数据的 encoding，可选项为：

- `JSON`：数据使用JSON序列化的方式存在MQ中，可与所有FORMAT搭配使用
- `AVRO` ：数据使用AVRO序列化的方式存在MQ中，可与所有FORMAT搭配使用
- `Protobuf`：数据使用Profobuf序列化的方式存在MQ中，可与FORMAT PLAIN / UPSERT / CANAL搭配使用
- `CSV`：数据使用CSV序列化的方式存在MQ中，可与FORMAT PLAIN搭配使用
- `Bytes`：数据以RAW BYTES的形式存在MQ中，可与FORMAT PLAIN搭配使用

除此之外，RisingWave 也支持指定 Schema Registry 解析 MQ 中的数据。示例：

```sql
CREATE TABLE IF NOT EXISTS table_abc 
WITH (
   connector='kafka',
   topic='demo_topic',
   properties.bootstrap.server='172.10.1.1:9090,172.10.1.2:9090',
   scan.startup.mode='latest',
   scan.startup.timestamp_millis='140000000'
) FORMAT PLAIN ENCODE AVRO (
   schema.registry = 'http://127.0.0.1:8081'
);
```

指定了 `schema.registry` 后，用户无须在 DDL 中对 table 或 source 进行列定义，RisingWave会自动通过 `shcema.registry` 推导出正确的 schema。值得注意的是，用户依旧可以在DDL中显式指定数据的主键： `CREATE TABLE t1 (PRIMARY KEY(id))`  ，对于 UPSERT 和 CDC 格式的数据，主键默认为 MQ 消息的 key。

### Change Data Capture (CDC)

RisingWave 支持导入上游数据库的 CDC，支持的方式主要有两种：

1. RisingWave 消费消息队列中的 CDC 数据进行数据导入。RisingWave 支持`DEBEZIUM`, `MAXWELL`, `CANAL` 等主流 CDC 格式经由 Apache Kafka, Apache Pulsar 等消息队列导入RisingWave。OLTP 数据库（TiDB、MySQL、PostgreSQL、Oracle等）和 NoSQL 数据库（MongoDB 等）均可通过此方式 CDC 导入 RisingWave。
2. RisingWave 直接连接上游数据库进行数据导入。RisingWave 目前支持 MySQL 和 PostgreSQL 的直连 CDC 导入。

示例1（经由消息队列导入 CDC）：

```sql
CREATE TABLE IF NOT EXISTS mq_cdc
WITH (
   connector='kafka',
   topic='cdc_topic',
   properties.bootstrap.server='172.10.1.1:9090,172.10.1.2:9090',
   scan.startup.mode='earliest'
) FORMAT DEBEZIUM ENCODE AVRO (
   schema.registry = 'http://127.0.0.1:8081'
);
```

示例2（直连 MySQL CDC）：

```sql
CREATE TABLE orders (
   order_id int,
   price decimal,
   PRIMARY KEY (order_id)
) WITH (
 connector = 'mysql-cdc',
 hostname = '127.0.0.1',
 port = '3306',
 username = 'root',
 password = '123456',
 database.name = 'mydb',
 table.name = 'orders',
);
```

方式 1 适合已经建立了基于消息队列进行标准 CDC 采集的用户使用，方式 2 适合未基于消息队列采集 CDC 或希望简化架构的用户使用。不管通过哪种方式来导入 CDC 数据，RisingWave 都可以保证源表的全增量数据正确导入，进而在 RisingWave 中建立物化视图进行流式计算。值得注意的是，RisingWave 正努力拓展直连 CDC 的功能和性能，未来将支持更多的数据库和更多高级特性如全量数据 backfill 断点续传、多表事务等等。

### 存储系统

RisingWave 支持从上游存储系统导入数据，目前支持兼容 S3 协议的存储系统中导入数据。示例：

```sql
CREATE TABLE s(
    id int,
    name varchar,
    age int,
    primary key(id)
) 
WITH (
    connector = 's3_v2',
    s3.region_name = 'ap-southeast-2',
    s3.bucket_name = 'example-s3-source',
    s3.credentials.access = 'xxxxx',
    s3.credentials.secret = 'xxxxx'
) FORMAT PLAIN ENCODE CSV (
    without_header = 'true',
    delimiter = ','
);
```

目前支持 CSV 和 JSON 两种 encoding 的数据从 S3 给定 bucket 中导入。未来 RisingWave 将会支持从更多的上游存储系统中导入数据。

### DML导入

除了通过上面列举的方式从上游不同数据源中流式导入数据，RisingWave 的 table 也支持通过 PostgreSQL DML 的方式插入数据。用户可以通过 `INSERT INTO ...` 插入数据到 RisingWave 的 table，也可尝试通过兼容 PostgreSQL 的批量导入工具进行数据的批量插入。值得注意的是，由于 RisingWave 是一个流式数据库，流式导入是更为推荐的数据导入方式，DML 导入数据是流式导入的一种补充，主要适用于数据订正和低频批量导入的场景。

## Sink

RisingWave 常见的下游系统包括：

- **消息队列**，如 Apache Kafka、Apache Pulsar、Redpanda 等等；
- **数据库**，如 MySQL、PostgreSQL、TiDB、Apache Doris、Starrocks 、Clickhouse 等等；
- **数据湖**，如 Apache Iceberg、Delta Lake 等等；
- **其他系统**，如 ElasticSearch、Cassandra、Redis 等等；

完整列表请移步[官方文档](https://docs.risingwave.com/docs/current/data-delivery/)。

用户可以通过 `CREATE SINK` 的方式将 RisingWave 的数据导出到下游系统。与 SOURCE 类似，用户可以指定 SINK 的数据格式 FORMAT 和 ENCODE。

FORMAT 的可选项为：

- `PLAIN` ：无特定的数据格式，以下游系统支持的格式为准
- `UPSERT` ：UPSERT 格式，导出的数据为带主键的 UPSERT 流
- `DEBEZIUM`： CDC 格式，导出的数据为 DEBEZIUM 格式的 CDC流

ENCODE的可选项为：

- `JSON`：数据使用 JSON 序列化的方式导出
- `AVRO` ：数据使用 AVRO 序列化的方式导出，目前只支持和 UPSERT 格式搭配使用

不同的下游系统有不同的 FORMAT 和 ENCODE 支持，对于数据库和数据湖系统等有明确数据模型的而言， `CREATE SINK` 时不需要额外指定 FORMAT 和 ENCODE，RisingWave 会以下游的数据模型为准进行数据导出。而对于消息队列而言，用户可以按需指定 FORMAT 和 ENCODE。

RisingWave 支持 `CREATE SINK FROM MV/SOURCE/TABLE` 将物化视图和表数据直接导出，也支持 `CREATE SINK AS <query>` 通过 query 选取和变换数据后再进行导出。

### 直接导出物化视图/表数据 (CREATE SINK FROM)

```sql
CREATE SINK sink1 FROM mv_or_table 
WITH (
   connector='kafka',
   properties.bootstrap.server='localhost:9092',
   topic='test'
)
FORMAT PLAIN ENCODE JSON;
```

### 导出 Query 的数据（CREATE SINK AS）

```sql
CREATE SINK sink2 AS 
SELECT 
   avg(distance) as avg_distance, 
   avg(duration) as avg_duration 
FROM taxi_trips
WITH (
   connector='kafka',
   properties.bootstrap.server='localhost:9092',
   topic='test'
)
FORMAT PLAIN ENCODE JSON;
```

值得注意的是，不同的下游系统 SINK 在 CREATE SINK 时有不同的可配置的 WITH 选项，详情请移步具体 SINK 的[官方文档](https://docs.risingwave.com/docs/current/data-delivery/)。
