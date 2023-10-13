---
sidebar_position: 1
---

# RisingWave 快速入门

本文的目的是让大家能够在 **5分钟之内** 了解 RisingWave 流数据库是什么，并且如何使用。

## 什么是 RisingWave

RisingWave 是一款流数据库。简单来说，流数据库就是让用户可以用使用数据库的方式来处理流数据，进行连续不断的实时流计算，并提供数据存储与随机查询的功能。

RisingWave 是一款开源（Apache 2.0 协议）分布式流数据库。其与 PostgreSQL 传输协议兼容，也就是说，用户可以像使用 PostgreSQL 一样使用 RisingWave。

**用户可以使用 RisingWave 来进行**：

- 流计算；
- 数据存储；
- 随机查询（尤其是点查）。

**用户不应该使用 RisingWave 来进行**：

- 事务处理；
- 频繁的涉及到全表扫描的复杂查询。

也就是说，**用户可以使用 RisingWave 来替换**：

- 如 Apache Flink、Apache Spark Streaming、KsqlDB 等系统来进行流处理；
- 如 Apache Flink + Cassandra / Redis / DynamoDB 这样的系统组合。

**而不应该使用 RisingWave 替换**：

- 如 PostgreSQL、MySQL、TiDB 等系统来进行事务处理；
- 如 ClickHouse、Apache Doris 等系统来进行复杂分析查询；
- 如 ElasticSearch 等系统来进行全文搜索。

## RisingWave 解决的流处理痛点

市面上已经有了一些知名的开源流处理系统，如 Apache Flink、Apache Spark Streaming 等。那为什么我们需要使用 RisingWave？

RisingWave 解决了以下几个常见的流处理系统痛点：

### 学习曲线陡峭

现有流处理系统几乎都有很陡峭的学习曲线，不光入门难，在入门之后学习核心概念、使用高阶技巧也很难。

### 资源使用率低

### 多流 join 低效

### 大状态管理难

### 动态扩缩容难

### 检查点间隔过大

### 结果验证困难

### 结果查询架构复杂





## RisingWave 的缺陷

相比于 Apache Flink、Apache Spark Streaming 等流处理系统，RisingWave 最大的缺陷在于其**不支持 Java、Python 等可编程接口**。

不少 Apache Flink、Apache Spark Streaming 的资深用户选择使用了 Java、Python 等接口来进行编程。如果已有代码逻辑过于复杂、无法使用 SQL 改写，那么可能就不适合使用 RisingWave。

当然，RisingWave 支持 Python / Java 等语言的 UDF。因此，如果你的程序可以使用 UDF 来表示，那么还是可以选用 RisingWave 的。

## RisingWave 与 Flink SQL


Get started by **creating a new site**.

Or **try Docusaurus immediately** with **[docusaurus.new](https://docusaurus.new)**.

### What you'll need

- [Node.js](https://nodejs.org/en/download/) version 16.14 or above:
  - When installing Node.js, you are recommended to check all checkboxes related to dependencies.

## Generate a new site

Generate a new Docusaurus site using the **classic template**.

The classic template will automatically be added to your project after you run the command:

```bash
npm init docusaurus@latest my-website classic
```

You can type this command into Command Prompt, Powershell, Terminal, or any other integrated terminal of your code editor.

The command also installs all necessary dependencies you need to run Docusaurus.

## Start your site

Run the development server:

```bash
cd my-website
npm run start
```

The `cd` command changes the directory you're working with. In order to work with your newly created Docusaurus site, you'll need to navigate the terminal there.

The `npm run start` command builds your website locally and serves it through a development server, ready for you to view at http://localhost:3000/.

Open `docs/intro.md` (this page) and edit some lines: the site **reloads automatically** and displays your changes.
