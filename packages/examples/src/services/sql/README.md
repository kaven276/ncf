通过各个数据的的 sqlib 库支持，可以在 .sql 文件中写 SQL/PLSQL 方式写数据库操作逻辑。

features
==========
* 可以完全仅仅写 .sql 文件即可完成服务，而不依赖于 sql 外的语言。
* 使用什么连接池或者给定连接无耦合，自由的通过 @ncf 的 dir/index.ts 中配置如何获取连接
* 支持参数绑定
* 支持动态 SQL，通过 --{!!param} 在行尾的方式来方便的切换是否包含，比 mybatis 等传统方式更方便
* 支持 declare 的匿名块的执行
* 支持存储过程安装并执行，自带版本管理。

支持的数据库
===========
* postgres. @ncf/loader-sql-pg 来支持，现已初步支持。
* oracle.  @ncf/loader-sql-ora 来支持，等待从原来的 oracle-sqlib-engine 移植。
* mysql. @ncf/loader-sql-my 来支持，暂时不支持。

ncf 官方对各个数据库支持的优先顺序如上面列表的顺序。

因为 postgres 设计精良，功能丰富可扩展性强，生态活跃覆盖广泛。
又因为 pg 为开源生态，没有 oracle/mysql 为单一厂商控制的风险。
加上国内去 IOE 的大势，开源能替代现有系统中 oracle 的只有 postgres。
因此对 postgres 的支持是第一位的。
