---
sidebar_position: 1
---


# 用户定义函数（user-defined function）

在现代的数据处理和分析中，SQL 语言是处理结构化数据的强大工具。然而，随着数据分析的复杂性增加，标准的 SQL 语句和内置函数可能不足以满足所有的数据处理需求。这就引出了 用户定义函数（User Defined Functions，UDF）的概念，它们允许用户使用 Python 等语言来自定义函数，并嵌入到 SQL 语言中以实现更复杂的计算和操作。

## 什么时候需要 UDF

当需要执行标准 SQL 函数无法支持的计算时，UDF 就显得至关重要。这里我们列举一些典型的场景和例子：

- 复杂的数学或统计计算，例如计算两个数的最大公约数。
- 自定义数据转换或验证，例如从网络包中提取信息。
- 需要使用外部服务或资源，例如访问 OpenAI API 生成文本。
- 从已有的系统迁移，例如迁移 Flink UDF 和实现 RisingWave 暂不支持的函数。

需要注意的是，由于涉及跨语言通信和数据转换，UDF 的执行效率相比内置函数要显著低一些。因此用户应当始终优先使用内置函数。

## UDF 的种类

在 RisingWave 中，函数主要可以分为三类：

1. **标量函数（Scalar Functions）**：这些函数接受一行输入并返回一个值。它们类似于 SQL 中的传统函数，以行为单位进行操作。
2. **表函数（Table Functions）**：这些函数接受一行输入并可以返回多行。它们可在查询中作为表使用，适用于拆分、合并或生成数据。
3. **聚合函数（Aggregate Functions）**：这些函数接受一系列行输入并返回一个值。例如 `sum` 或 `avg`，用于数据汇总。

目前，RisingWave 支持自定义标量函数（UDF）和表函数（UDTF），而暂不支持自定义聚合函数（UDAF）。根据我们的经验，大部分需求都可以用 UDF 或 UDTF 实现。如果需要自定义聚合逻辑，可以考虑首先使用内置的 `array_agg` 将其聚合为数组，然后交给 UDF 进行处理。

## 在 RisingWave 中使用 UDF

目前，RisingWave 支持 Python 和 Java 两种语言定义 UDF。它们具有不同的优势，可以根据实际需要进行选择：

- Python：开发部署简单，适合快速实现功能。但是性能可能较低。
- Java：开发部署相对繁琐，但是性能较好。适合计算密集型函数，或者从 Flink 迁移。

总体而言，我们更推荐开发者使用 Python 实现 UDF。

### Python UDF

要使用 Python UDF，请首先确认你的系统中已经安装 Python 3.8 或以上的开发环境。

使用 pip 安装 RisingWave 开发包：

```bash
pip install risingwave
```

创建一个文件并实现你的函数：

```python
# 导入必要的 API
from risingwave.udf import udf, udtf, UdfServer

# 定义一个名为 gcd 的标量函数来计算两个整数的最大公约数
@udf(input_types=['INT', 'INT'], result_type='INT')
def gcd(x, y):
    while y != 0:
        (x, y) = (y, x % y)
    return x

# 定义一个名为 series 的表函数来生成一个整数序列
@udtf(input_types='INT', result_types='INT')
def series(n):
    for i in range(n):
        yield i

# 注册函数并启动 UDF 服务器
if __name__ == '__main__':
    server = UdfServer(location="0.0.0.0:8815") # 可以调整服务器的监听地址
    server.add_function(gcd)
    server.add_function(series)
    server.serve()
```

运行这个 UDF 服务：

```bash
python3 udf.py
```

接下来，我们需要在 RisingWave 中声明函数：

```sql
CREATE FUNCTION gcd(int, int) RETURNS int
AS gcd USING LINK 'http://localhost:8815';

CREATE FUNCTION series(int) RETURNS TABLE (x int)
AS series USING LINK 'http://localhost:8815';
```

创建成功后，我们就可以像其它内置函数一样使用 UDF 了：

