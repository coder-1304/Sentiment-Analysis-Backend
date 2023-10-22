class CustomErrorHandler extends Error{
    static alreadyExists(msg){
        return new CustomErrorHandler(409,msg)
    }
    constructor(status, msg){
        this.status=status;
        this.msg=msg;
    }
}

module.exports = CustomErrorHandler;
