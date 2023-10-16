---
sidebar_position: 1
---

# 内部状态管理

流处理系统连续不断的对数据流进行流计算。其设计核心在于如何管理连续计算过程中的内部状态。RisingWave 使用远端对象存储（如 S3 等）持久化状态，并使用计算节点的本地内存与磁盘进行缓存。RisingWave 的内部状态存储称之为 Hummock。Hummock 为 LSM tree 结构。Hummock 中的压缩（compaction）过程会不断将数据排序并持久化到远端对象存储上。

传统流处理系统，如 Apache Flink、KsqlDB 等流处理系统，都采用的是存算耦合架构，即内部状态存储放在计算节点本地，与计算紧耦合；RisingWave 采用的是存算分离架构，即内部状态存储放在远端，与计算分离。存算分离的优点在于存储与计算能够分别进行扩缩容。存算分离的缺点在于存储放在远端可能导致性能下降。为了最小化存算分离带来的性能下降，RisingWave 在计算节点本地做了缓存。绝大部分状态访问均会落在缓存上，保证系统高性能。


如 Apache Flink、KsqlDB 等，使用 RocksDB 在计算节点本地存储内部状态。RocksDB 与 Hummock 均为 LSM tree 结构，但 RocksDB 为单机存储，而 Hummock 为云原生分层结构存储。

RisingWave 在设计早期曾考虑过使用 RocksDB 管理内部状态，但是由于各种原因否决了该方案。具体原因包括但不限于：
* RocksDB 单机存储改为云存储会带来巨大工作量；
* RocksDB 的压缩（compaction）过程可能会严重影响计算性能，将其拆成单独模块会带来巨大工作量；
* RocksDB 带有各种 RisingWave 不需要的概念、功能与设计，可能对整体性能产生负面影响；
* RocksDB 为通用存储，其并不感知 RisingWave 计算种类与进度，因此需要 RisingWave 传递额外信息。为更好与计算配合，通用存储并不适合。

