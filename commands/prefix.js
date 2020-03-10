module.exports=(args,message)=>{
    if(!message.member.hasPermission("ADMINISTRATOR")){
        return message.channel.sendEm("Only guild admins can change bot prefix!")
    }
    if(!args[0]){
        return message.channel.sendEm("Please specify prefix!")
    }
db.collection("prefixes").findOneAndUpdate({guild:message.guild.id},{$set:{prefix:args[0]}})
    message.channel.sendEm("Prefix changed!")
}