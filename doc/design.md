# **Design Document**

## **Code Rollup**
---
Commit code using following instructions:
```
npm run push      // commit to server
npm run local     // commit to local folder
npm run build     // compile code
```

## **Thread**
---
1. 所有对游戏对象的操作都应该通过thread完成
2. 每个RoomManagerProcess都下辖以下功能的thread:
    - 标定ConstructionSite
    - 为ConstructionSite发布建造任务
    - 遍历所有Structure对象，进行必要操作或发布任务
        - Task log应该挂在Structure的内存里
    - 遍历所有Worker Creep对象，获取并执行任务
3. Thread有0-2的priority，在操作对像前先把对象的priority field设为自己的priority，操作完成后再恢复原priority，通过这种机制来抢占资源
    - 抢占是否会中断当前任务还有待商榷

## **Task**
---
1. task不用放回task queue中
2. 每个task的发布者（thread/target）都应保存一个task log，task结束时无论task完成与否，log上对应的记录都要被删除
    - 派生的task没有id，也不需要在结束时更新log
    - 发布者应该自己确认task是否完成，如果task结束但未完成则需要重新发布task
3. 每次harvest都采满再走，暂时不处理采满但存完还剩一点的情况，之后统一用一个dump任务处理

## **TODO List**
---
1. 改进spawn索取能量的逻辑
2. 分配能量的事情由structure自行发布任务完成，agent不参与
3. 用Addr生成对象时应检查cache中是否已存在此对象，同样的每次生成后都应把对象挂到cache上（用一个cache函数封装这个功能）
4. 用一个cache函数封装build功能，输入addr它就能根据type生成对应的object


