# **Design Document**

## **Code Rollup**
---
Commit code using following instructions:
```
npm run push      // commit to server
npm run local     // commit to local folder
npm run build     // compile code
```

## **General Idea**
---
1. 观摩Tigga运营得出的经验：harvester/updator站桩工作，transporter在中间搬运资源
    - 理由：为work部件添加move部件是不值得的
2. 所以任务调度系统过于general了，应该用一个结构更简单的物流系统代替
3. 建造和修理任务可以独立于物流系统

## **Process & Thread**
---
1. 所有需要状态机且不直接操作游戏对象的逻辑应该用process & thread完成
2. Thread有0-2的priority，在操作对像前先把对象的priority field设为自己的priority，操作完成后再恢复原priority，通过这种机制来抢占资源
    - 抢占是否会中断当前任务还有待商榷
3. 部分process/thread会直接控制creep（任务系统无法满足战斗的需求）
4. RoomManagerProcess包含以下功能的thread
    - 标定ConstructionSite
    - 房间运营，发布非军事creep的spawn request
    - 保护房间安全，发布军事creep的spawn request并控制它们战斗

## **Transportation System**
---
1. 物流系统由node和transporter组成：node可以是任何需要搬入/搬出物资的对象；transporter是专门运输资源的creep
2. Node可以发布请求资源的task
    - 每个task包含如下信息
        - owner：信息发布者的id
        - srcType：请求资源的类型
        - tarAmount：请求资源的数量（如果是0则代表不设上限）
        - resAmount：已经预定的额度（如果tarAmount==0则一直为0）
        - comAmount：已经完成的额度（如果tarAmount==0则一直为0）
    - 每个transporter不会认领整个task，而是根据自己的运载能力预定任务额度，完成后再去更新已完成的额度
        - 每次预定都会生成一个package分配给transporter，之后transporter会专注于这个package直到完成
    - 在没有task时，transporter会主动寻找掉落在地上的资源并带在身上，这会生成一个特殊类型的transaction
        -  之所以要和普通transaction作区分是因为这只涉及捡起不涉及运输
3. 每个房间都有一个task.trans内存对象: 包含房间内所有的运输任务，有0-2三个优先级（数字越小优先级越高）
4. 每个房间都有一个srcNode: 建筑类型（包括掉落的资源）分类的可以取用资源的node集合
    - srcNode集合和Construction System共享
    - 需要有专门的thread更新掉落资源的状态
5. 目标node并不需要一个数据结构来表达，因为task已经足够了

## **Construction System**
---
1. 建造系统由node和worker组成：node可以是任何construction site或许需要修理的建筑，worker是专门负责建造/维修的creep
    - 和物流系统几乎相同，区别是给出能量的方法不同
2. 每个房间都有一个task.build内存对象: 包含房间内所有的运输任务，有0-2三个优先级（数字越小优先级越高）
3. 和物流系统共用srcNode，transaction数据结构和调度函数

## **Execution Order**
---
1. Process/Thread发布任务，thread直接控制的creep执行操作
2. Scheduler分配任务
3. 剩余所有creep执行操作

## **TODO List**
---



