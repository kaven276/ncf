// import 各个任务定义文件，自动触发 schedule 来定时执行所有任务
import { gracefulShutdown } from 'node-schedule';
import './task1';

process.on('SIGINT', function () {
  gracefulShutdown().then(() => console.log('gracefule shutdown all jobs'));
});
