# **Design Document**

## **Code Rollup**
---
Commit code using following instructions:
```
npm run push      // commit to server
npm run local     // commit to local folder
npm run build     // compile code
```

## **Execution Procedure**
---
### Mount everything from memory at global reset:

Praetor
Decemviri



## **Note**
---
1. task不用放回task flow中
2. 每个task的发布者（target）都应保存一个task log，task结束时无论task完成与否，log上对应的记录都要被删除
    - 派生的task没有id，也不需要在结束时更新log
    - 发布者应该自己确认task是否完成，如果task结束但未完成则需要重新发布task
3. 每次harvest都采满再走，暂时不处理采满但存完还剩一点的情况，之后统一用一个dump任务处理
4. 所有DataProto的派生类（非abstract类）在改写data后都要重新writeback

## **ToDo List**
---
1. 改进spawn索取能量的逻辑
2. 分配能量的事情由structure自行发布任务完成，agent不参与
