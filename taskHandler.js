class TaskHandler {

    constructor(moveList, actionList, endList) {
        /* Move function
           Return: 
           - (RoomPosition) A position to move to
           - (Boolean) False if no proper position is found

           Action function
           Return: 
           - (Const) Occupy if task works correctly
           - (Const) Finish if current action is ended
           - (Const) Pend if no work to do currently (but may recovere in future)
           - (Const) Halt if needed

           End function
           Return: none
        */
        this.moveList = moveList        // (List of function references) Produce target location in each phase
        this.actionList = actionList    // (List of function references) Do somthing after reaching the location
        this.endList = endList          // (List of function references) Do / Update something (other than time stamp) when a phase finished
    }
}

module.exports = TaskHandler;