```sql
SELECT gcd(25, 15);
----
5

SELECT * FROM series(5);
----
0
1
2
3
4
```

想了解更详细的用法，可以参考 [RisingWave 文档](https://docs.risingwave.com/docs/current/udf-python/)。

### Java UDF

要使用 Java UDF，请确认你的系统中已经安装 [JDK](https://www.oracle.com/technetwork/java/javase/downloads/index.html) 11 或以上版本，以及 Maven 3 或以上版本的开发环境。

相比 Python 的单文件部署，创建 Java 项目要更繁琐一些。不过，我们已经准备了一份代码模板。你可以从这里开始创建自己的 UDF 项目：

```bash
git clone https://github.com/risingwavelabs/risingwave-java-udf-template.git
```

在 Java 中定义标量函数，需要创建一个类实现 `ScalarFunction` 接口，并在其中实现名为 `eval` 的方法。系统会根据 `eval` 的参数和返回值类型自动推断 SQL 函数的类型。

```java
import com.risingwave.functions.ScalarFunction;

public class Gcd implements ScalarFunction {
    public int eval(int a, int b) {
        while (b != 0) {
            int temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }
}
```

类似的，定义表函数需要创建一个类实现 `TableFunction` 接口。其中 `eval` 方法返回一个 `Iterator` 遍历输出的每一行（注意这是与 Flink API 的不同之处）。

```java
import com.risingwave.functions.TableFunction;

public class Series implements TableFunction {
    public Iterator<Integer> eval(int n) {
        return java.util.stream.IntStream.range(0, n).iterator();
    }
}
```

最后，我们在主函数中注册函数并启动 UDF 服务：

```java
import com.risingwave.functions.UdfServer;

public class App {
    public static void main(String[] args) {
        try (var server = new UdfServer("0.0.0.0", 8815)) {
            // 注册函数
            server.addFunction("gcd", new Gcd());
            server.addFunction("series", new Series());
            // 启动服务
            server.start();
            server.awaitTermination();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

我们可以直接通过 maven 编译并运行项目：

```java
_JAVA_OPTIONS="--add-opens=java.base/java.nio=ALL-UNNAMED" mvn exec:java -Dexec.mainClass="com.example.App"
```

或者先构建，然后运行 jar 包：

```java
mvn package
java -jar target/risingwave-udf-example.jar
```

之后，我们就可以在 RisingWave 中声明并使用它们了：

```java
CREATE FUNCTION gcd(int, int) RETURNS int
AS gcd USING LINK 'http://localhost:8815';

CREATE FUNCTION series(int) RETURNS TABLE (x int)
AS series USING LINK 'http://localhost:8815';

SELECT gcd(25, 15);
----
5

SELECT * FROM series(5);
----
0
1
2
3
4
```

关于更详细的用法，可以参考 [RisingWave 文档](https://docs.risingwave.com/docs/current/udf-java/)。

## UDF 的工作原理

正如我们所见，目前 RisingWave 的 UDF 运行在独立的 Python 或 Java 进程中。它使用 [Apache Arrow Flight RPC](https://arrow.apache.org/docs/format/Flight.html) 协议向 RisingWave 提供计算服务，与 RisingWave 通过 Arrow 格式交换数据。当RisingWave 计算引擎执行到 UDF 表达式时，它会首先将函数输入转为 Arrow 格式，然后调用 UDF 服务器的 `doExchange` 方法，最终在服务端由 Python 或 Java SDK 调用用户定义的函数。

UDF 的 RPC 以批处理方式工作，一般以 1024 行为一个数据块进行传输。在实践中，这里的数据传输通常不会成为性能瓶颈。

UDF 服务器是无状态的。因此它可以被安全地水平扩展，以提升性能和可用性。当 RisingWave 无法连接到 UDF 服务器时，它会在几秒内重试若干次。如果依然失败，则会抛出表达式计算错误，在批处理中直接报错，而在流处理中对应函数的返回值会被置为 NULL。
