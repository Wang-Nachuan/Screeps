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
1. For each room, instantiate:
    - Praetor, which will instantiate:
        - All types of creeps
        - All nodes
2. Globally, instantiate:
    - Decemviri, which will instantiate:
        - ...
        - ...

### Pre-execution
1. For each object in each level, call its routine function, which:
    - Issue requests
    - Update memory (if necessary)
    - Do other things (if necessary)

### Execution
1. For objects that can be assigned a task
    - Assign tasks
    - Execute
    - Update memory (if necessary)


## **Note**
---
1. At building stage, first build agent, then creeps and structures
2. Cache agent, when derefering agent first search at cached agent
3. Cache creeps and structure, when derefering them first search at cached creeps/structures